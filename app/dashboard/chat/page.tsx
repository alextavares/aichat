"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Send,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  Code,
  Brain,
  Zap,
  Paperclip,
  X,
  FileText,
  Image,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  tokensUsed?: number
  attachments?: FileAttachment[]
}

interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  content: string // base64 for images, text content for documents
}

// Categorias de modelos para melhor organização
const MODEL_CATEGORIES = {
  OPENAI: {
    name: 'OpenAI',
    icon: Sparkles,
    models: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tier: 'FREE' },
      { id: 'gpt-4', name: 'GPT-4', tier: 'PRO' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tier: 'PRO' },
    ]
  },
  ANTHROPIC: {
    name: 'Claude',
    icon: Brain,
    models: [
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', tier: 'FREE' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', tier: 'PRO' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', tier: 'ENTERPRISE' },
    ]
  },
  GOOGLE: {
    name: 'Google',
    icon: Sparkles,
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', tier: 'PRO' },
    ]
  },
  META: {
    name: 'Llama',
    icon: Brain,
    models: [
      { id: 'llama-2-13b', name: 'Llama 2 13B', tier: 'FREE' },
      { id: 'llama-2-70b', name: 'Llama 2 70B', tier: 'PRO' },
    ]
  },
  MISTRAL: {
    name: 'Mistral',
    icon: Zap,
    models: [
      { id: 'mistral-7b', name: 'Mistral 7B', tier: 'FREE' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', tier: 'PRO' },
    ]
  },
  CODE: {
    name: 'Código',
    icon: Code,
    models: [
      { id: 'phind-codellama-34b', name: 'Phind CodeLlama', tier: 'PRO' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', tier: 'PRO' },
    ]
  },
  OPENSOURCE: {
    name: 'Open Source',
    icon: Brain,
    models: [
      { id: 'nous-hermes-2', name: 'Nous Hermes 2', tier: 'PRO' },
      { id: 'openhermes-2.5', name: 'OpenHermes 2.5', tier: 'PRO' },
    ]
  }
}

// Função para obter modelos disponíveis baseado no plano do usuário
function getAvailableModels(planType: string) {
  const tierMap: Record<string, string[]> = {
    FREE: ['FREE'],
    PRO: ['FREE', 'PRO'],
    ENTERPRISE: ['FREE', 'PRO', 'ENTERPRISE']
  }
  
  const allowedTiers = tierMap[planType] || ['FREE']
  const availableModels: Array<{id: string, name: string, category: string, icon: any}> = []
  
  Object.entries(MODEL_CATEGORIES).forEach(([key, category]) => {
    category.models.forEach(model => {
      if (allowedTiers.includes(model.tier)) {
        availableModels.push({
          id: model.id,
          name: model.name,
          category: category.name,
          icon: category.icon
        })
      }
    })
  })
  
  return availableModels
}

export default function ChatPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load user plan
  const fetchUserPlan = useCallback(async () => {
    if (session?.user) {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.planType || 'FREE')
        }
      } catch (error) {
        console.error('Error fetching user plan:', error)
      }
    }
  }, [session])

  useEffect(() => {
    fetchUserPlan()
  }, [fetchUserPlan])

  const loadTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      if (response.ok) {
        const template = await response.json()
        setInput(template.templateContent)
        toast({
          title: "Template carregado!",
          description: `Template "${template.name}" pronto para usar.`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o template.",
        variant: "destructive",
      })
    }
  }, [])

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const conversation = await response.json()
        setConversationId(conversationId)
        setMessages(conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          model: msg.modelUsed,
          tokensUsed: msg.tokensUsed,
        })))
        if (conversation.modelUsed) {
          setSelectedModel(conversation.modelUsed)
        }
        toast({
          title: "Conversa carregada!",
          description: "Você pode continuar de onde parou.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa.",
        variant: "destructive",
      })
    }
  }, [])

  // Load template or conversation if specified in URL
  useEffect(() => {
    const templateId = searchParams.get('template')
    const conversationId = searchParams.get('conversation')
    
    if (templateId) {
      loadTemplate(templateId)
    } else if (conversationId) {
      loadConversation(conversationId)
    }
  }, [searchParams, loadTemplate, loadConversation])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        })
        continue
      }

      // Validate file type
      const allowedTypes = [
        'text/plain',
        'text/markdown',
        'text/csv',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/json',
        'text/javascript',
        'text/html',
        'text/css',
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Suportamos apenas texto, imagens, PDF e alguns formatos de código.",
          variant: "destructive",
        })
        continue
      }

      try {
        let content = ''
        if (file.type.startsWith('image/')) {
          // Convert image to base64
          const reader = new FileReader()
          content = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        } else {
          // Read text content
          content = await file.text()
        }

        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          content,
        }

        setAttachments(prev => [...prev, attachment])
        toast({
          title: "Arquivo anexado",
          description: `${file.name} foi anexado com sucesso.`,
        })
      } catch (error) {
        toast({
          title: "Erro ao processar arquivo",
          description: "Não foi possível processar o arquivo.",
          variant: "destructive",
        })
      }
    }

    // Clear the input
    if (event.target) {
      event.target.value = ''
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copiado!",
        description: "Mensagem copiada para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && attachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([]) // Clear attachments after sending
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            attachments: msg.attachments
          })),
          model: selectedModel,
          conversationId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro na resposta')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Stream não disponível')

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        model: selectedModel
      }

      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.token) {
                  assistantMessage.content += data.token
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  )
                }
                
                if (data.done) {
                  setConversationId(data.conversationId)
                  assistantMessage.tokensUsed = data.tokensUsed?.total
                }
                
                if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.error('Parse error:', parseError)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Erro no chat",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem",
        variant: "destructive",
      })
      
      // Remove failed message
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setAttachments([])
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header - InnerAI Style */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px] h-10 bg-card border-border/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[400px] bg-card border-border/50 rounded-xl">
              {getAvailableModels(userPlan).map(model => {
                const Icon = model.icon
                return (
                  <SelectItem key={model.id} value={model.id} className="rounded-lg">
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{model.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs flex-shrink-0 border-border/50">
                        {model.category}
                      </Badge>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-card"
            onClick={handleNewChat}
            disabled={messages.length === 0}
            title="Nova Conversa"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Comece uma nova conversa</h2>
            <p className="text-muted-foreground max-w-md">
              Escolha um modelo de IA e envie sua mensagem. Estou aqui para ajudar com qualquer pergunta!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={`max-w-[80%] ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {message.model && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {message.model}
                          </Badge>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(message.content, message.id)}
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/10 rounded-lg">
                            {attachment.type.startsWith('image/') ? (
                              <Image className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-xs truncate flex-1">{attachment.name}</span>
                            <span className="text-xs opacity-70">{formatFileSize(attachment.size)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.tokensUsed && (
                      <div className="text-xs opacity-50 mt-2">
                        Tokens: {message.tokensUsed}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-[80%]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Pensando...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area - InnerAI Style */}
      <div className="p-4 border-t border-border/50 chat-input-shadow">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="text-sm text-muted-foreground">Arquivos anexados:</div>
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/50">
                  {attachment.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm truncate flex-1">{attachment.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="relative flex items-end gap-2 bg-card rounded-2xl p-2 border border-border/50">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.pdf,.jpg,.jpeg,.png,.gif,.webp,.json,.js,.html,.css"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex gap-1 absolute left-3 bottom-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent"
                title="Adicionar arquivo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent"
                title="Pesquisar na web"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent"
                title="Conhecimento"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </Button>
            </div>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte para Inner AI"
              className="min-h-[70px] max-h-[200px] resize-none border-0 bg-transparent pl-28 pr-12 py-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}