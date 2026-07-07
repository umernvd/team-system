# Team Roster API — Middleware Session Auth

A Node.js/Express/MongoDB employee roster API with stateful authentication using custom middleware + Express Session. No third-party auth library — just `req.session.userId` directly. Sessions are stored in MongoDB via `connect-mongo`.

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
| **Middleware** | Log requests, check session, check roles, validate input, handle errors |
| **Controller** | Parse request, call service, send response |
| **Service** | Business logic (decide what happens) |
| **Repository** | Database queries only |
| **Model** | Mongoose schema definition |

## Project Structure

```
.
├── server.js                    # Entry point — session, routes
├── db.js                        # MongoDB connection (used by CLI)
├── app.js                       # CLI tool (standalone)
├── .env.example                 # Environment variables template
├── package.json
├── README.md
│
├── routes/                      # URL routing
│   ├── auth.js                  #   POST /auth/register, /login, /logout, /refresh
│   ├── employee.js              #   CRUD /employees
│   └── webhook.js               #   POST /webhooks/test
│
├── controllers/                 # Thin request/response handlers
│   ├── authController.js        #   session: set req.session.userId on login
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/                    # Business logic
│   ├── authService.js           #   find user, compare password, generate JWT
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
│   ├── isAuthenticated.js       #   checks req.session.userId (custom session)
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
2. **Login**: `POST /auth/login` — `authService.login` verifies credentials → controller sets `req.session.userId/username/role` manually → connect-mongo persists session → Set-Cookie header. JWT tokens also returned.
3. **Protected routes**: Browser sends session cookie automatically. `isAuthenticated` middleware reads `req.session.userId` directly — no Passport needed.
4. **Refresh**: `POST /auth/refresh` — re-issues JWT tokens if `req.session.userId` is valid (no body or refresh token needed).
5. **Logout**: `POST /auth/logout` — `req.session.destroy(cb)` destroys the session + clears cookie.

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
POST /auth/login

1. Route           → matches POST /login → [validate, controller]
2. requestLogger   → logs [POST] /auth/login → 200 (35ms)
3. validate        → runs authValidator.validateLogin(req)
                     collects ALL errors in array
                     if errors.length > 0 → throw AppError(400, errors)
4. Controller      → calls authService.login({ username, password })
5. Service         → userRepository.findByUsername(username)
                     bcrypt.compare(password, user.password)
                     jwt.sign({ userId, username, role }, SECRET, ...)
                     return { user, tokens }
6. Repository      → User.findOne({ username }) → Mongoose doc
7. Controller      → req.session.userId = user._id
                     req.session.username = user.username
                     req.session.role = user.role
                  → success(res, { accessToken, refreshToken, user }, ...)
8. notFound        → if no route matched → 404 AppError
9. errorHandler    → catches any thrown AppError → { success, message, errors }
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
