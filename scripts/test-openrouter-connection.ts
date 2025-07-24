#!/usr/bin/env tsx

// Teste direto da conexão com OpenRouter
import { OpenRouterProvider } from '../lib/ai/openrouter-provider'

async function testOpenRouter() {
  console.log('🔗 TESTANDO CONEXÃO COM OPENROUTER\n')

  try {
    const provider = new OpenRouterProvider()
    
    console.log(`✅ Provider criado`)
    console.log(`   • Configurado: ${provider.isConfigured()}`)
    
    if (!provider.isConfigured()) {
      console.error('❌ OpenRouter não está configurado!')
      console.log('   • Verifique se OPENROUTER_API_KEY está definida no .env.local')
      return
    }

    // Testar listagem de modelos
    console.log('\n🔄 Testando listagem de modelos...')
    const models = provider.getAvailableModels()
    console.log(`   • Modelos disponíveis: ${models.length}`)

    // Testar uma requisição simples
    console.log('\n🧪 Testando requisição de chat...')
    const messages = [
      { role: 'user' as const, content: 'Diga apenas "Olá!" em português' }
    ]

    try {
      const response = await provider.generateResponse(messages, 'gpt-4o-mini')
      console.log('✅ Resposta recebida:')
      console.log(`   • Conteúdo: ${response.content}`)
      console.log(`   • Tokens: ${JSON.stringify(response.tokensUsed)}`)
      console.log(`   • Custo: $${response.cost}`)
    } catch (apiError) {
      console.error('❌ Erro na API do OpenRouter:')
      console.error(`   • ${apiError}`)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testOpenRouter()