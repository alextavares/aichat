#!/usr/bin/env node

// Extrai informações da URL real do pagamento
const urlParams = `collection_id=116652675141&collection_status=pending&payment_id=116652675141&status=pending&external_reference={"userId":"cmcm8eb8i000113c45429pm8t","planId":"pro","billingCycle":"monthly","timestamp":"2025-07-02T20:26:41.143Z"}&payment_type=bank_transfer&merchant_order_id=32124135327&preference_id=110125456-65901094-548a-44ba-a87d-67ddec08ff4f&site_id=MLB&processing_mode=aggregator&merchant_account_id=null`

const params = new URLSearchParams(urlParams)

console.log('🔍 Informações do Pagamento Real:\n')
console.log(`Payment ID: ${params.get('payment_id')}`)
console.log(`Status: ${params.get('status')}`)
console.log(`Collection Status: ${params.get('collection_status')}`)

// Parse external_reference
const externalRef = JSON.parse(params.get('external_reference'))
console.log(`\n👤 Dados do Usuário:`)
console.log(`User ID: ${externalRef.userId}`)
console.log(`Plan ID: ${externalRef.planId}`)
console.log(`Billing Cycle: ${externalRef.billingCycle}`)
console.log(`Timestamp: ${externalRef.timestamp}`)

console.log(`\n🏪 Informações do Merchant:`)
console.log(`Preference ID: ${params.get('preference_id')}`)
console.log(`Merchant Order ID: ${params.get('merchant_order_id')}`)
console.log(`Payment Type: ${params.get('payment_type')}`)

console.log('\n🔄 Próximos Passos:')
console.log('1. Verificar se o webhook foi processado para este payment_id')
console.log('2. Verificar se o usuário foi atualizado no banco')
console.log('3. Corrigir o problema do botão na página pending')

async function testPaymentWebhook() {
  console.log('\n🧪 Testando webhook com payment_id real...')
  
  const payload = {
    id: "116652675141",
    live_mode: true,
    type: "payment",
    date_created: "2025-07-02T20:26:41.143Z",
    user_id: 44444,
    api_version: "v1", 
    action: "payment.updated",
    data: { id: "116652675141" }
  }
  
  try {
    const response = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/mercadopago/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    console.log(`Status: ${response.status}`)
    console.log(`Response: ${JSON.stringify(result, null, 2)}`)
    
  } catch (error) {
    console.error('Erro:', error)
  }
}

testPaymentWebhook()