# Deployment Plan: MercadoPago Webhook Feature

**Author:** @devops
**Date:** 2025-07-05
**Target Environment:** Staging

This document outlines the step-by-step plan to deploy the new MercadoPago webhook reliability feature to the staging environment.

## 1. Pre-Deployment Steps

These steps must be completed before the application code is deployed.

### 1.1. Environment Variable Configuration
The following environment variables must be set in the staging environment's configuration (e.g., on Digital Ocean):
- `MERCADOPAGO_ACCESS_TOKEN`: The API access token for MercadoPago.
- `MERCADOPAGO_WEBHOOK_SECRET`: The secret key used to validate webhook signatures.

**Action:** Confirm with the team lead that these secrets are available and have been securely added to the staging environment configuration.

### 1.2. Database Migration
The new database schema changes must be applied to the staging database.
- **Migration 1:** `20250705011520_init` (or the equivalent baseline migration)
- **Migration 2:** `20250705012558_add_webhook_log_status`

**Action:** Run the following command against the staging database **before** deploying the new application code:
`npx prisma migrate deploy`

*(Note: `migrate deploy` is the command for applying migrations in production/staging environments; `migrate dev` is for development).*

## 2. Deployment Steps

### 2.1. Deploy Application Code
Deploy the latest version of the `main` branch, which includes the new feature, to the Digital Ocean staging environment using our standard CI/CD pipeline.

## 3. Post-Deployment Steps

These steps must be completed after the new application code is running in the staging environment.

### 3.1. Configure Webhook Endpoint in MercadoPago
The new webhook endpoint URL needs to be configured in the MercadoPago developer dashboard for the staging/test application.
- **URL:** `https://[STAGING_APP_URL]/api/mercadopago/subscription`
- **Events:** Ensure it's subscribed to `payment` events.

### 3.2. Set Up Background Job for Webhook Processing
The `process-pending-webhooks.ts` script needs to be executed periodically to process the webhook queue.
- **Action:** Configure a cron job on the staging server to run the script.
- **Command:** `node scripts/process-pending-webhooks.ts`
- **Frequency:** Recommended to run every 1 minute.
- **Cron Schedule:** `* * * * *`

## 4. Verification Plan

1.  Trigger a test payment in the MercadoPago sandbox environment.
2.  Verify that a new entry is created in the `MercadoPagoWebhookLog` table with a `PENDING` status.
3.  Verify that the cron job executes within 1 minute.
4.  Verify that the log entry's status changes to `PROCESSED`.
5.  Verify that the corresponding user's subscription is correctly updated in the `Subscription` table.

---

**Next Step:**
Please review and approve this deployment plan. Once approved, we can begin with the pre-deployment steps.
