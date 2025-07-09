// Script para upgrade manual do usuário
// Uso: node scripts/manual-upgrade.js

const userId = 'cmcwfirhs0004ohrt0nl0bmha'
const paymentId = '117508146189'
const planType = 'PRO'

console.log('🔧 Processando upgrade manual...')
console.log('User ID:', userId)
console.log('Payment ID:', paymentId)
console.log('Plan:', planType)

// Simulação do que o webhook deveria fazer
const upgradeData = {
  userId: userId,
  paymentId: paymentId,
  planId: planType,
  billingCycle: 'monthly',
  amount: 99.90,
  status: 'COMPLETED'
}

console.log('\n📋 Dados para upgrade:')
console.log(JSON.stringify(upgradeData, null, 2))

console.log('\n⚠️  Este é um script de simulação.')
console.log('Para executar o upgrade real, use o endpoint debug após deploy.')