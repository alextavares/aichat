// Script para testar a jornada completa do usuário
import { randomBytes } from 'crypto'

const BASE_URL = 'https://seahorse-app-k5pag.ondigitalocean.app'

// Gerar dados únicos para o teste
const timestamp = Date.now()
const testUser = {
  email: `user_${timestamp}@innerai.com`,
  password: 'SenhaSegura123!@#',
  name: 'João Silva',
  profession: 'Desenvolvedor',
  organization: 'Empresa Teste'
}

console.log('🚀 Iniciando teste da jornada do usuário')
console.log(`📧 Email: ${testUser.email}`)
console.log(`🔑 Senha: ${testUser.password}`)

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testUserJourney() {
  try {
    // 1. Criar conta
    console.log('\n1️⃣ CRIANDO NOVA CONTA...')
    const signupResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    const signupData = await signupResponse.json()
    console.log(`✅ Conta criada: ${signupResponse.status === 201 ? 'SUCESSO' : 'FALHOU'}`)
    console.log('Resposta:', signupData)
    
    if (!signupResponse.ok) {
      throw new Error(`Falha ao criar conta: ${JSON.stringify(signupData)}`)
    }
    
    // 2. Simular acesso à página de preços
    console.log('\n2️⃣ ACESSANDO PÁGINA DE PREÇOS...')
    console.log(`URL: ${BASE_URL}/pricing`)
    console.log('ℹ️  Um usuário real clicaria em "Fazer Upgrade" no plano Pro')
    
    // 3. Criar sessão de checkout
    console.log('\n3️⃣ CRIANDO SESSÃO DE CHECKOUT...')
    console.log('⚠️  ATENÇÃO: Para continuar, preciso que você:')
    console.log('   1. Faça login no site com as credenciais acima')
    console.log('   2. Acesse: https://seahorse-app-k5pag.ondigitalocean.app/pricing')
    console.log('   3. Clique em "Fazer Upgrade" no plano Pro (R$ 1,00)')
    console.log('   4. Complete o pagamento via PIX')
    console.log('')
    console.log('📱 Ou use o atalho direto (após fazer login):')
    console.log(`   ${BASE_URL}/test-payment`)
    
    // 4. Informações para verificar depois
    console.log('\n4️⃣ APÓS O PAGAMENTO, VERIFIQUE:')
    console.log(`   - Status da assinatura: ${BASE_URL}/dashboard/subscription`)
    console.log(`   - Se mostra "Plano Pro" ativo`)
    console.log(`   - Se não houver erro de "subscription not found"`)
    
    // 5. Dados para debug
    console.log('\n5️⃣ DADOS PARA DEBUG:')
    console.log(`User ID será criado no banco com email: ${testUser.email}`)
    console.log('Verificar nos logs se o webhook processou corretamente')
    
  } catch (error) {
    console.error('\n❌ ERRO:', error)
  }
}

// Executar teste
testUserJourney().then(() => {
  console.log('\n✅ Script concluído!')
  console.log('👉 Agora faça login e teste o pagamento manualmente')
}).catch(error => {
  console.error('\n❌ Erro fatal:', error)
})