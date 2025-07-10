"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, StopCircle, Plus } from 'lucide-react'
import { FileAttachment } from '@/types/chat'
import { FileUploader } from './file-uploader'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop?: () => void
  attachments: FileAttachment[]
  onAddFiles: (files: FileList) => void
  onRemoveAttachment: (id: string) => void
  formatFileSize: (bytes: number) => string
  isLoading?: boolean
  isStreaming?: boolean
  isFileUploading?: boolean
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  attachments,
  onAddFiles,
  onRemoveAttachment,
  formatFileSize,
  isLoading = false,
  isStreaming = false,
  isFileUploading = false,
  disabled = false,
  placeholder = "Digite sua mensagem...",
  maxLength = 4000,
  className
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showFileUploader, setShowFileUploader] = useState(false)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [value])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !isLoading && !isStreaming && value.trim()) {
        onSend()
      }
    }
  }

  const handleSend = () => {
    if (!disabled && !isLoading && !isStreaming && value.trim()) {
      onSend()
    }
  }

  const handleStop = () => {
    if (isStreaming && onStop) {
      onStop()
    }
  }

  const canSend = !disabled && !isLoading && !isStreaming && value.trim().length > 0
  const canStop = isStreaming && onStop

  return (
    <Card className={cn("border-t-0 rounded-t-none", className)}>
      <CardContent className="p-4 space-y-3">
        {/* File Attachments Display */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <Badge
                key={attachment.id}
                variant="secondary"
                className="gap-1 py-1 px-2"
              >
                <span className="truncate max-w-[100px]">{attachment.name}</span>
                <span className="text-xs opacity-70">
                  ({formatFileSize(attachment.size)})
                </span>
                <button
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* File Uploader */}
        {showFileUploader && (
          <FileUploader
            attachments={attachments}
            isUploading={isFileUploading}
            onFilesAdd={onAddFiles}
            onRemoveAttachment={onRemoveAttachment}
            formatFileSize={formatFileSize}
          />
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFileUploader(!showFileUploader)}
            disabled={disabled || isLoading || isStreaming}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              className="min-h-[44px] max-h-[200px] resize-none pr-12"
              rows={1}
            />
            
            {/* Character Count */}
            {value.length > 0 && (
              <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                {value.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send/Stop Button */}
          <div className="shrink-0">
            {canStop ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleStop}
                className="gap-1"
              >
                <StopCircle className="h-4 w-4" />
                Parar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                size="sm"
                className="gap-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isLoading ? 'Enviando...' : 'Enviar'}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
          {(isLoading || isStreaming) && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{isStreaming ? 'Recebendo resposta...' : 'Processando...'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}