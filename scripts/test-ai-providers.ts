import { aiService } from '../lib/ai/ai-service.js'
import { AIMessage } from '../lib/ai/types.js'

async function testAIProviders() {
  console.log('🤖 Testando Provedores de IA...\n')

  // Mensagem de teste
  const testMessages: AIMessage[] = [
    {
      role: 'user',
      content: 'Olá! Me diga em uma frase: qual é a capital do Brasil?'
    }
  ]

  // Verificar quais provedores estão configurados
  console.log('📋 Verificando configuração dos provedores:')
  
  const openaiConfigured = !!process.env.OPENAI_API_KEY
  const openrouterConfigured = !!process.env.OPENROUTER_API_KEY
  
  console.log(`- OpenAI: ${openaiConfigured ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`- OpenRouter: ${openrouterConfigured ? '✅ Configurado' : '❌ Não configurado'}`)
  
  if (!openaiConfigured && !openrouterConfigured) {
    console.log('\n❌ Nenhum provedor configurado! Configure as API keys no .env.local')
    return
  }

  // Listar modelos disponíveis
  console.log('\n📊 Modelos disponíveis:')
  const allModels = aiService.getAllAvailableModels()
  
  const modelsByProvider = allModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = []
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, typeof allModels>)

  Object.entries(modelsByProvider).forEach(([provider, models]) => {
    console.log(`\n${provider.toUpperCase()}:`)
    models.forEach(model => {
      console.log(`  - ${model.name} (${model.id})`)
      console.log(`    Max tokens: ${model.maxTokens}`)
      console.log(`    Custo: $${model.costPerInputToken}/1k input, $${model.costPerOutputToken}/1k output`)
    })
  })

  // Testar um modelo de cada provedor configurado
  console.log('\n🧪 Testando modelos...\n')

  if (openaiConfigured) {
    console.log('Testando OpenAI (gpt-3.5-turbo)...')
    try {
      const response = await aiService.generateResponse(testMessages, 'gpt-3.5-turbo')
      console.log(`✅ Resposta: ${response.content}`)
      console.log(`   Tokens: ${response.tokensUsed.total} (custo: $${response.cost.toFixed(4)})`)
    } catch (error) {
      console.log(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  if (openrouterConfigured) {
    console.log('\nTestando OpenRouter (mistral-7b)...')
    try {
      const response = await aiService.generateResponse(testMessages, 'mistral-7b')
      console.log(`✅ Resposta: ${response.content}`)
      console.log(`   Tokens: ${response.tokensUsed.total} (custo: $${response.cost.toFixed(4)})`)
    } catch (error) {
      console.log(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // Testar streaming
  console.log('\n🌊 Testando streaming...')
  
  if (openaiConfigured) {
    console.log('\nStreaming com OpenAI:')
    try {
      process.stdout.write('Resposta: ')
      let fullResponse = ''
      
      await aiService.streamResponseWithCallbacks(testMessages, 'gpt-3.5-turbo', {
        onToken: (token) => {
          process.stdout.write(token)
          fullResponse += token
        },
        onComplete: (response) => {
          console.log(`\n✅ Completo! Tokens: ${response.tokensUsed.total} (custo: $${response.cost.toFixed(4)})`)
        },
        onError: (error) => {
          console.log(`\n❌ Erro: ${error.message}`)
        }
      })
    } catch (error) {
      console.log(`\n❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // Testar modelos por plano
  console.log('\n🎯 Modelos por plano:')
  
  const plans = ['FREE', 'PRO', 'ENTERPRISE'] as const
  plans.forEach(plan => {
    const models = aiService.getModelsForPlan(plan)
    console.log(`\n${plan}:`)
    models.forEach(model => {
      console.log(`  - ${model.name}`)
    })
  })

  console.log('\n✅ Teste concluído!')
}

// Executar teste
testAIProviders()
  .catch(console.error)
  .finally(() => process.exit(0))