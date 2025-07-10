"use client"

import { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Paperclip, X, FileText, Image, Loader2, Upload, CloudUpload } from 'lucide-react'
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
  const [isDragActive, setIsDragActive] = useState(false)

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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFilesAdd(files)
    }
  }, [onFilesAdd])

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

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragActive 
            ? "border-primary bg-primary/5 text-primary" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
        onClick={!isUploading ? handleFileSelect : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : isDragActive ? (
            <CloudUpload className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isUploading 
                ? 'Processando arquivos...' 
                : isDragActive 
                  ? 'Solte os arquivos aqui' 
                  : 'Arraste arquivos aqui ou clique para selecionar'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPEG, GIF, WebP, TXT, PDF, DOCX, CSV (máx. 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Button (Alternative) */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="gap-2"
        >
          <Paperclip className="h-4 w-4" />
          Ou escolher arquivos
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