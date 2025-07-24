#!/usr/bin/env tsx

// Teste do sistema de créditos integrado com modelos do InnerAI
import { 
  getModelById, 
  calculateCreditsForTokens, 
  modelRequiresCredits,
  getModelsForPlan,
  INNERAI_MODELS
} from '../lib/ai/innerai-models-config'

console.log('🔬 Testando Sistema de Créditos Integrado com InnerAI Models\n')

// 1. Testar configuração de modelos
console.log('📋 Modelos disponíveis por categoria:')
const fastModels = INNERAI_MODELS.filter(m => m.category === 'fast' && m.isAvailable)
const advancedModels = INNERAI_MODELS.filter(m => m.category === 'advanced' && m.isAvailable)
const reasoningModels = INNERAI_MODELS.filter(m => m.category === 'reasoning' && m.isAvailable)

console.log(`  • Modelos Rápidos (FREE): ${fastModels.length}`)
console.log(`  • Modelos Avançados (LITE+): ${advancedModels.length}`)
console.log(`  • Raciocínio Profundo (PRO+): ${reasoningModels.length}`)

// 2. Testar cálculo de créditos
console.log('\n💰 Testando cálculo de créditos:')

const testCases = [
  { modelId: 'gpt-4o-mini', inputTokens: 100, outputTokens: 200 },
  { modelId: 'claude-4-sonnet', inputTokens: 500, outputTokens: 800 },
  { modelId: 'o3', inputTokens: 200, outputTokens: 400 },
  { modelId: 'gemini-2.5-flash', inputTokens: 1000, outputTokens: 1500 }
]

for (const testCase of testCases) {
  const model = getModelById(testCase.modelId)
  if (model) {
    const credits = calculateCreditsForTokens(
      testCase.modelId, 
      testCase.inputTokens, 
      testCase.outputTokens
    )
    const requiresCredits = modelRequiresCredits(testCase.modelId)
    
    console.log(`  • ${model.name} (${model.category}):`)
    console.log(`    - Tokens: ${testCase.inputTokens}/${testCase.outputTokens}`)
    console.log(`    - Créditos: ${credits}`)
    console.log(`    - Requer créditos: ${requiresCredits ? 'Sim' : 'Não (FREE)'}`)
    console.log(`    - Plano mínimo: ${model.planRequired}`)
  }
}

// 3. Testar modelos por plano
console.log('\n📊 Modelos disponíveis por plano:')
const plans = ['FREE', 'LITE', 'PRO', 'ENTERPRISE'] as const

for (const plan of plans) {
  const models = getModelsForPlan(plan)
  console.log(`  • ${plan}: ${models.length} modelos`)
  
  const byCategory = {
    fast: models.filter(m => m.category === 'fast').length,
    advanced: models.filter(m => m.category === 'advanced').length,
    reasoning: models.filter(m => m.category === 'reasoning').length
  }
  
  console.log(`    - Rápidos: ${byCategory.fast}, Avançados: ${byCategory.advanced}, Raciocínio: ${byCategory.reasoning}`)
}

// 4. Simular cenários de uso
console.log('\n🎯 Cenários de uso simulados:')

const scenarios = [
  {
    plan: 'FREE',
    model: 'gpt-4o-mini',
    usage: 'Chat básico com 50 mensagens/dia'
  },
  {
    plan: 'LITE', 
    model: 'claude-4-sonnet',
    usage: 'Análise de código com 20 mensagens/dia'
  },
  {
    plan: 'PRO',
    model: 'o3',
    usage: 'Resolução de problemas complexos, 10 mensagens/dia'
  }
]

for (const scenario of scenarios) {
  const model = getModelById(scenario.model)
  if (model) {
    const dailyCredits = calculateCreditsForTokens(scenario.model, 150, 300) * (
      scenario.plan === 'FREE' ? 50 : 
      scenario.plan === 'LITE' ? 20 : 10
    )
    
    console.log(`  • ${scenario.plan} - ${model.name}:`)
    console.log(`    - Uso: ${scenario.usage}`)
    console.log(`    - Créditos/dia: ${dailyCredits}`)
    console.log(`    - Créditos/mês: ${dailyCredits * 30}`)
  }
}

console.log('\n✅ Teste do sistema de créditos concluído!')
console.log('\n📈 Estatísticas:')
console.log(`  • Total de modelos configurados: ${INNERAI_MODELS.length}`)
console.log(`  • Modelos disponíveis: ${INNERAI_MODELS.filter(m => m.isAvailable).length}`)
console.log(`  • Modelos FREE (sem créditos): ${INNERAI_MODELS.filter(m => m.planRequired === 'FREE').length}`)
console.log(`  • Modelos que consomem créditos: ${INNERAI_MODELS.filter(m => m.planRequired !== 'FREE').length}`)