import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

export interface AppError {
  message: string
  code?: string
  details?: any
}

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((error: any) => {
    console.error('Error:', error)
    
    let errorMessage = 'Ocorreu um erro inesperado'
    let errorCode: string | undefined
    
    // Handle different error types
    if (error.response) {
      // API error response
      const data = error.response.data
      errorMessage = data.message || data.error || errorMessage
      errorCode = data.code
      
      // Specific error handling
      switch (error.response.status) {
        case 400:
          errorMessage = data.message || 'Dados inválidos. Verifique as informações fornecidas.'
          break
        case 401:
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.'
          break
        case 403:
          errorMessage = 'Você não tem permissão para realizar esta ação.'
          break
        case 404:
          errorMessage = 'Recurso não encontrado.'
          break
        case 429:
          errorMessage = 'Muitas tentativas. Por favor, aguarde um momento.'
          break
        case 500:
          errorMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.'
          break
        case 503:
          errorMessage = 'Serviço temporariamente indisponível. Por favor, tente novamente.'
          break
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Erro de conexão. Verifique sua internet.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    const appError: AppError = {
      message: errorMessage,
      code: errorCode,
      details: error
    }
    
    setError(appError)
    return appError
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const executeAsync = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options?: {
      showToast?: boolean
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
    }
  ): Promise<T | null> => {
    setIsLoading(true)
    clearError()
    
    try {
      const result = await asyncFn()
      
      if (options?.showToast && options?.successMessage) {
        toast({
          title: "Sucesso",
          description: options.successMessage,
        })
      }
      
      return result
    } catch (err) {
      const appError = handleError(err)
      
      if (options?.showToast) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: options?.errorMessage || appError.message,
        })
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError, clearError])

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync
  }
}