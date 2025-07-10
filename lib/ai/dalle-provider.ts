import OpenAI from 'openai'

export interface ImageGenerationOptions {
  prompt: string
  model?: 'dall-e-2' | 'dall-e-3'
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number
}

export interface ImageGenerationResponse {
  images: Array<{
    url: string
    revised_prompt?: string
  }>
  cost: number
  model: string
}

export class DalleProvider {
  private openai: OpenAI | null = null
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey })
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured')
    }

    const {
      prompt,
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      n = 1
    } = options

    try {
      const response = await this.openai.images.generate({
        model,
        prompt,
        size: size as any,
        quality: model === 'dall-e-3' ? quality : undefined,
        style: model === 'dall-e-3' ? style : undefined,
        n: model === 'dall-e-3' ? 1 : n, // DALL-E 3 only supports n=1
        response_format: 'url'
      })

      // Calculate cost based on model and settings
      const cost = this.calculateCost(model, size, quality, n)

      return {
        images: response.data.map(img => ({
          url: img.url!,
          revised_prompt: img.revised_prompt
        })),
        cost,
        model
      }
    } catch (error) {
      console.error('DALL-E API error:', error)
      throw new Error('Erro ao gerar imagem com DALL-E')
    }
  }

  private calculateCost(
    model: string,
    size: string,
    quality: string,
    n: number
  ): number {
    // DALL-E 3 pricing (USD)
    if (model === 'dall-e-3') {
      if (size === '1024x1024') {
        return quality === 'hd' ? 0.080 : 0.040
      } else if (size === '1792x1024' || size === '1024x1792') {
        return quality === 'hd' ? 0.120 : 0.080
      }
    }
    
    // DALL-E 2 pricing (USD)
    if (model === 'dall-e-2') {
      if (size === '1024x1024') return 0.020 * n
      if (size === '512x512') return 0.018 * n
      if (size === '256x256') return 0.016 * n
    }

    return 0
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  getAvailableModels() {
    return [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        maxSize: '1792x1024',
        features: ['HD Quality', 'Style Control', 'Enhanced Prompts']
      },
      {
        id: 'dall-e-2',
        name: 'DALL-E 2',
        maxSize: '1024x1024', 
        features: ['Multiple Images', 'Lower Cost']
      }
    ]
  }
}

export const dalleProvider = new DalleProvider()