const fetch = require('node-fetch')

// Configurações
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_MODEL = process.argv[2] || 'gpt-3.5-turbo'

async function diagnoseChatSystem() {
  console.log('🔍 Diagnóstico do Sistema de Chat InnerAI')
  console.log('='.repeat(50))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Modelo de teste: ${TEST_MODEL}`)
  console.log('')

  // 1. Verificar variáveis de ambiente
  console.log('📋 1. Verificando Configuração...')
  const envCheck = {
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET
  }
  
  Object.entries(envCheck).forEach(([key, value]) => {
    console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Configurado' : 'NÃO CONFIGURADO'}`)
  })
  console.log('')

  // 2. Testar conectividade com APIs externas
  console.log('🌐 2. Testando Conectividade...')
  
  // Teste OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      console.log(`  ${response.ok ? '✅' : '❌'} OpenRouter API: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.log(`  ❌ OpenRouter API: Erro de conexão - ${error.message}`)
    }
  } else {
    console.log('  ⚠️  OpenRouter API: Chave não configurada')
  }

  // Teste OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      console.log(`  ${response.ok ? '✅' : '❌'} OpenAI API: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.log(`  ❌ OpenAI API: Erro de conexão - ${error.message}`)
    }
  } else {
    console.log('  ⚠️  OpenAI API: Chave não configurada')
  }
  console.log('')

  // 3. Testar endpoint de chat (se servidor estiver rodando)
  console.log('🤖 3. Testando Endpoint de Chat...')
  try {
    const testMessage = {
      messages: [
        { role: 'user', content: 'Hello, this is a test message.' }
      ],
      model: TEST_MODEL
    }

    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    })

    if (response.ok) {
      const data = await response.json()
      console.log('  ✅ Endpoint de chat funcionando')
      console.log(`  📝 Resposta: ${data.message ? data.message.substring(0, 100) + '...' : 'Sem conteúdo'}`)
    } else {
      const errorData = await response.text()
      console.log(`  ❌ Endpoint de chat falhou: ${response.status} ${response.statusText}`)
      console.log(`  📝 Erro: ${errorData.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`  ❌ Não foi possível conectar ao servidor: ${error.message}`)
    console.log('  💡 Certifique-se de que o servidor está rodando em', BASE_URL)
  }
  console.log('')

  // 4. Verificar banco de dados (se possível)
  console.log('🗄️  4. Testando Banco de Dados...')
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$queryRaw`SELECT 1`
    console.log('  ✅ Conexão com banco de dados funcionando')
    
    // Verificar se há usuários
    const userCount = await prisma.user.count()
    console.log(`  👥 Total de usuários: ${userCount}`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.log(`  ❌ Erro no banco de dados: ${error.message}`)
  }
  console.log('')

  // 5. Recomendações
  console.log('💡 5. Recomendações:')
  
  if (!envCheck.OPENROUTER_API_KEY && !envCheck.OPENAI_API_KEY) {
    console.log('  ⚠️  Configure pelo menos uma chave de API (OpenRouter ou OpenAI)')
  }
  
  if (!envCheck.DATABASE_URL) {
    console.log('  ⚠️  Configure a URL do banco de dados')
  }
  
  if (!envCheck.NEXTAUTH_SECRET) {
    console.log('  ⚠️  Configure o NEXTAUTH_SECRET para autenticação')
  }
  
  console.log('  📚 Para mais informações, consulte o README.md do projeto')
  console.log('')
  console.log('✅ Diagnóstico concluído!')
}

// Executar diagnóstico
diagnoseChatSystem().catch(error => {
  console.error('❌ Erro durante diagnóstico:', error)
  process.exit(1)
}) 