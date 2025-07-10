import { useState, useCallback } from 'react'
import { Message } from '@/types/chat'
import { toast } from '@/hooks/use-toast'

export function useChatStreaming() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  const sendMessage = useCallback(async (
    userMessage: Message,
    model: string,
    conversationId: string | null,
    onMessageUpdate: (content: string) => void,
    onComplete: (finalMessage: Message, tokensUsed?: number) => void
  ) => {
    setIsStreaming(true)
    const assistantMessageId = crypto.randomUUID()
    setStreamingMessageId(assistantMessageId)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          model,
          conversationId,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response reader available')
      }

      let accumulatedContent = ''
      let tokensUsed = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.content) {
                accumulatedContent += parsed.content
                onMessageUpdate(accumulatedContent)
              }
              
              if (parsed.tokens) {
                tokensUsed = parsed.tokens
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }

      const finalMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: accumulatedContent,
        timestamp: new Date(),
        model,
        tokensUsed
      }

      onComplete(finalMessage, tokensUsed)
    } catch (error) {
      console.error('Streaming error:', error)
      toast({
        title: "Erro na resposta",
        description: "Não foi possível obter resposta da IA. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsStreaming(false)
      setStreamingMessageId(null)
    }
  }, [])

  return {
    isStreaming,
    streamingMessageId,
    sendMessage
  }
}