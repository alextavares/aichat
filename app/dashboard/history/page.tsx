"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  MessageSquare,
  Calendar,
  Clock,
  MoreVertical,
  Download,
  Archive,
  Trash2,
  ExternalLink,
  Bot,
  User,
  Filter,
  SortDesc,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  modelUsed: string
  messagesCount: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'archived'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'messages'>('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    filterAndSortConversations()
  }, [conversations, searchQuery, filterType, sortBy])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        // Garante que data seja um array
        setConversations(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      })
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortConversations = () => {
    // Garante que conversations seja um array
    if (!Array.isArray(conversations)) {
      setFilteredConversations([])
      return
    }
    
    let filtered = [...conversations]

    // Apply filter
    if (filterType === 'active') {
      filtered = filtered.filter(c => !c.isArchived)
    } else if (filterType === 'archived') {
      filtered = filtered.filter(c => c.isArchived)
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages?.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'messages':
          return b.messagesCount - a.messagesCount
        default:
          return 0
      }
    })

    setFilteredConversations(filtered)
  }

  const handleContinueConversation = (conversationId: string) => {
    router.push(`/dashboard/chat?conversation=${conversationId}`)
  }

  const handleArchiveConversation = async (conversationId: string, isArchived: boolean) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: !isArchived }),
      })

      if (response.ok) {
        toast({
          title: isArchived ? "Desarquivado!" : "Arquivado!",
          description: `Conversa ${isArchived ? 'desarquivada' : 'arquivada'} com sucesso.`,
        })
        fetchConversations()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível arquivar a conversa.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return

    try {
      const response = await fetch(`/api/conversations/${conversationToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Excluído!",
          description: "Conversa excluída com sucesso.",
        })
        setShowDeleteDialog(false)
        setConversationToDelete(null)
        fetchConversations()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      })
    }
  }

  const handleExportConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/export`)
      if (response.ok) {
        const data = await response.json()
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversa-${conversationId}-${format(new Date(), 'yyyy-MM-dd')}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Exportado!",
          description: "Conversa exportada com sucesso.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar a conversa.",
        variant: "destructive",
      })
    }
  }

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title
    
    // Generate title from first user message
    const firstUserMessage = conversation.messages?.find(m => m.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
    
    return 'Conversa sem título'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Conversas</h1>
        <p className="text-muted-foreground">
          Visualize, continue ou exporte suas conversas anteriores
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar em conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                Todas as conversas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('active')}>
                Conversas ativas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('archived')}>
                Conversas arquivadas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SortDesc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Mais recentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Mais antigas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('messages')}>
                Mais mensagens
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({Array.isArray(conversations) ? conversations.length : 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativas ({Array.isArray(conversations) ? conversations.filter(c => !c.isArchived).length : 0})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Arquivadas ({Array.isArray(conversations) ? conversations.filter(c => c.isArchived).length : 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filterType} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-48 animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-4/5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conversa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Tente ajustar sua busca'
                  : 'Comece uma nova conversa para vê-la aqui'}
              </p>
              <Button onClick={() => router.push('/dashboard/chat')}>
                Nova Conversa
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredConversations.map(conversation => (
                <Card
                  key={conversation.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {getConversationTitle(conversation)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(conversation.updatedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleContinueConversation(conversation.id)
                          }}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Continuar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleArchiveConversation(conversation.id, conversation.isArchived)
                          }}>
                            <Archive className="h-4 w-4 mr-2" />
                            {conversation.isArchived ? 'Desarquivar' : 'Arquivar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleExportConversation(conversation.id)
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setConversationToDelete(conversation.id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          {conversation.messagesCount} mensagens
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {conversation.modelUsed}
                        </Badge>
                      </div>
                      {conversation.isArchived && (
                        <Badge variant="secondary" className="text-xs">
                          Arquivada
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Conversation Preview Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedConversation && getConversationTitle(selectedConversation)}</DialogTitle>
            <DialogDescription>
              {selectedConversation && format(new Date(selectedConversation.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedConversation?.messages?.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  
                  <Card className={`max-w-[80%] ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                  }`}>
                    <CardContent className="p-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </CardContent>
                  </Card>

                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedConversation(null)}>
              Fechar
            </Button>
            <Button onClick={() => selectedConversation && handleContinueConversation(selectedConversation.id)}>
              Continuar Conversa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conversa?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A conversa será permanentemente excluída.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConversation}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}