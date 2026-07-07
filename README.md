# Team Roster API — Passport Session Auth

A Node.js/Express/MongoDB employee roster API with stateful authentication using Passport.js Local Strategy + Express Session. User sessions are stored in MongoDB via `connect-mongo`.

## Quick Start

```bash
cp .env.example .env
npm install
node --env-file .env server.js
# or: npm start
```

Open http://localhost:5000/test-client.html and select **Session** mode — the cookie is handled automatically.

## Architecture

```
request → Route → Middleware → Validator → Controller → Service → Repository → MongoDB
```

Each layer has a single responsibility:

| Layer | Job |
|-------|------|
| **Route** | Match URL + method, chain middleware |
| **Middleware** | Log requests, check auth, check roles, validate input, handle errors |
| **Controller** | Parse request, call service, send response |
| **Service** | Business logic (decide what happens) |
| **Repository** | Database queries only |
| **Model** | Mongoose schema definition |

## Project Structure

```
.
├── server.js                    # Entry point — session, passport, routes
├── db.js                        # MongoDB connection (used by CLI)
├── app.js                       # CLI tool (standalone)
├── .env.example                 # Environment variables template
├── package.json
├── README.md
│
├── config/
│   └── passport.js              # Passport Local Strategy + serializeUser
│
├── routes/                      # URL routing
│   ├── auth.js                  #   POST /auth/register, /login, /logout, /refresh
│   ├── employee.js              #   CRUD /employees
│   └── webhook.js               #   POST /webhooks/test
│
├── controllers/                 # Thin request/response handlers
│   ├── authController.js        #   login handles req.logIn, logout handles req.logout
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/                    # Business logic
│   ├── authService.js           #   find user, compare password, generate JWT, no DB refresh
│   ├── employeeService.js
│   └── webhookService.js
│
├── repositories/                # Database queries
│   ├── userRepository.js
│   ├── employeeRepository.js
│   └── webhookEventRepository.js
│
├── validators/                  # Input validation (returns ALL errors)
│   ├── authValidator.js         #   Register + login
│   ├── employeeValidator.js     #   CRUD
│   └── webhookValidator.js
│
├── middlewares/                 # Reusable Express middleware
│   ├── requestLogger.js         #   Logs every request
│   ├── isAuthenticated.js       #   checks req.isAuthenticated() (Passport session)
│   ├── roleCheck.js             #   Admin role enforcement
│   ├── validate.js              #   Runs validators
│   ├── webhookSignature.js      #   HMAC signature verification
│   ├── notFound.js              #   404 handler
│   └── errorHandler.js          #   Central error handler
│
├── models/                      # Mongoose schemas
│   ├── User.js
│   ├── Employee.js
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
    └── test-client.html         # API test client (session mode default)
```

## Auth Flow

1. **Register**: `POST /auth/register` with `{ username, password, role? }`
2. **Login**: `POST /auth/login` — `authService.login` verifies credentials → `req.logIn(user, cb)` creates the Passport session (stored in MongoDB via connect-mongo) → Set-Cookie header returned. JWT tokens also returned alongside the session.
3. **Protected routes**: Browser sends the session cookie automatically. `isAuthenticated` middleware checks `req.isAuthenticated()` (Passport deserializes the user from session).
4. **Refresh**: `POST /auth/refresh` — re-issues JWT tokens using the existing session (no body or refresh token needed).
5. **Logout**: `POST /auth/logout` — `req.logout(cb)` destroys the session both server-side and clears the cookie.

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create an account |
| POST | `/auth/login` | None | Login → session cookie + JWT tokens |
| POST | `/auth/logout` | Session | Destroy session |
| POST | `/auth/refresh` | Session | Re-issue JWT tokens |

### Employees

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/employees` | Session | Any | List all employees |
| POST | `/employees` | Session | Admin | Create (single or bulk) |
| PUT | `/employees/:id` | Session | Admin | Update by `_id` |
| DELETE | `/employees/:id` | Session | Admin | Delete by `_id` |

### Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/test` | Signature | Test webhook with HMAC verification |

### Other

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/admin-only` | Session | Admin |

## Request Flow Example

```
POST /employees

1. Route           → matches POST /employees
2. requestLogger   → logs [POST] /employees → status (durationms)
3. isAuthenticated → checks req.isAuthenticated() → 401 or next
4. roleCheck       → verifies req.user.role === 'admin'
5. validate        → runs employeeValidator.validateCreate() → collects ALL errors
6. Controller      → calls employeeService.create(req.body)
7. Service         → checks if array or single → calls repository
8. Repository      → Employee.insertMany() or Employee.save()
9. Controller      → sends response via success() helper
10. notFound       → if no route matched → 404 AppError
11. errorHandler   → catches any thrown AppError → { success, message, errors }
```

## Response Format

Every API response follows the same two shapes:

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
| `SESSION_SECRET` | `your-session-secret-change-me` | Express session signing secret |
| `ACCESS_TOKEN_SECRET` | `your-access-secret-change-me` | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | `your-refresh-secret-change-me` | JWT signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | `7d` | Refresh token lifetime |
| `WEBHOOK_SECRET` | `test-webhook-secret` | HMAC secret for webhook verification |

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
