// API-driven version of Lab 2 frontend
const API_URL = '';
const CURRENT_USER_KEY = 'ipt_current_user';
let currentUser = null;

// ============ API HELPER ============
async function apiCall(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(API_URL + path, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ============ TOAST ============
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ AUTH ============
function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function loadCurrentUser() {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

async function handleRegistration(e) {
  e.preventDefault();
  const firstName = document.getElementById('reg-firstname').value;
  const lastName = document.getElementById('reg-lastname').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    await apiCall('/users/register', {
      method: 'POST',
      body: { firstName, lastName, email, password },
    });
    localStorage.setItem('unverified_email', email);
    showToast('Registration successful! Please verify your email.', 'success');
    navigateTo('#/verify-email');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleEmailVerification() {
  const email = localStorage.getItem('unverified_email');
  if (!email) {
    showToast('No email to verify', 'error');
    navigateTo('#/register');
    return;
  }

  try {
    await apiCall('/users/verify-email', {
      method: 'POST',
      body: { email },
    });
    localStorage.removeItem('unverified_email');
    showToast('Email verified! You can now login.', 'success');
    navigateTo('#/login');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const user = await apiCall('/users/authenticate', {
      method: 'POST',
      body: { email, password },
    });
    saveCurrentUser(user);
    setAuthState(true, user);
    showToast(`Welcome back, ${user.firstName}!`, 'success');
    navigateTo('#/profile');
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('not found')) {
      showToast('Account not found. Please register first.', 'error');
    } else if (msg.includes('verify')) {
      showToast('Please verify your email first.', 'warning');
    } else {
      showToast(msg || 'Login failed', 'error');
    }
  }
}

function setAuthState(isAuth, user) {
  if (isAuth && user) {
    currentUser = user;
    document.body.classList.remove('not-authenticated');
    document.body.classList.add('authenticated');
    document.getElementById('username-display').textContent = user.firstName;
    if (user.role === 'admin') {
      document.body.classList.add('is-admin');
    } else {
      document.body.classList.remove('is-admin');
    }
  } else {
    currentUser = null;
    document.body.classList.remove('authenticated', 'is-admin');
    document.body.classList.add('not-authenticated');
  }
}

function handleLogout(e) {
  e.preventDefault();
  clearCurrentUser();
  setAuthState(false);
  showToast('Logged out successfully', 'info');
  navigateTo('#/');
}

function checkAuthState() {
  const user = loadCurrentUser();
  if (user && user.verified) {
    setAuthState(true, user);
  }
}

// ============ PROFILE ============
function renderProfile() {
  if (!currentUser) {
    navigateTo('#/login');
    return;
  }
  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Role:</strong> <span class="badge bg-${currentUser.role === 'admin' ? 'danger' : 'primary'}">${currentUser.role}</span></p>
                <p><strong>Status:</strong> <span class="badge bg-success">Verified</span></p>
            </div>
        </div>
        <hr>
        <button class="btn btn-primary" onclick="showToast('Edit profile feature coming in Phase 8!', 'info')">Edit Profile</button>
    `;
}

// ============ ACCOUNTS ============
async function renderAccountsList() {
  const accountsContent = document.getElementById('accounts-content');
  try {
    const accounts = await apiCall('/users');
    accountsContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showAddAccountForm()">+ Add Account</button>
        <div id="account-form-container"></div>
        <table class="table table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${accounts
                  .map(
                    (acc) => `
                    <tr>
                        <td>${acc.firstName} ${acc.lastName}</td>
                        <td>${acc.email}</td>
                        <td><span class="badge bg-${acc.role === 'admin' ? 'danger' : 'primary'}">${acc.role}</span></td>
                        <td>${acc.verified ? '✓' : '✗'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editAccount(${acc.id})">Edit</button>
                            <button class="btn btn-sm btn-info" onclick="resetPassword(${acc.id})">Reset PW</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteAccount(${acc.id})">Delete</button>
                        </td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    `;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showAddAccountForm() {
  const container = document.getElementById('account-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Add New Account</h5>
                <form id="add-account-form">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="acc-firstname" placeholder="First Name" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="acc-lastname" placeholder="Last Name" required>
                        </div>
                    </div>
                    <div class="mb-2">
                        <input type="email" class="form-control" id="acc-email" placeholder="Email" required>
                    </div>
                    <div class="mb-2">
                        <input type="password" class="form-control" id="acc-password" placeholder="Password" minlength="6" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="acc-role">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label><input type="checkbox" id="acc-verified"> Verified</label>
                    </div>
                    <button type="submit" class="btn btn-success">Save Account</button>
                    <button type="button" class="btn btn-secondary" onclick="renderAccountsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document.getElementById('add-account-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const body = {
      firstName: document.getElementById('acc-firstname').value,
      lastName: document.getElementById('acc-lastname').value,
      email: document.getElementById('acc-email').value,
      password: document.getElementById('acc-password').value,
      role: document.getElementById('acc-role').value,
      verified: document.getElementById('acc-verified').checked,
    };
    try {
      await apiCall('/users', { method: 'POST', body });
      showToast('Account created successfully!', 'success');
      renderAccountsList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function editAccount(id) {
  try {
    const account = await apiCall(`/users/${id}`);
    const container = document.getElementById('account-form-container');
    container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Edit Account</h5>
                <form id="edit-account-form">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="edit-firstname" value="${account.firstName}" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <input type="text" class="form-control" id="edit-lastname" value="${account.lastName}" required>
                        </div>
                    </div>
                    <div class="mb-2">
                        <input type="email" class="form-control" id="edit-email" value="${account.email}" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="edit-role">
                            <option value="user" ${account.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${account.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label><input type="checkbox" id="edit-verified" ${account.verified ? 'checked' : ''}> Verified</label>
                    </div>
                    <button type="submit" class="btn btn-success">Update Account</button>
                    <button type="button" class="btn btn-secondary" onclick="renderAccountsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('edit-account-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const body = {
        firstName: document.getElementById('edit-firstname').value,
        lastName: document.getElementById('edit-lastname').value,
        email: document.getElementById('edit-email').value,
        role: document.getElementById('edit-role').value,
        verified: document.getElementById('edit-verified').checked,
      };
      try {
        await apiCall(`/users/${id}`, { method: 'PUT', body });
        showToast('Account updated successfully!', 'success');
        renderAccountsList();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function resetPassword(id) {
  const newPassword = prompt('Enter new password (min 6 characters):');
  if (!newPassword) return;
  if (newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  try {
    await apiCall(`/users/${id}`, { method: 'PUT', body: { password: newPassword } });
    showToast('Password reset successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteAccount(id) {
  if (currentUser.id === id) {
    showToast('Cannot delete your own account!', 'error');
    return;
  }
  if (!confirm('Are you sure you want to delete this account?')) return;
  try {
    await apiCall(`/users/${id}`, { method: 'DELETE' });
    showToast('Account deleted successfully!', 'success');
    renderAccountsList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============ DEPARTMENTS ============
async function renderDepartmentsList() {
  const deptsContent = document.getElementById('departments-content');
  try {
    const departments = await apiCall('/departments');
    deptsContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showAddDepartmentForm()">+ Add Department</button>
        <div id="dept-form-container"></div>
        <table class="table table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${departments
                  .map(
                    (dept) => `
                    <tr>
                        <td>${dept.name}</td>
                        <td>${dept.description}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editDepartment(${dept.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
                        </td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    `;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showAddDepartmentForm() {
  const container = document.getElementById('dept-form-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Add New Department</h5>
                <form id="add-dept-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="dept-name" placeholder="Department Name" required>
                    </div>
                    <div class="mb-2">
                        <textarea class="form-control" id="dept-desc" placeholder="Description" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Save Department</button>
                    <button type="button" class="btn btn-secondary" onclick="renderDepartmentsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document.getElementById('add-dept-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const body = {
      name: document.getElementById('dept-name').value,
      description: document.getElementById('dept-desc').value,
    };
    try {
      await apiCall('/departments', { method: 'POST', body });
      showToast('Department created successfully!', 'success');
      renderDepartmentsList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function editDepartment(id) {
  try {
    const dept = await apiCall(`/departments/${id}`);
    const container = document.getElementById('dept-form-container');
    container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Edit Department</h5>
                <form id="edit-dept-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="edit-dept-name" value="${dept.name}" required>
                    </div>
                    <div class="mb-2">
                        <textarea class="form-control" id="edit-dept-desc" rows="3">${dept.description}</textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Update Department</button>
                    <button type="button" class="btn btn-secondary" onclick="renderDepartmentsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('edit-dept-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const body = {
        name: document.getElementById('edit-dept-name').value,
        description: document.getElementById('edit-dept-desc').value,
      };
      try {
        await apiCall(`/departments/${id}`, { method: 'PUT', body });
        showToast('Department updated successfully!', 'success');
        renderDepartmentsList();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteDepartment(id) {
  if (!confirm('Are you sure you want to delete this department?')) return;
  try {
    await apiCall(`/departments/${id}`, { method: 'DELETE' });
    showToast('Department deleted successfully!', 'success');
    renderDepartmentsList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============ EMPLOYEES ============
async function renderEmployeesList() {
  const employeesContent = document.getElementById('employees-content');
  try {
    const [employees, accounts, departments] = await Promise.all([
      apiCall('/employees'),
      apiCall('/users'),
      apiCall('/departments'),
    ]);

    employeesContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showAddEmployeeForm()">+ Add Employee</button>
        <div id="employee-form-container"></div>
        <table class="table table-hover">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${employees
                  .map((emp) => {
                    const user = accounts.find((acc) => acc.id === emp.userId);
                    const dept = departments.find((d) => d.id === emp.departmentId);
                    return `
                        <tr>
                            <td>${emp.employeeId}</td>
                            <td>${user ? user.email : 'N/A'}</td>
                            <td>${emp.position}</td>
                            <td>${dept ? dept.name : 'N/A'}</td>
                            <td>${emp.hireDate}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick="editEmployee(${emp.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                  })
                  .join('')}
            </tbody>
        </table>
    `;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function showAddEmployeeForm() {
  try {
    const [accounts, departments] = await Promise.all([
      apiCall('/users'),
      apiCall('/departments'),
    ]);
    const container = document.getElementById('employee-form-container');
    container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Add New Employee</h5>
                <form id="add-employee-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="emp-id" placeholder="Employee ID" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="emp-user" required>
                            <option value="">Select User</option>
                            ${accounts.map((acc) => `<option value="${acc.id}">${acc.email}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="text" class="form-control" id="emp-position" placeholder="Position" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="emp-dept" required>
                            <option value="">Select Department</option>
                            ${departments.map((dept) => `<option value="${dept.id}">${dept.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="date" class="form-control" id="emp-hire-date" required>
                    </div>
                    <button type="submit" class="btn btn-success">Save Employee</button>
                    <button type="button" class="btn btn-secondary" onclick="renderEmployeesList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('add-employee-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const body = {
        employeeId: document.getElementById('emp-id').value,
        userId: parseInt(document.getElementById('emp-user').value),
        position: document.getElementById('emp-position').value,
        departmentId: parseInt(document.getElementById('emp-dept').value),
        hireDate: document.getElementById('emp-hire-date').value,
      };
      try {
        await apiCall('/employees', { method: 'POST', body });
        showToast('Employee added successfully!', 'success');
        renderEmployeesList();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editEmployee(id) {
  try {
    const [emp, accounts, departments] = await Promise.all([
      apiCall(`/employees/${id}`),
      apiCall('/users'),
      apiCall('/departments'),
    ]);
    const container = document.getElementById('employee-form-container');
    container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>Edit Employee</h5>
                <form id="edit-employee-form">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="edit-emp-id" value="${emp.employeeId}" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="edit-emp-user" required>
                            ${accounts.map((acc) => `<option value="${acc.id}" ${acc.id === emp.userId ? 'selected' : ''}>${acc.email}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="text" class="form-control" id="edit-emp-position" value="${emp.position}" required>
                    </div>
                    <div class="mb-2">
                        <select class="form-control" id="edit-emp-dept" required>
                            ${departments.map((dept) => `<option value="${dept.id}" ${dept.id === emp.departmentId ? 'selected' : ''}>${dept.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-2">
                        <input type="date" class="form-control" id="edit-emp-hire-date" value="${emp.hireDate}" required>
                    </div>
                    <button type="submit" class="btn btn-success">Update Employee</button>
                    <button type="button" class="btn btn-secondary" onclick="renderEmployeesList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('edit-employee-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const body = {
        employeeId: document.getElementById('edit-emp-id').value,
        userId: parseInt(document.getElementById('edit-emp-user').value),
        position: document.getElementById('edit-emp-position').value,
        departmentId: parseInt(document.getElementById('edit-emp-dept').value),
        hireDate: document.getElementById('edit-emp-hire-date').value,
      };
      try {
        await apiCall(`/employees/${id}`, { method: 'PUT', body });
        showToast('Employee updated successfully!', 'success');
        renderEmployeesList();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  try {
    await apiCall(`/employees/${id}`, { method: 'DELETE' });
    showToast('Employee deleted successfully!', 'success');
    renderEmployeesList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============ REQUESTS ============
async function renderRequestsList() {
  if (!currentUser) return;
  const requestsContent = document.getElementById('requests-content');
  try {
    const path = currentUser.role === 'admin'
      ? '/requests'
      : `/requests/account/${currentUser.id}`;
    const userRequests = await apiCall(path);

    requestsContent.innerHTML = `
        <button class="btn btn-success mb-3" onclick="showNewRequestModal()">+ New Request</button>
        <div id="request-modal-container"></div>
        ${
          userRequests.length === 0
            ? '<p class="text-muted">No requests yet.</p>'
            : `
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Items</th>
                        <th>Status</th>
                        ${currentUser.role === 'admin' ? '<th>Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${userRequests
                      .map(
                        (req) => `
                        <tr>
                            <td>${req.date}</td>
                            <td>${req.type}</td>
                            <td>${(req.items || []).length} item(s)</td>
                            <td><span class="badge bg-${req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'danger'}">${req.status}</span></td>
                            ${
                              currentUser.role === 'admin'
                                ? `
                                <td>
                                    <button class="btn btn-sm btn-success" onclick="updateRequestStatus(${req.id}, 'Approved')">Approve</button>
                                    <button class="btn btn-sm btn-danger" onclick="updateRequestStatus(${req.id}, 'Rejected')">Reject</button>
                                </td>
                            `
                                : ''
                            }
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
            </table>
        `
        }
    `;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showNewRequestModal() {
  const container = document.getElementById('request-modal-container');
  container.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <h5>New Request</h5>
                <form id="new-request-form">
                    <div class="mb-2">
                        <label>Request Type</label>
                        <select class="form-control" id="request-type" required>
                            <option value="Equipment">Equipment</option>
                            <option value="Leave">Leave</option>
                            <option value="Resources">Resources</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label>Items</label>
                        <div id="items-container">
                            <div class="row mb-2 item-row">
                                <div class="col-md-7">
                                    <input type="text" class="form-control" placeholder="Item name" required>
                                </div>
                                <div class="col-md-3">
                                    <input type="number" class="form-control" placeholder="Qty" min="1" value="1" required>
                                </div>
                                <div class="col-md-2">
                                    <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.item-row').remove()">×</button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="addItemRow()">+ Add Item</button>
                    </div>
                    <button type="submit" class="btn btn-success">Submit Request</button>
                    <button type="button" class="btn btn-secondary" onclick="renderRequestsList()">Cancel</button>
                </form>
            </div>
        </div>
    `;

  document.getElementById('new-request-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const itemRows = document.querySelectorAll('.item-row');
    const items = Array.from(itemRows).map((row) => {
      const inputs = row.querySelectorAll('input');
      return {
        name: inputs[0].value,
        quantity: parseInt(inputs[1].value),
      };
    });
    if (items.length === 0) {
      showToast('Please add at least one item', 'error');
      return;
    }
    const body = {
      type: document.getElementById('request-type').value,
      items,
      status: 'Pending',
      accountId: currentUser.id,
    };
    try {
      await apiCall('/requests', { method: 'POST', body });
      showToast('Request submitted successfully!', 'success');
      renderRequestsList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function addItemRow() {
  const container = document.getElementById('items-container');
  const newRow = document.createElement('div');
  newRow.className = 'row mb-2 item-row';
  newRow.innerHTML = `
        <div class="col-md-7">
            <input type="text" class="form-control" placeholder="Item name" required>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control" placeholder="Qty" min="1" value="1" required>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.item-row').remove()">×</button>
        </div>
    `;
  container.appendChild(newRow);
}

async function updateRequestStatus(id, status) {
  try {
    await apiCall(`/requests/${id}`, { method: 'PUT', body: { status } });
    showToast(`Request ${status.toLowerCase()}!`, status === 'Approved' ? 'success' : 'warning');
    renderRequestsList();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============ ROUTING ============
function navigateTo(hash) {
  window.location.hash = hash;
}

function handleRouting() {
  const hash = window.location.hash || '#/';
  const route = hash.replace('#/', '');

  const allPages = document.querySelectorAll('.page');
  allPages.forEach((page) => page.classList.remove('active'));

  const isAuthenticated = document.body.classList.contains('authenticated');
  const isAdmin = document.body.classList.contains('is-admin');

  let pageToShow = null;

  switch (route) {
    case '':
    case 'home':
      pageToShow = 'home-page';
      break;

    case 'login':
      if (isAuthenticated) {
        navigateTo('#/profile');
        return;
      }
      pageToShow = 'login-page';
      break;

    case 'register':
      if (isAuthenticated) {
        navigateTo('#/profile');
        return;
      }
      pageToShow = 'register-page';
      break;

    case 'verify-email':
      const unverifiedEmail = localStorage.getItem('unverified_email');
      if (unverifiedEmail) {
        document.getElementById('verification-email').textContent = unverifiedEmail;
      }
      pageToShow = 'verify-email-page';
      break;

    case 'profile':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      renderProfile();
      pageToShow = 'profile-page';
      break;

    case 'requests':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      renderRequestsList();
      pageToShow = 'requests-page';
      break;

    case 'employees':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      if (!isAdmin) {
        showToast('Access Denied: Admin only', 'error');
        navigateTo('#/profile');
        return;
      }
      renderEmployeesList();
      pageToShow = 'employees-page';
      break;

    case 'accounts':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      if (!isAdmin) {
        showToast('Access Denied: Admin only', 'error');
        navigateTo('#/profile');
        return;
      }
      renderAccountsList();
      pageToShow = 'accounts-page';
      break;

    case 'departments':
      if (!isAuthenticated) {
        showToast('Please login first', 'warning');
        navigateTo('#/login');
        return;
      }
      if (!isAdmin) {
        showToast('Access Denied: Admin only', 'error');
        navigateTo('#/profile');
        return;
      }
      renderDepartmentsList();
      pageToShow = 'departments-page';
      break;

    default:
      navigateTo('#/');
      return;
  }

  if (pageToShow) {
    const page = document.getElementById(pageToShow);
    if (page) page.classList.add('active');
  }
}

window.addEventListener('hashchange', handleRouting);

document.addEventListener('DOMContentLoaded', function () {
  checkAuthState();
  if (!window.location.hash) {
    window.location.hash = '#/';
  }
  handleRouting();
  setupEventListeners();
});

function setupEventListeners() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) registerForm.addEventListener('submit', handleRegistration);

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const verifyBtn = document.getElementById('verify-btn');
  if (verifyBtn) verifyBtn.addEventListener('click', handleEmailVerification);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}
