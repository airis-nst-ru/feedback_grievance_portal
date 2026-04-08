# Security Notes

This document outlines the current security posture of the Grievance Portal API and areas for improvement.

---

## Authentication Mechanism

### Admin Auth — `withAuth` Middleware

**How it works:**
1. Admin logs in via `POST /api/admin/auth` with `ADMIN_USERNAME` / `ADMIN_PASSWORD`
2. Server returns a token: `admin-token-<timestamp>`
3. All admin endpoints check for `Authorization: Bearer admin-token-*`

**⚠️ Weakness:** The middleware only checks that the token **starts with** `admin-token-`. It does not validate against any stored session, check expiry, or verify a signature. Any request with `Authorization: Bearer admin-token-anything` will be accepted.

**Recommendation:** For a production system, consider:
- JWT tokens with expiry and signature verification
- Session-based auth with server-side session storage
- Rate limiting on the login endpoint

---

## Unprotected Endpoints

The following endpoints have **no authentication**:

| Endpoint | Risk Level | Notes |
|---|---|---|
| `POST /api/submission` | **Medium** | Anyone can submit. Could be abused for spam. Consider rate limiting. |
| `GET /api/submission/:trackingId` | **Low** | Tracking IDs are random 6-char hex. Brute-forceable but unlikely. |

---

## CORS

There is **no CORS configuration**. All API endpoints are accessible from any origin. For a production deployment, consider adding CORS headers via `next.config.ts` or a root `middleware.ts`.

---

## Environment Variables

| Variable | Purpose | Sensitivity |
|---|---|---|
| `DATABASE_URL` | MongoDB connection string | 🔴 **High** |
| `ADMIN_USERNAME` | Admin login credential | 🔴 **High** |
| `ADMIN_PASSWORD` | Admin login credential | 🔴 **High** |
| `SMTP_USER` | Gmail address for notifications | 🟡 **Medium** |
| `SMTP_PASS` | Gmail App Password | 🔴 **High** |

Ensure `.env` is in `.gitignore` and never committed to version control.

---

## Recommendations Summary

1. **Add rate limiting** — Especially on `POST /api/submission` and `POST /api/admin/auth`
2. **Improve admin tokens** — Use JWTs or server-side sessions instead of prefix-based validation
3. **Add CORS policy** — Restrict which origins can call your API
4. **Input sanitization** — Sanitize `content` fields to prevent stored XSS if rendered in HTML
