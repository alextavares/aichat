import { aiService } from '../lib/ai/ai-service'

// Simular a função getAvailableModels do chat page
const MODEL_CATEGORIES = {
  ADVANCED: {
    name: 'Modelos Avançados',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', tier: 'PRO' },
      { id: 'gpt-4o', name: 'GPT-4o', tier: 'PRO' },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', tier: 'PRO' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'PRO' },
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', tier: 'PRO' },
      { id: 'perplexity-sonar', name: 'Perplexity Sonar', tier: 'PRO' },
      { id: 'sabia-3.1', name: 'Sabiá 3.1', tier: 'FREE' },
      { id: 'mistral-large-2', name: 'Mistral Large 2', tier: 'PRO' },
      { id: 'grok-3', name: 'Grok 3', tier: 'PRO' },
      { id: 'amazon-nova-premier', name: 'Amazon Nova Premier', tier: 'PRO' },
    ]
  },
  REASONING: {
    name: 'Raciocínio Profundo',
    models: [
      { id: 'o3', name: 'o3', tier: 'PRO' },
      { id: 'o4-mini', name: 'o4 Mini', tier: 'PRO' },
      { id: 'qwen-qwq', name: 'Qwen QwQ', tier: 'FREE' },
      { id: 'claude-4-sonnet-thinking', name: 'Claude 4 Sonnet Thinking', tier: 'PRO' },
      { id: 'deepseek-r1-small', name: 'Deepseek R1 Small', tier: 'FREE' },
      { id: 'deepseek-r1', name: 'Deepseek R1', tier: 'PRO' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', tier: 'PRO' },
    ]
  }
}

function getAvailableModels(planType: string) {
  const tierMap: Record<string, string[]> = {
    FREE: ['FREE'],
    PRO: ['FREE', 'PRO'],
    ENTERPRISE: ['FREE', 'PRO', 'ENTERPRISE']
  }
  
  const allowedTiers = tierMap[planType] || ['FREE']
  const availableModels: Array<{id: string, name: string, category: string}> = []
  
  Object.entries(MODEL_CATEGORIES).forEach(([key, category]) => {
    category.models.forEach(model => {
      if (allowedTiers.includes(model.tier)) {
        availableModels.push({
          id: model.id,
          name: model.name,
          category: category.name
        })
      }
    })
  })
  
  return availableModels
}

console.log('🎨 Simulando interface de chat...\n')

// Testar com plano PRO
console.log('💎 Modelos disponíveis para usuário PRO:')
console.log('=====================================\n')

const proModels = getAvailableModels('PRO')
const categorizedModels = {}

proModels.forEach(model => {
  if (!categorizedModels[model.category]) {
    categorizedModels[model.category] = []
  }
  categorizedModels[model.category].push(model)
})

Object.entries(categorizedModels).forEach(([category, models]) => {
  console.log(`📂 ${category}:`)
  models.forEach(model => {
    console.log(`   - ${model.name} (${model.id})`)
  })
  console.log()
})

// Verificar integração com backend
console.log('🔌 Verificando integração com AI Service:')
const backendModels = aiService.getModelsForPlan('PRO')
const uiModelIds = proModels.map(m => m.id)

let allMatch = true
uiModelIds.forEach(modelId => {
  const existsInBackend = backendModels.some(m => m.id === modelId)
  if (!existsInBackend) {
    console.log(`❌ ${modelId} não encontrado no backend`)
    allMatch = false
  }
})

if (allMatch) {
  console.log('✅ Todos os modelos da UI estão disponíveis no backend!')
} else {
  console.log('⚠️  Alguns modelos da UI não estão configurados no backend')
}

console.log('\n✨ Para usar os modelos, você precisa:')
console.log('1. Configurar OPENROUTER_API_KEY no arquivo .env')
console.log('2. Fazer login em http://localhost:3000/auth/signin')
console.log('   Email: test@example.com')
console.log('   Senha: test123')
console.log('3. Acessar http://localhost:3000/dashboard/chat')