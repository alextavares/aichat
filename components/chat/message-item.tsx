"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Bot, 
  User, 
  MoreVertical, 
  RotateCcw,
  Download
} from 'lucide-react'
import { Message } from '@/types/chat'
import { MarkdownRenderer } from './markdown-renderer'
import { CopyButton } from './copy-button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MessageItemProps {
  message: Message
  isStreaming?: boolean
  onRegenerate?: () => void
  onExport?: () => void
  className?: string
}

export function MessageItem({ 
  message, 
  isStreaming = false,
  onRegenerate,
  onExport,
  className 
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const isAssistant = message.role === 'assistant'
  const isUser = message.role === 'user'

  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, "HH:mm", { locale: ptBR })
  }

  const exportMessage = () => {
    const messageData = {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      model: message.model,
      tokensUsed: message.tokensUsed
    }

    const blob = new Blob([JSON.stringify(messageData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `message-${message.id}-${format(message.timestamp, 'yyyy-MM-dd-HH-mm')}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    onExport?.()
  }

  return (
    <div 
      className={cn(
        "group flex gap-3 transition-colors",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
        {/* Message Card */}
        <Card className={cn(
          "relative transition-all",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted/50",
          isStreaming && "animate-pulse"
        )}>
          <CardContent className="p-3 relative">
            {/* Content */}
            <div className="prose prose-sm max-w-none">
              {isUser ? (
                <p className="whitespace-pre-wrap m-0">{message.content}</p>
              ) : (
                <MarkdownRenderer 
                  content={message.content}
                  className={isStreaming ? "opacity-75" : ""}
                />
              )}
            </div>

            {/* Message Actions - Show on hover */}
            {showActions && !isStreaming && (
              <div className="absolute -top-2 right-2 flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
                <CopyButton 
                  text={message.content}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAssistant && onRegenerate && (
                      <DropdownMenuItem onClick={onRegenerate}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regenerar resposta
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={exportMessage}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar mensagem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Metadata */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isUser && "flex-row-reverse"
        )}>
          <span>{formatTimestamp(message.timestamp)}</span>
          
          {message.model && (
            <Badge variant="outline" className="text-xs py-0 px-1.5">
              {message.model}
            </Badge>
          )}
          
          {message.tokensUsed && (
            <Badge variant="secondary" className="text-xs py-0 px-1.5">
              {message.tokensUsed} tokens
            </Badge>
          )}
          
          {isStreaming && (
            <Badge variant="secondary" className="text-xs py-0 px-1.5 animate-pulse">
              Digitando...
            </Badge>
          )}
        </div>

        {/* File Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-full">
            {message.attachments.map((attachment) => (
              <Card key={attachment.id} className="border-dashed">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2 text-xs">
                    {attachment.type.startsWith('image/') ? (
                      <div className="w-8 h-8 rounded border overflow-hidden">
                        <img
                          src={attachment.content}
                          alt={attachment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center">
                        📄
                      </div>
                    )}
                    <div>
                      <p className="font-medium truncate max-w-[100px]">
                        {attachment.name}
                      </p>
                      <p className="text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}