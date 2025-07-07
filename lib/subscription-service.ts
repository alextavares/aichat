import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { SubscriptionStatus } from '@prisma/client';

// Initialize the MercadoPago client
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
const payment = new Payment(client);

interface WebhookPayload {
  type: string;
  data: {
    id: string;
  };
}

/**
 * Processes a validated MercadoPago webhook payload, fetches real payment data,
 * and updates the user's subscription in the database.
 * @param payload The webhook payload from MercadoPago.
 */
export async function updateSubscriptionFromWebhook(payload: WebhookPayload) {
  if (payload.type !== 'payment') {
    console.log(`Ignoring webhook of type: ${payload.type}`);
    return;
  }

  try {
    const paymentDetails = await payment.get({ id: payload.data.id });

    if (!paymentDetails || !paymentDetails.external_reference) {
      throw new Error(`Payment details or external_reference (userId) not found for payment ID: ${payload.data.id}`);
    }

    const userId = paymentDetails.external_reference;
    const status = paymentDetails.status;
    const paymentId = payload.data.id;

    console.log(`Processing payment ${paymentId} for user ${userId} with status: ${status}`);

    let subscriptionStatus: SubscriptionStatus;
    switch (status) {
      case 'approved':
        subscriptionStatus = SubscriptionStatus.ACTIVE;
        break;
      case 'cancelled':
        subscriptionStatus = SubscriptionStatus.CANCELLED;
        break;
      case 'rejected':
      case 'failed':
        // For failed payments, we might just log it or mark a subscription as past_due
        // For now, we'll treat it as cancelled for simplicity.
        subscriptionStatus = SubscriptionStatus.CANCELLED;
        break;
      default:
        console.log(`Unhandled payment status: ${status}`);
        return; // Exit if the status is not one we handle
    }

    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30); // Add 30 days for an active subscription

    await prisma.subscription.upsert({
      where: {
        mercadoPagoPaymentId: paymentId,
      },
      update: {
        status: subscriptionStatus,
        expiresAt: subscriptionStatus === 'ACTIVE' ? newEndDate : new Date(),
      },
      create: {
        userId: userId,
        mercadoPagoPaymentId: paymentId,
        planType: 'PRO', // This could also be derived from paymentDetails if available
        status: subscriptionStatus,
        startedAt: new Date(),
        expiresAt: subscriptionStatus === 'ACTIVE' ? newEndDate : new Date(),
      },
    });

    console.log(`Successfully processed payment ${paymentId} for user ${userId}. Status set to ${subscriptionStatus}.`);

  } catch (error) {
    console.error(`Failed to process payment ID ${payload.data.id}:`, error);
    // Re-throw to be handled by the caller if necessary
    throw error;
  }
}
