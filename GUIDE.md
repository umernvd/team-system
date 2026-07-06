# Basic Auth Implementation Guide

## Overview

This branch adds **HTTP Basic Authentication** to the Team Roster API. Users must register, then include their credentials in the `Authorization` header for every protected request.

---

## Architecture

```
client → Authorization: Basic <base64(user:pass)> → server.js
                                                       │
                                              ┌────────┴────────┐
                                              │  basicAuth.js    │
                                              │  (middleware)    │
                                              └────────┬────────┘
                                                       │ lookup + verify
                                              ┌────────┴────────┐
                                              │  User model     │
                                              │  (MongoDB)      │
                                              └─────────────────┘
                                                       │
                                              ┌────────┴────────┐
                                              │  Employee routes │
                                              │  (protected)    │
                                              └─────────────────┘
```

---

## Files Added / Modified

| File | What it does |
|------|--------------|
| `models/User.js` | Mongoose schema — username (unique), password (hashed), role (user/admin) |
| `middleware/basicAuth.js` | Decodes Basic header, looks up user, verifies password via bcrypt, attaches user to `req.user` |
| `middleware/roleCheck.js` | Checks `req.user.role` against a required role |
| `controllers/authController.js` | Register (hash+save), Login (verify+return user), Logout (stateless) |
| `routes/auth.js` | POST `/auth/register`, `/auth/login`, `/auth/logout` |
| `server.js` | Mounts auth routes, applies `basicAuth` to all employee routes, global error handler |
| `package.json` | Added `bcrypt` and `express-basic-auth` deps |

---

## Auth Flow

### 1. Register
```
POST /auth/register
{ "username": "alice", "password": "secret123", "role": "admin" }

→ 201 { "message": "User registered successfully", "user": {...} }
```

### 2. Login (verify credentials)
```
POST /auth/login
{ "username": "alice", "password": "secret123" }

→ 200 { "message": "Login successful", "user": {...} }
```

### 3. Access protected routes
Include the Authorization header:
```
Authorization: Basic base64("alice:secret123")
```
Header is sent with every request — no session, no token.

### 4. Logout
```
POST /auth/logout
→ 200 { "message": "Logout successful – please discard your stored credentials" }
```
Stateless — the server just tells the client to stop sending credentials.

---

## Middleware: basicAuth.js

Decodes the Base64 credentials from the `Authorization: Basic` header, looks up the user in MongoDB, and compares the password hash with bcrypt.

On success, attaches the full user document to `req.user`.

## Middleware: roleCheck.js

Takes a required role string and returns a middleware that checks `req.user.role`. Returns 403 if the role doesn't match.

---

## Protected Routes

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/employees` | Basic | any |
| POST | `/employees` | Basic | any |
| PUT | `/employees/:id` | Basic | any |
| DELETE | `/employees/:id` | Basic | any |
| GET | `/admin-only` | Basic | admin |

---

## Testing

Open `http://localhost:5000/test-client.html` in a browser. The test client lets you register, login, and test all employee CRUD operations with Basic auth baked in.
