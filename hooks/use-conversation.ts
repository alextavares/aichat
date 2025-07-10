import { useState, useCallback } from 'react'
import { Message } from '@/types/chat'
import { toast } from '@/hooks/use-toast'

export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (response.ok) {
        const conversation = await response.json()
        setConversationId(id)
        setMessages(conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          model: msg.modelUsed,
          tokensUsed: msg.tokensUsed,
        })))
        return conversation
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa.",
        variant: "destructive",
      })
    }
  }, [])

  const saveConversation = useCallback(async (updatedMessages: Message[], modelUsed: string) => {
    try {
      const messageData = updatedMessages.map(msg => ({
        role: msg.role.toUpperCase(),
        content: msg.content,
        modelUsed: msg.model || modelUsed,
        tokensUsed: msg.tokensUsed || 0,
      }))

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messages: messageData,
          modelUsed,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (!conversationId) {
          setConversationId(data.id)
        }
        return data
      }
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  }, [conversationId])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content
        }
      }
      return updated
    })
  }, [])

  return {
    messages,
    conversationId,
    isLoading,
    setIsLoading,
    loadConversation,
    saveConversation,
    startNewConversation,
    addMessage,
    updateLastMessage,
    setMessages
  }
}