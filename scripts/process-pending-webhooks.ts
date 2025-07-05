import { prisma } from '../lib/prisma';
import { updateSubscriptionFromWebhook } from '../lib/subscription-service';

async function processPendingWebhooks() {
  console.log('Starting to process pending webhooks...');

  const pendingWebhooks = await prisma.mercadoPagoWebhookLog.findMany({
    where: { status: 'PENDING' },
  });

  if (pendingWebhooks.length === 0) {
    console.log('No pending webhooks to process.');
    return;
  }

  console.log(`Found ${pendingWebhooks.length} pending webhooks.`);

  for (const webhook of pendingWebhooks) {
    console.log(`Processing webhook ID: ${webhook.id}`);
    try {
      // The body is stored as a JSON object in the DB
      const payload = webhook.body as any; 
      
      // We need to simulate the webhook structure that updateSubscriptionFromWebhook expects
      // This assumes the core data is in the 'body' field of the log
      if (payload && payload.type && payload.data && payload.data.id) {
        await updateSubscriptionFromWebhook(payload);

        await prisma.mercadoPagoWebhookLog.update({
          where: { id: webhook.id },
          data: { status: 'PROCESSED' },
        });
        console.log(`Webhook ID: ${webhook.id} processed successfully.`);
      } else {
        throw new Error('Webhook log body is missing required fields (type, data.id)');
      }

    } catch (error) {
      console.error(`Failed to process webhook ID: ${webhook.id}`, error);
      await prisma.mercadoPagoWebhookLog.update({
        where: { id: webhook.id },
        data: { status: 'FAILED' },
      });
    }
  }

  console.log('Finished processing webhooks.');
}

processPendingWebhooks()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
