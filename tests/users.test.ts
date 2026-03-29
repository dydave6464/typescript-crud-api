// tests/users.test.ts
// Simple API test script - run with: npm test
// Make sure the server is running first: npm run start:dev

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
    console.log('=== TypeScript CRUD API Tests ===\n');

    // Test 1: Create a User
    console.log('Test 1: Create a User (POST /users)');
    try {
        const createRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Mr',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: 'secret123',
                confirmPassword: 'secret123',
                role: 'User',
            }),
        });
        const createData = await createRes.json();
        console.log(`  Status: ${createRes.status}`);
        console.log(`  Response:`, createData);
        console.log(`  PASSED\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    // Test 2: Get All Users
    console.log('Test 2: Get All Users (GET /users)');
    try {
        const getAllRes = await fetch(`${BASE_URL}/users`);
        const getAllData = await getAllRes.json();
        console.log(`  Status: ${getAllRes.status}`);
        console.log(`  Users found: ${getAllData.length}`);
        console.log(`  Response:`, getAllData);
        console.log(`  PASSED\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    // Test 3: Get User by ID
    console.log('Test 3: Get User by ID (GET /users/1)');
    try {
        const getOneRes = await fetch(`${BASE_URL}/users/1`);
        const getOneData = await getOneRes.json();
        console.log(`  Status: ${getOneRes.status}`);
        console.log(`  Response:`, getOneData);
        console.log(`  PASSED\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    // Test 4: Update User
    console.log('Test 4: Update User (PUT /users/1)');
    try {
        const updateRes = await fetch(`${BASE_URL}/users/1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Janet',
                password: 'newsecret456',
                confirmPassword: 'newsecret456',
            }),
        });
        const updateData = await updateRes.json();
        console.log(`  Status: ${updateRes.status}`);
        console.log(`  Response:`, updateData);
        console.log(`  PASSED\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    // Test 5: Validation Error
    console.log('Test 5: Validation Error (POST /users with missing fields)');
    try {
        const validRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Bob',
            }),
        });
        const validData = await validRes.json();
        console.log(`  Status: ${validRes.status}`);
        console.log(`  Response:`, validData);
        console.log(`  PASSED (expected 400 error)\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    // Test 6: Delete User
    console.log('Test 6: Delete User (DELETE /users/1)');
    try {
        const deleteRes = await fetch(`${BASE_URL}/users/1`, {
            method: 'DELETE',
        });
        const deleteData = await deleteRes.json();
        console.log(`  Status: ${deleteRes.status}`);
        console.log(`  Response:`, deleteData);
        console.log(`  PASSED\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    // Test 7: Get Deleted User (should 404)
    console.log('Test 7: Get Deleted User (GET /users/1 - should fail)');
    try {
        const gone = await fetch(`${BASE_URL}/users/1`);
        const goneData = await gone.json();
        console.log(`  Status: ${gone.status}`);
        console.log(`  Response:`, goneData);
        console.log(`  PASSED (expected error)\n`);
    } catch (err) {
        console.log(`  FAILED:`, err, '\n');
    }

    console.log('=== All Tests Complete ===');
}

testAPI();
