# Environment Variables

All environment variables used by the application.

---

## Required

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `ADMIN_USERNAME` | Admin panel login username | `admin` |
| `ADMIN_PASSWORD` | Admin panel login password | `securepassword` |

## Optional

| Variable | Description | Default | Example |
|---|---|---|---|
| `APP_NAME` | Application name shown in healthcheck and email sender name | `"Grievance Portal"` | `"Anonymous Club Grievance Portal"` |
| `SMTP_USER` | Gmail address used to send notification emails | — | `portal@gmail.com` |
| `SMTP_PASS` | Gmail App Password ([how to generate](https://myaccount.google.com/apppasswords)) | — | `abcd efgh ijkl mnop` |

> **Note:** If `SMTP_USER` and `SMTP_PASS` are not set, the application will work normally but email notifications will be silently skipped.

---

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values.

3. For Gmail SMTP:
   - Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account
   - Generate an [App Password](https://myaccount.google.com/apppasswords)
   - Use that 16-character password as `SMTP_PASS`
