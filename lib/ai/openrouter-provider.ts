import { AIProvider, AIMessage, AIResponse, AIModel } from './types'

export class OpenRouterProvider implements AIProvider {
  public readonly id = 'openrouter'
  private apiKey: string
  private baseURL = 'https://openrouter.ai/api/v1'
  private maxRetries = 3
  private retryDelay = 1000 // 1 segundo

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('[OpenRouter] API key not configured')
    }
  }

  // Método para fazer retry com exponential backoff
  private async retryRequest<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[OpenRouter] Attempt ${attempt}/${retries}`)
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.warn(`[OpenRouter] Attempt ${attempt} failed:`, lastError.message)
        
        // Não fazer retry em erros de autenticação ou quota
        if (lastError.message.includes('401') || 
            lastError.message.includes('quota') || 
            lastError.message.includes('billing')) {
          throw lastError
        }
        
        if (attempt < retries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
          console.log(`[OpenRouter] Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError || new Error('All retries failed')
  }

  // Mapa EXATO dos modelos do InnerAI original para OpenRouter
  private modelMap: Record<string, string> = {
    // ===== MODELOS RÁPIDOS (Fast Models) =====
    'llama-4-scout': 'meta-llama/llama-3.2-3b-instruct', // Fallback temporário
    'deepseek-3.1': 'deepseek/deepseek-chat', // Fallback temporário
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'claude-3.5-haiku': 'anthropic/claude-3-5-haiku-20241022',
    'gemini-2.5-flash': 'google/gemini-2.0-flash-exp',
    'google-gaia': 'google/gemini-pro', // Fallback temporário
    
    // ===== MODELOS AVANÇADOS (Advanced Models) =====
    'gpt-4.1': 'openai/gpt-4-turbo', // Fallback temporário
    'gpt-4o': 'openai/gpt-4o',
    'claude-4-sonnet': 'anthropic/claude-3-5-sonnet-20241022',
    'gemini-2.5-pro': 'google/gemini-pro-1.5', // Fallback temporário
    'llama-4-maverick': 'meta-llama/llama-3.1-405b-instruct',
    'perplexity-sonar': 'perplexity/llama-3.1-sonar-large-128k-online',
    'sabia-3.1': 'maritalk/sabia-3',
    'mistral-large-2': 'mistralai/mistral-large',
    'grok-3': 'x-ai/grok-beta',
    'amazon-nova-premier': 'amazon/nova-pro-v1',
    
    // ===== RACIOCÍNIO PROFUNDO (Deep Reasoning) =====
    'grok-4': 'x-ai/grok-beta', // Fallback temporário
    'o3': 'openai/o1-preview',
    'o4-mini': 'openai/o1-mini',
    'qwen-qwq': 'qwen/qwq-32b-preview',
    'claude-4-sonnet-thinking': 'anthropic/claude-3-5-sonnet-20241022',
    'deepseek-r1-small': 'deepseek/deepseek-r1',
    'deepseek-r1': 'deepseek/deepseek-r1',
    
    // Manter alguns modelos legados para compatibilidade
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
    'gpt-4': 'openai/gpt-4',
    'gpt-4-turbo': 'openai/gpt-4-turbo-preview'
  }

  // Informações sobre os modelos para exibição
  getModelInfo() {
    return {
      // Modelos OpenAI
      'gpt-4.1': {
        name: 'GPT-4.1',
        description: 'Modelo mais recente e poderoso da OpenAI',
        category: 'advanced',
        contextWindow: 128000,
        strengths: ['Raciocínio avançado', 'Multimodal', 'Velocidade']
      },
      'o3': {
        name: 'o3',
        description: 'Modelo de raciocínio profundo',
        category: 'reasoning',
        contextWindow: 128000,
        strengths: ['Raciocínio step-by-step', 'Resolução de problemas', 'Matemática']
      },
      'o4-mini': {
        name: 'o4 Mini',
        description: 'Modelo de raciocínio otimizado',
        category: 'reasoning',
        contextWindow: 128000,
        strengths: ['Raciocínio rápido', 'Eficiência', 'Precisão']
      },
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
      },
      // Novos modelos OpenAI
      'gpt-4o': {
        name: 'GPT-4o',
        description: 'Modelo mais recente e poderoso da OpenAI',
        category: 'advanced',
        contextWindow: 128000,
        strengths: ['Raciocínio avançado', 'Multimodal', 'Velocidade']
      },
      'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        description: 'Versão otimizada do GPT-4o',
        category: 'fast',
        contextWindow: 128000,
        strengths: ['Velocidade', 'Eficiência', 'Custo-benefício']
      },
      // Claude atualizado
      'claude-3.5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        description: 'Versão mais recente do Claude Sonnet',
        category: 'advanced',
        contextWindow: 200000,
        strengths: ['Raciocínio', 'Código', 'Análise']
      },
      'claude-3.5-haiku': {
        name: 'Claude 3.5 Haiku',
        description: 'Claude rápido e eficiente atualizado',
        category: 'fast',
        contextWindow: 200000,
        strengths: ['Velocidade', 'Precisão', 'Eficiência']
      },
      'claude-4-sonnet': {
        name: 'Claude 4 Sonnet',
        description: 'Modelo mais recente da Anthropic',
        category: 'advanced',
        contextWindow: 200000,
        strengths: ['Raciocínio avançado', 'Análise profunda', 'Código']
      },
      'claude-4-sonnet-thinking': {
        name: 'Claude 4 Sonnet Thinking',
        description: 'Claude com modo de raciocínio avançado',
        category: 'reasoning',
        contextWindow: 200000,
        strengths: ['Raciocínio profundo', 'Análise detalhada', 'Explicações']
      },
      // Gemini 2
      'gemini-2-flash': {
        name: 'Gemini 2.5 Flash',
        description: 'Modelo rápido do Google com contexto enorme',
        category: 'fast',
        contextWindow: 1048576,
        strengths: ['Contexto gigante', 'Multimodal', 'Velocidade']
      },
      'gemini-2-pro': {
        name: 'Gemini 2.5 Pro',
        description: 'Modelo avançado do Google',
        category: 'advanced',
        contextWindow: 1048576,
        strengths: ['Contexto gigante', 'Análise profunda', 'Multimodal']
      },
      'gemini-2.5-pro': {
        name: 'Gemini 2.5 Pro',
        description: 'Modelo avançado do Google com contexto massivo',
        category: 'advanced',
        contextWindow: 1048576,
        strengths: ['Contexto gigante', 'Análise profunda', 'Multimodal']
      },
      // Grok
      'grok-3': {
        name: 'Grok 3',
        description: 'Modelo mais recente da xAI',
        category: 'advanced',
        contextWindow: 131072,
        strengths: ['Humor', 'Atualidade', 'Personalidade']
      },
      'grok-3-mini': {
        name: 'Grok 3 Mini',
        description: 'Versão rápida do Grok',
        category: 'fast',
        contextWindow: 131072,
        strengths: ['Velocidade', 'Humor', 'Conversação']
      },
      // Perplexity
      'perplexity-sonar-pro': {
        name: 'Perplexity Sonar Pro',
        description: 'Modelo com pesquisa web integrada',
        category: 'research',
        contextWindow: 200000,
        strengths: ['Pesquisa web', 'Atualidade', 'Fontes']
      },
      'perplexity-reasoning': {
        name: 'Perplexity Reasoning Pro',
        description: 'Modelo focado em raciocínio com pesquisa',
        category: 'reasoning',
        contextWindow: 128000,
        strengths: ['Raciocínio', 'Pesquisa', 'Análise']
      },
      // Llama atualizado
      'llama-3.3-70b': {
        name: 'Llama 3.3 70B',
        description: 'Versão mais recente do Llama',
        category: 'balanced',
        contextWindow: 131072,
        strengths: ['Open source', 'Versatilidade', 'Performance']
      },
      'llama-3.1-405b': {
        name: 'Llama 3.1 405B',
        description: 'Maior modelo do Llama',
        category: 'advanced',
        contextWindow: 32768,
        strengths: ['Capacidade máxima', 'Open source', 'Profundidade']
      },
      // Mistral
      'mistral-large-2': {
        name: 'Mistral Large 2',
        description: 'Versão mais recente do Mistral Large',
        category: 'advanced',
        contextWindow: 131072,
        strengths: ['Multilíngue', 'Raciocínio', 'Código']
      },
      // Qwen
      'qwq-32b': {
        name: 'QwQ 32B',
        description: 'Modelo de raciocínio da Qwen',
        category: 'reasoning',
        contextWindow: 131072,
        strengths: ['Raciocínio step-by-step', 'Matemática', 'Lógica']
      },
      'qwen-2.5-72b': {
        name: 'Qwen 2.5 72B',
        description: 'Modelo avançado da Alibaba',
        category: 'advanced',
        contextWindow: 32768,
        strengths: ['Multilíngue', 'Código', 'Análise']
      },
      'qwen-2.5-coder': {
        name: 'Qwen 2.5 Coder',
        description: 'Especializado em programação',
        category: 'code',
        contextWindow: 32768,
        strengths: ['Código', 'Debug', 'Arquitetura']
      },
      // Novos modelos
      'llama-4-maverick': {
        name: 'Llama 4 Maverick',
        description: 'Modelo open source mais poderoso da Meta',
        category: 'advanced',
        contextWindow: 131072,
        strengths: ['Open source', 'Versatilidade', 'Performance']
      },
      'perplexity-sonar': {
        name: 'Perplexity Sonar',
        description: 'Modelo com pesquisa web integrada',
        category: 'advanced',
        contextWindow: 200000,
        strengths: ['Pesquisa web', 'Atualidade', 'Fontes']
      },
      'sabia-3.1': {
        name: 'Sabiá 3.1',
        description: 'Modelo brasileiro otimizado para português',
        category: 'advanced',
        contextWindow: 32768,
        strengths: ['Português nativo', 'Cultura brasileira', 'Regionalização']
      },
      'amazon-nova-premier': {
        name: 'Amazon Nova Premier',
        description: 'Modelo mais poderoso da Amazon',
        category: 'advanced',
        contextWindow: 300000,
        strengths: ['Capacidade máxima', 'Integração AWS', 'Performance']
      },
      'qwen-qwq': {
        name: 'Qwen QwQ',
        description: 'Modelo de raciocínio step-by-step',
        category: 'reasoning',
        contextWindow: 131072,
        strengths: ['Raciocínio detalhado', 'Matemática', 'Lógica']
      },
      'deepseek-r1-small': {
        name: 'Deepseek R1 Small',
        description: 'Modelo de raciocínio eficiente',
        category: 'reasoning',
        contextWindow: 128000,
        strengths: ['Raciocínio rápido', 'Eficiência', 'Custo-benefício']
      }
    }
  }

  private getOpenRouterModel(model: string): string {
    return this.modelMap[model] || model
  }

  async generateResponse(messages: AIMessage[], model: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('[OpenRouter] API key not configured')
    }

    const openRouterModel = this.getOpenRouterModel(model)
    console.log(`[OpenRouter] Generating response with model: ${openRouterModel}`)
    
    return this.retryRequest(async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
      
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
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error?.message || errorMessage
          } catch {
            // Se não conseguir parsear, usar a mensagem de status HTTP
          }
          
          console.error(`[OpenRouter] API Error: ${errorMessage}`)
          throw new Error(errorMessage)
        }

        const data = await response.json()
        
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('[OpenRouter] Invalid response format')
        }
        
        // Calcular custos aproximados (OpenRouter fornece isso na resposta)
        const usage = data.usage || {}
        const promptTokens = usage.prompt_tokens || 0
        const completionTokens = usage.completion_tokens || 0
        const totalTokens = promptTokens + completionTokens
        
        // OpenRouter retorna o custo real na resposta
        const cost = data.usage?.total_cost || this.estimateCost(model, promptTokens, completionTokens)

        console.log(`[OpenRouter] Success: ${completionTokens} tokens, $${cost.toFixed(6)}`)

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
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('[OpenRouter] Request timeout after 30 seconds')
        }
        throw error
      }
    })
  }

  async *streamResponse(
    messages: AIMessage[], 
    model: string,
    _options?: {
      maxTokens?: number
      temperature?: number
    }
  ): AsyncGenerator<string> {
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
                yield token
              }
            } catch {
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
      // Novos modelos
      'gpt-4.1': { input: 0.005, output: 0.015 },
      'gpt-4o': { input: 0.0025, output: 0.01 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'o3': { input: 0.015, output: 0.06 },
      'o4-mini': { input: 0.003, output: 0.012 },
      'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
      'claude-4-sonnet': { input: 0.003, output: 0.015 },
      'claude-4-sonnet-thinking': { input: 0.003, output: 0.015 },
      'claude-3.5-haiku': { input: 0.0008, output: 0.004 },
      'gemini-2-flash': { input: 0.0003, output: 0.0025 },
      'gemini-2-pro': { input: 0.00125, output: 0.01 },
      'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
      'gemini-2-flash-free': { input: 0.0, output: 0.0 },
      'grok-3': { input: 0.003, output: 0.015 },
      'grok-3-mini': { input: 0.0003, output: 0.0005 },
      'grok-2-vision': { input: 0.002, output: 0.01 },
      'perplexity-sonar-pro': { input: 0.003, output: 0.015 },
      'perplexity-sonar': { input: 0.003, output: 0.015 },
      'perplexity-reasoning': { input: 0.002, output: 0.008 },
      'llama-3.3-70b': { input: 0.000039, output: 0.00012 },
      'llama-3.2-90b-vision': { input: 0.0012, output: 0.0012 },
      'llama-3.1-405b': { input: 0.0008, output: 0.0008 },
      'llama-4-maverick': { input: 0.0008, output: 0.0008 },
      'qwen-qwq': { input: 0.000075, output: 0.00015 },
      'qwq-32b': { input: 0.000075, output: 0.00015 },
      'qwen-2.5-72b': { input: 0.00012, output: 0.00039 },
      'qwen-2.5-coder': { input: 0.00006, output: 0.00015 },
      'mistral-large-2': { input: 0.002, output: 0.006 },
      'sabia-3.1': { input: 0.002, output: 0.008 },
      'amazon-nova-premier': { input: 0.008, output: 0.032 },
      'deepseek-r1-small': { input: 0.00014, output: 0.00055 }
    }

    const modelCosts = costs[model] || { input: 0.001, output: 0.001 }
    
    return (inputTokens / 1000 * modelCosts.input) + (outputTokens / 1000 * modelCosts.output)
  }

  isConfigured(): boolean {
    // Verificar novamente a variável de ambiente se não tiver chave
    if (!this.apiKey && process.env.OPENROUTER_API_KEY) {
      this.apiKey = process.env.OPENROUTER_API_KEY
    }
    return !!this.apiKey
  }

  getAvailableModels(): AIModel[] {
    // Os modelos agora são gerenciados pela configuração centralizada do InnerAI
    // Esta função é mantida para compatibilidade, mas não é mais usada
    return []
  }

  estimateTokens(text: string, model: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4)
  }
}