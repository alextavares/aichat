import { useState, useCallback } from 'react'
import { FileAttachment } from '@/types/chat'
import { toast } from '@/hooks/use-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB for images (will be compressed if larger)
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

  const validateFileType = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer
        const bytes = new Uint8Array(buffer, 0, 4)
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
        
        // Check magic numbers for common file types
        const magicNumbers: { [key: string]: string[] } = {
          'image/jpeg': ['ffd8ff'],
          'image/png': ['89504e47'],
          'image/gif': ['47494638'],
          'image/webp': ['52494646'],
          'application/pdf': ['25504446'],
          'text/plain': [], // Text files don't have consistent magic numbers
          'application/msword': ['d0cf11e0'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504b0304'],
          'text/csv': [] // CSV files are text-based
        }
        
        const fileMagics = magicNumbers[file.type] || []
        
        // If no magic numbers defined (like for text files), trust the MIME type
        if (fileMagics.length === 0) {
          resolve(true)
          return
        }
        
        // Check if file header matches expected magic numbers
        const isValid = fileMagics.some(magic => hex.startsWith(magic))
        resolve(isValid)
      }
      reader.onerror = () => resolve(false)
      reader.readAsArrayBuffer(file.slice(0, 4))
    })
  }, [])

  const compressImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img
        const maxWidth = 1920
        const maxHeight = 1080
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Try different quality levels until file size is acceptable
        let quality = 0.8
        let dataUrl = canvas.toDataURL('image/jpeg', quality)
        
        // Reduce quality if still too large
        while (dataUrl.length > MAX_IMAGE_SIZE && quality > 0.1) {
          quality -= 0.1
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }
        
        resolve(dataUrl)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }, [])

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

    // Validate file content using magic numbers
    const isValidFile = await validateFileType(file)
    if (!isValidFile) {
      toast({
        title: "Arquivo inválido",
        description: "O arquivo não corresponde ao tipo esperado ou pode estar corrompido.",
        variant: "destructive",
      })
      return null
    }

    try {
      let content: string
      
      if (isImage) {
        // Check if image needs compression
        if (file.size > MAX_IMAGE_SIZE) {
          toast({
            title: "Comprimindo imagem",
            description: "A imagem está sendo otimizada para melhor performance.",
          })
          content = await compressImage(file)
        } else {
          // Convert image to base64
          content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        }
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