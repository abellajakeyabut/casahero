# CasaHero API Contracts

The HTTP endpoints the UI calls or mocks today, as of 2026-10-18.

## Overview

| Method | Path | Called by UI | Express server | MSW mock |
|---|---|---|---|---|
| `POST` | `/casahero-api/signup` | Yes | Yes | Yes |
| `POST` | `/casahero-api/login` | Yes | Yes | Yes (3s delay) |
| `POST` | `/casahero-api/logout` | Yes | Yes | Yes (3s delay) |
| `GET` | `/casahero-api/landlords` | No | No | Yes |
| `GET` | `/casahero-api/leases` | No | No | Yes |
| `GET` | `/casahero-api/test` | No | No | Yes |

Sources:
- Client calls: `casahero-ui/src/api/auth.js`
- Server: `casahero-server/server.js`
- Mocks: `casahero-ui/src/mocks/handlers.js`, with mock data in `casahero-ui/src/mocks/db.js`

## Conventions

**Base URL.** The client uses `VITE_API_URL`, or `/casahero-api` when that isn't set (see `casahero-ui/src/api/api.js`).
- **Development:** `.env` sets `http://localhost:5173/casahero-api`. That is the Vite dev server, and MSW intercepts the requests in the browser.
- **Production:** the Express server serves the UI and the API from the same origin on port `3000`.

**Request format.** JSON, sent with `Content-Type: application/json`. The axios client times out after 10 seconds.

**Response format.** Every endpoint that is implemented today returns HTTP `200` with this envelope:

```json
{ "outcome": "<human-readable message>", "success": true }
```

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Whether the operation succeeded. The UI branches on this field. |
| `outcome` | string | A message for display or logging. |

**Errors.** No error contract is defined yet. The server never returns `success: false` or a non-2xx status. On the client, a non-2xx response or a network failure makes axios throw. The login page catches that and shows "Could not reach the server".

**Authentication.** No tokens or sessions exist yet. Logged-in state lives only in the UI's in-memory `userContext`.

## Auth

### `POST /casahero-api/signup`

Creates an account. Called from `Signup.jsx` through `signup()`.

Request body:

```json
{
  "name": "Tan Wei Ming",
  "email": "tan.weiming@example.com",
  "password": "secret",
  "confirmPassword": "secret"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Full name. |
| `email` | string | Yes | |
| `password` | string | Yes | |
| `confirmPassword` | string | No | Sent today, but only needed on the client (see Known issues). |

Response `200`:

```json
{ "outcome": "Signup successful!", "success": true }
```

UI behavior: when `success` is `true`, the UI shows the success modal.

### `POST /casahero-api/login`

Logs a user in. Called from `AuthProvider.authenticate()` through `login()`.

Request body:

```json
{ "username": "tan.weiming", "password": "secret" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | Yes | |
| `password` | string | Yes | |

The role the user picks (`tenant` or `landlord`) is **not** sent.

Response `200`:

```json
{ "outcome": "login successful!", "success": true }
```

UI behavior:
- `success: true`: the UI sets `userContext.loggedIn = true` and `userContext.username`, then goes to `/dashboard`.
- `success: false` or a missing body: the UI shows "Invalid username or password."
- The request throws: the UI shows "Could not reach the server."

### `POST /casahero-api/logout`

Logs a user out. Called from `TopBanner.jsx` through `logout()`.

Request body: the current `userContext`, spread as-is:

```json
{ "role": "landlord", "loggedIn": true, "username": "tan.weiming" }
```

Response `200`:

```json
{ "outcome": "logout successful!", "success": true }
```

UI behavior: when `success` is `true`, the UI clears `userContext` and goes to `/login`.

## Data (mock only)

These endpoints exist only in MSW. No UI code calls them yet, and the Express server doesn't implement them.

### `GET /casahero-api/landlords`

Response `200`: an array of landlords.

```json
[
  {
    "id": "ll-001",
    "email": "tan.weiming@example.com",
    "full_name": "Tan Wei Ming",
    "phone": "+65 9123 4567",
    "avatar_url": null,
    "default_role": "landlord",
    "auth_provider": "google",
    "created_at": "2026-01-05T09:00:00Z"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Prefix `ll-`. |
| `email` | string | |
| `full_name` | string | |
| `phone` | string | E.164-style, with spaces. |
| `avatar_url` | string or null | |
| `default_role` | string | `"landlord"`. |
| `auth_provider` | string | For example `"google"` or `"facebook"`. |
| `created_at` | string | ISO 8601 timestamp, UTC. |

### `GET /casahero-api/leases`

Response `200`: an array of leases.

```json
[
  {
    "id": "ls-001",
    "unit_id": "un-001",
    "landlord_id": "ll-001",
    "tenant_id": "tn-001",
    "start_date": "2026-04-01",
    "end_date": "2027-03-31",
    "monthly_rent_cents": 320000,
    "deposit_cents": 320000,
    "currency": "SGD",
    "due_day": 1,
    "status": "active",
    "document_paths": ["leases/ls-001/tenancy-agreement.pdf"],
    "created_at": "2026-03-15T09:00:00Z"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Prefix `ls-`. |
| `unit_id` | string | References a unit (`un-`). |
| `landlord_id` | string | References a landlord (`ll-`). |
| `tenant_id` | string | References a tenant (`tn-`). |
| `start_date` | string | `YYYY-MM-DD`. |
| `end_date` | string | `YYYY-MM-DD`. |
| `monthly_rent_cents` | integer | In the smallest currency unit. `320000` means SGD 3,200.00. |
| `deposit_cents` | integer | Same unit as `monthly_rent_cents`. |
| `currency` | string | ISO 4217 code, for example `"SGD"`. |
| `due_day` | integer | Day of the month that rent is due. |
| `status` | string | For example `"active"`. |
| `document_paths` | string[] | Storage paths for lease documents. |
| `created_at` | string | ISO 8601 timestamp, UTC. |

### `GET /casahero-api/test`

A connectivity check.

Response `200`:

```json
{ "id": 1, "message": "hello bandit" }
```

## Known issues

1. **The server ignores request bodies.** `server.js` has no `app.use(express.json())`, so `req.body` is `undefined`. Signup and login succeed for any input.
2. **The server always succeeds.** None of the auth endpoints validate input, and none can return `success: false`.
3. **The role isn't part of login.** The server can't tell whether a user is a tenant or a landlord. The UI trusts the toggle on the login page.
4. **`confirmPassword` is sent to the server.** It should be checked on the client and removed from the request body.
5. **Logout sends the whole `userContext`.** The server has no session to end, so the body isn't used.
6. **The signup mock returns the wrong message.** It returns `"login successful!"`. The server returns `"Signup successful!"`.
7. **Some endpoints exist only as mocks.** `landlords`, `leases` and `test` work in development through MSW, but return `index.html` from the Express server in production.
