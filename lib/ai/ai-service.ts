import { OpenAIProvider } from './openai-provider'
import { OpenRouterProvider } from './openrouter-provider'
import { AIProvider, AIMessage, AIResponse, AIModel } from './types'

class AIService {
  private providers: Map<string, AIProvider> = new Map()

  constructor() {
    // Initialize providers
    this.providers.set('openai', new OpenAIProvider())
    this.providers.set('openrouter', new OpenRouterProvider())
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
  ): Promise<AsyncGenerator<string>> {
    const provider = this.getProviderForModel(model)
    if (!provider.streamResponse) {
      throw new Error(`Streaming not supported for model ${model}`)
    }
    return provider.streamResponse(messages, model, options)
  }

  async streamResponseWithCallbacks(
    messages: AIMessage[],
    model: string,
    options: {
      maxTokens?: number
      temperature?: number
      onToken?: (token: string) => void
      onComplete?: (response: { tokensUsed: { input: number; output: number; total: number }; cost: number }) => void
      onError?: (error: Error) => void
    }
  ): Promise<void> {
    try {
      const generator = await this.streamResponse(messages, model, options)
      let fullContent = ''
      
      for await (const token of generator) {
        fullContent += token
        if (options.onToken) {
          options.onToken(token)
        }
      }
      
      // Calculate tokens and cost
      const tokensUsed = {
        input: this.estimateTokens(messages.map(m => m.content).join(' '), model),
        output: this.estimateTokens(fullContent, model),
        total: 0
      }
      tokensUsed.total = tokensUsed.input + tokensUsed.output
      
      const modelInfo = this.getAllAvailableModels().find(m => m.id === model)
      const cost = modelInfo ? 
        (tokensUsed.input * modelInfo.costPerInputToken + 
         tokensUsed.output * modelInfo.costPerOutputToken) : 0
      
      if (options.onComplete) {
        options.onComplete({ tokensUsed, cost })
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error)
      } else {
        throw error
      }
    }
  }

  estimateTokens(text: string, model: string): number {
    const provider = this.getProviderForModel(model)
    return provider.estimateTokens(text, model)
  }

  getAllAvailableModels(): AIModel[] {
    const models: AIModel[] = []
    Array.from(this.providers.values()).forEach(provider => {
      models.push(...provider.getAvailableModels())
    })
    return models
  }

  getModelsForPlan(planType: 'FREE' | 'PRO' | 'ENTERPRISE'): AIModel[] {
    const allModels = this.getAllAvailableModels()
    
    switch (planType) {
      case 'FREE':
        return allModels.filter(model => 
          ['gpt-3.5-turbo', 'claude-3-haiku', 'mistral-7b', 'llama-2-13b', 'deepseek-r1'].includes(model.id)
        )
      case 'PRO':
        return allModels.filter(model => 
          ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'gemini-pro', 
           'mixtral-8x7b', 'llama-2-70b', 'phind-codellama-34b', 'deepseek-coder', 'deepseek-r1'].includes(model.id)
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
    const openRouterModels = [
      'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1', 'claude-2',
      'gemini-pro', 'gemini-pro-vision', 'palm-2',
      'llama-2-70b', 'llama-2-13b', 'codellama-70b',
      'mixtral-8x7b', 'mistral-7b',
      'nous-hermes-2', 'openhermes-2.5', 'zephyr-7b',
      'phind-codellama-34b', 'deepseek-coder', 'deepseek-r1', 'wizardcoder-33b',
      'mythomist-7b', 'cinematika-7b', 'neural-chat-7b'
    ]
    
    // Primeiro tentar OpenRouter se configurado
    if (openRouterModels.includes(model)) {
      const provider = this.getProvider('openrouter')
      if (provider.isConfigured()) {
        return provider
      }
    }
    
    // Fallback para OpenAI se disponível
    if (openaiModels.includes(model)) {
      const openaiProvider = this.getProvider('openai')
      if (openaiProvider.isConfigured()) {
        return openaiProvider
      }
    }
    
    // Se OpenRouter está configurado, usar como fallback para modelos OpenAI
    const openRouterProvider = this.getProvider('openrouter')
    if (openRouterProvider.isConfigured() && openaiModels.includes(model)) {
      return openRouterProvider
    }
    
    throw new Error(`No configured provider found for model: ${model}`)
  }

}

export const aiService = new AIService()