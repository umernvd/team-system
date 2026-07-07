# Team Roster — Passport Session Auth

Stateful authentication using Passport.js Local Strategy + Express Session. User sessions are stored in MongoDB via `connect-mongo`.

## Quick Start

```bash
node --env-file .env server.js
# or
npm start
```

Open http://localhost:5000/test-client.html and select **Session** mode.

## Auth Flow

1. **Register** — `POST /auth/register` with `{ username, password, role? }`
2. **Login** — `POST /auth/login` — Passport verifies credentials, session created in MongoDB, Set-Cookie returned. JWT tokens also returned.
3. **Protected routes** — browser sends session cookie automatically; `isAuthenticated` middleware checks `req.isAuthenticated()`
4. **Refresh** — `POST /auth/refresh` — re-issues tokens using existing session (no body needed)
5. **Logout** — `POST /auth/logout` — destroys session

## API

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/auth/register` | — | — |
| POST | `/auth/login` | — | — |
| POST | `/auth/logout` | session | — |
| POST | `/auth/refresh` | session | — |
| GET | `/employees` | session | any |
| POST | `/employees` | session | admin |
| PUT | `/employees/:id` | session | admin |
| DELETE | `/employees/:id` | session | admin |
| GET | `/admin-only` | session | admin |
| POST | `/webhooks/test` | webhook signature | — |

## Environment Variables

See `.env.example`.
