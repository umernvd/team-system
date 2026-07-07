# Team Roster API — Basic Auth

A Node.js/Express/MongoDB employee roster API with HTTP Basic Authentication, built with a clean layered architecture.

## Quick Start

```bash
cp .env.example .env
npm install
node server.js
# or: npm start
```

## Architecture

```
request → Route → Middleware → Validator → Controller → Service → Repository → MongoDB
```

Each layer has a single responsibility:

| Layer | Job |
|-------|-----|
| **Route** | Match URL + method, chain middleware |
| **Middleware** | Log requests, check auth, validate input, handle errors |
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
│
├── routes/                      # URL routing
│   ├── auth.js                  #   POST /auth/register, /login, /logout
│   ├── employee.js              #   CRUD /employees
│   └── webhook.js               #   POST /webhooks/test
│
├── controllers/                 # Thin request/response handlers
│   ├── authController.js
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/                    # Business logic
│   ├── authService.js
│   ├── employeeService.js
│   └── webhookService.js
│
├── repositories/                # Database queries
│   ├── userRepository.js
│   ├── employeeRepository.js
│   └── webhookEventRepository.js
│
├── validators/                  # Input validation (returns ALL errors)
│   ├── authValidator.js
│   ├── employeeValidator.js
│   └── webhookValidator.js
│
├── middlewares/                 # Reusable Express middleware
│   ├── requestLogger.js         #   Logs every request
│   ├── basicAuth.js             #   HTTP Basic authentication
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
    └── test-client.html         # API test client
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create an account |
| POST | `/auth/login` | None | Verify credentials |
| POST | `/auth/logout` | None | Discard credentials |

### Employees

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/employees` | Basic | Any user |
| POST | `/employees` | Basic | Admin |
| PUT | `/employees/:id` | Basic | Admin |
| DELETE | `/employees/:id` | Basic | Admin |

### Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/test` | Signature | Test webhook with HMAC verification |

### Other

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/admin-only` | Basic | Admin |

## Request Flow Example

```
POST /employees

1. Route           → matches POST /employees
2. basicAuth       → decodes Basic auth header, finds user, checks password
3. roleCheck       → verifies req.user.role === 'admin'
4. validate        → runs employeeValidator.validateCreate()
5. Controller      → calls employeeService.create(req.body)
6. Service         → checks if array or single, calls repository
7. Repository      → Employee.insertMany() or Employee.save()
8. Controller      → sends response via success() helper
9. ErrorHandler    → catches any thrown errors → consistent format
```

## Response Format

Every API response follows the same two shapes:

**Success:**
```json
{
  "success": true,
  "message": "Employees retrieved",
  "data": [...]
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Name is required", "Role is required"]
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/teamRosterDB` | MongoDB connection string |
| `SALT_ROUNDS` | `10` | bcrypt salt rounds |
| `WEBHOOK_SECRET` | `test-webhook-secret` | HMAC secret for webhook verification |

Run with `node --env-file .env server.js` or `npm start`.

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
