const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPaymentAndUser() {
  const paymentId = process.argv[2] || '116721089167'
  const userId = process.argv[3] || 'cmcjf1pgi0001c5nqj53ud1r0'
  
  console.log('🔍 Verificando pagamento e usuário...')
  console.log('Payment ID:', paymentId)
  console.log('User ID:', userId)
  console.log('-'.repeat(50))
  
  try {
    // Verificar pagamento
    console.log('\n📄 Verificando pagamento no banco...')
    const payment = await prisma.payment.findFirst({
      where: { mercadoPagoPaymentId: paymentId }
    })
    
    if (payment) {
      console.log('✅ Pagamento encontrado:')
      console.log('  - ID:', payment.id)
      console.log('  - Status:', payment.status)
      console.log('  - Amount:', payment.amount)
      console.log('  - Created:', payment.createdAt)
    } else {
      console.log('❌ Pagamento não encontrado no banco')
    }
    
    // Verificar usuário
    console.log('\n👤 Verificando usuário...')
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (user) {
      console.log('✅ Usuário encontrado:')
      console.log('  - Email:', user.email)
      console.log('  - Plan Type:', user.planType)
      console.log('  - Created:', user.createdAt)
      
      if (user.subscriptions.length > 0) {
        const sub = user.subscriptions[0]
        console.log('\n📅 Assinatura ativa:')
        console.log('  - Status:', sub.status)
        console.log('  - Plan:', sub.planType)
        console.log('  - Started:', sub.startedAt)
        console.log('  - Expires:', sub.expiresAt)
        console.log('  - MercadoPago ID:', sub.mercadoPagoPaymentId)
      } else {
        console.log('\n❌ Nenhuma assinatura encontrada')
      }
    } else {
      console.log('❌ Usuário não encontrado')
    }
    
    // Verificar todos os pagamentos do usuário
    console.log('\n💳 Todos os pagamentos do usuário:')
    const allPayments = await prisma.payment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
    
    if (allPayments.length > 0) {
      allPayments.forEach((p, i) => {
        console.log(`\n  Pagamento ${i + 1}:`)
        console.log(`    - ID: ${p.id}`)
        console.log(`    - Status: ${p.status}`)
        console.log(`    - Amount: R$ ${p.amount}`)
        console.log(`    - MercadoPago ID: ${p.mercadoPagoPaymentId}`)
        console.log(`    - Created: ${p.createdAt}`)
      })
    } else {
      console.log('  Nenhum pagamento encontrado')
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkPaymentAndUser()

console.log('\n📝 Uso:')
console.log('node scripts/check-payment-and-user.js [PAYMENT_ID] [USER_ID]')
console.log('\nExemplo:')
console.log('node scripts/check-payment-and-user.js 116721089167 cmcjf1pgi0001c5nqj53ud1r0') 