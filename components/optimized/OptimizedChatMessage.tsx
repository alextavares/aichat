import { memo, useCallback } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Copy, Check, Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  model?: string
}

interface OptimizedChatMessageProps {
  message: Message
  copiedId: string | null
  onCopy: (id: string, content: string) => void
}

// Memoized chat message component for better performance
export const OptimizedChatMessage = memo(function ChatMessage({ 
  message, 
  copiedId, 
  onCopy 
}: OptimizedChatMessageProps) {
  const handleCopy = useCallback(() => {
    onCopy(message.id, message.content)
  }, [message.id, message.content, onCopy])

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isCopied = copiedId === message.id

  return (
    <div className="flex gap-3 mb-6">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'Você' : 'Assistente'}
          </span>
          {isAssistant && message.model && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {message.model}
            </span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {isAssistant && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="ml-1 text-xs">
                {isCopied ? 'Copiado!' : 'Copiar'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})

// Memoized messages list for better performance with large conversations
export const OptimizedMessagesList = memo(function MessagesList({
  messages,
  copiedId,
  onCopy,
}: {
  messages: Message[]
  copiedId: string | null
  onCopy: (id: string, content: string) => void
}) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <OptimizedChatMessage
          key={message.id}
          message={message}
          copiedId={copiedId}
          onCopy={onCopy}
        />
      ))}
    </div>
  )
})