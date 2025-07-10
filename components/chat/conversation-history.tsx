"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isYesterday, isThisWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConversationSearch, SearchFilters } from "./conversation-search"
import { 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Search,
  Calendar,
  Sparkles,
  Plus
} from "lucide-react"

interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  modelUsed: string
}

interface SearchResult extends Conversation {
  messageCount: number
  matchingMessages: Array<{
    id: string
    content: string
    role: string
    createdAt: Date
  }>
  preview: string
}

interface ConversationHistoryProps {
  currentConversationId?: string
  onSelectConversation: (conversationId: string) => void
  onNewConversation: () => void
}

export default function ConversationHistory({
  currentConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        })))
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const deleteConversation = async (conversationId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta conversa?")) return
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        if (currentConversationId === conversationId) {
          onNewConversation()
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const startRenaming = (conv: Conversation) => {
    setEditingId(conv.id)
    setEditingTitle(conv.title)
  }

  const cancelRenaming = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const saveRenaming = async (conversationId: string) => {
    if (!editingTitle.trim()) {
      cancelRenaming()
      return
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: editingTitle })
      })
      
      if (response.ok) {
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: editingTitle }
            : conv
        ))
        // Also update search results if in search mode
        if (isSearchMode) {
          setSearchResults(prev => prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, title: editingTitle }
              : conv
          ))
        }
        cancelRenaming()
      }
    } catch (error) {
      console.error("Error renaming conversation:", error)
    }
  }

  // Handle search functionality
  const handleSearch = useCallback(async (filters: SearchFilters) => {
    setCurrentFilters(filters)
    
    // Check if any search filters are active
    const hasActiveFilters = !!(
      filters.query.trim() || 
      filters.dateFrom || 
      filters.dateTo || 
      filters.model || 
      filters.messageCount ||
      filters.sortBy !== 'recent'
    )

    if (!hasActiveFilters) {
      setIsSearchMode(false)
      setSearchResults([])
      return
    }

    setIsSearchMode(true)
    setSearchLoading(true)

    try {
      const params = new URLSearchParams()
      if (filters.query.trim()) params.append('query', filters.query)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString())
      if (filters.model) params.append('model', filters.model)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.messageCount) params.append('messageCount', filters.messageCount)

      const response = await fetch(`/api/conversations/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt)
        })))
      }
    } catch (error) {
      console.error("Error searching conversations:", error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    conversations.forEach(conv => {
      let key: string
      const convDate = conv.createdAt

      if (convDate.toDateString() === today.toDateString()) {
        key = "Hoje"
      } else if (convDate.toDateString() === yesterday.toDateString()) {
        key = "Ontem"
      } else if (convDate > lastWeek) {
        key = "Últimos 7 dias"
      } else {
        key = "Mais antigos"
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(conv)
    })

    return groups
  }

  const groupedConversations = groupConversationsByDate(conversations)

  // Render conversation item (reusable for both normal and search results)
  const renderConversationItem = (conv: Conversation | SearchResult, isSearchResult = false) => (
    <div
      key={conv.id}
      className={`
        p-3 rounded-lg cursor-pointer transition-colors group
        ${currentConversationId === conv.id 
          ? 'bg-accent' 
          : 'hover:bg-accent/50'
        }
      `}
      onClick={() => editingId !== conv.id && onSelectConversation(conv.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-2">
          {editingId === conv.id ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveRenaming(conv.id)
                } else if (e.key === "Escape") {
                  cancelRenaming()
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm h-6 px-1"
              autoFocus
            />
          ) : (
            <p 
              className="text-sm font-medium line-clamp-1"
              onDoubleClick={() => startRenaming(conv)}
              dangerouslySetInnerHTML={{ 
                __html: isSearchResult && currentFilters?.query 
                  ? conv.title.replace(
                      new RegExp(`(${escapeRegExp(currentFilters.query)})`, 'gi'),
                      '<mark>$1</mark>'
                    )
                  : conv.title 
              }}
            />
          )}
          
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {conv.modelUsed && (
                <>
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  {conv.modelUsed}
                </>
              )}
              {conv.modelUsed && <span className="mx-1">•</span>}
              <Calendar className="h-3 w-3 inline mr-1" />
              {format(conv.updatedAt, "dd/MM HH:mm", { locale: ptBR })}
            </p>
            
            {isSearchResult && 'messageCount' in conv && (
              <Badge variant="secondary" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                {conv.messageCount}
              </Badge>
            )}
          </div>

          {/* Search result preview */}
          {isSearchResult && 'preview' in conv && conv.preview && (
            <p 
              className="text-xs text-muted-foreground mt-2 line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: currentFilters?.query 
                  ? conv.preview.replace(
                      new RegExp(`(${escapeRegExp(currentFilters.query)})`, 'gi'),
                      '<mark>$1</mark>'
                    )
                  : conv.preview 
              }}
            />
          )}

          {/* Matching messages snippet */}
          {isSearchResult && 'matchingMessages' in conv && conv.matchingMessages.length > 0 && (
            <div className="mt-2 space-y-1">
              {conv.matchingMessages.slice(0, 2).map((msg, idx) => (
                <div key={idx} className="text-xs bg-muted/50 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {msg.role === 'USER' ? 'Você' : 'IA'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p 
                    className="line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: currentFilters?.query 
                        ? msg.content.replace(
                            new RegExp(`(${escapeRegExp(currentFilters.query)})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        : msg.content 
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {editingId === conv.id ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  saveRenaming(conv.id)
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  cancelRenaming()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  startRenaming(conv)
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(conv.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Helper function to escape regex special characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with New Conversation Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full mb-4"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>

        {/* Search Component */}
        <ConversationSearch 
          onSearch={handleSearch}
          isLoading={searchLoading}
          className="mb-0"
        />
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Loading State */}
          {(loading || searchLoading) && (
            <div className="text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                {searchLoading ? 'Buscando...' : 'Carregando conversas...'}
              </div>
            </div>
          )}

          {/* Search Mode */}
          {isSearchMode && !searchLoading && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">
                  Resultados da Busca
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {searchResults.length}
                </Badge>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa encontrada</p>
                  <p className="text-xs mt-1">
                    Tente ajustar os filtros de busca
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(conv => renderConversationItem(conv, true))}
                </div>
              )}
            </div>
          )}

          {/* Normal Mode */}
          {!isSearchMode && !loading && (
            <>
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa ainda</p>
                  <p className="text-xs mt-1">
                    Comece uma nova conversa para aparecer aqui
                  </p>
                </div>
              ) : (
                Object.entries(groupedConversations).map(([dateGroup, convs]) => (
                  <div key={dateGroup}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {dateGroup}
                      <Badge variant="outline" className="text-xs">
                        {convs.length}
                      </Badge>
                    </h3>
                    <div className="space-y-2">
                      {convs.map(conv => renderConversationItem(conv))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}