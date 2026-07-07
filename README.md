# Team Roster API — Google OAuth + JWT

A Node.js/Express/MongoDB employee roster API with Google OAuth 2.0 authentication using Passport.js GoogleStrategy. Supports both Google login and local username/password login with JWT access + refresh token rotation.

## Quick Start

```bash
cp .env.example .env
# Edit .env with your Google OAuth credentials
npm install
node --env-file .env server.js
# or: npm start
```

Open http://localhost:5000/ and click **Login with Google**.

## Architecture

```
request → Route → Middleware → Validator → Controller → Service → Repository → MongoDB
```

Each layer has a single responsibility:

| Layer | Job |
|-------|------|
| **Route** | Match URL + method, chain middleware |
| **Middleware** | Log requests, verify JWT, check roles, validate input, handle errors |
| **Controller** | Parse request, call service, send response |
| **Service** | Business logic (decide what happens) |
| **Repository** | Database queries only |
| **Model** | Mongoose schema definition |

## Project Structure

```
.
├── server.js                    # Entry point — passport init, routes
├── db.js                        # MongoDB connection (used by CLI)
├── app.js                       # CLI tool (standalone)
├── .env.example                 # Environment variables template
├── package.json
├── README.md
│
├── config/
│   └── passport.js              # Passport GoogleStrategy (findOrCreate by googleId/email)
│
├── routes/                      # URL routing
│   ├── auth.js                  #   POST /auth/register, /login, /refresh, /logout
│   │                            #   GET  /auth/google, /auth/google/callback
│   ├── employee.js              #   CRUD /employees (JWT Bearer per-route)
│   └── webhook.js               #   POST /webhooks/test
│
├── controllers/                 # Thin request/response handlers
│   ├── authController.js        #   oauthCallback wraps passport.authenticate('google')
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/                    # Business logic
│   ├── authService.js           #   register, login, oauthCallback, refresh (rotation), logout
│   ├── employeeService.js
│   └── webhookService.js
│
├── repositories/                # Database queries
│   ├── userRepository.js        #   + findByGoogleId, findByEmail
│   ├── employeeRepository.js
│   ├── refreshTokenRepository.js
│   └── webhookEventRepository.js
│
├── validators/                  # Input validation (returns ALL errors)
│   ├── authValidator.js         #   Register + login
│   ├── authTokenValidator.js    #   Refresh + logout (requires refreshToken)
│   ├── employeeValidator.js     #   CRUD
│   └── webhookValidator.js
│
├── middlewares/                 # Reusable Express middleware
│   ├── requestLogger.js         #   Logs every request
│   ├── authenticateToken.js     #   JWT Bearer token verification
│   ├── roleCheck.js             #   Admin role enforcement
│   ├── validate.js              #   Runs validators
│   ├── webhookSignature.js      #   HMAC signature verification
│   ├── notFound.js              #   404 handler
│   └── errorHandler.js          #   Central error handler
│
├── models/                      # Mongoose schemas
│   ├── User.js                  #   googleId, displayName, optional password
│   ├── Employee.js
│   ├── RefreshToken.js          #   TTL index on expiresAt
│   └── WebhookEvent.js
│
├── utils/
│   ├── response.js              # success() / error() helpers
│   └── AppError.js              # Custom error class
│
├── webhooks/
│   └── test.js                  # Test webhook processor
│
└── public/
    └── test-client.html         # API test client (bearer mode default)
```

## Auth Flow

### Google OAuth
1. User clicks **Login with Google** → redirected to Google consent screen
2. User grants access → Google redirects to `/auth/google/callback`
3. Passport GoogleStrategy fetches profile → finds or creates user by `googleId` or email
4. Controller calls `authService.oauthCallback(user)` → generates JWT tokens + saves refresh token to DB
5. Response returns `{ accessToken, refreshToken, user }`

### Local Login
1. `POST /auth/login` with `{ username, password }`
2. Service looks up user, verifies password (fails if Google-only account)
3. Generates JWT tokens + saves refresh token to DB

### Token Refresh
1. `POST /auth/refresh` with `{ refreshToken }`
2. Service verifies refresh token in DB, verifies JWT, deletes old token
3. Generates new token pair + saves new refresh token (rotation)

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create a local account |
| POST | `/auth/login` | None | Local login → tokens + user |
| GET | `/auth/google` | None | Initiate Google OAuth (browser redirect) |
| GET | `/auth/google/callback` | None | Google OAuth callback → tokens + user |
| POST | `/auth/refresh` | None | Exchange refresh token for new pair |
| POST | `/auth/logout` | None | Invalidate refresh token |

### Employees

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/employees` | Bearer | Any user |
| POST | `/employees` | Bearer | Admin |
| PUT | `/employees/:id` | Bearer | Admin |
| DELETE | `/employees/:id` | Bearer | Admin |

### Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/test` | Signature | Test webhook with HMAC verification |

### Other

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/admin-only` | Bearer | Admin |

## Request Flow Example

```
GET /auth/google/callback (after Google consent)

1. Route           → matches GET /google/callback → [controller]
2. requestLogger   → logs [GET] /auth/google/callback → 200 (450ms)
3. Controller      → passport.authenticate('google', { session: false }, cb)
4. Strategy        → config/passport.js (GoogleStrategy)
                     → exchanges auth code for Google profile
                     → findByGoogleId or findByEmail or create user
                     → returns Mongoose user doc
5. Controller (cb) → calls authService.oauthCallback(user)
6. Service         → generateTokens(user)
                     → refreshTokenRepository.create({ token, userId, expiresAt })
7. Response        → { success, message, data: { accessToken, refreshToken, user } }
```

## Response Format

**Success:**
```json
{ "success": true, "message": "Employees retrieved", "data": [...] }
```

**Error:**
```json
{ "success": false, "message": "Validation failed", "errors": ["Name is required", "Role is required"] }
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/teamRosterDB` | MongoDB connection string |
| `SALT_ROUNDS` | `10` | bcrypt salt rounds |
| `ACCESS_TOKEN_SECRET` | `your-access-secret-change-me` | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | `your-refresh-secret-change-me` | JWT signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | `7d` | Refresh token lifetime |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `http://localhost:5000/auth/google/callback` | OAuth redirect URI |
| `WEBHOOK_SECRET` | `test-webhook-secret` | HMAC secret for webhook verification |

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/), create a project
2. Enable the Google+ API
3. Create OAuth 2.0 credentials (Web application type)
4. Add your callback URL (e.g. `http://localhost:5000/auth/google/callback`) as an authorized redirect URI
5. Copy Client ID and Client Secret to `.env`

## Testing Webhooks

```bash
SECRET="test-webhook-secret"
SIG=$(echo -n '{"event":"test","data":{"message":"hello"}}' | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:5000/webhooks/test \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIG" \
  -H "X-Webhook-Event-Id: test-123" \
  -d '{"event":"test","data":{"message":"hello"}}'
```

## CLI Tool

```bash
node app.js list
node app.js add "Name" "Role" "Dept"
node app.js update <numericId> "New Role"
node app.js delete <numericId>
```
