"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  modelUsed: string
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
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
  }

  const deleteConversation = async (conversationId: string) => {
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full"
          variant="outline"
        >
          + Nova Conversa
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Carregando conversas...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Nenhuma conversa ainda
            </div>
          ) : (
            Object.entries(groupedConversations).map(([dateGroup, convs]) => (
              <div key={dateGroup}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {dateGroup}
                </h3>
                <div className="space-y-1">
                  {convs.map(conv => (
                    <div
                      key={conv.id}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-colors
                        ${currentConversationId === conv.id 
                          ? 'bg-accent' 
                          : 'hover:bg-accent/50'
                        }
                      `}
                      onClick={() => onSelectConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-2">
                          <p className="text-sm font-medium line-clamp-1">
                            {conv.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conv.modelUsed} • {format(conv.updatedAt, "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conv.id)
                          }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}