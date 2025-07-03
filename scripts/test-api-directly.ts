// Teste direto da API para verificar se o problema é frontend ou backend

async function testApiDirectly() {
  console.log('🧪 Testando API de chat diretamente...\n')
  
  try {
    // 1. Testar endpoint de chat
    console.log('1. Testando /api/chat/stream...')
    
    const response = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Olá! Este é um teste direto da API.' }
        ],
        model: 'mistral-7b'
      })
    })
    
    console.log(`Status: ${response.status}`)
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const text = await response.text()
      console.log(`Response (first 200 chars): ${text.substring(0, 200)}...`)
      
      if (text.includes('error') || text.includes('Error')) {
        console.log('❌ API retornou erro na resposta')
      } else if (text.length > 0) {
        console.log('✅ API retornou resposta válida')
      } else {
        console.log('⚠️  API retornou resposta vazia')
      }
    } else {
      const errorText = await response.text()
      console.log(`❌ API Error: ${errorText}`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
  }
  
  try {
    // 2. Testar assets estáticos
    console.log('\n2. Testando assets estáticos...')
    
    const staticTests = [
      '/_next/static/',
      '/_next/static/chunks/',
      '/favicon.ico'
    ]
    
    for (const path of staticTests) {
      try {
        const response = await fetch(`https://seahorse-app-k5pag.ondigitalocean.app${path}`)
        console.log(`${path}: ${response.status}`)
      } catch (error) {
        console.log(`${path}: ERRO - ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar assets:', error.message)
  }
  
  try {
    // 3. Testar modelos disponíveis
    console.log('\n3. Testando endpoint de modelos...')
    
    const modelsResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/models')
    console.log(`Models API: ${modelsResponse.status}`)
    
    if (modelsResponse.ok) {
      const models = await modelsResponse.json()
      console.log(`Modelos disponíveis: ${models.length || 'N/A'}`)
    }
    
  } catch (error) {
    console.log('⚠️  Endpoint de modelos não existe ou erro:', error.message)
  }
  
  try {
    // 4. Testar configuração da aplicação
    console.log('\n4. Testando configuração da aplicação...')
    
    const healthResponse = await fetch('https://seahorse-app-k5pag.ondigitalocean.app/api/health')
    console.log(`Health check: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('Health status:', health)
    }
    
  } catch (error) {
    console.log('⚠️  Health check não existe ou erro:', error.message)
  }
  
  console.log('\n📊 RESUMO DO TESTE DIRETO DA API:')
  console.log('- Se API de chat funciona: problema é no frontend')
  console.log('- Se API retorna erro: problema é no backend') 
  console.log('- Se assets retornam 404: problema é no build/deploy')
  console.log('- Verificar variáveis de ambiente se API falha')
}

if (require.main === module) {
  testApiDirectly()
}

export { testApiDirectly }