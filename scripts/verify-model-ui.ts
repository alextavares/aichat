#!/usr/bin/env node
import { aiService } from '../lib/ai/ai-service'
import { PLAN_LIMITS, getModelType } from '../lib/usage-limits'

console.log('🔍 Verificando Modelos na UI')
console.log('============================\n')

// Verificar modelos por plano
const plans = ['FREE', 'PRO', 'ENTERPRISE'] as const

for (const plan of plans) {
  console.log(`\n📋 Plano ${plan}:`)
  console.log('-------------------')
  
  const models = aiService.getModelsForPlan(plan)
  const limits = PLAN_LIMITS[plan]
  
  console.log(`Total de modelos: ${models.length}`)
  console.log(`Modelos rápidos: ${limits.modelsAllowed.fast.length}`)
  console.log(`Modelos avançados: ${limits.modelsAllowed.advanced.length}`)
  
  // Listar alguns modelos de exemplo
  console.log('\nExemplos de modelos disponíveis:')
  
  const fastExamples = models.filter(m => limits.modelsAllowed.fast.includes(m.id)).slice(0, 3)
  const advancedExamples = models.filter(m => limits.modelsAllowed.advanced.includes(m.id)).slice(0, 3)
  
  if (fastExamples.length > 0) {
    console.log('\n  🚀 Modelos Rápidos:')
    fastExamples.forEach(m => {
      console.log(`     - ${m.name} (${m.id})`)
    })
  }
  
  if (advancedExamples.length > 0) {
    console.log('\n  💎 Modelos Avançados:')
    advancedExamples.forEach(m => {
      console.log(`     - ${m.name} (${m.id})`)
    })
  }
}

// Verificar categorização
console.log('\n\n🏷️  Verificando Categorização de Modelos:')
console.log('=========================================')

const testModels = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3.5-sonnet',
  'claude-3.5-haiku',
  'deepseek-r1',
  'gemini-2-flash-free',
  'grok-3',
  'perplexity-sonar-pro'
]

for (const modelId of testModels) {
  const type = getModelType(modelId)
  const emoji = type === 'fast' ? '🚀' : type === 'advanced' ? '💎' : '❓'
  console.log(`${emoji} ${modelId}: ${type || 'não categorizado'}`)
}

// Verificar novos modelos
console.log('\n\n✨ Novos Modelos Implementados:')
console.log('================================')

const newModels = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3.5-sonnet',
  'claude-3.5-haiku',
  'gemini-2-flash',
  'gemini-2-pro',
  'gemini-2-flash-free',
  'grok-3',
  'grok-3-mini',
  'grok-2-vision',
  'perplexity-sonar',
  'perplexity-sonar-pro',
  'perplexity-reasoning',
  'llama-3.3-70b',
  'llama-3.1-405b',
  'llama-3.2-90b-vision',
  'qwq-32b',
  'qwen-2.5-72b',
  'qwen-2.5-coder',
  'mistral-large-2'
]

const allModels = aiService.getAllAvailableModels()
let foundCount = 0

for (const modelId of newModels) {
  const model = allModels.find(m => m.id === modelId)
  if (model) {
    console.log(`✅ ${model.name} (${modelId})`)
    foundCount++
  } else {
    console.log(`❌ ${modelId} - NÃO ENCONTRADO`)
  }
}

console.log(`\n📊 Total: ${foundCount}/${newModels.length} modelos encontrados`)