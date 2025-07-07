import { z } from 'zod'

export interface AIModel {
  id: string
  name: string
  provider: string
  category: 'fast' | 'advanced' | 'specialized'
  description: string
  inputCostPerToken: number
  outputCostPerToken: number
  contextWindow: number
  features: string[]
  isAvailable: boolean
  requiresAuth: boolean
  supportedFeatures: {
    text: boolean
    vision: boolean
    audio: boolean
    codeGeneration: boolean
    reasoning: boolean
  }
}

export const AI_MODELS: AIModel[] = [
  // Fast Models (Free Plan)
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'fast',
    description: 'Modelo rápido e eficiente para tarefas básicas',
    inputCostPerToken: 0.0000003,
    outputCostPerToken: 0.0000012,
    contextWindow: 128000,
    features: ['Chat', 'Análise', 'Escrita'],
    isAvailable: true,
    requiresAuth: false,
    supportedFeatures: {
      text: true,
      vision: true,
      audio: false,
      codeGeneration: true,
      reasoning: false
    }
  },
  {
    id: 'deepseek-3.1',
    name: 'DeepSeek 3.1',
    provider: 'DeepSeek',
    category: 'fast',
    description: 'Modelo open-source otimizado para código',
    inputCostPerToken: 0.0000002,
    outputCostPerToken: 0.0000008,
    contextWindow: 64000,
    features: ['Programação', 'Análise', 'Chat'],
    isAvailable: true,
    requiresAuth: false,
    supportedFeatures: {
      text: true,
      vision: false,
      audio: false,
      codeGeneration: true,
      reasoning: true
    }
  },
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    category: 'fast',
    description: 'Modelo rápido da Anthropic com boa qualidade',
    inputCostPerToken: 0.0000008,
    outputCostPerToken: 0.000004,
    contextWindow: 200000,
    features: ['Chat', 'Análise', 'Escrita'],
    isAvailable: true,
    requiresAuth: false,
    supportedFeatures: {
      text: true,
      vision: true,
      audio: false,
      codeGeneration: true,
      reasoning: false
    }
  },

  // Advanced Models (Pro Plan)
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'advanced',
    description: 'Modelo mais avançado da OpenAI com multimodalidade',
    inputCostPerToken: 0.000015,
    outputCostPerToken: 0.00006,
    contextWindow: 128000,
    features: ['Chat avançado', 'Visão', 'Áudio', 'Código'],
    isAvailable: true,
    requiresAuth: true,
    supportedFeatures: {
      text: true,
      vision: true,
      audio: true,
      codeGeneration: true,
      reasoning: true
    }
  },
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    category: 'advanced',
    description: 'Modelo de nova geração da Anthropic',
    inputCostPerToken: 0.000015,
    outputCostPerToken: 0.000075,
    contextWindow: 200000,
    features: ['Raciocínio avançado', 'Análise', 'Código'],
    isAvailable: true,
    requiresAuth: true,
    supportedFeatures: {
      text: true,
      vision: true,
      audio: false,
      codeGeneration: true,
      reasoning: true
    }
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'advanced',
    description: 'Modelo avançado do Google com foco em raciocínio',
    inputCostPerToken: 0.00001,
    outputCostPerToken: 0.00004,
    contextWindow: 1000000,
    features: ['Contexto extenso', 'Multimodalidade', 'Código'],
    isAvailable: true,
    requiresAuth: true,
    supportedFeatures: {
      text: true,
      vision: true,
      audio: true,
      codeGeneration: true,
      reasoning: true
    }
  },

  // Specialized Models
  {
    id: 'o1-preview',
    name: 'OpenAI o1 Preview',
    provider: 'OpenAI',
    category: 'specialized',
    description: 'Modelo especializado em raciocínio complexo',
    inputCostPerToken: 0.000015,
    outputCostPerToken: 0.00006,
    contextWindow: 128000,
    features: ['Raciocínio', 'Matemática', 'Ciência'],
    isAvailable: true,
    requiresAuth: true,
    supportedFeatures: {
      text: true,
      vision: false,
      audio: false,
      codeGeneration: true,
      reasoning: true
    }
  }
]

export const ModelSelectionSchema = z.object({
  modelId: z.string(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(8192).optional().default(2048),
  systemPrompt: z.string().optional(),
})

export type ModelSelection = z.infer<typeof ModelSelectionSchema>

export class AIModelManager {
  static getAvailableModels(userPlan: 'free' | 'pro' | 'enterprise' = 'free'): AIModel[] {
    if (userPlan === 'free') {
      return AI_MODELS.filter(model => model.category === 'fast')
    }
    if (userPlan === 'pro') {
      return AI_MODELS.filter(model => 
        model.category === 'fast' || model.category === 'advanced'
      )
    }
    return AI_MODELS // Enterprise has access to all models
  }

  static getModelById(id: string): AIModel | undefined {
    return AI_MODELS.find(model => model.id === id)
  }

  static getModelsByProvider(provider: string): AIModel[] {
    return AI_MODELS.filter(model => model.provider === provider)
  }

  static getModelsByFeature(feature: keyof AIModel['supportedFeatures']): AIModel[] {
    return AI_MODELS.filter(model => model.supportedFeatures[feature])
  }

  static calculateTokenCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = this.getModelById(modelId)
    if (!model) return 0
    
    return (inputTokens * model.inputCostPerToken) + (outputTokens * model.outputCostPerToken)
  }

  static getBestModelForTask(
    task: 'chat' | 'code' | 'vision' | 'reasoning' | 'writing',
    userPlan: 'free' | 'pro' | 'enterprise' = 'free'
  ): AIModel | null {
    const availableModels = this.getAvailableModels(userPlan)
    
    switch (task) {
      case 'chat':
        return availableModels.find(m => m.id === 'gpt-4o') || 
               availableModels.find(m => m.id === 'claude-3.5-haiku') ||
               availableModels[0]
      
      case 'code':
        return availableModels.find(m => m.id === 'deepseek-3.1') ||
               availableModels.find(m => m.supportedFeatures.codeGeneration) ||
               null
      
      case 'vision':
        return availableModels.find(m => m.supportedFeatures.vision) || null
      
      case 'reasoning':
        return availableModels.find(m => m.id === 'o1-preview') ||
               availableModels.find(m => m.supportedFeatures.reasoning) ||
               null
      
      case 'writing':
        return availableModels.find(m => m.id === 'claude-4-sonnet') ||
               availableModels.find(m => m.provider === 'Anthropic') ||
               availableModels[0]
      
      default:
        return availableModels[0] || null
    }
  }

  static getModelUsageStats(modelId: string) {
    // This would connect to analytics/usage tracking
    return {
      totalUsage: 0,
      averageResponseTime: 0,
      successRate: 0,
      avgTokensPerRequest: 0
    }
  }
}

// Export types and schemas
export type { AIModel, ModelSelection }
export { ModelSelectionSchema }