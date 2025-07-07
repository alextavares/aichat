# QA Review Report: MercadoPago Webhook Reliability

**Author:** @qa (Senior Developer & QA Architect)
**Date:** 2025-07-04
**Status:** **Requires Refactoring**

## 1. Executive Summary

The initial implementation of the MercadoPago webhook handler provides a solid structural foundation. However, the core business logic is incomplete and relies on placeholders, preventing it from meeting the key functional requirements outlined in the PRD. The code is **not ready for production**.

This report details the required refactorings to ensure the feature is robust, secure, and correct, followed by a test plan to validate the final implementation.

## 2. Code Review Findings & Refactoring Plan

### 2.1. `lib/subscription-service.ts` (Critical)

**Issue:** The current implementation uses placeholder data for `userId` and payment `status`. It does not fetch the real payment details from MercadoPago, which is a critical requirement for identifying the user and the payment outcome.

**Refactoring Proposal:**
1.  Introduce the official MercadoPago SDK (`mercadopago`).
2.  Inside `updateSubscriptionFromWebhook`, use `mercadopago.payment.findById(payload.data.id)` to fetch the full payment object.
3.  Extract the real `status` and `userId` (from the `external_reference` field, as assumed in the architecture) from the fetched payment object.
4.  Implement logic to handle various statuses (`approved`, `rejected`, `cancelled`), not just `approved`.
5.  The `planType` should also be derived from the payment details, not hardcoded as `'PRO'`.

---

**Issue:** The logic to find the subscription to update (`findFirst`) is not reliable as a user might have multiple subscriptions.

**Refactoring Proposal:**
1.  The `Subscription` model in `prisma.schema` should be updated. The `mercadoPagoPaymentId` field should be marked as `@unique`. This is the correct way to identify a subscription record uniquely.
2.  The logic should then be changed to `prisma.subscription.upsert` using `where: { mercadoPagoPaymentId: payload.data.id }`. This is more efficient and less error-prone than the manual find-then-update approach.
    *(Note: This requires a schema change and migration, which is a task for the @dev, guided by the @architect).*

### 2.2. `app/api/mercadopago/subscription/route.ts` (High)

**Issue:** The background processing (`updateSubscriptionFromWebhook().catch()`) is "fire-and-forget". If the server restarts while processing, the webhook event is lost permanently.

**Refactoring Proposal (Robustness):**
1.  Implement a simple version of the "Transactional Outbox" pattern mentioned in the architecture.
2.  **Step A:** In the main `POST` function, do only two things: validate the signature and save the raw webhook body and headers to a new Prisma model, e.g., `MercadoPagoWebhookLog`, with a status of `PENDING`.
3.  **Step B:** Create a separate, simple background job or trigger (or for now, even a manual script) that reads `PENDING` webhooks from the log table, processes them using `updateSubscriptionFromWebhook`, and updates their status to `PROCESSED` or `FAILED`.
4.  This decouples receipt from processing and ensures no webhooks are lost.

### 2.3. `lib/mercadopago-validation.ts` (Medium)

**Issue:** The validation does not protect against replay attacks using old webhooks.

**Refactoring Proposal (Security):**
1.  Add logic to check the `timestamp` from the signature header.
2.  Compare it to the current server time.
3.  If the timestamp is older than a reasonable threshold (e.g., 5 minutes), reject the webhook, even if the signature is valid.

## 3. Proposed Test Plan

Once the refactoring is complete, the following tests must be implemented and passed.

### 3.1. Unit Tests

-   **`mercadopago-validation.test.ts`**:
    -   Test with a valid signature.
    -   Test with an invalid signature.
    -   Test with a missing secret or signature.
    -   Test with a valid signature but an old timestamp (replay attack).
-   **`subscription-service.test.ts`**:
    -   Mock the Prisma client and MercadoPago SDK.
    -   Test that an `approved` status correctly creates/updates a subscription.
    -   Test that a `rejected` status is handled correctly.
    -   Test that the logic correctly identifies the `userId` from the mocked payment object.

### 3.2. Integration Test

-   **`mercadopago-webhook.integration.test.ts`**:
    -   Use a library like `supertest` to make a POST request to the actual `/api/mercadopago/subscription` endpoint.
    -   Mock the MercadoPago SDK and Prisma client.
    -   Test the entire flow from request receipt to service layer interaction.
    -   Assert that an invalid signature returns a `403`.
    -   Assert that a valid signature returns a `200`.

## 4. Next Steps

@dev Please review this QA report. I recommend proceeding with the proposed refactorings, starting with the critical issues in `subscription-service.ts`. I am available to clarify any points and will review the implementation again after the changes are made.
