#!/usr/bin/env ts-node
/**
 * 🔐 Teste de Autenticação em Produção
 * Verifica se as correções de middleware e NextAuth estão funcionando
 */

const PRODUCTION_URL = 'https://seahorse-app-k5pag.ondigitalocean.app'
const TEST_USER = {
  email: 'admin@innerai.com.br',
  password: 'admin123'
}

async function testAuthProduction() {
  console.log('🔐 Teste de Autenticação em Produção')
  console.log('=====================================')
  console.log(`URL: ${PRODUCTION_URL}`)
  console.log()

  try {
    // 1. Testar acesso direto ao chat (deve redirecionar)
    console.log('1. 🚫 Testando acesso não autenticado ao chat...')
    try {
      const response = await fetch(`${PRODUCTION_URL}/dashboard/chat`, {
        redirect: 'manual'
      })
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location')
        console.log(`   ✅ Correto: Redirecionamento para login (${response.status})`)
        console.log(`   📍 Location: ${location}`)
        
        // Verificar headers de debug
        const authDebug = response.headers.get('x-auth-debug')
        if (authDebug) {
          console.log(`   🐛 Debug: ${authDebug}`)
        }
      } else {
        console.log(`   ❌ Erro: Chat acessível sem autenticação (${response.status})`)
      }
    } catch (error: any) {
      console.log(`   ⚠️  Erro inesperado: ${error.message}`)
    }

    console.log()

    // 2. Testar login via API
    console.log('2. 🔑 Testando login via API...')
    const loginData = new URLSearchParams({
      email: TEST_USER.email,
      password: TEST_USER.password,
      csrfToken: 'test', // Em produção seria obtido da página
      callbackUrl: `${PRODUCTION_URL}/dashboard/chat`,
      json: 'true'
    })

    const loginResponse = await fetch(
      `${PRODUCTION_URL}/api/auth/callback/credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginData,
        redirect: 'manual'
      }
    )

    console.log(`   Status: ${loginResponse.status}`)
    const loginHeaders: Record<string, string> = {}
    loginResponse.headers.forEach((value, key) => {
      loginHeaders[key] = value
    })
    console.log(`   Headers: ${JSON.stringify(loginHeaders, null, 2)}`)

    // 3. Verificar configuração NextAuth
    console.log()
    console.log('3. ⚙️  Verificando configuração NextAuth...')
    const providersResponse = await fetch(`${PRODUCTION_URL}/api/auth/providers`)
    const providersData = await providersResponse.json()
    console.log(`   ✅ Providers disponíveis: ${Object.keys(providersData).join(', ')}`)

    // 4. Verificar CSRF token
    console.log()
    console.log('4. 🛡️  Verificando CSRF token...')
    const csrfResponse = await fetch(`${PRODUCTION_URL}/api/auth/csrf`)
    const csrfData = await csrfResponse.json()
    console.log(`   ✅ CSRF Token: ${csrfData.csrfToken ? 'Disponível' : 'Não encontrado'}`)

    // 5. Verificar configuração de sessão
    console.log()
    console.log('5. 📝 Verificando configuração de sessão...')
    const sessionResponse = await fetch(`${PRODUCTION_URL}/api/auth/session`)
    const sessionData = await sessionResponse.json()
    console.log(`   Sessão: ${sessionData.user ? 'Autenticada' : 'Não autenticada'}`)

  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message)
    console.error('   Verifique se o servidor está rodando e acessível')
  }

  console.log()
  console.log('🎯 Próximos passos:')
  console.log('1. Verificar logs de produção')
  console.log('2. Confirmar variáveis de ambiente (NEXTAUTH_SECRET, NEXTAUTH_URL)')
  console.log('3. Testar manualmente no navegador')
  console.log('4. Verificar configuração de cookies')
}

// Executar teste
if (require.main === module) {
  testAuthProduction()
}