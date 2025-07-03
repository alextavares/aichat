const fetch = require('node-fetch')

// Configurações
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/mercadopago/webhook'
const PAYMENT_ID = process.argv[2] || '116721089167'
const USER_ID = process.argv[3] || 'cmcjf1pgi0001c5nqj53ud1r0'
const PLAN_ID = process.argv[4] || 'pro'
const BILLING_CYCLE = process.argv[5] || 'monthly'

async function simulateApprovedPayment() {
  console.log('Simulando pagamento aprovado do MercadoPago...')
  console.log('Payment ID:', PAYMENT_ID)
  console.log('User ID:', USER_ID)
  console.log('Plan ID:', PLAN_ID)
  console.log('Billing Cycle:', BILLING_CYCLE)
  console.log('Webhook URL:', WEBHOOK_URL)

  try {
    // Simular notificação do MercadoPago
    const webhookPayload = {
      id: PAYMENT_ID,
      topic: 'payment',
      type: 'payment',
      action: 'payment.created',
      api_version: 'v1',
      data: {
        id: PAYMENT_ID
      },
      date_created: new Date().toISOString(),
      user_id: 123456789,
      live_mode: false
    }

    console.log('\nEnviando webhook...')
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'ts=1234567890,v1=dummy_signature',
        'x-request-id': 'test-request-' + Date.now()
      },
      body: JSON.stringify(webhookPayload)
    })

    const result = await response.text()
    console.log('Status:', response.status)
    console.log('Response:', result)

    if (response.ok) {
      console.log('\n✅ Webhook enviado com sucesso!')
      console.log('O pagamento deve estar sendo processado agora.')
      console.log('Verifique o console do servidor para ver os logs.')
    } else {
      console.error('\n❌ Erro ao enviar webhook:', response.status, result)
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
  }
}

// Executar
simulateApprovedPayment()

console.log('\n📝 Uso:')
console.log('node scripts/simulate-approved-payment.js [PAYMENT_ID] [USER_ID] [PLAN_ID] [BILLING_CYCLE]')
console.log('\nExemplo:')
console.log('node scripts/simulate-approved-payment.js 116721089167 cmcjf1pgi0001c5nqj53ud1r0 pro monthly')