export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  tokensUsed?: number
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  content: string // base64 for images, text content for documents
}

export interface ModelInfo {
  id: string
  name: string
  tier: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'
}

export interface ModelCategory {
  name: string
  icon: React.ComponentType<{ className?: string }>
  models: ModelInfo[]
}