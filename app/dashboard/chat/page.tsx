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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Monitor,
  Save,
  Link,
  Globe,
  Search,
  BookOpen,
  Plus,
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
  ADVANCED: {
    name: 'Modelos Avançados',
    icon: Sparkles,
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', tier: 'PRO' },
      { id: 'gpt-4o', name: 'GPT-4o', tier: 'PRO' },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', tier: 'PRO' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'PRO' },
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', tier: 'PRO' },
      { id: 'perplexity-sonar', name: 'Perplexity Sonar', tier: 'PRO' },
      { id: 'sabia-3.1', name: 'Sabiá 3.1', tier: 'FREE' },
      { id: 'mistral-large-2', name: 'Mistral Large 2', tier: 'PRO' },
      { id: 'grok-3', name: 'Grok 3', tier: 'PRO' },
      { id: 'amazon-nova-premier', name: 'Amazon Nova Premier', tier: 'PRO' },
    ]
  },
  REASONING: {
    name: 'Raciocínio Profundo',
    icon: Brain,
    models: [
      { id: 'o3', name: 'o3', tier: 'PRO' },
      { id: 'o4-mini', name: 'o4 Mini', tier: 'PRO' },
      { id: 'qwen-qwq', name: 'Qwen QwQ', tier: 'FREE' },
      { id: 'claude-4-sonnet-thinking', name: 'Claude 4 Sonnet Thinking', tier: 'PRO' },
      { id: 'deepseek-r1-small', name: 'Deepseek R1 Small', tier: 'FREE' },
      { id: 'deepseek-r1', name: 'Deepseek R1', tier: 'PRO' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', tier: 'PRO' },
    ]
  },
  CLASSIC: {
    name: 'Modelos Clássicos',
    icon: Zap,
    models: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tier: 'FREE' },
      { id: 'gpt-4', name: 'GPT-4', tier: 'PRO' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', tier: 'PRO' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', tier: 'FREE' },
      { id: 'gemini-pro', name: 'Gemini Pro', tier: 'PRO' },
      { id: 'llama-2-70b', name: 'Llama 2 70B', tier: 'PRO' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', tier: 'PRO' },
      { id: 'mistral-7b', name: 'Mistral 7B', tier: 'FREE' },
    ]
  },
  CODE: {
    name: 'Código',
    icon: Code,
    models: [
      { id: 'phind-codellama-34b', name: 'Phind CodeLlama', tier: 'PRO' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', tier: 'PRO' },
      { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder', tier: 'PRO' },
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
  const [selectedModel, setSelectedModel] = useState('mistral-7b')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [savedFiles, setSavedFiles] = useState<FileAttachment[]>([]) // Simular arquivos salvos
  const [webSearchEnabled, setWebSearchEnabled] = useState(false) // Estado para controlar busca na internet
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(false) // Estado para controlar Knowledge Base
  const [isChatDisabledByLimit, setIsChatDisabledByLimit] = useState(false) // Novo estado
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasLoadedRef = useRef(false) // Prevent multiple loads

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
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
    }
    
    if (session) {
      fetchUserPlan()
    }
  }, [session])

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

  // Load template, conversation, or prompt if specified in URL
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const templateId = searchParams.get('template')
    const conversationId = searchParams.get('conversation')
    const promptParam = searchParams.get('prompt')
    
    if (templateId && templateId.length > 0) {
      hasLoadedRef.current = true
      loadTemplate(templateId)
    } else if (conversationId && conversationId.length > 0) {
      hasLoadedRef.current = true
      loadConversation(conversationId)
    } else if (promptParam && promptParam.length > 0) {
      hasLoadedRef.current = true
      setInput(decodeURIComponent(promptParam))
      // Focus the textarea after setting the prompt
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

// Classe de erro customizada
class HttpError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

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

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    try {
      // Aqui você normalmente faria uma requisição para buscar o conteúdo da URL
      // Por enquanto, vamos simular com uma mensagem
      const urlAttachment: FileAttachment = {
        id: Date.now().toString() + Math.random().toString(),
        name: urlInput,
        type: 'text/html',
        size: 0,
        content: `[URL Content from: ${urlInput}]`, // Em produção, você buscaria o conteúdo real
      }

      setAttachments(prev => [...prev, urlAttachment])
      toast({
        title: "URL adicionada",
        description: `${urlInput} foi anexada com sucesso.`,
      })
      setUrlInput('')
      setUrlDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao adicionar URL",
        description: "Não foi possível adicionar a URL.",
        variant: "destructive",
      })
    }
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
          conversationId,
          webSearchEnabled,
          knowledgeBaseEnabled
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Usar a classe de erro customizada para propagar mais detalhes
        throw new HttpError(errorData.message || 'Erro na resposta', response.status, errorData)
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
      let toastMessage = "Erro ao enviar mensagem";
      let toastTitle = "Erro no chat";

      if (error instanceof HttpError && error.data?.errorCode === "LIMIT_REACHED") {
        setIsChatDisabledByLimit(true) // Desabilita o chat
        toastTitle = "Limite Atingido"
        // Construir mensagem mais detalhada
        toastMessage = error.message // Mensagem base do backend (ex: "Daily message limit reached (10/10)")

        if (error.data.planType && error.data.usage) {
          if (error.data.details?.limitType === 'dailyMessages') {
             toastMessage = `Você atingiu seu limite de ${error.data.details.limit} mensagens diárias para o plano ${error.data.planType}.`
          } else if (error.data.details?.limitType === 'monthlyTokens') {
            toastMessage = `Você atingiu seu limite de tokens mensais para o plano ${error.data.planType}.`
          }
        }
        // Para adicionar link ao toast, a description do toast pode precisar aceitar JSX.
        // Se não, podemos adicionar a sugestão de upgrade na mensagem.
        toastMessage += " Considere fazer um upgrade para continuar."

        // Exemplo de como adicionar um link se o toast suportar ReactNode na description
        // (isso depende da implementação do componente `toast`)
        // const symptômesDescription = (
        //   <>
        //     {toastMessage}
        //     <Button variant="link" onClick={() => router.push('/pricing')} className="p-0 h-auto text-white underline">
        //       Fazer Upgrade
        //     </Button>
        //   </>
        // );
      } else if (error instanceof Error) {
        toastMessage = error.message
      }

      toast({
        title: toastTitle,
        description: toastMessage, // Aqui poderia ser o JSX com o botão se suportado
        variant: "destructive",
        // duration: isChatDisabledByLimit ? Infinity : 5000 // Manter o toast visível se o chat estiver desabilitado?
      })
      
      // Remove a mensagem do usuário que falhou da UI, exceto se o chat foi desabilitado por limite
      // pois nesse caso a mensagem pode já ter sido removida ou o estado do chat é diferente.
      if (!isChatDisabledByLimit && messages.length > 0 && messages[messages.length -1].role === 'user') {
         setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); // Remove a mensagem específica
      } else if (messages.length > 0 && messages[messages.length -1].role === 'user' && !(error instanceof HttpError && error.data?.errorCode === "LIMIT_REACHED")) {
        // Se não for erro de limite, remove a última mensagem do usuário
         setMessages(prev => prev.slice(0, -1));
      }


    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isChatDisabledByLimit) return; // Não permitir submit se desabilitado
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
          <div className="flex flex-col items-center justify-center h-full">
            <div className="max-w-5xl w-full mx-auto">
              {/* Greeting */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold mb-2">
                  Hello {session?.user?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  What can I do for you today?
                </p>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <Button
                  variant="secondary"
                  className="rounded-full px-6 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
                  onClick={() => toast({ title: "Filtragem em Breve!", description: "A capacidade de filtrar sugestões de prompt por categoria estará disponível em futuras atualizações." })}
                >
                  Work
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-6 py-2"
                  onClick={() => toast({ title: "Filtragem em Breve!", description: "A capacidade de filtrar sugestões de prompt por categoria estará disponível em futuras atualizações." })}
                >
                  Popular
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-6 py-2"
                  onClick={() => toast({ title: "Filtragem em Breve!", description: "A capacidade de filtrar sugestões de prompt por categoria estará disponível em futuras atualizações." })}
                >
                  Marketing
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={() => toast({ title: "Mais Opções em Breve!", description: "Funcionalidades adicionais, como ver mais categorias ou adicionar seus próprios prompts, serão implementadas em breve." })}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {/* Template Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Performance Indicators */}
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200"
                  onClick={() => setInput("Design a comprehensive KPI framework for tracking business performance metrics")}
                >
                  <h3 className="font-semibold text-lg mb-3">Performance Indicators</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Design a comprehensive KPI framework for tracking business performance
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-600">
                    <Plus className="h-4 w-4" />
                    <span>PROMPT</span>
                  </div>
                </Card>

                {/* Priority Matrix */}
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
                  onClick={() => setInput("Create a strategic prioritization framework for Company/Sector using urgency and importance matrix")}>
                  <h3 className="font-semibold text-lg mb-3">Priority Matrix</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a strategic prioritization framework for Company/Sector...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Plus className="h-4 w-4" />
                    <span>PROMPT</span>
                  </div>
                </Card>

                {/* Strategic Timeline */}
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200"
                  onClick={() => setInput("Develop an implementation roadmap for strategic initiatives with key milestones and dependencies")}>
                  <h3 className="font-semibold text-lg mb-3">Strategic Timeline</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Develop an implementation roadmap for...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-cyan-600">
                    <Plus className="h-4 w-4" />
                    <span>PROMPT</span>
                  </div>
                </Card>

                {/* Decision Criteria */}
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
                  onClick={() => setInput("Design a robust decision-making framework for evaluating strategic options and alternatives")}>
                  <h3 className="font-semibold text-lg mb-3">Decision Criteria</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Design a robust decision-making framework for Type of...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Plus className="h-4 w-4" />
                    <span>PROMPT</span>
                  </div>
                </Card>

                {/* Planning Meeting Guide */}
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200"
                  onClick={() => setInput("Structure an annual strategic planning meeting agenda with objectives and expected outcomes")}>
                  <h3 className="font-semibold text-lg mb-3">Planning Meeting Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Structure an annual strategic planning
                  </p>
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <Plus className="h-4 w-4" />
                    <span>PROMPT</span>
                  </div>
                </Card>

                {/* Strategic Communication */}
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200"
                  onClick={() => setInput("Develop a strategic communication plan for stakeholder engagement and change management")}>
                  <h3 className="font-semibold text-lg mb-3">Strategic Communication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Develop a strategic communication plan for
                  </p>
                  <div className="flex items-center gap-2 text-xs text-violet-600">
                    <Plus className="h-4 w-4" />
                    <span>PROMPT</span>
                  </div>
                </Card>
              </div>
            </div>
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
          
          <div className="relative bg-card rounded-2xl p-2 border border-border/50">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.pdf,.jpg,.jpeg,.png,.gif,.webp,.json,.js,.html,.css"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isChatDisabledByLimit ? "Limite atingido. Faça upgrade para continuar." : "Design a comprehensive KPI framework for Area/Department that captures both leading and lagging indicators. Structure metrics to reflect operational efficiency, strategic progress, and stakeholder value creation. Include data collection protocols, reporting frequencies, and intervention thresholds."}
              className="min-h-[100px] max-h-[200px] resize-none border-0 bg-transparent px-4 pt-4 pb-12 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              disabled={isLoading || isChatDisabledByLimit}
            />
            {/* Bottom toolbar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs hover:bg-accent"
                      title="Add"
                      disabled={isLoading || isChatDisabledByLimit}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem 
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer"
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      From your computer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        toast({
                          title: "Em breve",
                          description: "Funcionalidade de arquivos salvos estará disponível em breve.",
                        })
                      }}
                      className="cursor-pointer"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Saved files
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setUrlDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      <Link className="mr-2 h-4 w-4" />
                      From URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  type="button"
                  variant={webSearchEnabled ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs hover:bg-accent flex items-center gap-2"
                  title="Web Search"
                  onClick={() => {
                    setWebSearchEnabled(!webSearchEnabled)
                    toast({
                      title: webSearchEnabled ? "Web Search desativado" : "Web Search ativado",
                      description: webSearchEnabled 
                        ? "A IA não fará buscas na internet." 
                        : "A IA pode fazer buscas na internet para responder suas perguntas.",
                    })
                  }}
                >
                  <Globe className="h-4 w-4" />
                  <span>Web Search</span>
                </Button>
                
                <Button
                  type="button"
                  variant={knowledgeBaseEnabled ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs hover:bg-accent flex items-center gap-2"
                  title="Knowledge Base"
                  onClick={() => {
                    setKnowledgeBaseEnabled(!knowledgeBaseEnabled)
                    toast({
                      title: knowledgeBaseEnabled ? "Knowledge Base desativada" : "Knowledge Base ativada",
                      description: knowledgeBaseEnabled 
                        ? "A IA não usará a base de conhecimento." 
                        : "A IA usará documentos da base de conhecimento como contexto.",
                    })
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Knowledge</span>
                </Button>
              </div>
              
              <Button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || isLoading || isChatDisabledByLimit}
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
              >
                {isLoading && !isChatDisabledByLimit ? ( // Mostrar loader apenas se não estiver desabilitado por limite
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Dialog para inserir URL */}
      <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar arquivo de URL</DialogTitle>
            <DialogDescription>
              Insira a URL do arquivo que deseja adicionar ao chat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/arquivo.pdf"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlSubmit()
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUrlDialogOpen(false)
                setUrlInput('')
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}