# InnerAI Product Requirements Document (PRD): MercadoPago Webhook Reliability

## 1. Goals and Background Context

### Goals

- **Ensure 100% reliable processing** of all incoming MercadoPago subscription webhooks.
- **Instantly and accurately update** a user's subscription status in our database upon receiving a valid payment event.
- **Eliminate revenue loss** and user dissatisfaction caused by failed or missed webhook events.
- **Provide robust logging** for all webhook events to enable rapid debugging of any future issues.

### Background Context

Currently, our integration with MercadoPago is experiencing intermittent issues with webhook processing. When a user's subscription payment is processed by MercadoPago, they send a webhook to our system to notify us of the event (e.g., payment approved, payment failed). Failures in processing these webhooks lead to a critical business problem: a user pays for a subscription, but their account is not upgraded in our system. This results in a poor user experience, manual support overhead, and potential loss of revenue and customer trust. This PRD outlines the requirements to build a resilient and reliable webhook processing system.

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-07-04 | 1.0 | Initial draft | @pm |

## 2. Requirements

### Functional Requirements

- **FR1:** The system **must** expose a dedicated API endpoint (`/api/mercadopago/subscription`) to receive POST requests from MercadoPago webhooks.
- **FR2:** The endpoint **must** securely validate the authenticity of incoming webhooks using MercadoPago's signature validation method to prevent fraudulent requests.
- **FR3:** The system **must** successfully parse the JSON payload of valid webhooks to extract the event type (e.g., `payment.updated`, `subscription.updated`) and relevant data (e.g., user ID, payment status).
- **FR4:** Upon receiving a successful payment event, the system **must** update the corresponding user's subscription status and expiration date in the Prisma database.
- **FR5:** The system **must** handle different payment statuses correctly (e.g., `approved`, `rejected`, `in_process`).
- **FR6:** The endpoint **must** return a `200 OK` status code to MercadoPago immediately upon successful receipt of a webhook to prevent unnecessary retries. In case of a processing error, it should return an appropriate `5xx` error code.

### Non-Functional Requirements

- **NFR1:** The webhook endpoint **must** have an average response time of less than 500ms.
- **NFR2:** All webhook processing steps (receipt, validation, processing, database update) **must** be logged with clear, structured information for traceability and debugging.
- **NFR3:** The system **must** be resilient to duplicate webhook events from MercadoPago, ensuring an event is processed only once.
- **NFR4:** All sensitive information, such as API keys and secrets, **must** be stored securely in environment variables and not be hardcoded.

## 3. Technical Assumptions

- **Framework:** The endpoint will be built as a Next.js API Route within the existing InnerAI application.
- **Database:** All database interactions will use the existing Prisma ORM setup.
- **Deployment:** The solution will be deployed on our current Digital Ocean infrastructure.
- **Security:** Webhook signature validation will be implemented using the `x-signature` header and our secret key from MercadoPago.

## 4. Epics & Stories

### Epic 1: Stabilize MercadoPago Webhook Integration

This epic covers the end-to-end implementation of a robust and reliable webhook processing system for MercadoPago subscriptions.

#### Story 1.1: Create Secure Webhook Endpoint
As a developer, I want to create a secure API endpoint that can receive and validate webhooks from MercadoPago, so that we can ensure all incoming data is authentic and from a trusted source.

**Acceptance Criteria:**
- 1.1.1: An API route is created at `/api/mercadopago/subscription`.
- 1.1.2: The route only accepts POST requests.
- 1.1.3: A middleware or function is implemented to verify the `x-signature` header of incoming requests against our MercadoPago secret.
- 1.1.4: Requests with an invalid signature are rejected with a `403 Forbidden` status code and the event is logged as a security warning.
- 1.1.5: Validated requests are passed to the processing logic.

#### Story 1.2: Implement Subscription Update Logic
As a developer, I want to parse the validated webhook payload and update the user's subscription status in the database, so that user accounts reflect their real-time payment status.

**Acceptance Criteria:**
- 1.2.1: The webhook's JSON payload is successfully parsed.
- 1.2.2: The system correctly identifies the user associated with the webhook event.
- 1.2.3: If the payment status is `approved`, the user's `subscriptionStatus` in the database is set to `active` and the `subscriptionEndDate` is updated accordingly.
- 1.2.4: The system correctly handles other relevant statuses (e.g., `cancelled`, `rejected`) by updating the user's subscription status appropriately.
- 1.2.5: The entire process is wrapped in a database transaction to ensure data integrity.

#### Story 1.3: Add Robust Logging and Error Handling
As a developer, I want to implement comprehensive logging and error handling for the entire webhook process, so that we can easily monitor, debug, and be alerted to any issues.

**Acceptance Criteria:**
- 1.3.1: A structured log is created upon receiving any webhook.
- 1.3.2: The outcome of the signature validation (success or failure) is logged.
- 1.3.3: The outcome of the database update (success or failure) is logged, including any database errors.
- 1.3.4: In case of any unexpected error during processing, the error is caught, logged in detail, and a `500 Internal Server Error` is returned to MercadoPago.

## 5. Next Steps

### Architect Prompt

@architect Please review this PRD and create a technical architecture document for the MercadoPago Webhook Reliability feature. The document should detail the specific implementation plan for the Next.js API route, the database transaction logic with Prisma, and the proposed logging structure.
