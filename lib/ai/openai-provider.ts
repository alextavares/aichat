import OpenAI from 'openai'
import { AIProvider, AIMessage, AIResponse, AIModel } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Token estimation for OpenAI models (rough estimation)
function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai'
  private apiKey: string | undefined
  private models: AIModel[] = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 4096,
      costPerInputToken: 0.0015 / 1000, // $0.0015 per 1k tokens
      costPerOutputToken: 0.002 / 1000,  // $0.002 per 1k tokens
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      costPerInputToken: 0.03 / 1000,   // $0.03 per 1k tokens
      costPerOutputToken: 0.06 / 1000,  // $0.06 per 1k tokens
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 128000,
      costPerInputToken: 0.01 / 1000,   // $0.01 per 1k tokens
      costPerOutputToken: 0.03 / 1000,  // $0.03 per 1k tokens
    }
  ]

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
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
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      })

      const response = completion.choices[0]?.message?.content || ''
      const usage = completion.usage

      const inputTokens = usage?.prompt_tokens || 0
      const outputTokens = usage?.completion_tokens || 0
      const totalTokens = usage?.total_tokens || 0

      const modelInfo = this.models.find(m => m.id === model)
      const cost = modelInfo ? 
        (inputTokens * modelInfo.costPerInputToken) + 
        (outputTokens * modelInfo.costPerOutputToken) : 0

      return {
        content: response,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens
        },
        cost,
        model
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Erro ao gerar resposta com OpenAI')
    }
  }

  estimateTokens(text: string, model: string): number {
    return estimateTokens(text)
  }

  getAvailableModels(): AIModel[] {
    return this.models
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  async* streamResponse(
    messages: AIMessage[],
    model: string,
    options?: {
      maxTokens?: number
      temperature?: number
    }
  ): AsyncGenerator<string> {
    try {
      const stream = await openai.chat.completions.create({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          yield content
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error)
      throw new Error('Erro ao fazer streaming da resposta')
    }
  }
}