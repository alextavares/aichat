import { OpenRouterProvider } from '../lib/ai/openrouter-provider'

async function testOpenRouter() {
  console.log('🧪 Testando conexão com OpenRouter...\n')
  
  const provider = new OpenRouterProvider()
  
  // Verificar se está configurado
  if (!provider.isConfigured()) {
    console.error('❌ OpenRouter não está configurado!')
    console.log('Por favor, configure OPENROUTER_API_KEY no arquivo .env.local')
    return
  }
  
  console.log('✅ OpenRouter API key configurada')
  console.log('🔑 API Key:', process.env.OPENROUTER_API_KEY?.slice(0, 10) + '...')
  
  // Testar com um modelo simples
  const testModel = 'mistral-7b'
  console.log(`\n📝 Testando com modelo: ${testModel}`)
  
  try {
    const response = await provider.generateResponse(
      [
        {
          role: 'user',
          content: 'Olá! Responda apenas com "Funcionando!"'
        }
      ],
      testModel
    )
    
    console.log('✅ Resposta recebida:', response.content)
    console.log('📊 Tokens usados:', response.tokensUsed)
    console.log('💰 Custo estimado: $', response.cost.toFixed(6))
    
    // Testar streaming
    console.log('\n🔄 Testando streaming...')
    const stream = provider.streamResponse(
      [
        {
          role: 'user',
          content: 'Conte de 1 a 5'
        }
      ],
      testModel
    )
    
    let fullResponse = ''
    for await (const token of stream) {
      process.stdout.write(token)
      fullResponse += token
    }
    
    console.log('\n\n✅ Streaming funcionando!')
    console.log('📝 Resposta completa:', fullResponse.length, 'caracteres')
    
    // Listar modelos disponíveis
    console.log('\n📋 Modelos disponíveis:')
    const models = provider.getAvailableModels()
    models.slice(0, 10).forEach(model => {
      console.log(`  - ${model.name} (${model.id})`)
    })
    console.log(`  ... e mais ${models.length - 10} modelos`)
    
  } catch (error) {
    console.error('\n❌ Erro ao testar OpenRouter:', error)
  }
}

testOpenRouter()