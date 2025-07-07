import { z } from 'zod'
import crypto from 'crypto'

export interface APIKey {
  id: string
  userId: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom'
  key: string // Encrypted
  keyPreview: string // Last 4 characters for display
  isActive: boolean
  usage: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    lastUsed?: Date
  }
  limits: {
    maxRequestsPerDay?: number
    maxTokensPerDay?: number
    maxCostPerDay?: number
  }
  permissions: {
    models: string[]
    features: string[]
  }
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ProviderConfig {
  provider: string
  name: string
  description: string
  keyFormat: RegExp
  testEndpoint: string
  supportedModels: string[]
  features: string[]
  pricing: {
    inputCost: number
    outputCost: number
    currency: 'USD' | 'BRL'
  }
}

const APIKeySchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum(['openai', 'anthropic', 'google', 'openrouter', 'custom']),
  key: z.string().min(10),
  limits: z.object({
    maxRequestsPerDay: z.number().positive().optional(),
    maxTokensPerDay: z.number().positive().optional(),
    maxCostPerDay: z.number().positive().optional()
  }).optional(),
  permissions: z.object({
    models: z.array(z.string()),
    features: z.array(z.string())
  }).optional(),
  expiresAt: z.date().optional()
})

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {
    provider: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, DALL-E, Whisper',
    keyFormat: /^sk-[a-zA-Z0-9]{48,}$/,
    testEndpoint: 'https://api.openai.com/v1/models',
    supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    features: ['chat', 'completion', 'vision', 'audio', 'image-generation'],
    pricing: {
      inputCost: 0.000015,
      outputCost: 0.00006,
      currency: 'USD'
    }
  },
  anthropic: {
    provider: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Haiku',
    keyFormat: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    supportedModels: ['claude-3-5-sonnet', 'claude-3-haiku'],
    features: ['chat', 'completion', 'vision', 'document-analysis'],
    pricing: {
      inputCost: 0.000015,
      outputCost: 0.000075,
      currency: 'USD'
    }
  },
  google: {
    provider: 'google',
    name: 'Google AI',
    description: 'Gemini Pro, PaLM, Vertex AI',
    keyFormat: /^AIza[a-zA-Z0-9_-]{35}$/,
    testEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
    supportedModels: ['gemini-pro', 'gemini-pro-vision'],
    features: ['chat', 'completion', 'vision', 'reasoning'],
    pricing: {
      inputCost: 0.00001,
      outputCost: 0.00004,
      currency: 'USD'
    }
  },
  openrouter: {
    provider: 'openrouter',
    name: 'OpenRouter',
    description: 'Acesso unificado a múltiplos modelos',
    keyFormat: /^sk-or-v1-[a-zA-Z0-9]{64,}$/,
    testEndpoint: 'https://openrouter.ai/api/v1/models',
    supportedModels: ['all'],
    features: ['chat', 'completion', 'vision', 'multi-model'],
    pricing: {
      inputCost: 0.00001,
      outputCost: 0.00003,
      currency: 'USD'
    }
  }
}

export class APIKeyManager {
  private static encryptionKey = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production'

  // Encrypt API key for storage
  private static encryptKey(key: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey)
    let encrypted = cipher.update(key, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  // Decrypt API key for use
  private static decryptKey(encryptedKey: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey)
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (error) {
      throw new Error('Failed to decrypt API key')
    }
  }

  // Create API key preview (show only last 4 characters)
  private static createKeyPreview(key: string): string {
    if (key.length < 4) return '****'
    return '***' + key.slice(-4)
  }

  // Validate API key format
  static validateKeyFormat(provider: string, key: string): boolean {
    const config = PROVIDER_CONFIGS[provider]
    if (!config) return false
    return config.keyFormat.test(key)
  }

  // Test API key by making a test request
  static async testAPIKey(provider: string, key: string): Promise<{
    isValid: boolean
    error?: string
    metadata?: any
  }> {
    const config = PROVIDER_CONFIGS[provider]
    if (!config) {
      return { isValid: false, error: 'Provider not supported' }
    }

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'InnerAI/1.0'
      }

      // Set authorization header based on provider
      switch (provider) {
        case 'openai':
        case 'openrouter':
          headers['Authorization'] = `Bearer ${key}`
          break
        case 'anthropic':
          headers['x-api-key'] = key
          headers['anthropic-version'] = '2023-06-01'
          break
        case 'google':
          // Google uses query parameter
          break
      }

      const url = provider === 'google' 
        ? `${config.testEndpoint}?key=${key}`
        : config.testEndpoint

      const response = await fetch(url, {
        method: 'GET',
        headers,
        timeout: 10000
      })

      if (response.ok) {
        const data = await response.json()
        return {
          isValid: true,
          metadata: {
            modelsCount: data.data?.length || 0,
            organization: data.organization || null
          }
        }
      } else {
        return {
          isValid: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Add new API key
  static async addAPIKey(
    userId: string,
    keyData: z.infer<typeof APIKeySchema>
  ): Promise<APIKey> {
    // Validate key format
    if (!this.validateKeyFormat(keyData.provider, keyData.key)) {
      throw new Error('Invalid API key format for this provider')
    }

    // Test key validity
    const testResult = await this.testAPIKey(keyData.provider, keyData.key)
    if (!testResult.isValid) {
      throw new Error(`API key test failed: ${testResult.error}`)
    }

    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      userId,
      name: keyData.name,
      provider: keyData.provider,
      key: this.encryptKey(keyData.key),
      keyPreview: this.createKeyPreview(keyData.key),
      isActive: true,
      usage: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0
      },
      limits: keyData.limits || {},
      permissions: keyData.permissions || {
        models: PROVIDER_CONFIGS[keyData.provider].supportedModels,
        features: PROVIDER_CONFIGS[keyData.provider].features
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: keyData.expiresAt
    }

    // In a real implementation, this would save to database
    return apiKey
  }

  // Get user's API keys
  static async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    // In a real implementation, this would query the database
    return []
  }

  // Get active API key for provider
  static async getActiveKey(userId: string, provider: string): Promise<string | null> {
    const keys = await this.getUserAPIKeys(userId)
    const activeKey = keys.find(k => 
      k.provider === provider && 
      k.isActive && 
      (!k.expiresAt || k.expiresAt > new Date())
    )

    if (!activeKey) return null
    return this.decryptKey(activeKey.key)
  }

  // Update API key usage
  static async updateKeyUsage(
    keyId: string,
    usage: {
      requests: number
      tokens: number
      cost: number
    }
  ): Promise<void> {
    // In a real implementation, this would update the database
    // and check against limits
    console.log(`Updating usage for key ${keyId}:`, usage)
  }

  // Check if key usage is within limits
  static async checkUsageLimits(keyId: string): Promise<{
    withinLimits: boolean
    violations: string[]
  }> {
    // In a real implementation, this would check actual usage against limits
    return {
      withinLimits: true,
      violations: []
    }
  }

  // Rotate API key (generate new key for same provider)
  static async rotateAPIKey(keyId: string, newKey: string): Promise<APIKey> {
    // In a real implementation, this would update the existing key
    // after validating the new key
    throw new Error('Not implemented')
  }

  // Delete API key
  static async deleteAPIKey(keyId: string, userId: string): Promise<void> {
    // In a real implementation, this would soft-delete the key
    console.log(`Deleting API key ${keyId} for user ${userId}`)
  }

  // Get usage analytics for API keys
  static async getKeyAnalytics(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<Array<{
    keyId: string
    name: string
    provider: string
    usage: {
      requests: number
      tokens: number
      cost: number
      successRate: number
    }
    trends: Array<{
      date: Date
      requests: number
      cost: number
    }>
  }>> {
    // In a real implementation, this would aggregate usage data
    return []
  }

  // Auto-detect provider from key format
  static detectProvider(key: string): string | null {
    for (const [provider, config] of Object.entries(PROVIDER_CONFIGS)) {
      if (config.keyFormat.test(key)) {
        return provider
      }
    }
    return null
  }

  // Get cost estimation for a request
  static estimateRequestCost(
    provider: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const config = PROVIDER_CONFIGS[provider]
    if (!config) return 0

    return (inputTokens * config.pricing.inputCost) + 
           (outputTokens * config.pricing.outputCost)
  }

  // Bulk import API keys
  static async bulkImportKeys(
    userId: string,
    keys: Array<{
      name: string
      provider: string
      key: string
    }>
  ): Promise<{
    successful: APIKey[]
    failed: Array<{ key: any; error: string }>
  }> {
    const successful: APIKey[] = []
    const failed: Array<{ key: any; error: string }> = []

    for (const keyData of keys) {
      try {
        const apiKey = await this.addAPIKey(userId, {
          ...keyData,
          provider: keyData.provider as any
        })
        successful.push(apiKey)
      } catch (error) {
        failed.push({
          key: keyData,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { successful, failed }
  }
}

export { APIKeyManager, APIKeySchema }
export type { APIKey, ProviderConfig }