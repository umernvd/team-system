# JWT Auth Implementation Guide

## Overview

This branch adds **JWT (JSON Web Token) authentication** to the Team Roster API. Users register, log in to receive an access token + refresh token, then include the access token in the `Authorization` header for protected requests.

---

## Architecture

```
client → POST /auth/login → { accessToken, refreshToken }
                    │
                    ▼  (store token)
client → Authorization: Bearer <token> → server.js
                                                │
                                       ┌────────┴────────┐
                                       │   auth.js        │
                                       │  (middleware)     │
                                       │  jwt.verify()    │
                                       └────────┬────────┘
                                                │ attach to req.user
                                       ┌────────┴────────┐
                                       │  Employee routes │
                                       │  (protected)    │
                                       └─────────────────┘
```

---

## Files Added / Modified

| File | What it does |
|------|--------------|
| `config.js` | JWT secrets (`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`) and expiry durations |
| `models/User.js` | Mongoose schema — username (unique), password (hashed), role (user/admin) |
| `models/RefreshToken.js` | Stores refresh tokens in DB with TTL index for auto-expiry |
| `middleware/auth.js` | `authenticateToken` — verifies JWT from `Authorization: Bearer` header and attaches `req.user` |
| `middleware/auth.js` | `roleCheck` — gates routes by `req.user.role` |
| `controllers/authController.js` | Register (hash+save), Login (verify+return tokens), Refresh (rotate tokens), Logout (delete refresh token) |
| `routes/auth.js` | POST `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| `server.js` | Mounts auth routes, applies `authenticateToken` to all employee routes, global error handler |

---

## Auth Flow

### 1. Register
```
POST /auth/register
{ "username": "alice", "password": "secret123", "role": "admin" }

→ 201 { "message": "User registered successfully", "user": {...} }
```

### 2. Login
```
POST /auth/login
{ "username": "alice", "password": "secret123" }

→ 200 {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": { "id": "...", "username": "alice", "role": "admin" }
  }
```

### 3. Access protected routes
```
Authorization: Bearer eyJhbG...
```
Access token expires in 15 minutes (configurable in `config.js`).

### 4. Refresh expired token
```
POST /auth/refresh
{ "refreshToken": "eyJhbG..." }

→ 200 { "accessToken": "eyJhbG...", "refreshToken": "eyJhbG..." }
```
Refresh token expires in 7 days. Each refresh rotates both tokens and deletes the old refresh token from the DB.

### 5. Logout
```
POST /auth/logout
{ "refreshToken": "eyJhbG..." }

→ 200 { "message": "Logged out successfully" }
```
Deletes the refresh token from the database — token can no longer be used to get new access tokens.

---

## Middleware: auth.js

### `authenticateToken`
Extracts token from `Authorization: Bearer <token>`, verifies with `jwt.verify()` using `ACCESS_TOKEN_SECRET`, and attaches `{ id, username, role }` to `req.user`.

### `roleCheck(requiredRole)`
Returns a middleware that checks `req.user.role`. Returns 403 if the role doesn't match.

---

## Token Configuration (config.js)

| Setting | Value | Description |
|---------|-------|-------------|
| `ACCESS_TOKEN_SECRET` | `'your-access-secret-change-me'` | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | `'your-refresh-secret-change-me'` | Secret for signing refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | `'15m'` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | `'7d'` | Refresh token lifetime |
| `SALT_ROUNDS` | `10` | bcrypt salt rounds for password hashing |

> ⚠️ Change the secrets in `config.js` before deploying to production.

---

## Protected Routes

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/employees` | Bearer token | any |
| POST | `/employees` | Bearer token | any |
| PUT | `/employees/:id` | Bearer token | any |
| DELETE | `/employees/:id` | Bearer token | any |
| GET | `/admin-only` | Bearer token | admin |

---

## Testing

Open `http://localhost:5000/test-client.html` in a browser. The test client defaults to **Bearer** mode — register a user, login to get a token, then test all employee CRUD operations.
