# Google OAuth Authentication with JWT

## Architecture

```
browser → /auth/google → redirect to Google consent screen
Google → /auth/google/callback → Passport GoogleStrategy → findOrCreate User
  → generate JWT access + refresh tokens → return JSON

Subsequent requests:
  client → Authorization: Bearer <accessToken> → authenticateToken middleware → route handler
```

## Auth Flow

1. **Google Login**: User visits `/auth/google`, Passport redirects to Google's OAuth consent screen.
2. **Callback**: Google redirects to `/auth/google/callback` with an authorization code.
3. **Token Exchange**: `passport-google-oauth20` exchanges the code for an access token and fetches the user profile.
4. **Find or Create**: The strategy looks up the user by `googleId` or email, creates a new account if none exists, or links the Google ID to an existing account with the same email.
5. **JWT Generation**: The `oauthCallback` controller generates an access token (15 min) and a refresh token (7 days).
6. **Subsequent Requests**: The client includes `Authorization: Bearer <accessToken>` in every request.

## File Structure

| File | Purpose |
|------|---------|
| `config.js` | JWT secrets, expiry, Google OAuth credentials |
| `config/passport.js` | Passport GoogleStrategy configuration |
| `middleware/auth.js` | `authenticateToken` (JWT verify), `roleCheck()` (admin gate) |
| `controllers/authController.js` | register, login, oauthCallback, refresh, logout |
| `routes/auth.js` | Route definitions for auth endpoints |
| `server.js` | Express entry point, Passport init, route mounting |
| `routes/employee.js` | Employee CRUD with per-route admin role gating |
| `models/User.js` | User schema with googleId, displayName, role |
| `models/RefreshToken.js` | Refresh token persistence with TTL index |

## Middleware Chain

| Route | Middleware | Role Required |
|-------|-----------|---------------|
| `GET /employees` | `authenticateToken` | Any authenticated user |
| `POST /employees` | `authenticateToken` → `roleCheck('admin')` | Admin only |
| `PUT /employees/:id` | `authenticateToken` → `roleCheck('admin')` | Admin only |
| `DELETE /employees/:id` | `authenticateToken` → `roleCheck('admin')` | Admin only |
| `GET /admin-only` | `authenticateToken` → `roleCheck('admin')` | Admin only |
| `POST /auth/register` | None | Public |
| `POST /auth/login` | None | Public |
| `GET /auth/google` | Passport | Public |
| `GET /auth/google/callback` | Passport → oauthCallback | Public |
| `POST /auth/refresh` | None | Public (requires valid refresh token) |
| `POST /auth/logout` | None | Public (requires valid refresh token) |

## Endpoints

### Auth Routes (`/auth`)

**POST /auth/register** — Register a local user
```json
{ "username": "user@example.com", "password": "secret123", "role": "user" }
```

**POST /auth/login** — Local login
```json
{ "username": "user@example.com", "password": "secret123" }
```
Returns: `{ accessToken, refreshToken, user }`

**GET /auth/google** — Initiate Google OAuth (browser redirect)

**GET /auth/google/callback** — Google OAuth callback (returns JSON with tokens)

**POST /auth/refresh** — Refresh access token
```json
{ "refreshToken": "..." }
```
Returns: `{ accessToken, refreshToken }`

**POST /auth/logout** — Invalidate refresh token
```json
{ "refreshToken": "..." }
```

## Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/), create a project, and enable the Google+ API.
2. Create OAuth 2.0 credentials (Web application type).
3. Add `http://localhost:5000/auth/google/callback` as an authorized redirect URI.
4. Copy the Client ID and Client Secret into `config.js`.
5. Start the server: `node server.js`
6. Visit `http://localhost:5000/auth/google` to test the OAuth flow.

## Testing with the API Client

1. Open `http://localhost:5000/` in a browser.
2. The test client defaults to **Bearer** auth mode.
3. Click **Login with Google** — you'll be redirected to Google's consent screen.
4. After granting access, the browser shows a JSON response with `accessToken` and `refreshToken`.
5. Copy the `accessToken` value and paste it in the **Bearer Token** field.
6. Now you can test all employee CRUD endpoints.
