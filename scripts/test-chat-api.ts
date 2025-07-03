import { aiService } from '../lib/ai/ai-service'

async function testChatAPI() {
  console.log('🚀 Testando API de chat com novos modelos...\n')

  const testModels = [
    { id: 'gpt-4.1', name: 'GPT-4.1' },
    { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar' },
    { id: 'sabia-3.1', name: 'Sabiá 3.1' },
    { id: 'o3', name: 'o3' }
  ]

  // Verificar quais modelos estão disponíveis
  console.log('📋 Modelos disponíveis no sistema:')
  const allModels = aiService.getAllAvailableModels()
  const modelIds = allModels.map(m => m.id)
  console.log(modelIds.join(', '))
  console.log()

  // Verificar modelos para plano PRO
  console.log('💎 Modelos disponíveis para plano PRO:')
  const proModels = aiService.getModelsForPlan('PRO')
  const proModelIds = proModels.map(m => m.id)
  console.log(proModelIds.join(', '))
  console.log()

  // Testar se os novos modelos estão incluídos
  console.log('✅ Verificando novos modelos:')
  for (const model of testModels) {
    const isAvailable = modelIds.includes(model.id)
    const isInPro = proModelIds.includes(model.id)
    console.log(`${model.name} (${model.id}): ${isAvailable ? '✓' : '✗'} Disponível | ${isInPro ? '✓' : '✗'} PRO`)
  }

  // Testar um modelo específico
  console.log('\n🧪 Testando modelo Sabiá 3.1...')
  try {
    const response = await aiService.generateResponse(
      [{ role: 'user', content: 'Olá! Me diga "Oi, sou o Sabiá 3.1 e estou funcionando!" em português brasileiro.' }],
      'sabia-3.1'
    )
    console.log('Resposta:', response.content)
    console.log('Tokens usados:', response.tokensUsed.total)
  } catch (error) {
    console.error('Erro:', error.message)
  }
}

testChatAPI().catch(console.error)