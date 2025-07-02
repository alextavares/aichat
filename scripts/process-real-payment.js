#!/usr/bin/env node

// Processa o pagamento real: payment_id=116664369469
const paymentData = {
  paymentId: "116664369469",
  userId: "cmcmhv3rm00008c5d13r3axzb",
  planId: "pro",
  billingCycle: "monthly"
}

console.log('🔄 Processando pagamento real:', paymentData)

async function processPayment() {
  try {
    console.log('\n1. Testando webhook com payment.updated...')
    
    const webhookPayload = {
      action: "payment.updated",
      api_version: "v1",
      data: { id: paymentData.paymentId },
      date_created: "2025-07-02T21:55:33Z",
      id: 122565065785,
      live_mode: true,
      type: "payment",
      user_id: "110125456"
    }
    
    const response = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/mercadopago/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    })
    
    const result = await response.json()
    console.log(`Status: ${response.status}`)
    console.log(`Response:`, JSON.stringify(result, null, 2))
    
    console.log('\n2. Verificando o status do pagamento via API pública...')
    
    const statusResponse = await fetch(`https://seahorse-app-k5pag.ondigitalocean.app/api/public/payment-status?payment_id=${paymentData.paymentId}`)
    const statusResult = await statusResponse.json()
    console.log('Status do pagamento:', statusResult)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

processPayment()