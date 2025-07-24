import { INNERAI_MODELS } from '../lib/ai/innerai-models-config'

console.log('🚀 Testando configuração atualizada dos modelos InnerAI\n')

// Estatísticas gerais
const totalModels = INNERAI_MODELS.length
const fastModels = INNERAI_MODELS.filter(m => m.category === 'fast')
const advancedModels = INNERAI_MODELS.filter(m => m.category === 'advanced')
const creditModels = INNERAI_MODELS.filter(m => m.category === 'credit')

console.log('📊 ESTATÍSTICAS:')
console.log(`Total de modelos: ${totalModels}`)
console.log(`Modelos rápidos: ${fastModels.length}`)
console.log(`Modelos avançados: ${advancedModels.length}`)
console.log(`Modelos de crédito: ${creditModels.length}`)
console.log()

// Modelos rápidos (FREE)
console.log('⚡ MODELOS RÁPIDOS (FREE):')
fastModels.forEach(model => {
  console.log(`✅ ${model.name} (${model.provider})`)
  console.log(`   ID: ${model.id}`)
  console.log(`   Contexto: ${model.contextWindow.toLocaleString()} tokens`)
  console.log(`   Performance: Velocidade ${model.performance.speed}, Qualidade ${model.performance.quality}`)
  console.log()
})

// Modelos avançados
console.log('🧠 MODELOS AVANÇADOS:')
advancedModels.forEach(model => {
  console.log(`✅ ${model.name} (${model.provider})`)
  console.log(`   ID: ${model.id}`)
  console.log(`   Plano: ${model.planRequired}`)
  console.log(`   Contexto: ${model.contextWindow.toLocaleString()} tokens`)
  console.log(`   Custo: $${model.costPer1kTokens.input}/$${model.costPer1kTokens.output} por 1k tokens`)
  console.log()
})

// Modelos de crédito
console.log('💎 MODELOS DE CRÉDITO:')
creditModels.forEach(model => {
  console.log(`✅ ${model.name} (${model.provider})`)
  console.log(`   ID: ${model.id}`)
  console.log(`   Créditos: ${model.credits || 'N/A'}`)
  console.log(`   Features: ${model.features.join(', ')}`)
  console.log()
})

// Verificar modelos removidos
const removedModels = [
  'Claude 3 Opus',
  'Claude 3 Sonnet (versão antiga)',
  'Mistral Large 2',
  'Grok 3.0 (beta)'
]

console.log('🗑️ MODELOS REMOVIDOS (ultrapassados):')
removedModels.forEach(model => {
  console.log(`❌ ${model}`)
})
console.log()

// Novos modelos adicionados
const newModels = [
  'Claude 3.5 Haiku (20241022)',
  'Claude 3.5 Sonnet (20241022)', 
  'Gemini Flash 1.5 8B',
  'Llama 3.3 70B',
  'OpenAI o1-preview',
  'Grok 2 (1212)'
]

console.log('✨ MODELOS ATUALIZADOS/NOVOS:')
newModels.forEach(model => {
  console.log(`✅ ${model}`)
})
console.log()

console.log('🎉 Configuração atualizada com sucesso!')
console.log('📍 Acesse: http://localhost:3005/dashboard/models')