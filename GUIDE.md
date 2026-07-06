# Passport Session Auth Implementation Guide

## Overview

This branch adds **stateful authentication** using Passport.js with the Local Strategy and Express Session. User sessions are stored in MongoDB via connect-mongo, and a cookie identifies the session on each request. On login, the server also returns JWT tokens to meet the token-based spec. A /auth/refresh endpoint re-issues tokens using the existing session.

---

## Architecture

`
browser → POST /auth/login → Passport Local Strategy verifies credentials
                                      ↓
                              Session created, stored in MongoDB (connect-mongo)
                              Set-Cookie header returned to browser
                                      ↓
browser → GET /employees (cookie sent automatically) → isAuthenticated middleware
                                      ↓
                              Employee route handler (if session valid)
`

---

## Files Added / Modified

| File | What it does |
|------|--------------|
| config.js | JWT secrets, session secret, expiry durations, salt rounds |
| config/passport.js | Passport Local Strategy + serializeUser / deserializeUser |
| models/User.js | Mongoose schema — username (unique), password (hashed), role (user/admin) |
| middleware/auth.js | isAuthenticated — checks eq.isAuthenticated() from Passport |
| middleware/auth.js | oleCheck — gates routes by eq.user.role |
| controllers/authController.js | Register (hash+save), Login (Passport + JWT), Logout (destroy session), Refresh (re-issue via session) |
| outes/auth.js | POST /auth/register, /auth/login, /auth/logout, /auth/refresh |
| server.js | Session middleware, Passport init, MongoDB connect, auth routes, static file serving |

---

## Auth Flow

### 1. Register
`
POST /auth/register
{ "username": "alice", "password": "secret123", "role": "admin" }

→ 201 { "message": "User registered", "user": { ... } }
`

### 2. Login
`
POST /auth/login
{ "username": "alice", "password": "secret123" }

→ 200 {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": { ... }
  }
`
Passport verifies credentials. A session is created and stored in MongoDB. Set-Cookie header is sent to the browser. JWT tokens are also returned.

### 3. Access protected routes
The browser automatically sends the session cookie. No manual Authorization header needed. The isAuthenticated middleware checks eq.isAuthenticated().

### 4. Refresh tokens
`
POST /auth/refresh
(no body needed — session cookie is sent automatically)

→ 200 { "accessToken": "eyJhbG...", "refreshToken": "eyJhbG..." }
`
Uses the existing session to re-issue tokens. No separate refresh token storage needed.

### 5. Logout
`
POST /auth/logout
→ 200 { "message": "Logged out successfully" }
`
Destroys the session on the server and clears the cookie.

---

## Middleware

### isAuthenticated
Calls eq.isAuthenticated() (provided by Passport). Returns 401 if no valid session.

### oleCheck(requiredRole)
Returns a middleware that checks eq.user.role. Returns 403 if the role doesn't match.

---

## Protected Routes

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | /employees | Session cookie | any |
| POST | /employees | Session cookie | admin |
| PUT | /employees/:id | Session cookie | admin |
| DELETE | /employees/:id | Session cookie | admin |
| GET | /admin-only | Session cookie | admin |

---

## Testing

Open http://localhost:5000/test-client.html in a browser. Select **Session** mode. Register a user, login to create the session, then test employee CRUD. The cookie is handled automatically — no manual token or header management needed.
