import { AIProvider, AIMessage, AIResponse, AIModel } from './types'

export class OpenRouterProvider implements AIProvider {
  public readonly id = 'openrouter'
  private apiKey: string
  private baseURL = 'https://openrouter.ai/api/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
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
    'gpt-4.1': 'openai/gpt-4-turbo-preview',
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'o3': 'openai/o1-preview',
    'o4-mini': 'openai/o1-mini',
    
    // Modelos Anthropic
    'claude-3-opus': 'anthropic/claude-3-opus',
    'claude-3-sonnet': 'anthropic/claude-3-sonnet-20240229',
    'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
    'claude-4-sonnet': 'anthropic/claude-3.5-sonnet',
    'claude-4-sonnet-thinking': 'anthropic/claude-3.5-sonnet',
    'claude-3-haiku': 'anthropic/claude-3-haiku-20240307',
    'claude-3.5-haiku': 'anthropic/claude-3.5-haiku',
    'claude-2.1': 'anthropic/claude-2.1',
    'claude-2': 'anthropic/claude-2',
    
    // Modelos Google
    'gemini-pro': 'google/gemini-pro',
    'gemini-pro-vision': 'google/gemini-pro-vision',
    'gemini-2-flash': 'google/gemini-2.0-flash-exp',
    'gemini-2-pro': 'google/gemini-2.0-pro-exp',
    'gemini-2.5-pro': 'google/gemini-2.0-pro-exp',
    'gemini-2-flash-free': 'google/gemini-2.0-flash-exp:free',
    'palm-2': 'google/palm-2-chat-bison',
    
    // Modelos Meta
    'llama-2-70b': 'meta-llama/llama-2-70b-chat',
    'llama-2-13b': 'meta-llama/llama-2-13b-chat',
    'codellama-70b': 'meta-llama/codellama-70b-instruct',
    'llama-4-maverick': 'meta-llama/llama-3.3-70b-instruct',
    
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
    
    // Modelos xAI (Grok)
    'grok-3': 'x-ai/grok-3',
    'grok-3-mini': 'x-ai/grok-3-mini',
    'grok-2-vision': 'x-ai/grok-2-vision-1212',
    
    // Modelos Perplexity
    'perplexity-sonar-pro': 'perplexity/sonar-pro',
    'perplexity-sonar': 'perplexity/sonar-pro',
    'perplexity-reasoning': 'perplexity/sonar-reasoning-pro',
    
    // Modelos Llama atualizados
    'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',
    'llama-3.2-90b-vision': 'meta-llama/llama-3.2-90b-vision-instruct',
    'llama-3.1-405b': 'meta-llama/llama-3.1-405b-instruct',
    
    // Modelos Qwen
    'qwq-32b': 'qwen/qwq-32b',
    'qwen-2.5-72b': 'qwen/qwen-2.5-72b-instruct',
    'qwen-2.5-coder': 'qwen/qwen-2.5-coder-32b-instruct',
    
    // Mistral atualizado
    'mistral-large-2': 'mistralai/mistral-large-2411',
    
    // Modelos Sabiá (Maritaca AI)
    'sabia-3.1': 'maritaca/sabia-3',
    
    // Amazon Nova
    'amazon-nova-premier': 'amazon/nova-pro-v1'
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
    return [
      // Modelos OpenAI
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000005,
        costPerOutputToken: 0.000015
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000025,
        costPerOutputToken: 0.00001
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000015,
        costPerOutputToken: 0.0000006
      },
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
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015
      },
      {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
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
      },
      // Novos modelos - Fase 1
      {
        id: 'claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000008,
        costPerOutputToken: 0.000004
      },
      // Google Gemini
      {
        id: 'gemini-2-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'openrouter',
        maxTokens: 8192,
        costPerInputToken: 0.0000003,
        costPerOutputToken: 0.0000025
      },
      {
        id: 'gemini-2-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'openrouter',
        maxTokens: 8192,
        costPerInputToken: 0.00000125,
        costPerOutputToken: 0.00001
      },
      {
        id: 'gemini-2-flash-free',
        name: 'Gemini 2.0 Flash (Free)',
        provider: 'openrouter',
        maxTokens: 8192,
        costPerInputToken: 0.0,
        costPerOutputToken: 0.0
      },
      // xAI Grok
      {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015
      },
      {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000003,
        costPerOutputToken: 0.0000005
      },
      {
        id: 'grok-2-vision',
        name: 'Grok 2 Vision',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000002,
        costPerOutputToken: 0.00001
      },
      // Perplexity
      {
        id: 'perplexity-sonar-pro',
        name: 'Perplexity Sonar Pro',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015
      },
      {
        id: 'perplexity-sonar',
        name: 'Perplexity Sonar',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000001,
        costPerOutputToken: 0.000001
      },
      {
        id: 'perplexity-reasoning',
        name: 'Perplexity Reasoning Pro',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000002,
        costPerOutputToken: 0.000008
      },
      // Llama atualizados
      {
        id: 'llama-3.3-70b',
        name: 'Llama 3.3 70B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000000039,
        costPerOutputToken: 0.00000012
      },
      {
        id: 'llama-4-maverick',
        name: 'Llama 4 Maverick',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000008,
        costPerOutputToken: 0.0000008
      },
      {
        id: 'llama-3.1-405b',
        name: 'Llama 3.1 405B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.0000008,
        costPerOutputToken: 0.0000008
      },
      // Mistral
      {
        id: 'mistral-large-2',
        name: 'Mistral Large 2',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000002,
        costPerOutputToken: 0.000006
      },
      // Qwen
      {
        id: 'qwq-32b',
        name: 'QwQ 32B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000000075,
        costPerOutputToken: 0.00000015
      },
      {
        id: 'qwen-2.5-72b',
        name: 'Qwen 2.5 72B',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000012,
        costPerOutputToken: 0.00000039
      },
      {
        id: 'qwen-2.5-coder',
        name: 'Qwen 2.5 Coder',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000006,
        costPerOutputToken: 0.00000015
      },
      // Novos modelos
      {
        id: 'o3',
        name: 'o3',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000015,
        costPerOutputToken: 0.00006
      },
      {
        id: 'o4-mini',
        name: 'o4 Mini',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000012
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'openrouter',
        maxTokens: 8192,
        costPerInputToken: 0.00000125,
        costPerOutputToken: 0.00001
      },
      {
        id: 'perplexity-sonar',
        name: 'Perplexity Sonar',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015
      },
      {
        id: 'sabia-3.1',
        name: 'Sabiá 3.1',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000002,
        costPerOutputToken: 0.000008
      },
      {
        id: 'amazon-nova-premier',
        name: 'Amazon Nova Premier',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000008,
        costPerOutputToken: 0.000032
      },
      {
        id: 'qwen-qwq',
        name: 'Qwen QwQ',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000000075,
        costPerOutputToken: 0.00000015
      },
      {
        id: 'claude-4-sonnet-thinking',
        name: 'Claude 4 Sonnet Thinking',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.000003,
        costPerOutputToken: 0.000015
      },
      {
        id: 'deepseek-r1-small',
        name: 'Deepseek R1 Small',
        provider: 'openrouter',
        maxTokens: 4096,
        costPerInputToken: 0.00000014,
        costPerOutputToken: 0.00000055
      }
    ]
  }

  estimateTokens(text: string, model: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4)
  }
}