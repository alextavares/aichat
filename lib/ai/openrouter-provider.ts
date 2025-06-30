import { AIProvider, AIMessage, AIResponse, AIModel } from './types'

export class OpenRouterProvider implements AIProvider {
  public readonly id = 'openrouter'
  private apiKey: string
  private baseURL = 'https://openrouter.ai/api/v1'

  constructor(apiKey: string = process.env.OPENROUTER_API_KEY || '') {
    this.apiKey = apiKey
    if (!this.apiKey) {
      console.warn('OpenRouter API key not configured')
    }
  }

  // Mapa de modelos com nomes amigáveis para o usuário
  private modelMap: Record<string, string> = {
    // Modelos OpenAI via OpenRouter
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
    'gpt-4': 'openai/gpt-4',
    'gpt-4-turbo': 'openai/gpt-4-turbo-preview',
    
    // Modelos Anthropic
    'claude-3-opus': 'anthropic/claude-3-opus',
    'claude-3-sonnet': 'anthropic/claude-3-sonnet-20240229',
    'claude-3-haiku': 'anthropic/claude-3-haiku-20240307',
    'claude-2.1': 'anthropic/claude-2.1',
    'claude-2': 'anthropic/claude-2',
    
    // Modelos Google
    'gemini-pro': 'google/gemini-pro',
    'gemini-pro-vision': 'google/gemini-pro-vision',
    'palm-2': 'google/palm-2-chat-bison',
    
    // Modelos Meta
    'llama-2-70b': 'meta-llama/llama-2-70b-chat',
    'llama-2-13b': 'meta-llama/llama-2-13b-chat',
    'codellama-70b': 'meta-llama/codellama-70b-instruct',
    
    // Modelos Mistral
    'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
    'mistral-7b': 'mistralai/mistral-7b-instruct',
    
    // Modelos Open Source
    'nous-hermes-2': 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    'openhermes-2.5': 'teknium/openhermes-2.5-mistral-7b',
    'zephyr-7b': 'huggingfaceh4/zephyr-7b-beta',
    
    // Modelos para Código
    'phind-codellama-34b': 'phind/phind-codellama-34b-v2',
    'deepseek-coder': 'deepseek/deepseek-coder-33b-instruct',
    'deepseek-r1': 'deepseek/deepseek-r1-0528:free',
    'wizardcoder-33b': 'wizardlm/wizardcoder-33b-v1.1',
    
    // Modelos Criativos
    'mythomist-7b': 'gryphe/mythomist-7b',
    'cinematika-7b': 'jondurbin/cinematika-7b-v0.1',
    
    // Modelos Rápidos
    'neural-chat-7b': 'intel/neural-chat-7b-v3-3',
  }

  // Informações sobre os modelos para exibição
  getModelInfo() {
    return {
      'claude-3-opus': {
        name: 'Claude 3 Opus',
        description: 'Modelo mais poderoso da Anthropic',
        category: 'premium',
        contextWindow: 200000,
        strengths: ['Raciocínio complexo', 'Análise profunda', 'Criatividade']
      },
      'claude-3-sonnet': {
        name: 'Claude 3 Sonnet',
        description: 'Equilíbrio entre performance e custo',
        category: 'balanced',
        contextWindow: 200000,
        strengths: ['Versatilidade', 'Velocidade', 'Precisão']
      },
      'claude-3-haiku': {
        name: 'Claude 3 Haiku',
        description: 'Modelo rápido e eficiente',
        category: 'fast',
        contextWindow: 200000,
        strengths: ['Velocidade', 'Custo-benefício', 'Tarefas simples']
      },
      'gemini-pro': {
        name: 'Gemini Pro',
        description: 'Modelo avançado do Google',
        category: 'premium',
        contextWindow: 32000,
        strengths: ['Multimodal', 'Raciocínio', 'Conhecimento atual']
      },
      'mixtral-8x7b': {
        name: 'Mixtral 8x7B',
        description: 'Modelo MoE poderoso e eficiente',
        category: 'balanced',
        contextWindow: 32000,
        strengths: ['Open source', 'Multilíngue', 'Performance']
      },
      'llama-2-70b': {
        name: 'Llama 2 70B',
        description: 'Modelo open source da Meta',
        category: 'balanced',
        contextWindow: 4096,
        strengths: ['Open source', 'Customizável', 'Boa performance']
      },
      'phind-codellama-34b': {
        name: 'Phind CodeLlama',
        description: 'Especializado em programação',
        category: 'code',
        contextWindow: 16000,
        strengths: ['Código', 'Debug', 'Explicações técnicas']
      },
      'deepseek-coder': {
        name: 'DeepSeek Coder',
        description: 'Modelo focado em código',
        category: 'code',
        contextWindow: 16000,
        strengths: ['Programação', 'Algoritmos', 'Refatoração']
      },
      'deepseek-r1': {
        name: 'DeepSeek R1',
        description: 'Modelo avançado de raciocínio (gratuito)',
        category: 'reasoning',
        contextWindow: 128000,
        strengths: ['Raciocínio complexo', 'Análise profunda', 'Resolução de problemas']
      },
      'mythomist-7b': {
        name: 'Mythomist',
        description: 'Modelo criativo para histórias',
        category: 'creative',
        contextWindow: 8192,
        strengths: ['Criatividade', 'Narrativas', 'Roleplay']
      },
      'nous-hermes-2': {
        name: 'Nous Hermes 2',
        description: 'Modelo versátil e preciso',
        category: 'balanced',
        contextWindow: 8192,
        strengths: ['Instruções', 'Versatilidade', 'Consistência']
      }
    }
  }

  private getOpenRouterModel(model: string): string {
    return this.modelMap[model] || model
  }

  async generateResponse(messages: AIMessage[], model: string): Promise<AIResponse> {
    const openRouterModel = this.getOpenRouterModel(model)
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'InnerAI Clone'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 4096,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'OpenRouter API error')
      }

      const data = await response.json()
      
      // Calcular custos aproximados (OpenRouter fornece isso na resposta)
      const usage = data.usage || {}
      const promptTokens = usage.prompt_tokens || 0
      const completionTokens = usage.completion_tokens || 0
      const totalTokens = promptTokens + completionTokens
      
      // OpenRouter retorna o custo real na resposta
      const cost = data.usage?.total_cost || this.estimateCost(model, promptTokens, completionTokens)

      return {
        content: data.choices[0].message.content,
        tokensUsed: {
          input: promptTokens,
          output: completionTokens,
          total: totalTokens
        },
        cost,
        model: openRouterModel
      }
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw error
    }
  }

  async *streamResponse(
    messages: AIMessage[], 
    model: string,
    options?: {
      maxTokens?: number
      temperature?: number
    }
  ): AsyncGenerator<string> {
    const openRouterModel = this.getOpenRouterModel(model)
    let fullContent = ''
    let tokensUsed = { input: 0, output: 0, total: 0 }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'InnerAI Clone'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 4096,
          stream: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'OpenRouter API error')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const token = parsed.choices[0]?.delta?.content
              if (token) {
                fullContent += token
                yield token
              }

              // OpenRouter envia usage no final
              if (parsed.usage) {
                tokensUsed = {
                  input: parsed.usage.prompt_tokens || 0,
                  output: parsed.usage.completion_tokens || 0,
                  total: parsed.usage.total_tokens || 0
                }
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenRouter streaming error:', error)
      throw error
    }
  }


  private estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Custos aproximados por 1k tokens (você pode ajustar com valores reais)
    const costs: Record<string, { input: number; output: number }> = {
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'claude-2.1': { input: 0.008, output: 0.024 },
      'claude-2': { input: 0.008, output: 0.024 },
      'gemini-pro': { input: 0.00025, output: 0.0005 },
      'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
      'palm-2': { input: 0.0005, output: 0.0005 },
      'llama-2-70b': { input: 0.0007, output: 0.0009 },
      'llama-2-13b': { input: 0.0001, output: 0.0001 },
      'codellama-70b': { input: 0.0007, output: 0.0009 },
      'mixtral-8x7b': { input: 0.00027, output: 0.00027 },
      'mistral-7b': { input: 0.00006, output: 0.00006 },
      'nous-hermes-2': { input: 0.00027, output: 0.00027 },
      'openhermes-2.5': { input: 0.00006, output: 0.00006 },
      'zephyr-7b': { input: 0.00006, output: 0.00006 },
      'phind-codellama-34b': { input: 0.0004, output: 0.0004 },
      'deepseek-coder': { input: 0.0004, output: 0.0004 },
      'deepseek-r1': { input: 0.0, output: 0.0 }, // Modelo gratuito
      'wizardcoder-33b': { input: 0.0004, output: 0.0004 },
      'mythomist-7b': { input: 0.00006, output: 0.00006 },
      'cinematika-7b': { input: 0.00006, output: 0.00006 },
      'neural-chat-7b': { input: 0.00006, output: 0.00006 },
    }

    const modelCosts = costs[model] || { input: 0.001, output: 0.001 }
    
    return (inputTokens / 1000 * modelCosts.input) + (outputTokens / 1000 * modelCosts.output)
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  getAvailableModels(): AIModel[] {
    return [
      // Modelos Anthropic
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000015,
        costPerOutputToken: 0.000075
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000025,
        costPerOutputToken: 0.00000125
      },
      // Modelos Google
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000025,
        costPerOutputToken: 0.0000005
      },
      // Modelos Meta
      {
        id: 'llama-2-70b',
        name: 'Llama 2 70B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000007,
        costPerOutputToken: 0.0000009
      },
      {
        id: 'llama-2-13b',
        name: 'Llama 2 13B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000001,
        costPerOutputToken: 0.0000001
      },
      // Modelos Mistral
      {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000027,
        costPerOutputToken: 0.00000027
      },
      {
        id: 'mistral-7b',
        name: 'Mistral 7B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006
      },
      // Modelos para Código
      {
        id: 'phind-codellama-34b',
        name: 'Phind CodeLlama 34B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000004,
        costPerOutputToken: 0.0000004
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder 33B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000004,
        costPerOutputToken: 0.0000004
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1 (Free)',
        provider: 'openrouter',
        maxTokens: 128000,
        costPerInputToken: 0.0,
        costPerOutputToken: 0.0
      },
      // Modelos Open Source
      {
        id: 'nous-hermes-2',
        name: 'Nous Hermes 2 Mixtral',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000027,
        costPerOutputToken: 0.00000027
      },
      {
        id: 'openhermes-2.5',
        name: 'OpenHermes 2.5',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006
      },
      {
        id: 'zephyr-7b',
        name: 'Zephyr 7B Beta',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006
      },
      // Modelos Criativos
      {
        id: 'mythomist-7b',
        name: 'Mythomist 7B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006
      },
      {
        id: 'cinematika-7b',
        name: 'Cinematika 7B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006
      },
      {
        id: 'neural-chat-7b',
        name: 'Neural Chat 7B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000006
      }
    ]
  }

  estimateTokens(text: string, model: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4)
  }
}