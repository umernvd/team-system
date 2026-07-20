# Team Roster API — Auth0 Auth

A Node.js/Express/MongoDB employee roster API with Auth0 authentication. Auth0 handles all user management — the backend just verifies Auth0-issued JWT tokens.

## Quick Start

```bash
cp .env.example .env
# Fill in your Auth0 credentials in .env
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
| **Middleware** | Log requests, verify Auth0 JWT, check roles, validate input, handle errors |
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
├── PLAN.md                      # Development plan
│
├── routes/                      # URL routing
│   ├── employee.js              #   CRUD /employees (Auth0-protected)
│   └── webhook.js               #   POST /webhooks/test
│
├── controllers/                 # Thin request/response handlers
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/                    # Business logic
│   ├── employeeService.js
│   └── webhookService.js
│
├── repositories/                # Database queries
│   ├── employeeRepository.js
│   └── webhookEventRepository.js
│
├── validators/                  # Input validation (returns ALL errors)
│   ├── employeeValidator.js
│   └── webhookValidator.js
│
├── middlewares/                 # Reusable Express middleware
│   ├── requestLogger.js         #   Logs every request
│   ├── authenticateToken.js     #   Auth0 JWT verification via JWKS
│   ├── roleCheck.js             #   Admin role enforcement
│   ├── validate.js              #   Runs validators
│   ├── webhookSignature.js      #   HMAC signature verification
│   ├── notFound.js              #   404 handler
│   └── errorHandler.js          #   Central error handler
│
├── models/                      # Mongoose schemas
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
├── frontend/                    # React app (separate README inside)
│
└── PLAN.md
```

## API Endpoints

### Employees

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/employees` | Bearer (Auth0) | Any user |
| POST | `/employees` | Bearer (Auth0) | Admin |
| PUT | `/employees/:id` | Bearer (Auth0) | Admin |
| DELETE | `/employees/:id` | Bearer (Auth0) | Admin |

### Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/webhooks/test` | Signature | Test webhook with HMAC verification |

## Auth Flow

1. User logs in via **Auth0 Universal Login** (hosted login page by Auth0)
2. Auth0 redirects back to the React app with an ID token
3. React app calls `getAccessTokenSilently()` from Auth0 SDK to get an access token
4. React app sends `Authorization: Bearer <token>` to backend
5. Backend verifies the token's RS256 signature against Auth0's JWKS endpoint
6. Backend checks the `audience` and `issuer` match the configured values
7. If valid, request proceeds to controller → service → repository
8. When the token expires, Auth0 SDK automatically refreshes it in the background

## Response Format

**Success:**
```json
{ "success": true, "message": "Employees retrieved", "data": [...] }
```

**Error:**
```json
{ "success": false, "message": "Validation failed", "errors": ["Name is required"] }
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/teamRosterDB` | MongoDB connection string |
| `WEBHOOK_SECRET` | `test-webhook-secret` | HMAC secret for webhook verification |
| `AUTH0_DOMAIN` | `your-tenant.auth0.com` | Auth0 tenant domain |
| `AUTH0_AUDIENCE` | `https://team-roster-api` | API identifier in Auth0 dashboard |

## Auth0 Setup

1. Create a free account at [auth0.com](https://auth0.com)
2. Go to Dashboard → Applications → APIs → Create API
   - Name: `Team Roster API`
   - Identifier: `https://team-roster-api`
3. Go to Dashboard → Applications → Single Page Application → Create
   - Set Allowed Callback URLs: `http://localhost:3000`
   - Set Allowed Logout URLs: `http://localhost:3000`
   - Set Allowed Web Origins: `http://localhost:3000`
4. Copy the Domain and Client ID from the SPA settings
5. (Optional) Create an Auth0 Rule to add a `role` claim to user tokens for admin access

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
