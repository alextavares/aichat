const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function manualUpgrade() {
  const userId = 'cmcwfirhs0004ohrt0nl0bmha'
  const paymentId = '117508146189'
  const planType = 'PRO'
  
  console.log('🔧 Processing manual upgrade...')
  console.log('User ID:', userId)
  console.log('Payment ID:', paymentId)
  console.log('Plan Type:', planType)
  console.log('-'.repeat(50))
  
  try {
    // Step 1: Update user plan
    console.log('📄 Updating user plan...')
    const user = await prisma.user.update({
      where: { id: userId },
      data: { planType: planType }
    })
    console.log('✅ User plan updated to:', user.planType)
    
    // Step 2: Create subscription
    console.log('📅 Creating subscription...')
    const startDate = new Date()
    const expiresDate = new Date(startDate)
    expiresDate.setMonth(startDate.getMonth() + 1) // Monthly
    
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType: planType,
        status: 'ACTIVE',
        mercadoPagoPaymentId: paymentId,
        startedAt: startDate,
        expiresAt: expiresDate
      }
    })
    console.log('✅ Subscription created:', subscription.id)
    
    // Step 3: Create payment record
    console.log('💳 Creating payment record...')
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: 99.90,
        currency: 'BRL',
        status: 'COMPLETED',
        mercadoPagoPaymentId: paymentId
      }
    })
    console.log('✅ Payment record created:', payment.id)
    
    // Step 4: Verify final state
    console.log('🔍 Verifying final state...')
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    console.log('✅ Final verification:')
    console.log('  - User plan:', finalUser.planType)
    console.log('  - Subscription status:', finalUser.subscriptions[0]?.status)
    console.log('  - Subscription expires:', finalUser.subscriptions[0]?.expiresAt)
    
    console.log('\n🎉 Manual upgrade completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during manual upgrade:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

manualUpgrade()