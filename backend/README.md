# Backend

Rails API for Maddox Gaming storefront, community features, and payment orchestration.

## Payment Endpoints

- `POST /api/v1/checkouts`: create a pending order and return payment configuration.
- `POST /api/v1/checkouts/:id/verify`: verify a Flutterwave transaction from the backend.
- `GET /api/v1/orders`: list the current user’s recent orders.
- `POST /api/v1/orders/:id/retry`: retry a failed or pending order payment.
- `GET /api/v1/finance/summary`: revenue and payment analytics for admin users.
- `POST /api/v1/payments/flutterwave/webhook`: webhook receiver for Flutterwave confirmation.
- `POST /api/v1/payments/mpesa/callback`: callback receiver for Daraja STK confirmation.

## Environment Variables

Copy `.env.example` to your preferred shell environment and set:

- `FLUTTERWAVE_SECRET`
- `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- `FLUTTERWAVE_API_URL`
- `PAYMENT_BUSINESS_NAME`
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

Card payments require the Flutterwave values. M-Pesa payments require the Daraja values.

Email confirmations use Action Mailer. In development, if SMTP is not configured, Rails writes generated emails to `backend/tmp/mails`. SMS confirmations use the generic JSON POST gateway configured by `SMS_API_URL` and `SMS_API_KEY`.

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
