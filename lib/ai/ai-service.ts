import { OpenAIProvider } from './openai-provider'
import { OpenRouterProvider } from './openrouter-provider'
import { AIProvider, AIMessage, AIResponse, AIModel } from './types'
import { INNERAI_MODELS, getModelsForPlan, getModelById } from './innerai-models-config'

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
    console.log(`[AIService] Generating response for model: ${model}`)
    
    try {
      // Primeiro, tentar o provider específico para o modelo
      const provider = this.getProviderForModel(model)
      console.log(`[AIService] Using provider: ${provider.id}`)
      return await provider.generateResponse(messages, model, options)
      
    } catch (error) {
      console.warn(`[AIService] Primary provider failed:`, error)
      
      // Tentar fallback se disponível
      try {
        const fallbackProvider = this.getFallbackProvider(model)
        if (fallbackProvider) {
          console.log(`[AIService] Trying fallback provider: ${fallbackProvider.id}`)
          return await fallbackProvider.generateResponse(messages, model, options)
        }
      } catch (fallbackError) {
        console.error(`[AIService] Fallback provider also failed:`, fallbackError)
      }
      
      // Se tudo falhou, lançar o erro original
      throw error
    }
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
    // Usar a configuração exata do InnerAI
    return INNERAI_MODELS.filter(model => model.isAvailable).map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      contextLength: model.contextWindow,
      costPerInputToken: model.costPer1kTokens.input / 1000,
      costPerOutputToken: model.costPer1kTokens.output / 1000,
      features: model.features,
      category: model.category,
      planRequired: model.planRequired
    }))
  }

  getModelsForPlan(planType: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'): AIModel[] {
    // Usar a função da configuração exata do InnerAI
    return getModelsForPlan(planType).map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      contextLength: model.contextWindow,
      costPerInputToken: model.costPer1kTokens.input / 1000,
      costPerOutputToken: model.costPer1kTokens.output / 1000,
      features: model.features,
      category: model.category,
      planRequired: model.planRequired
    }))
  }

  private getProviderForModel(model: string): AIProvider {
    // Buscar modelo na configuração do InnerAI
    const innerAIModel = getModelById(model)
    
    if (!innerAIModel) {
      throw new Error(`Model ${model} not found in InnerAI configuration`)
    }
    
    if (!innerAIModel.isAvailable) {
      throw new Error(`Model ${model} is not available`)
    }
    
    // Usar OpenRouter para todos os modelos exceto modelos nativos da OpenAI
    const nativeOpenAIModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    
    if (nativeOpenAIModels.includes(model)) {
      // Tentar OpenAI primeiro, fallback para OpenRouter
      const openaiProvider = this.getProvider('openai')
      if (openaiProvider.isConfigured()) {
        return openaiProvider
      }
    }
    
    // Usar OpenRouter para todos os outros modelos (incluindo fallback)
    const openRouterProvider = this.getProvider('openrouter')
    if (openRouterProvider.isConfigured()) {
      return openRouterProvider
    }
    
    throw new Error(`No configured provider found for model: ${model}`)
  }

  private getFallbackProvider(model: string): AIProvider | null {
    // Tentar outros providers disponíveis como fallback
    const allProviders = Array.from(this.providers.values())
    
    for (const provider of allProviders) {
      try {
        if (provider.isConfigured()) {
          // Verificar se o provider tem o modelo ou pode usar um similar
          const availableModels = provider.getAvailableModels()
          const hasModel = availableModels.some(m => m.id === model)
          
          if (hasModel) {
            return provider
          }
        }
      } catch (error) {
        console.warn(`[AIService] Error checking fallback provider ${provider.id}:`, error)
      }
    }
    
    return null
  }

}

export const aiService = new AIService()