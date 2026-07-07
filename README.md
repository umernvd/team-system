# Team Roster API

A Node.js/Express/MongoDB employee roster API with no authentication — pure Employee CRUD.

## Quick Start

```bash
npm install
node --env-file .env server.js
# or: npm start
```

Open http://localhost:5000/ to use the test client.

## Architecture

```
request → Route → Middleware → Validator → Controller → Service → Repository → MongoDB
```

Each layer has a single responsibility:

| Layer | Job |
|-------|------|
| **Route** | Match URL + method, chain middleware |
| **Middleware** | Log requests, validate input, handle errors |
| **Controller** | Parse request, call service, send response |
| **Service** | Business logic (decide what happens) |
| **Repository** | Database queries only |
| **Model** | Mongoose schema definition |

## Project Structure

```
.
├── server.js                 # Entry point
├── db.js                     # MongoDB connection (used by CLI)
├── app.js                    # CLI tool (standalone)
├── .env.example              # Environment variables template
├── package.json
├── README.md
│
├── routes/
│   ├── employee.js           # CRUD /employees
│   └── webhook.js            # POST /webhooks/test
│
├── controllers/
│   ├── employeeController.js
│   └── webhookController.js
│
├── services/
│   ├── employeeService.js
│   └── webhookService.js
│
├── repositories/
│   ├── employeeRepository.js
│   └── webhookEventRepository.js
│
├── validators/
│   ├── employeeValidator.js
│   └── webhookValidator.js
│
├── middlewares/
│   ├── requestLogger.js      # Logs every request
│   ├── validate.js           # Runs validators
│   ├── webhookSignature.js   # HMAC signature verification
│   ├── notFound.js           # 404 handler
│   └── errorHandler.js       # Central error handler
│
├── models/
│   ├── Employee.js
│   └── WebhookEvent.js
│
├── utils/
│   ├── response.js           # success() / error() helpers
│   └── AppError.js           # Custom error class
│
├── webhooks/
│   └── test.js               # Test webhook processor
│
└── public/
    └── test-client.html      # API test client
```

## API Endpoints

### Employees

| Method | Path | Description |
|--------|------|-------------|
| GET | `/employees` | List all employees |
| POST | `/employees` | Create one or bulk insert (array) |
| PUT | `/employees/:id` | Update employee by `_id` |
| DELETE | `/employees/:id` | Delete employee by `_id` |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/test` | Test webhook with HMAC verification |

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
