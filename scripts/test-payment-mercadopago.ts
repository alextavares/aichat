import { createCheckoutSession } from '../lib/payment-service'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testMercadoPagoPayment() {
  console.log('🧪 Testando fluxo de pagamento com Mercado Pago\n')

  try {
    // Teste 1: PIX
    console.log('1️⃣ Testando pagamento com PIX...')
    const pixResult = await createCheckoutSession({
      planId: 'pro',
      userId: 'test-user-123',
      email: 'teste@example.com',
      paymentMethod: 'pix',
      billingCycle: 'monthly',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    })
    
    console.log('✅ PIX checkout criado:')
    console.log(`   Provider: ${pixResult.provider}`)
    console.log(`   URL: ${pixResult.checkoutUrl}`)
    console.log(`   ID: ${pixResult.preferenceId}\n`)

    // Teste 2: Boleto
    console.log('2️⃣ Testando pagamento com Boleto...')
    const boletoResult = await createCheckoutSession({
      planId: 'lite',
      userId: 'test-user-456',
      email: 'teste2@example.com',
      paymentMethod: 'boleto',
      billingCycle: 'yearly',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    })
    
    console.log('✅ Boleto checkout criado:')
    console.log(`   Provider: ${boletoResult.provider}`)
    console.log(`   URL: ${boletoResult.checkoutUrl}`)
    console.log(`   ID: ${boletoResult.preferenceId}\n`)

    // Teste 3: Cartão (Stripe)
    console.log('3️⃣ Testando pagamento com Cartão...')
    const cardResult = await createCheckoutSession({
      planId: 'enterprise',
      userId: 'test-user-789',
      email: 'teste3@example.com',
      paymentMethod: 'card',
      installments: 3,
      billingCycle: 'monthly',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    })
    
    console.log('✅ Cartão checkout criado:')
    console.log(`   Provider: ${cardResult.provider}`)
    console.log(`   URL: ${cardResult.checkoutUrl}`)
    console.log(`   Session ID: ${cardResult.sessionId}\n`)

    console.log('🎉 Todos os testes passaram!')
    console.log('\n📋 URLs de teste geradas:')
    console.log(`PIX: ${pixResult.checkoutUrl}`)
    console.log(`Boleto: ${boletoResult.checkoutUrl}`)
    console.log(`Cartão: ${cardResult.checkoutUrl}`)

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    process.exit(1)
  }
}

// Executar teste
testMercadoPagoPayment()