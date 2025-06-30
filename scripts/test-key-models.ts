#!/usr/bin/env node
import dotenv from 'dotenv'
import path from 'path'

// Carrega as variáveis de ambiente
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Modelos chave para testar (um de cada categoria principal)
const KEY_MODELS = [
  { id: 'gpt-4o-mini', openRouterId: 'openai/gpt-4o-mini', category: 'OpenAI Fast' },
  { id: 'claude-3.5-sonnet', openRouterId: 'anthropic/claude-3.5-sonnet', category: 'Anthropic Advanced' },
  { id: 'gemini-2-flash', openRouterId: 'google/gemini-2.5-flash', category: 'Google Fast' },
  { id: 'deepseek-r1', openRouterId: 'deepseek/deepseek-r1-0528:free', category: 'DeepSeek Free' },
  { id: 'grok-3-mini', openRouterId: 'x-ai/grok-3-mini', category: 'xAI Fast' }
]

// Testar modelo
async function testModel(model: typeof KEY_MODELS[0]) {
  console.log(`\n🧪 Testando ${model.category}: ${model.id}`)
  console.log(`   OpenRouter ID: ${model.openRouterId}`)
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'InnerAI Test'
      },
      body: JSON.stringify({
        model: model.openRouterId,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from InnerAI!" in exactly 3 words.'
          }
        ],
        max_tokens: 20,
        temperature: 0
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error(`   ❌ Erro: ${data.error?.message || JSON.stringify(data)}`)
      return false
    }

    console.log(`   ✅ Sucesso!`)
    console.log(`   💬 Resposta: "${data.choices[0].message.content}"`)
    console.log(`   📊 Tokens: ${data.usage.total_tokens}`)
    if (data.usage?.total_cost) {
      console.log(`   💰 Custo: $${data.usage.total_cost.toFixed(6)}`)
    }
    
    return true
  } catch (error) {
    console.error(`   ❌ Erro de conexão: ${error}`)
    return false
  }
}

// Main
async function main() {
  console.log('🚀 Teste Rápido dos Modelos Implementados')
  console.log('==========================================\n')
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY não encontrada!')
    console.error('   Adicione ao arquivo .env.local:')
    console.error('   OPENROUTER_API_KEY=sua-chave-aqui')
    process.exit(1)
  }

  console.log('✅ API Key encontrada')
  console.log(`📍 Testando ${KEY_MODELS.length} modelos principais...\n`)

  let successCount = 0
  
  for (const model of KEY_MODELS) {
    const success = await testModel(model)
    if (success) successCount++
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  console.log('\n\n📊 RESULTADO FINAL')
  console.log('==================')
  console.log(`✅ Modelos funcionando: ${successCount}/${KEY_MODELS.length}`)
  console.log(`❌ Modelos com falha: ${KEY_MODELS.length - successCount}/${KEY_MODELS.length}`)
  
  if (successCount === KEY_MODELS.length) {
    console.log('\n🎉 Todos os modelos testados estão funcionando!')
  } else {
    console.log('\n⚠️  Alguns modelos falharam. Verifique os logs acima.')
  }
}

main().catch(console.error)