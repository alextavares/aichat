import { PrismaClient, SubscriptionStatus, PlanType } from '@prisma/client'

const prisma = new PrismaClient()

async function expireSubscriptions() {
  console.log('Starting job: Expire Subscriptions...')
  let processedCount = 0
  let errorCount = 0

  try {
    const now = new Date()
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: {
          lt: now, // Less than current time
          not: null, // Ensure expiresAt is not null
        },
      },
      include: {
        // Include user to easily get userId and for logging
        user: {
          select: { id: true, email: true, planType: true },
        },
      },
    })

    if (expiredSubscriptions.length === 0) {
      console.log('No active subscriptions found that have expired.')
      return
    }

    console.log(`Found ${expiredSubscriptions.length} subscription(s) to expire.`)

    for (const subscription of expiredSubscriptions) {
      try {
        console.log(
          `Processing subscription ID: ${subscription.id} for user ID: ${subscription.userId} (Email: ${subscription.user.email}, Current Plan: ${subscription.user.planType})`
        )

        // Update subscription status to EXPIRED
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.EXPIRED },
        })

        // Update user's plan to FREE
        // Only update if their current plan is not already FREE (though it shouldn't be if subscription was ACTIVE)
        if (subscription.user.planType !== PlanType.FREE) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { planType: PlanType.FREE },
          })
          console.log(
            `User ID: ${subscription.userId} plan downgraded to FREE.`
          )
        } else {
          console.log(
            `User ID: ${subscription.userId} plan was already FREE. No downgrade needed.`
          )
        }

        processedCount++
      } catch (e: any) {
        errorCount++
        console.error(
          `Error processing subscription ID: ${subscription.id} for user ID: ${subscription.userId}. Error: ${e.message}`
        )
        // Decide on error handling: continue with next subscription or stop?
        // For a cron job, it's usually better to attempt to process all.
      }
    }
  } catch (error: any) {
    errorCount++
    console.error(`Major error during Expire Subscriptions job: ${error.message}`)
    // Potentially send a notification on major errors
  } finally {
    await prisma.$disconnect()
    console.log('Expire Subscriptions job finished.')
    console.log(`Successfully processed: ${processedCount} subscription(s).`)
    console.log(`Errors encountered: ${errorCount}.`)
  }
}

// Execute the function
expireSubscriptions()
  .then(() => {
    console.log('Script execution successful.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script execution failed:', error)
    process.exit(1)
  })
