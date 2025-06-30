#!/usr/bin/env node
import dotenv from 'dotenv'
import path from 'path'

// Carrega as variáveis de ambiente
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Modelos para testar organizados por categoria
const TEST_MODELS = {
  fast: [
    'gpt-4o-mini',
    'claude-3.5-haiku',
    'gemini-2-flash',
    'grok-3-mini',
    'perplexity-sonar',
    'llama-3.3-70b',
    'qwq-32b'
  ],
  advanced: [
    'gpt-4o',
    'claude-3.5-sonnet',
    'gemini-2-pro',
    'grok-3',
    'perplexity-sonar-pro',
    'mistral-large-2'
  ],
  free: [
    'deepseek-r1',
    'gemini-2-flash-free'
  ]
}

// Função para testar um modelo específico
async function testModel(modelId: string, modelName: string) {
  console.log(`\n🔍 Testando ${modelName} (${modelId})...`)
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'InnerAI Model Test'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: 'Responda em português: Qual é a capital do Brasil? (responda em no máximo 10 palavras)'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(`❌ Erro: ${error.error?.message || 'Erro desconhecido'}`)
      return false
    }

    const data = await response.json()
    const answer = data.choices[0].message.content
    const usage = data.usage
    
    console.log(`✅ Sucesso!`)
    console.log(`   Resposta: ${answer}`)
    console.log(`   Tokens: ${usage.total_tokens} (prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens})`)
    
    if (data.usage?.total_cost) {
      console.log(`   Custo: $${data.usage.total_cost.toFixed(6)}`)
    }
    
    return true
  } catch (error) {
    console.error(`❌ Erro na requisição: ${error}`)
    return false
  }
}

// Mapeamento de IDs para nomes do OpenRouter
const MODEL_MAPPING: Record<string, string> = {
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-3.5-haiku': 'anthropic/claude-3.5-haiku',
  'gemini-2-flash': 'google/gemini-2.5-flash',
  'gemini-2-pro': 'google/gemini-2.5-pro',
  'gemini-2-flash-free': 'google/gemini-2.0-flash-exp:free',
  'grok-3': 'x-ai/grok-3',
  'grok-3-mini': 'x-ai/grok-3-mini',
  'perplexity-sonar': 'perplexity/sonar',
  'perplexity-sonar-pro': 'perplexity/sonar-pro',
  'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',
  'mistral-large-2': 'mistralai/mistral-large-2411',
  'qwq-32b': 'qwen/qwq-32b',
  'deepseek-r1': 'deepseek/deepseek-r1-0528:free'
}

// Função principal
async function main() {
  console.log('🚀 Iniciando testes dos novos modelos do OpenRouter...\n')
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY não encontrada no .env.local')
    process.exit(1)
  }

  const results = {
    success: [] as string[],
    failed: [] as string[]
  }

  // Testar modelos por categoria
  for (const [category, models] of Object.entries(TEST_MODELS)) {
    console.log(`\n\n📂 === Categoria: ${category.toUpperCase()} ===`)
    
    for (const modelId of models) {
      const openRouterModelId = MODEL_MAPPING[modelId]
      if (!openRouterModelId) {
        console.error(`❌ Modelo ${modelId} não tem mapeamento!`)
        results.failed.push(modelId)
        continue
      }
      
      const success = await testModel(modelId, openRouterModelId)
      if (success) {
        results.success.push(modelId)
      } else {
        results.failed.push(modelId)
      }
      
      // Pequena pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Resumo final
  console.log('\n\n📊 === RESUMO DOS TESTES ===')
  console.log(`\n✅ Modelos funcionando (${results.success.length}):`)
  results.success.forEach(model => console.log(`   - ${model}`))
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Modelos com falha (${results.failed.length}):`)
    results.failed.forEach(model => console.log(`   - ${model}`))
  }
  
  console.log(`\n\n🎯 Taxa de sucesso: ${results.success.length}/${results.success.length + results.failed.length} (${Math.round(results.success.length / (results.success.length + results.failed.length) * 100)}%)`)
}

// Executar testes
main().catch(console.error)