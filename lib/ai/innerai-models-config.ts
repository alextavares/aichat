// Configuração EXATA dos modelos do InnerAI original
// Baseado na análise do site app.innerai.com - Janeiro 2025
// ATENÇÃO: Esta lista deve ser EXATAMENTE igual à do InnerAI original

export interface AIModel {
  id: string
  name: string
  provider: string
  category: 'fast' | 'advanced' | 'reasoning'
  description: string
  contextWindow: number
  costPer1kTokens: {
    input: number
    output: number
  }
  // Configuração de créditos para o sistema interno
  creditsPerToken: {
    input: number  // Créditos por token de entrada
    output: number // Créditos por token de saída
  }
  features: string[]
  planRequired: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'
  isAvailable: boolean
  openRouterModel: string
  performance: {
    speed: 'fast' | 'medium' | 'slow'
    quality: 'good' | 'excellent' | 'superior'
  }
}

export const INNERAI_MODELS: AIModel[] = [
  // ===== MODELOS RÁPIDOS (Fast Models) =====
  // Exatamente como no InnerAI original
  
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    category: 'fast',
    description: 'Modelo Llama mais recente para respostas rápidas',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.0002, output: 0.0002 },
    creditsPerToken: { input: 0.001, output: 0.001 }, // Modelo rápido - baixo custo
    features: ['Chat', 'Fast Response', 'Open Source'],
    planRequired: 'FREE',
    isAvailable: false, // Aguardando disponibilidade no OpenRouter
    openRouterModel: 'meta-llama/llama-3.2-3b-instruct', // Fallback temporário
    performance: { speed: 'fast', quality: 'good' },
  },
  
  {
    id: 'deepseek-3.1',
    name: 'Deepseek 3.1',
    provider: 'DeepSeek',
    category: 'fast',
    description: 'Última versão do modelo DeepSeek',
    contextWindow: 64000,
    costPer1kTokens: { input: 0.00014, output: 0.00028 },
    creditsPerToken: { input: 0.001, output: 0.002 }, // Modelo rápido
    features: ['Chat', 'Code', 'Math', 'Reasoning'],
    planRequired: 'FREE',
    isAvailable: false, // Aguardando disponibilidade no OpenRouter
    openRouterModel: 'deepseek/deepseek-chat', // Fallback temporário
    performance: { speed: 'fast', quality: 'excellent' },
  },
  
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'fast',
    description: 'Modelo rápido e eficiente da OpenAI',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
    creditsPerToken: { input: 0.002, output: 0.004 }, // Modelo rápido
    features: ['Chat', 'Completions', 'Function Calling', 'Vision'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'openai/gpt-4o-mini',
    performance: { speed: 'fast', quality: 'good' },
  },
  
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    category: 'fast',
    description: 'Modelo rápido da Anthropic com excelente qualidade',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
    creditsPerToken: { input: 0.003, output: 0.008 }, // Modelo rápido
    features: ['Chat', 'Fast Response', 'Code', 'Analysis'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'anthropic/claude-3-5-haiku-20241022',
    performance: { speed: 'fast', quality: 'excellent' },
  },
  
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    category: 'fast',
    description: 'Nova versão rápida do Gemini com melhor performance',
    contextWindow: 1000000,
    costPer1kTokens: { input: 0.0000375, output: 0.00015 },
    creditsPerToken: { input: 0.001, output: 0.002 }, // Modelo rápido - muito eficiente
    features: ['Chat', 'Multimodal', 'Code', 'Fast Response'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'google/gemini-2.0-flash-exp', // Última versão disponível
    performance: { speed: 'fast', quality: 'good' },
  },
  
  {
    id: 'google-gaia',
    name: 'Google Gaia',
    provider: 'Google',
    category: 'fast',
    description: 'Novo modelo especializado do Google',
    contextWindow: 32768,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    creditsPerToken: { input: 0.005, output: 0.012 }, // Modelo rápido
    features: ['Chat', 'Specialized Tasks', 'Fast Response'],
    planRequired: 'FREE',
    isAvailable: false, // Aguardando disponibilidade no OpenRouter
    openRouterModel: 'google/gemini-pro', // Fallback temporário
    performance: { speed: 'fast', quality: 'good' },
  },

  // ===== MODELOS AVANÇADOS (Advanced Models) =====
  // Exatamente como no InnerAI original
  
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    category: 'advanced',
    description: 'Nova versão aprimorada do GPT-4',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    creditsPerToken: { input: 0.08, output: 0.20 }, // Modelo avançado - custo médio
    features: ['Chat', 'Advanced Reasoning', 'Vision', 'Function Calling'],
    planRequired: 'LITE',
    isAvailable: false, // Aguardando disponibilidade no OpenRouter
    openRouterModel: 'openai/gpt-4-turbo', // Fallback temporário
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'advanced',
    description: 'Modelo mais capaz da OpenAI para tarefas complexas',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.0025, output: 0.01 },
    creditsPerToken: { input: 0.02, output: 0.08 }, // Modelo avançado
    features: ['Chat', 'Vision', 'Function Calling', 'Advanced Reasoning'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'openai/gpt-4o',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    category: 'advanced',
    description: 'Nova geração do Claude com capacidades aprimoradas',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    creditsPerToken: { input: 0.025, output: 0.10 }, // Modelo avançado
    features: ['Chat', 'Analysis', 'Code', 'Long Context', 'Vision'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'anthropic/claude-3-5-sonnet-20241022', // Última versão disponível
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'advanced',
    description: 'Versão avançada do Gemini com capacidades superiores',
    contextWindow: 2097152,
    costPer1kTokens: { input: 0.00125, output: 0.005 },
    creditsPerToken: { input: 0.01, output: 0.04 }, // Modelo avançado - eficiente
    features: ['Chat', 'Multimodal', 'Code', 'Long Context', 'Advanced Analysis'],
    planRequired: 'LITE',
    isAvailable: false, // Aguardando disponibilidade no OpenRouter
    openRouterModel: 'google/gemini-pro-1.5', // Fallback temporário
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    category: 'advanced',
    description: 'Versão avançada do Llama 4 para tarefas complexas',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.000005, output: 0.000015 },
    creditsPerToken: { input: 0.0001, output: 0.0002 }, // Modelo avançado - open source barato
    features: ['Chat', 'Advanced Reasoning', 'Code', 'Open Source'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'meta-llama/llama-3.1-405b-instruct', // Melhor disponível
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    provider: 'Perplexity',
    category: 'advanced',
    description: 'Modelo especializado em pesquisa web com citações',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.001, output: 0.001 },
    creditsPerToken: { input: 0.008, output: 0.008 }, // Modelo avançado com pesquisa web
    features: ['Web Search', 'Real-time Info', 'Citations', 'Research'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'perplexity/llama-3.1-sonar-large-128k-online',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'sabia-3.1',
    name: 'Sabiá 3.1',
    provider: 'Maritalk',
    category: 'advanced',
    description: 'Modelo brasileiro especializado em português',
    contextWindow: 32768,
    costPer1kTokens: { input: 0.001, output: 0.003 },
    creditsPerToken: { input: 0.008, output: 0.024 }, // Modelo avançado brasileiro
    features: ['Chat', 'Portuguese Native', 'Brazilian Context'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'maritalk/sabia-3', // Verificar disponibilidade
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    category: 'advanced',
    description: 'Segunda geração do Mistral Large',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.002, output: 0.006 },
    creditsPerToken: { input: 0.016, output: 0.048 }, // Modelo avançado europeu
    features: ['Chat', 'Multilingual', 'Code', 'Function Calling'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'mistralai/mistral-large',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    category: 'advanced',
    description: 'Terceira geração do Grok com melhor performance',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.002, output: 0.01 },
    creditsPerToken: { input: 0.016, output: 0.08 }, // Modelo avançado xAI
    features: ['Chat', 'Real-time Info', 'Vision', 'Uncensored'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'x-ai/grok-beta',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'amazon-nova-premier',
    name: 'Amazon Nova Premier',
    provider: 'Amazon',
    category: 'advanced',
    description: 'Modelo premium da Amazon para empresas',
    contextWindow: 300000,
    costPer1kTokens: { input: 0.008, output: 0.032 },
    creditsPerToken: { input: 0.064, output: 0.256 }, // Modelo avançado enterprise
    features: ['Chat', 'Enterprise Features', 'Long Context'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'amazon/nova-pro-v1',
    performance: { speed: 'medium', quality: 'excellent' },
  },

  // ===== RACIOCÍNIO PROFUNDO (Deep Reasoning) =====
  // Exatamente como no InnerAI original
  
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    category: 'reasoning',
    description: 'Quarta geração do Grok com raciocínio avançado',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    creditsPerToken: { input: 0.1, output: 0.3 }, // Modelo de raciocínio premium
    features: ['Advanced Reasoning', 'Problem Solving', 'Real-time Info'],
    planRequired: 'PRO',
    isAvailable: false, // Aguardando disponibilidade no OpenRouter
    openRouterModel: 'x-ai/grok-beta', // Fallback temporário
    performance: { speed: 'slow', quality: 'superior' },
  },
  
  {
    id: 'o3',
    name: 'o3',
    provider: 'OpenAI',
    category: 'reasoning',
    description: 'Modelo de raciocínio de terceira geração da OpenAI',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.015, output: 0.06 },
    creditsPerToken: { input: 0.15, output: 0.60 }, // Modelo de raciocínio premium
    features: ['Advanced Reasoning', 'Problem Solving', 'Math', 'Science'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'openai/o1-preview', // Melhor disponível
    performance: { speed: 'slow', quality: 'superior' },
  },
  
  {
    id: 'o4-mini',
    name: 'o4 Mini',
    provider: 'OpenAI',
    category: 'reasoning',
    description: 'Versão compacta do modelo de raciocínio o4',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.003, output: 0.012 },
    creditsPerToken: { input: 0.03, output: 0.12 }, // Modelo de raciocínio compacto
    features: ['Reasoning', 'Problem Solving', 'Fast Inference'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'openai/o1-mini',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'qwen-qwq',
    name: 'Qwen QwQ',
    provider: 'Alibaba',
    category: 'reasoning',
    description: 'Modelo de raciocínio especializado em questões complexas',
    contextWindow: 32768,
    costPer1kTokens: { input: 0.0009, output: 0.0009 },
    creditsPerToken: { input: 0.009, output: 0.009 }, // Modelo de raciocínio eficiente
    features: ['Reasoning', 'Q&A', 'Problem Solving'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'qwen/qwq-32b-preview',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'claude-4-sonnet-thinking',
    name: 'Claude 4 Sonnet Thinking',
    provider: 'Anthropic',
    category: 'reasoning',
    description: 'Claude 4 com capacidades avançadas de raciocínio',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    creditsPerToken: { input: 0.03, output: 0.15 }, // Modelo de raciocínio anthropic
    features: ['Advanced Reasoning', 'Analysis', 'Problem Solving', 'Long Context'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'anthropic/claude-3-5-sonnet-20241022', // Melhor disponível
    performance: { speed: 'slow', quality: 'superior' },
  },
  
  {
    id: 'deepseek-r1-small',
    name: 'Deepseek R1 Small',
    provider: 'DeepSeek',
    category: 'reasoning',
    description: 'Versão compacta do modelo de raciocínio DeepSeek R1',
    contextWindow: 64000,
    costPer1kTokens: { input: 0.00055, output: 0.0022 },
    creditsPerToken: { input: 0.006, output: 0.022 }, // Modelo de raciocínio compacto
    features: ['Reasoning', 'Problem Solving', 'Fast Inference'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'deepseek/deepseek-r1',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'deepseek-r1',
    name: 'Deepseek R1',
    provider: 'DeepSeek',
    category: 'reasoning',
    description: 'Modelo de raciocínio avançado da DeepSeek',
    contextWindow: 64000,
    costPer1kTokens: { input: 0.00055, output: 0.0022 },
    creditsPerToken: { input: 0.006, output: 0.022 }, // Modelo de raciocínio avançado
    features: ['Advanced Reasoning', 'Problem Solving', 'Math', 'Science'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'deepseek/deepseek-r1',
    performance: { speed: 'slow', quality: 'superior' },
  },
]

// Configurações de planos - EXATAMENTE como no InnerAI
export const PLAN_LIMITS = {
  FREE: {
    fastModels: 'unlimited', // Modelos Rápidos: ilimitadas
    advancedModels: 0, // Modelos Avançados: não disponível
    reasoningModels: 0, // Raciocínio Profundo: não disponível
  },
  LITE: {
    fastModels: 'unlimited', // Modelos Rápidos: ilimitadas
    advancedModels: 'unlimited', // Modelos Avançados: ilimitadas
    reasoningModels: 0, // Raciocínio Profundo: não disponível
  },
  PRO: {
    fastModels: 'unlimited', // Modelos Rápidos: ilimitadas
    advancedModels: 'unlimited', // Modelos Avançados: ilimitadas
    reasoningModels: 'unlimited', // Raciocínio Profundo: ilimitadas
  },
  ENTERPRISE: {
    fastModels: 'unlimited',
    advancedModels: 'unlimited',
    reasoningModels: 'unlimited',
  },
}

// Categorias para filtros - EXATAMENTE como no InnerAI
export const MODEL_CATEGORIES = {
  fast: 'Modelos Rápidos',
  advanced: 'Modelos Avançados',
  reasoning: 'Raciocínio Profundo',
}

// Função para obter modelos por categoria
export function getModelsByCategory(category: 'fast' | 'advanced' | 'reasoning') {
  return INNERAI_MODELS.filter(model => model.category === category && model.isAvailable)
}

// Função para obter modelos por plano - EXATAMENTE como no InnerAI
export function getModelsForPlan(planType: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE') {
  const availableModels = INNERAI_MODELS.filter(model => model.isAvailable)
  
  switch (planType) {
    case 'FREE':
      // Apenas modelos rápidos
      return availableModels.filter(model => model.category === 'fast')
    
    case 'LITE':
      // Modelos rápidos + avançados
      return availableModels.filter(model => 
        model.category === 'fast' || model.category === 'advanced'
      )
    
    case 'PRO':
      // Todos os modelos
      return availableModels
    
    case 'ENTERPRISE':
      // Todos os modelos
      return availableModels
    
    default:
      return []
  }
}

// Função para obter modelo por ID
export function getModelById(id: string) {
  return INNERAI_MODELS.find(model => model.id === id)
}

// Função para calcular créditos necessários baseado nos tokens
export function calculateCreditsForTokens(
  modelId: string, 
  inputTokens: number, 
  outputTokens: number
): number {
  const model = getModelById(modelId)
  if (!model) {
    return 0
  }
  
  const inputCredits = inputTokens * model.creditsPerToken.input
  const outputCredits = outputTokens * model.creditsPerToken.output
  
  return Math.ceil(inputCredits + outputCredits) // Arredondar para cima
}

// Função para verificar se um modelo consome créditos (não FREE)
export function modelRequiresCredits(modelId: string): boolean {
  const model = getModelById(modelId)
  if (!model) return false
  
  // Modelos FREE não consomem créditos do usuário
  return model.planRequired !== 'FREE'
}

// Providers disponíveis
export const PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Meta',
  'xAI',
  'Perplexity',
  'Mistral AI',
  'DeepSeek',
  'Alibaba',
  'Maritalk',
  'Amazon',
]