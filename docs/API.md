# API Documentation

> **Base URL:** `http://localhost:3000/api` (development) or your deployed domain.

---

## Table of Contents

- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
  - [Healthcheck](#healthcheck)
  - [Submit Feedback / Grievance](#submit-feedback--grievance)
  - [Check Submission Status](#check-submission-status)
- [Admin Endpoints](#admin-endpoints)
  - [Admin Login](#admin-login)
  - [List Submissions](#list-submissions)
  - [Get Submission by ID](#get-submission-by-id)
  - [Update Submission Status](#update-submission-status)
  - [Reply to Submission](#reply-to-submission)
  - [List Notification Emails](#list-notification-emails)
  - [Add Notification Email](#add-notification-email)
  - [Remove Notification Email](#remove-notification-email)

---

## Authentication

Admin endpoints require a `Bearer` token obtained from the [Admin Login](#admin-login) endpoint.

```
Authorization: Bearer admin-token-<timestamp>
```

---

## Public Endpoints

These endpoints require **no authentication**.

### Healthcheck

Check if the server is running.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/healthcheck` |
| **Auth** | None |

#### Response `200`

```json
{
  "status": 200,
  "message": "Anonymous Club Grievance Portal server is up and running!",
  "success": true
}
```

---

### Submit Feedback / Grievance

Submit an anonymous feedback or grievance. Triggers email notifications to all configured admin notification emails.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/submission` |
| **Auth** | None |

#### Request Body

```json
{
  "type": "grievance",
  "content": "The cafeteria food quality has deteriorated."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `string` | ✅ | Must be `"grievance"` or `"feedback"` |
| `content` | `string` | ✅ | The submission content |

#### Response `200`

```json
{
  "success": true,
  "trackingId": "GRV-A1B2C3",
  "message": "Your submission has been received. Use this ID to check status: GRV-A1B2C3"
}
```

#### Error `400`

```json
{
  "success": false,
  "error": "Missing type or content"
}
```

> **Note:** Tracking IDs are prefixed with `GRV-` for grievances and `FB-` for feedback, followed by 6 random hex characters.

---

### Check Submission Status

Look up a submission using its tracking ID.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/submission/:trackingId` |
| **Auth** | None |

#### Response `200`

```json
{
  "success": true,
  "data": {
    "type": "grievance",
    "status": "pending",
    "content": "The cafeteria food quality has deteriorated.",
    "createdAt": "2026-04-08T05:50:47.965Z",
    "replies": [
      {
        "content": "We have noted your concern and will address it.",
        "createdAt": "2026-04-08T06:00:00.000Z"
      }
    ]
  }
}
```

#### Error `404`

```json
{
  "success": false,
  "error": "Submission not found"
}
```

---

## Admin Endpoints

All admin endpoints (except login) require the `Authorization` header with a valid admin token.

```
Authorization: Bearer admin-token-<timestamp>
```

### Admin Login

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/admin/auth` |
| **Auth** | None |

#### Request Body

```json
{
  "username": "admin",
  "password": "admin"
}
```

#### Response `200`

```json
{
  "success": true,
  "token": "admin-token-1712556047965",
  "message": "Login successful"
}
```

#### Error `401`

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

> **Note:** Credentials are checked against `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

---

### List Submissions

Retrieve all submissions with optional filters.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/admin/submissions` |
| **Auth** | Admin Bearer Token |

#### Query Parameters

| Param | Type | Required | Values |
|---|---|---|---|
| `status` | `string` | ❌ | `pending`, `reviewing`, `resolved` |
| `type` | `string` | ❌ | `grievance`, `feedback` |

#### Example

```
GET /api/admin/submissions?status=pending&type=grievance
```

#### Response `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "663f...",
      "type": "grievance",
      "status": "pending",
      "content": "The cafeteria food quality has deteriorated.",
      "trackingId": "GRV-A1B2C3",
      "createdAt": "2026-04-08T05:50:47.965Z",
      "updatedAt": "2026-04-08T05:50:47.965Z",
      "replies": []
    }
  ]
}
```

---

### Get Submission by ID

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/admin/submissions/:id` |
| **Auth** | Admin Bearer Token |

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": "663f...",
    "type": "grievance",
    "status": "pending",
    "content": "The cafeteria food quality has deteriorated.",
    "trackingId": "GRV-A1B2C3",
    "createdAt": "2026-04-08T05:50:47.965Z",
    "updatedAt": "2026-04-08T05:50:47.965Z",
    "replies": [
      {
        "id": "664a...",
        "content": "We will look into this.",
        "createdAt": "2026-04-08T06:00:00.000Z",
        "submissionId": "663f..."
      }
    ]
  }
}
```

#### Error `404`

```json
{
  "success": false,
  "message": "Submission not found"
}
```

---

### Update Submission Status

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/admin/submissions/:id/status` |
| **Auth** | Admin Bearer Token |

#### Request Body

```json
{
  "status": "reviewing"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `status` | `string` | ✅ | `pending`, `reviewing`, `resolved` |

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": "663f...",
    "type": "grievance",
    "status": "reviewing",
    "content": "...",
    "trackingId": "GRV-A1B2C3",
    "createdAt": "2026-04-08T05:50:47.965Z",
    "updatedAt": "2026-04-08T06:10:00.000Z"
  }
}
```

---

### Reply to Submission

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/admin/submissions/:id/reply` |
| **Auth** | Admin Bearer Token |

#### Request Body

```json
{
  "content": "We have noted your concern and will address it shortly."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | `string` | ✅ | Reply text (non-empty) |

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": "664a...",
    "content": "We have noted your concern and will address it shortly.",
    "createdAt": "2026-04-08T06:00:00.000Z",
    "submissionId": "663f..."
  }
}
```

#### Error `404`

```json
{
  "success": false,
  "message": "Submission not found"
}
```

---

### List Notification Emails

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/admin/notifications` |
| **Auth** | Admin Bearer Token |

#### Response `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "665b...",
      "email": "admin@example.com",
      "createdAt": "2026-04-08T05:50:05.053Z"
    }
  ]
}
```

---

### Add Notification Email

Add an email address to receive notifications when new submissions arrive.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/admin/notifications` |
| **Auth** | Admin Bearer Token |

#### Request Body

```json
{
  "email": "admin@example.com"
}
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": "665b...",
    "email": "admin@example.com",
    "createdAt": "2026-04-08T05:50:05.053Z"
  }
}
```

#### Error `409`

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### Remove Notification Email

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/admin/notifications` |
| **Auth** | Admin Bearer Token |

#### Request Body

```json
{
  "email": "admin@example.com"
}
```

#### Response `200`

```json
{
  "success": true,
  "message": "Notification removed"
}
```

#### Error `404`

```json
{
  "success": false,
  "message": "Notification not found"
}
```
