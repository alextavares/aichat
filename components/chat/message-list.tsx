"use client"

import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ArrowDown, MessageSquare } from 'lucide-react'
import { Message } from '@/types/chat'
import { MessageItem } from './message-item'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: Message[]
  isStreaming?: boolean
  streamingMessageId?: string | null
  onRegenerate?: (messageId: string) => void
  onExportMessage?: (messageId: string) => void
  className?: string
}

export function MessageList({
  messages,
  isStreaming = false,
  streamingMessageId,
  onRegenerate,
  onExportMessage,
  className
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isStreaming])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleRegenerate = (messageId: string) => {
    onRegenerate?.(messageId)
  }

  const handleExportMessage = (messageId: string) => {
    onExportMessage?.(messageId)
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Comece uma conversa</h3>
            <p className="text-muted-foreground text-sm">
              Digite sua mensagem abaixo para começar a conversar com a IA. 
              Você pode enviar texto, fazer perguntas ou anexar arquivos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col flex-1 relative", className)}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="space-y-6 py-4">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.id === streamingMessageId}
              onRegenerate={() => handleRegenerate(message.id)}
              onExport={() => handleExportMessage(message.id)}
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
            />
          ))}
          
          {/* Spacer for scroll */}
          <div ref={bottomRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={scrollToBottom}
          className="rounded-full h-8 w-8 p-0 shadow-lg"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}