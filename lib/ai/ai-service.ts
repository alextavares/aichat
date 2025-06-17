import { OpenAIProvider } from './openai-provider'
import { AIProvider, AIMessage, AIResponse, AIModel } from './types'

class AIService {
  private providers: Map<string, AIProvider> = new Map()

  constructor() {
    // Initialize providers
    this.providers.set('openai', new OpenAIProvider())
  }

  getProvider(providerName: string): AIProvider {
    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`)
    }
    return provider
  }

  async generateResponse(
    messages: AIMessage[],
    model: string,
    options?: {
      maxTokens?: number
      temperature?: number
      stream?: boolean
    }
  ): Promise<AIResponse> {
    // Determine provider based on model
    const provider = this.getProviderForModel(model)
    return provider.generateResponse(messages, model, options)
  }

  async streamResponse(
    messages: AIMessage[],
    model: string,
    options?: {
      maxTokens?: number
      temperature?: number
    }
  ): AsyncGenerator<string> {
    const provider = this.getProviderForModel(model)
    if (!provider.streamResponse) {
      throw new Error(`Streaming not supported for model ${model}`)
    }
    return provider.streamResponse(messages, model, options)
  }

  estimateTokens(text: string, model: string): number {
    const provider = this.getProviderForModel(model)
    return provider.estimateTokens(text, model)
  }

  getAllAvailableModels(): AIModel[] {
    const models: AIModel[] = []
    for (const provider of this.providers.values()) {
      models.push(...provider.getAvailableModels())
    }
    return models
  }

  getModelsForPlan(planType: 'FREE' | 'PRO' | 'ENTERPRISE'): AIModel[] {
    const allModels = this.getAllAvailableModels()
    
    switch (planType) {
      case 'FREE':
        return allModels.filter(model => model.id === 'gpt-3.5-turbo')
      case 'PRO':
        return allModels.filter(model => 
          ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'].includes(model.id)
        )
      case 'ENTERPRISE':
        return allModels
      default:
        return []
    }
  }

  private getProviderForModel(model: string): AIProvider {
    // Map models to providers
    const openaiModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    
    if (openaiModels.includes(model)) {
      return this.getProvider('openai')
    }
    
    throw new Error(`No provider found for model: ${model}`)
  }
}

export const aiService = new AIService()