// Diagnóstico específico do problema do chat

async function diagnoseChatIssue() {
  console.log('🔍 Diagnosticando problema do chat em produção...\n')
  
  // Testar diferentes URLs e verificar respostas
  const urls = [
    'https://seahorse-app-k5pag.ondigitalocean.app',
    'https://seahorse-app-k5pag.ondigitalocean.app/dashboard',
    'https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat',
    'https://seahorse-app-k5pag.ondigitalocean.app/api/auth/session'
  ]
  
  console.log('1. Testando URLs sem autenticação:')
  for (const url of urls) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        redirect: 'manual' // Não seguir redirects automaticamente
      })
      
      console.log(`${url}:`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Redirect: ${response.headers.get('location') || 'Nenhum'}`)
      
      if (response.status === 200) {
        const text = await response.text()
        const hasLoginForm = text.includes('email') && text.includes('password')
        const hasChat = text.includes('chat') || text.includes('message')
        console.log(`   Tipo: ${hasLoginForm ? 'Login' : hasChat ? 'Chat' : 'Outro'}`)
      }
      console.log()
      
    } catch (error) {
      console.log(`   Erro: ${error.message}\n`)
    }
  }
  
  // Testar login via API
  console.log('2. Testando login via API:')
  try {
    // Obter CSRF token
    const csrfResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/auth/csrf')
    const csrfData = await csrfResponse.json()
    console.log(`✅ CSRF Token obtido: ${csrfData.csrfToken.substring(0, 20)}...`)
    
    // Fazer login
    const loginData = new URLSearchParams({
      email: 'test@example.com',
      password: 'test123',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat'
    })
    
    const loginResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: loginData,
      redirect: 'manual'
    })
    
    console.log(`Login Status: ${loginResponse.status}`)
    console.log(`Login Redirect: ${loginResponse.headers.get('location') || 'Nenhum'}`)
    
    // Verificar cookies de sessão
    const cookies = loginResponse.headers.get('set-cookie')
    if (cookies) {
      console.log('✅ Cookies de sessão recebidos')
      console.log(`Cookies: ${cookies.substring(0, 100)}...`)
    } else {
      console.log('❌ Nenhum cookie de sessão recebido')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de login:', error.message)
  }
  
  // Verificar se há problemas específicos
  console.log('\n3. Possíveis problemas identificados:')
  
  // Testar se o problema é de CORS ou CSP
  try {
    const testResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatTest/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    
    if (testResponse.status === 307 || testResponse.status === 302) {
      console.log('❌ Problema: Chat sempre redireciona para login')
      console.log('   Possível causa: Middleware de autenticação muito restritivo')
    }
    
    if (testResponse.status === 500) {
      console.log('❌ Problema: Erro interno do servidor')
      console.log('   Verificar logs do servidor para detalhes')
    }
    
  } catch (error) {
    console.log('❌ Problema de conectividade ou timeout')
  }
  
  console.log('\n🔧 Recomendações baseadas no diagnóstico:')
  console.log('1. Verificar middleware de autenticação em /dashboard/chat')
  console.log('2. Verificar se NextAuth está configurado corretamente')
  console.log('3. Verificar logs do servidor para erros específicos')
  console.log('4. Testar login manual no navegador')
  console.log('5. Verificar se variáveis NEXTAUTH_* estão corretas')
  
  console.log('\n📝 Próximos passos:')
  console.log('1. Login manual: https://seahorse-app-k5pag.ondigitalocean.app/auth/signin')
  console.log('2. Email: test@example.com')
  console.log('3. Senha: test123')
  console.log('4. Verificar se consegue acessar /dashboard/chat após login')
}

if (require.main === module) {
  diagnoseChatIssue()
}

export { diagnoseChatIssue }