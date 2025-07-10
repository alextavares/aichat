import { useState, useCallback } from 'react'
import { FileAttachment } from '@/types/chat'
import { toast } from '@/hooks/use-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv'
]

export function useFileUpload() {
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const processFile = useCallback(async (file: File): Promise<FileAttachment | null> => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      })
      return null
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type)
    
    if (!isImage && !isDocument) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Apenas imagens (PNG, JPEG, GIF, WebP) e documentos (TXT, PDF, DOCX, CSV) são permitidos.",
        variant: "destructive",
      })
      return null
    }

    try {
      let content: string
      
      if (isImage) {
        // Convert image to base64
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      } else {
        // Read document as text
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsText(file)
        })
      }

      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        content
      }
    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível processar o arquivo selecionado.",
        variant: "destructive",
      })
      return null
    }
  }, [])

  const addFiles = useCallback(async (files: FileList) => {
    setIsUploading(true)
    
    try {
      const newAttachments: FileAttachment[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const attachment = await processFile(file)
        if (attachment) {
          newAttachments.push(attachment)
        }
      }
      
      setAttachments(prev => [...prev, ...newAttachments])
      
      if (newAttachments.length > 0) {
        toast({
          title: "Arquivos adicionados",
          description: `${newAttachments.length} arquivo(s) adicionado(s) com sucesso.`,
        })
      }
    } finally {
      setIsUploading(false)
    }
  }, [processFile])

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachments([])
  }, [])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    attachments,
    isUploading,
    addFiles,
    removeAttachment,
    clearAttachments,
    formatFileSize
  }
}