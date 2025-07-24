import { INNERAI_MODELS } from './lib/ai/innerai-models-config'

console.log('🔍 Verificando configuração de modelos após correções...\n')

// Estatísticas gerais
console.log('📊 ESTATÍSTICAS GERAIS:')
console.log(`Total de modelos: ${INNERAI_MODELS.length}`)
console.log(`Modelos rápidos: ${INNERAI_MODELS.filter(m => m.category === 'fast').length}`)
console.log(`Modelos avançados: ${INNERAI_MODELS.filter(m => m.category === 'advanced').length}`)
console.log(`Modelos de crédito: ${INNERAI_MODELS.filter(m => m.category === 'credit').length}`)
console.log(`Modelos disponíveis: ${INNERAI_MODELS.filter(m => m.isAvailable).length}`)
console.log()

// Verificar se há modelos ultrapassados
const outdatedModels = [
  'Claude 3 Opus',
  'Claude 3 Sonnet',
  'Mistral Large 2',
  'Grok 3.0'
]

console.log('🚫 VERIFICANDO MODELOS ULTRAPASSADOS:')
outdatedModels.forEach(modelName => {
  const found = INNERAI_MODELS.find(m => m.name.includes(modelName))
  if (found) {
    console.log(`❌ ENCONTRADO: ${found.name} (${found.id})`)
  } else {
    console.log(`✅ REMOVIDO: ${modelName}`)
  }
})
console.log()

// Listar modelos atuais por categoria
console.log('⚡ MODELOS RÁPIDOS:')
INNERAI_MODELS.filter(m => m.category === 'fast').forEach(model => {
  console.log(`  • ${model.name} (${model.provider}) - ${model.isAvailable ? '✅ Disponível' : '❌ Indisponível'}`)
})
console.log()

console.log('🧠 MODELOS AVANÇADOS:')
INNERAI_MODELS.filter(m => m.category === 'advanced').forEach(model => {
  console.log(`  • ${model.name} (${model.provider}) - ${model.isAvailable ? '✅ Disponível' : '❌ Indisponível'}`)
})
console.log()

console.log('💳 MODELOS DE CRÉDITO:')
INNERAI_MODELS.filter(m => m.category === 'credit').forEach(model => {
  console.log(`  • ${model.name} (${model.provider}) - ${model.isAvailable ? '✅ Disponível' : '❌ Indisponível'}`)
})
console.log()

// Verificar propriedades corretas
console.log('🔧 VERIFICANDO PROPRIEDADES:')
const hasCorrectProperties = INNERAI_MODELS.every(model => 
  model.hasOwnProperty('isAvailable') && 
  model.hasOwnProperty('planRequired') &&
  model.hasOwnProperty('performance')
)
console.log(`Propriedades corretas: ${hasCorrectProperties ? '✅' : '❌'}`)

// Verificar se há problemas de performance
const performanceIssues = INNERAI_MODELS.filter(model => 
  !['fast', 'medium', 'slow'].includes(model.performance.speed) ||
  !['good', 'excellent', 'superior'].includes(model.performance.quality)
)
console.log(`Problemas de performance: ${performanceIssues.length === 0 ? '✅ Nenhum' : `❌ ${performanceIssues.length} modelos`}`)

if (performanceIssues.length > 0) {
  performanceIssues.forEach(model => {
    console.log(`  • ${model.name}: speed=${model.performance.speed}, quality=${model.performance.quality}`)
  })
}

console.log('\n✅ Verificação concluída!')