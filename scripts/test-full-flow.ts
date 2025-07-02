// Script para testar o fluxo completo de pagamento
import { randomBytes } from 'crypto'

const BASE_URL = 'https://seahorse-app-k5pag.ondigitalocean.app'

// Gerar email único para teste
const testEmail = `test_${randomBytes(4).toString('hex')}@innerai.com`
const testPassword = 'Test123!@#'

console.log('🚀 Iniciando teste do fluxo completo de pagamento')
console.log(`📧 Email de teste: ${testEmail}`)

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testFullFlow() {
  try {
    // 1. Criar conta
    console.log('\n1️⃣ Criando nova conta...')
    const signupResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
        profession: 'Developer',
        organization: 'Test Org'
      })
    })
    
    const signupData = await signupResponse.json()
    console.log('Signup response:', signupResponse.status, signupData)
    
    if (!signupResponse.ok) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`)
    }
    
    // 2. Fazer login  
    console.log('\n2️⃣ Fazendo login...')
    // NextAuth usa formulário ao invés de JSON
    const formData = new URLSearchParams()
    formData.append('email', testEmail)
    formData.append('password', testPassword)
    formData.append('csrfToken', 'test') // Normalmente precisaria de um token real
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      redirect: 'manual' // Evitar redirect automático
    })
    
    console.log('Login response:', loginResponse.status)
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('Cookies:', cookies)
    
    // 3. Verificar status da conta
    console.log('\n3️⃣ Verificando status da conta...')
    const subscriptionResponse = await fetch(`${BASE_URL}/api/user/subscription`, {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    const subscriptionData = await subscriptionResponse.json()
    console.log('Subscription status:', subscriptionData)
    
    // 4. Criar checkout
    console.log('\n4️⃣ Criando sessão de checkout...')
    const checkoutResponse = await fetch(`${BASE_URL}/api/mercadopago/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        planId: 'pro',
        paymentMethod: 'pix',
        billingCycle: 'monthly'
      })
    })
    
    const checkoutData = await checkoutResponse.json()
    console.log('Checkout response:', checkoutResponse.status, checkoutData)
    
    if (checkoutData.url) {
      console.log(`\n✅ Checkout URL criada: ${checkoutData.url}`)
      console.log('Preference ID:', checkoutData.preferenceId)
    }
    
    // 5. Verificar logs após alguns segundos
    console.log('\n5️⃣ Aguardando processamento...')
    await delay(5000)
    
    // 6. Verificar webhook endpoint de teste
    console.log('\n6️⃣ Testando endpoint de webhook...')
    const webhookTestResponse = await fetch(`${BASE_URL}/api/test-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '12345678',
        topic: 'payment',
        data: { id: '12345678' },
        type: 'payment'
      })
    })
    
    const webhookTestData = await webhookTestResponse.json()
    console.log('Webhook test response:', webhookTestData)
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar teste
testFullFlow().then(() => {
  console.log('\n✅ Teste concluído!')
  process.exit(0)
}).catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})