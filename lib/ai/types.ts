export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'openrouter' | 'anthropic'
  maxTokens: number
  costPerInputToken: number
  costPerOutputToken: number
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  cost: number
  model: string
  provider?: string
}

export interface AIProvider {
  id: string
  generateResponse(
    messages: AIMessage[],
    model: string,
    options?: {
      maxTokens?: number
      temperature?: number
      stream?: boolean
    }
  ): Promise<AIResponse>
  
  estimateTokens(text: string, model: string): number
  getAvailableModels(): AIModel[]
  isConfigured(): boolean
  streamResponse?(
    messages: AIMessage[],
    model: string,
    options?: {
      maxTokens?: number
      temperature?: number
    }
  ): AsyncGenerator<string>
}