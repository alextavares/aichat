import { z } from 'zod'

export interface ChatSession {
  id: string
  userId: string
  title: string
  model: string
  systemPrompt?: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  isArchived: boolean
  tags: string[]
  settings: ChatSettings
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  attachments?: MessageAttachment[]
  timestamp: Date
  tokens?: {
    input: number
    output: number
    cost: number
  }
  metadata?: {
    model: string
    temperature: number
    responseTime: number
    regenerated?: boolean
  }
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'document' | 'audio' | 'video'
  name: string
  url: string
  size: number
  mimeType: string
}

export interface ChatSettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt?: string
  autoSave: boolean
  codeHighlighting: boolean
  mathRendering: boolean
}

export const ChatMessageSchema = z.object({
  content: z.string().min(1).max(32000),
  attachments: z.array(z.object({
    type: z.enum(['image', 'document', 'audio', 'video']),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    mimeType: z.string()
  })).optional(),
  sessionId: z.string().uuid(),
  parentMessageId: z.string().uuid().optional()
})

export const ChatSettingsSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8192).default(2048),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
  systemPrompt: z.string().max(2000).optional(),
  autoSave: z.boolean().default(true),
  codeHighlighting: z.boolean().default(true),
  mathRendering: z.boolean().default(true)
})

export class ChatFeatures {
  // Advanced conversation management
  static async createChatSession(
    userId: string, 
    title: string, 
    model: string,
    settings?: Partial<ChatSettings>
  ): Promise<ChatSession> {
    const defaultSettings: ChatSettings = {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      autoSave: true,
      codeHighlighting: true,
      mathRendering: true,
      ...settings
    }

    return {
      id: crypto.randomUUID(),
      userId,
      title,
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      isArchived: false,
      tags: [],
      settings: defaultSettings
    }
  }

  // Message branching and regeneration
  static async regenerateMessage(
    sessionId: string,
    messageId: string,
    newSettings?: Partial<ChatSettings>
  ): Promise<ChatMessage> {
    // This would integrate with the AI service to regenerate
    // the message with different parameters
    throw new Error('Not implemented - requires AI service integration')
  }

  // Smart message summarization
  static async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    const conversationText = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')

    // This would use a fast model to create a summary
    return `Conversa sobre: ${conversationText.slice(0, 100)}...`
  }

  // Context-aware suggestions
  static getMessageSuggestions(
    messages: ChatMessage[], 
    currentInput: string
  ): string[] {
    const lastMessage = messages[messages.length - 1]
    
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return [
        'Pode me ajudar com...',
        'Explique como...',
        'Qual é a diferença entre...',
        'Me dê exemplos de...'
      ]
    }

    // Context-aware suggestions based on conversation
    if (lastMessage.content.includes('código') || lastMessage.content.includes('programação')) {
      return [
        'Pode explicar este código?',
        'Como posso otimizar isso?',
        'Há algum bug neste código?',
        'Pode refatorar este código?'
      ]
    }

    if (lastMessage.content.includes('erro') || lastMessage.content.includes('problema')) {
      return [
        'Como posso resolver isso?',
        'Quais são as possíveis causas?',
        'Pode me dar uma solução alternativa?',
        'Como prevenir isso no futuro?'
      ]
    }

    return [
      'Continue...',
      'Pode elaborar mais?',
      'Tem algum exemplo?',
      'E quanto a...?'
    ]
  }

  // Advanced search and filtering
  static searchMessages(
    messages: ChatMessage[], 
    query: string,
    filters?: {
      role?: 'user' | 'assistant' | 'system'
      dateRange?: { start: Date; end: Date }
      hasAttachments?: boolean
    }
  ): ChatMessage[] {
    let filtered = messages

    if (filters?.role) {
      filtered = filtered.filter(m => m.role === filters.role)
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= filters.dateRange!.start && 
        m.timestamp <= filters.dateRange!.end
      )
    }

    if (filters?.hasAttachments !== undefined) {
      filtered = filtered.filter(m => 
        filters.hasAttachments ? 
        (m.attachments && m.attachments.length > 0) : 
        (!m.attachments || m.attachments.length === 0)
      )
    }

    // Simple text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  }

  // Export conversation in various formats
  static exportConversation(
    session: ChatSession, 
    messages: ChatMessage[], 
    format: 'markdown' | 'json' | 'pdf' | 'txt'
  ): string {
    switch (format) {
      case 'markdown':
        let markdown = `# ${session.title}\n\n`
        markdown += `**Modelo:** ${session.model}\n`
        markdown += `**Data:** ${session.createdAt.toLocaleDateString()}\n\n`
        
        messages.forEach(msg => {
          const role = msg.role === 'user' ? '👤 **Você**' : '🤖 **AI**'
          markdown += `## ${role}\n\n${msg.content}\n\n`
          
          if (msg.attachments?.length) {
            markdown += `**Anexos:** ${msg.attachments.map(a => a.name).join(', ')}\n\n`
          }
        })
        
        return markdown

      case 'json':
        return JSON.stringify({ session, messages }, null, 2)

      case 'txt':
        let text = `${session.title}\n`
        text += `Modelo: ${session.model}\n`
        text += `Data: ${session.createdAt.toLocaleDateString()}\n\n`
        
        messages.forEach(msg => {
          const role = msg.role === 'user' ? 'Você' : 'AI'
          text += `${role}: ${msg.content}\n\n`
        })
        
        return text

      default:
        throw new Error(`Formato não suportado: ${format}`)
    }
  }

  // Calculate conversation statistics
  static getConversationStats(messages: ChatMessage[]) {
    const totalMessages = messages.length
    const userMessages = messages.filter(m => m.role === 'user').length
    const assistantMessages = messages.filter(m => m.role === 'assistant').length
    const totalTokens = messages.reduce((sum, m) => 
      sum + (m.tokens?.input || 0) + (m.tokens?.output || 0), 0
    )
    const totalCost = messages.reduce((sum, m) => sum + (m.tokens?.cost || 0), 0)
    const averageResponseTime = messages
      .filter(m => m.metadata?.responseTime)
      .reduce((sum, m, _, arr) => 
        sum + (m.metadata!.responseTime / arr.length), 0
      )

    return {
      totalMessages,
      userMessages,
      assistantMessages,
      totalTokens,
      totalCost,
      averageResponseTime,
      conversationLength: totalMessages > 0 ? 
        messages[messages.length - 1].timestamp.getTime() - messages[0].timestamp.getTime() : 0
    }
  }

  // Smart auto-complete for technical content
  static getAutoCompletesuggestions(
    input: string, 
    context: 'code' | 'general' | 'technical'
  ): string[] {
    const commonCompletions = {
      code: [
        'function',
        'const',
        'import',
        'export',
        'class',
        'interface',
        'type',
        'async',
        'await'
      ],
      technical: [
        'implementar',
        'configurar',
        'otimizar',
        'debugar',
        'integrar',
        'desenvolver',
        'arquitetura',
        'performance'
      ],
      general: [
        'explique',
        'como',
        'porque',
        'quando',
        'onde',
        'exemplo',
        'diferença',
        'vantagem'
      ]
    }

    const relevantCompletions = commonCompletions[context] || commonCompletions.general
    
    return relevantCompletions
      .filter(completion => 
        completion.toLowerCase().startsWith(input.toLowerCase())
      )
      .slice(0, 5)
  }
}

// Enhanced message templates
export const MESSAGE_TEMPLATES = {
  code: {
    review: 'Por favor, revise este código e sugira melhorias:\n\n```\n[SEU_CÓDIGO]\n```',
    debug: 'Estou enfrentando este erro:\n\n```\n[ERRO]\n```\n\nCódigo relacionado:\n\n```\n[CÓDIGO]\n```',
    explain: 'Pode explicar como este código funciona?\n\n```\n[CÓDIGO]\n```',
    optimize: 'Como posso otimizar este código para melhor performance?\n\n```\n[CÓDIGO]\n```'
  },
  writing: {
    improve: 'Por favor, melhore este texto:\n\n[SEU_TEXTO]',
    summarize: 'Resuma este conteúdo:\n\n[CONTEÚDO]',
    translate: 'Traduza este texto para [IDIOMA]:\n\n[TEXTO]',
    format: 'Formate este texto em [FORMATO]:\n\n[TEXTO]'
  },
  analysis: {
    data: 'Analise estes dados:\n\n[DADOS]',
    compare: 'Compare:\n\nOpção A: [OPÇÃO_A]\nOpção B: [OPÇÃO_B]',
    pros_cons: 'Liste os prós e contras de:\n\n[TÓPICO]',
    research: 'Pesquise sobre:\n\n[TÓPICO]'
  }
}

export type { ChatSession, ChatMessage, ChatSettings, MessageAttachment }
export { ChatMessageSchema, ChatSettingsSchema }