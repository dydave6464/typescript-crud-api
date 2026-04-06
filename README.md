# TypeScript CRUD API with Node.js, Express & MySQL

A fully typed REST API for managing user records, built with TypeScript, Express 5, Sequelize ORM, and MySQL.

## Features

- TypeScript with strict type checking
- Express 5 REST API with full CRUD operations
- MySQL database with Sequelize ORM (auto-creates database and tables)
- Joi request validation with typed schemas
- Password hashing with bcryptjs
- Role-based user management (Admin/User)
- Global error handling middleware

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://dev.mysql.com/downloads/) (running on localhost:3306)
- [VS Code](https://code.visualstudio.com/) with an API testing extension (Postman, Thunder Client, or EchoAPI)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/dydave6464/typescript-crud-api.git
cd typescript-crud-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database

Create a `config.json` file in the project root:

```json
{
    "database": {
        "host": "localhost",
        "port": 3306,
        "user": "root",
        "password": "your_mysql_password",
        "database": "typescript_crud_api"
    },
    "jwtSecret": "change-this-in-production-123!"
}
```

> **Note:** Replace `"your_mysql_password"` with your actual MySQL root password. You do NOT need to manually create the database — Sequelize will create it automatically when the server starts.

### 4. Start the Development Server

```bash
npm run start:dev
```

You should see:

```
Database initialized and models synced
Server running on http://localhost:4000
```

### 5. Build for Production (Optional)

```bash
npm run build
npm start
```

## Project Structure

```
typescript-crud-api/
├── config.json              # Database credentials (not committed)
├── tsconfig.json            # TypeScript compiler settings
├── package.json
├── src/
│   ├── server.ts            # Entry point
│   ├── _helpers/
│   │   ├── db.ts            # MySQL + Sequelize setup
│   │   └── role.ts          # Role enum (Admin, User)
│   ├── _middleware/
│   │   ├── errorHandler.ts  # Global error handler
│   │   └── validateRequest.ts # Joi validation wrapper
│   └── users/
│       ├── user.model.ts    # Sequelize User model (typed)
│       ├── user.service.ts  # Business logic (typed)
│       └── users.controller.ts # Route handlers (typed)
└── tests/
    └── users.test.ts        # API test script
```

## API Endpoints

| Method | URL           | Description        | Body Required |
|--------|---------------|--------------------|---------------|
| GET    | `/users`      | Get all users      | No            |
| GET    | `/users/:id`  | Get user by ID     | No            |
| POST   | `/users`      | Create a new user  | Yes           |
| PUT    | `/users/:id`  | Update a user      | Yes           |
| DELETE | `/users/:id`  | Delete a user      | No            |

## Testing with Postman / EchoAPI

### Test 1: Create a User (POST /users)

**URL:** `POST http://localhost:4000/users`

**Body (JSON):**

```json
{
    "title": "Mr",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "secret123",
    "confirmPassword": "secret123",
    "role": "User"
}
```

**Expected Response (200 OK):**

```json
{ "message": "User created" }
```

### Test 2: Get All Users (GET /users)

**URL:** `GET http://localhost:4000/users`

**Expected Response (200 OK):**

```json
[
    {
        "id": 1,
        "email": "jane@example.com",
        "title": "Mr",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "User",
        "createdAt": "2026-04-06T10:00:00.000Z",
        "updatedAt": "2026-04-06T10:00:00.000Z"
    }
]
```

> Note: `passwordHash` is excluded from responses by default (Sequelize `defaultScope`).

### Test 3: Get User by ID (GET /users/:id)

**URL:** `GET http://localhost:4000/users/1`

**Expected Response (200 OK):** Single user object.

**Error Case:** `GET /users/999` returns `404 { "message": "User not found" }`

### Test 4: Update User (PUT /users/:id)

**URL:** `PUT http://localhost:4000/users/1`

**Body (JSON):**

```json
{
    "firstName": "Janet",
    "password": "newsecret456",
    "confirmPassword": "newsecret456"
}
```

**Expected Response (200 OK):**

```json
{ "message": "User updated" }
```

### Test 5: Delete User (DELETE /users/:id)

**URL:** `DELETE http://localhost:4000/users/1`

**Expected Response (200 OK):**

```json
{ "message": "User deleted" }
```

### Test 6: Validation Error

**URL:** `POST http://localhost:4000/users`

**Body (JSON):** `{ "firstName": "Bob" }` (missing required fields)

**Expected Response (400 Bad Request):**

```json
{ "message": "Validation error: email is required, password is required, ..." }
```

## Scripts

| Command             | Description                              |
|---------------------|------------------------------------------|
| `npm run start:dev` | Run with auto-reload (development)       |
| `npm run build`     | Compile TypeScript to JavaScript         |
| `npm start`         | Run compiled JavaScript (production)     |
| `npm test`          | Run API test script                      |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot find module" | Run `npm install`, check import paths |
| "API not starting" | Verify MySQL is running and `config.json` credentials are correct |
| "TS2345: Argument of type..." | Check function signatures match Express types |
| "Cannot find name 'require'" | Ensure `module: "commonjs"` in `tsconfig.json` |

## Reflection

TypeScript significantly improved the development experience compared to plain JavaScript. Defining interfaces like `UserAttributes` and `UserCreationAttributes` made the data shape explicit, so every function knew exactly what fields to expect. The compiler caught type mismatches early — for example, passing a string where a number was expected for user IDs would have been a silent runtime bug in JavaScript but was flagged immediately during development. Using enums for roles (`Role.Admin`, `Role.User`) instead of raw strings eliminated typo-related bugs entirely. Overall, the upfront investment in type definitions paid off by reducing debugging time and making the codebase self-documenting.
