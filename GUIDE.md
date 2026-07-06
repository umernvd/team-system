# Middleware Session Auth Implementation Guide

## Overview

This branch adds **middleware-based stateful authentication** using Express Session and custom middleware. Session data (user ID, username, role) is stored in MongoDB via connect-mongo, and a cookie identifies the session on each request. JWT access and refresh tokens are also issued on login to satisfy the token-based spec.

Unlike the Passport.js branch, this implementation uses **no third-party auth library** — just a custom `isAuthenticated` middleware that checks `req.session.userId` directly.

---

## Architecture

```
browser → POST /auth/login → verify credentials with bcrypt
                                      ↓
                           store { userId, username, role } in session
                           session saved to MongoDB via connect-mongo
                           Set-Cookie header returned to browser
                                      ↓
browser → GET /employees (cookie sent automatically)
                                      ↓
                      isAuthenticated middleware checks req.session.userId
                                      ↓
                      attaches req.user = { id, username, role }
                                      ↓
                           Employee route handler
```

---

## Files Added / Modified

| File | What it does |
|------|--------------|
| `config.js` | JWT secrets, session secret, expiry durations, salt rounds |
| `models/User.js` | Mongoose schema — username (unique), password (hashed), role (user/admin) |
| `middleware/auth.js` | `isAuthenticated` — checks `req.session.userId`, attaches `req.user` |
| `middleware/auth.js` | `roleCheck` — gates routes by `req.user.role` |
| `controllers/authController.js` | Register (hash+save), Login (verify+create session+JWT), Logout (destroy session), Refresh (re-issue via session) |
| `routes/auth.js` | POST `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh` |
| `server.js` | Session middleware, MongoDB connect, auth routes, static file serving |

---

## Auth Flow

### 1. Register
```
POST /auth/register
{ "username": "alice", "password": "secret123", "role": "admin" }

→ 201 { "message": "User registered", "user": { ... } }
```

### 2. Login
```
POST /auth/login
{ "username": "alice", "password": "secret123" }

→ 200 {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": { ... }
  }
```
Server stores `{ userId, username, role }` in `req.session`. Session is persisted to MongoDB via connect-mongo. `Set-Cookie` header is sent to the browser. JWT tokens are also returned.

### 3. Access protected routes
The browser sends the session cookie automatically. `isAuthenticated` middleware reads `req.session.userId` — if present, it builds `req.user` and calls `next()`.

### 4. Refresh tokens
```
POST /auth/refresh
(no body — session cookie is sent automatically)

→ 200 { "accessToken": "eyJhbG...", "refreshToken": "eyJhbG..." }
```
Re-issues JWT tokens if the session is still valid.

### 5. Logout
```
POST /auth/logout
→ 200 { "message": "Logged out successfully" }
```
Destroys the session on the server and clears the cookie.

---

## Middleware

### `isAuthenticated`
Checks `req.session.userId` (set by express-session on login). If present, builds `{ id, username, role }` on `req.user` and calls `next()`. Returns 401 if no session.

### `roleCheck(requiredRole)`
Returns a middleware that checks `req.user.role`. Returns 403 if the role doesn't match.

---

## Protected Routes

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/employees` | Session cookie | any |
| POST | `/employees` | Session cookie | admin |
| PUT | `/employees/:id` | Session cookie | admin |
| DELETE | `/employees/:id` | Session cookie | admin |
| GET | `/admin-only` | Session cookie | admin |

---

## Testing

Open `http://localhost:5000/test-client.html` in a browser. Select **Session** mode. Register a user, login to create the session, then test employee CRUD. The cookie is handled automatically.
