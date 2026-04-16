# Backend

Rails API for Maddox Gaming storefront, community features, and payment orchestration.

## Payment Endpoints

- `POST /api/mpesa/pay`: dedicated Daraja STK initiation endpoint.
- `POST /api/mpesa/callback`: Daraja callback receiver alias.
- `POST /api/v1/checkouts`: create a pending order and return payment configuration.
- `POST /api/v1/checkouts/:id/verify`: verify a Flutterwave transaction from the backend.
- `GET /api/v1/orders`: list the current user’s recent orders.
- `POST /api/v1/orders/:id/retry`: retry a failed or pending order payment.
- `GET /api/v1/finance/summary`: revenue and payment analytics for admin users.
- `POST /api/v1/payments/flutterwave/webhook`: webhook receiver for Flutterwave confirmation.
- `POST /api/v1/payments/mpesa/callback`: callback receiver for Daraja STK confirmation.

## Upload Endpoints

- `POST /api/v1/direct_uploads`: create a signed direct-upload payload for Active Storage.

Use this endpoint from the React app before sending `image_signed_id` or `profile_picture_signed_id` to the normal product/user endpoints.

## Environment Variables

Copy `.env.example` to your preferred shell environment and set:

- `FLUTTERWAVE_SECRET`
- `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- `FLUTTERWAVE_API_URL`
- `PAYMENT_BUSINESS_NAME`
- `BASE_URL`
- `ACTIVE_STORAGE_SERVICE`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_REGION`
- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_FORCE_PATH_STYLE`
- `CLOUDFLARE_R2_PUBLIC`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_FORCE_PATH_STYLE`
- `S3_PUBLIC`
- `MPESA_CONSUMER_KEY`
- `MPESA_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `MPESA_API_BASE_URL`
- `MAILER_FROM_ADDRESS`
- `APP_HOST`
- `APP_PROTOCOL`
- `SMTP_ADDRESS`
- `SMTP_PORT`
- `SMTP_DOMAIN`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_AUTHENTICATION`
- `SMTP_ENABLE_STARTTLS_AUTO`
- `SMS_API_URL`
- `SMS_API_KEY`
- `SMS_SENDER_ID`

Current deployed backend values:

- `BASE_URL=https://maddox-gaming.netlify.app`
- `CORS_ALLOWED_ORIGINS=`
- `APP_HOST=maddox-gaming.onrender.com`
- `MPESA_CALLBACK_URL=https://maddox-gaming.onrender.com/api/mpesa/callback`

Card payments require the Flutterwave values. M-Pesa payments require the Daraja values.

User profile pictures and product images use Rails Active Storage. In production, you can now set `ACTIVE_STORAGE_SERVICE=cloudflare_r2` and provide the `CLOUDFLARE_R2_*` values, or keep using `ACTIVE_STORAGE_SERVICE=s3_compatible` with the generic `S3_*` values for other providers.

If `ACTIVE_STORAGE_SERVICE` is left unset, or is set to `s3_compatible` without the required `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, and `S3_ENDPOINT` values, or is set to `cloudflare_r2` without the required `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET`, and either `CLOUDFLARE_R2_ENDPOINT` or `CLOUDFLARE_R2_ACCOUNT_ID`, the app falls back to `local` storage so the web process can boot. On Render this means uploads are ephemeral unless you configure object storage.

Recommended Cloudflare R2 values:

- `ACTIVE_STORAGE_SERVICE=cloudflare_r2`
- `CLOUDFLARE_R2_ACCESS_KEY_ID=<your R2 access key ID>`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY=<your R2 secret access key>`
- `CLOUDFLARE_R2_BUCKET=<your bucket name>`
- `CLOUDFLARE_R2_REGION=auto`
- `CLOUDFLARE_R2_ACCOUNT_ID=<your Cloudflare account ID>`
- `CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com` if you prefer not to derive it from the account ID
- `CLOUDFLARE_R2_PUBLIC=true` when objects should be publicly readable

Recommended generic S3-compatible values when object storage is configured:

- `ACTIVE_STORAGE_SERVICE=s3_compatible`
- `S3_REGION=auto` for providers like Cloudflare R2, otherwise use your provider region
- `S3_FORCE_PATH_STYLE=true` only if your provider requires path-style addressing
- `S3_PUBLIC=true` when your bucket objects are publicly readable

Product creation and updates can now accept a multipart `image` upload in addition to the legacy `image_url` string.

Email confirmations use Action Mailer. In development, if SMTP is not configured, Rails writes generated emails to `backend/tmp/mails`. SMS confirmations use the generic JSON POST gateway configured by `SMS_API_URL` and `SMS_API_KEY`.

Background jobs in production default to `solid_queue`, but the adapter can be overridden with `ACTIVE_JOB_QUEUE_ADAPTER`. On Render, this repo now defaults that value to `async` so Active Storage uploads and other backgrounded work do not fail if Solid Queue tables and workers are not provisioned.

## Current Payment Behavior

- Card payments use Flutterwave modal + backend verification + webhook confirmation.
- M-Pesa payments use Daraja STK Push + callback confirmation.
- Failed and pending orders can be retried through the orders API.
- Terminal payment states trigger email and SMS notifications.

## Local Setup

```bash
bundle install
bin/rails db:migrate
bin/rails server
```

If bundler permissions fail inside WSL, set a project-local bundle path first:

```bash
bundle config set --local path vendor/bundle
bundle install
```

## Tests

```bash
bin/rails test
```
