# Team Roster API — JWT Auth

A Node.js/Express/MongoDB employee roster API with JWT authentication (access + refresh tokens), built with a clean layered architecture.

## Quick Start

```bash
cp .env.example .env
npm install
node --env-file .env server.js
# or: npm start
```

## Architecture

```
request → Route → Middleware → Validator → Controller → Service → Repository → MongoDB
```

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
├── server.js                    # Entry point
├── db.js                        # MongoDB connection
├── app.js                       # CLI tool (standalone)
├── .env.example                 # Environment variables template
├── package.json
├── README.md
│
├── routes/                      # URL routing
│   ├── auth.js                  #   POST /auth/register, /login, /refresh, /logout
│   ├── employee.js              #   CRUD /employees
│   └── webhook.js               #   POST /webhooks/test
│
├── controllers/                 # Thin request/response handlers
│   ├── authController.js
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/                    # Business logic
│   ├── authService.js           #   Token generation, refresh rotation
│   ├── employeeService.js
│   └── webhookService.js
│
├── repositories/                # Database queries
│   ├── userRepository.js
│   ├── employeeRepository.js
│   ├── refreshTokenRepository.js
│   └── webhookEventRepository.js
│
├── validators/                  # Input validation (returns ALL errors)
│   ├── authValidator.js         #   Register + login
│   ├── authTokenValidator.js    #   Refresh + logout
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
│   ├── User.js
│   ├── Employee.js
│   ├── RefreshToken.js
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
    └── test-client.html         # API test client
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create an account |
| POST | `/auth/login` | None | Login → get access + refresh tokens |
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

## Auth Flow

1. **Register**: `POST /auth/register` with `{ username, password, role? }`
2. **Login**: `POST /auth/login` → receive `{ accessToken, refreshToken, user }`
3. **Access protected routes**: Include `Authorization: Bearer <accessToken>` header
4. **Token refresh** (when access token expires): `POST /auth/refresh` with `{ refreshToken }` → receive new pair
5. **Logout**: `POST /auth/logout` with `{ refreshToken }` → token is invalidated

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
| `ACCESS_TOKEN_SECRET` | `access-secret-change-me` | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | `refresh-secret-change-me` | JWT signing secret for refresh tokens |
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
