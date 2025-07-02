#!/usr/bin/env node

// Simula um pagamento aprovado usando o endpoint de teste
console.log('🧪 Simulando pagamento aprovado para teste...')

async function simulatePayment() {
  try {
    // Primeiro, vamos fazer login para obter uma sessão válida
    console.log('1. Fazendo login...')
    
    const loginResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'fabianamaresias10@gmail.com',
        password: 'sua_senha_aqui' // Substitua pela senha correta
      })
    })
    
    console.log(`Login status: ${loginResponse.status}`)
    
    // Simula pagamento aprovado
    console.log('\n2. Simulando pagamento aprovado...')
    
    const paymentResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/test/simulate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'pro',
        billingCycle: 'monthly'
      })
    })
    
    const result = await paymentResponse.json()
    console.log(`Payment simulation status: ${paymentResponse.status}`)
    console.log('Response:', JSON.stringify(result, null, 2))
    
    if (paymentResponse.ok) {
      console.log('\n✅ Pagamento simulado com sucesso!')
      console.log('🎉 Usuário deve ter sido upgradado para plano PRO')
      console.log('📱 Teste agora fazendo login no dashboard')
    } else {
      console.log('\n❌ Falha na simulação')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

simulatePayment()