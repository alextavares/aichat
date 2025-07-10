"use client"

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Paperclip, X, FileText, Image, Loader2 } from 'lucide-react'
import { FileAttachment } from '@/types/chat'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  attachments: FileAttachment[]
  isUploading: boolean
  onFilesAdd: (files: FileList) => void
  onRemoveAttachment: (id: string) => void
  formatFileSize: (bytes: number) => string
  className?: string
}

export function FileUploader({
  attachments,
  isUploading,
  onFilesAdd,
  onRemoveAttachment,
  formatFileSize,
  className
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesAdd(files)
    }
    // Reset the input to allow selecting the same file again
    e.target.value = ''
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getFilePreview = (attachment: FileAttachment) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <div className="w-12 h-12 rounded border overflow-hidden bg-muted">
          <img
            src={attachment.content}
            alt={attachment.name}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
    
    return (
      <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center">
        {getFileIcon(attachment.type)}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.txt,.pdf,.doc,.docx,.csv"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {isUploading ? 'Processando...' : 'Anexar Arquivos'}
        </Button>
        
        {attachments.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {attachments.length} arquivo{attachments.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Arquivos Anexados</p>
              <Badge variant="outline" className="text-xs">
                {attachments.length}/{10} {/* Assuming max 10 files */}
              </Badge>
            </div>
            
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                  >
                    {getFilePreview(attachment)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {attachment.type.split('/')[1]?.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveAttachment(attachment.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Tipos suportados: Imagens (PNG, JPEG, GIF, WebP) e Documentos (TXT, PDF, DOCX, CSV)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}