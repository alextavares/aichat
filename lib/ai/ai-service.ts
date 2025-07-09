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
    const models: AIModel[] = []
    Array.from(this.providers.values()).forEach(provider => {
      models.push(...provider.getAvailableModels())
    })
    return models
  }

  getModelsForPlan(planType: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'): AIModel[] {
    const allModels = this.getAllAvailableModels()
    
    switch (planType) {
      case 'FREE':
        return allModels.filter(model => 
          ['gpt-4o-mini', 'claude-3.5-haiku', 
           'gemini-2-flash-free', 'mistral-7b', 'deepseek-r1-small', 'qwen-qwq'].includes(model.id)
        )
      case 'LITE':
        return allModels.filter(model => 
          ['gpt-4o-mini', 'claude-3.5-haiku', 'gemini-2-flash-free', 'mistral-7b', 'llama-2-13b', 'llama-3.3-70b', 
           'deepseek-r1', 'deepseek-r1-small', 'grok-3-mini', 'perplexity-sonar', 'qwen-qwq', 'sabia-3.1',
           'gpt-4o', 'gpt-3.5-turbo', 'claude-3.5-sonnet', 'claude-4-sonnet', 'gemini-2-pro', 'grok-3',
           'perplexity-sonar-pro', 'perplexity-reasoning', 'mistral-large-2'].includes(model.id)
        )
      case 'PRO':
        return allModels.filter(model => 
          ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1',
           'claude-3-sonnet', 'claude-3.5-sonnet', 'claude-4-sonnet', 'claude-4-sonnet-thinking', 
           'claude-3-haiku', 'claude-3.5-haiku',
           'gemini-pro', 'gemini-2-flash', 'gemini-2-pro', 'gemini-2.5-pro',
           'mixtral-8x7b', 'mistral-7b', 'mistral-large-2',
           'llama-2-70b', 'llama-3.3-70b', 'llama-3.1-405b', 'llama-4-maverick',
           'phind-codellama-34b', 'deepseek-coder', 'deepseek-r1', 'deepseek-r1-small', 'qwen-2.5-coder',
           'grok-3', 'grok-3-mini', 'grok-2-vision',
           'perplexity-sonar-pro', 'perplexity-sonar', 'perplexity-reasoning',
           'qwen-qwq', 'qwen-2.5-72b', 'sabia-3.1', 'amazon-nova-premier',
           'o3', 'o4-mini'].includes(model.id)
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
      'claude-3-opus', 'claude-3-sonnet', 'claude-3.5-sonnet', 'claude-4-sonnet', 'claude-4-sonnet-thinking',
      'claude-3-haiku', 'claude-3.5-haiku', 'claude-2.1', 'claude-2',
      'gemini-pro', 'gemini-pro-vision', 'gemini-2-flash', 'gemini-2-pro', 'gemini-2.5-pro', 'gemini-2-flash-free', 'palm-2',
      'llama-2-70b', 'llama-2-13b', 'llama-3.3-70b', 'llama-3.1-405b', 'llama-4-maverick', 'codellama-70b',
      'mixtral-8x7b', 'mistral-7b', 'mistral-large-2',
      'nous-hermes-2', 'openhermes-2.5', 'zephyr-7b',
      'phind-codellama-34b', 'deepseek-coder', 'deepseek-r1', 'deepseek-r1-small', 'wizardcoder-33b',
      'mythomist-7b', 'cinematika-7b', 'neural-chat-7b',
      'gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3', 'o4-mini',
      'grok-3', 'grok-3-mini', 'grok-2-vision',
      'perplexity-sonar-pro', 'perplexity-sonar', 'perplexity-reasoning',
      'qwen-qwq', 'qwen-2.5-72b', 'qwen-2.5-coder',
      'sabia-3.1', 'amazon-nova-premier'
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