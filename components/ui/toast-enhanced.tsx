"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Check,
  X,
  AlertCircle,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Copy,
  Download,
  Upload,
  Zap,
  Trophy,
  Gift,
  Bell
} from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  className?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const toastIcons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  loading: <Loader2 className="h-5 w-5 animate-spin" />
}

const toastColors = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  loading: 'bg-primary/10 text-primary border-primary/20',
  custom: 'bg-background border-border'
}

export function Toast({
  id,
  type,
  title,
  description,
  duration = 5000,
  icon,
  action,
  onClose,
  className,
  position = 'top-right'
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 10)

    // Auto close
    let closeTimer: NodeJS.Timeout
    if (type !== 'loading' && duration > 0) {
      closeTimer = setTimeout(() => handleClose(), duration)
    }

    return () => {
      clearTimeout(showTimer)
      clearTimeout(closeTimer)
    }
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300',
        toastColors[type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        position.includes('left') && (isVisible && !isLeaving ? 'translate-x-0' : '-translate-x-full'),
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 rounded-full p-1',
          type === 'custom' ? '' : 'animate-[fadeIn_0.5s_ease-out]'
        )}>
          {icon || toastIcons[type] || <Bell className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold leading-tight">
            {title}
          </p>
          {description && (
            <p className="text-sm opacity-90 leading-relaxed">
              {description}
            </p>
          )}
          
          {/* Action */}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs font-medium hover:underline focus:outline-none"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        {type !== 'loading' && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-foreground/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress bar for auto-close */}
      {type !== 'loading' && duration > 0 && (
        <div className="h-1 w-full bg-foreground/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current transition-all ease-linear"
            style={{
              width: '100%',
              animationName: 'shrink',
              animationDuration: `${duration}ms`,
              animationFillMode: 'forwards',
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Toast container component
interface ToastContainerProps {
  toasts: ToastProps[]
  position?: ToastProps['position']
}

export function ToastContainer({ toasts, position = 'top-right' }: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        positionClasses[position]
      )}
    >
      <div className="space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} position={position} />
        ))}
      </div>
    </div>
  )
}

// Pre-configured toast variants
export const toastVariants = {
  // Success variants
  copySuccess: (text?: string) => ({
    type: 'success' as ToastType,
    title: 'Copiado!',
    description: text || 'Conteúdo copiado para a área de transferência',
    icon: <Copy className="h-5 w-5" />,
    duration: 3000
  }),

  saveSuccess: () => ({
    type: 'success' as ToastType,
    title: 'Salvo com sucesso!',
    description: 'Suas alterações foram salvas',
    icon: <Check className="h-5 w-5" />,
    duration: 3000
  }),

  generateSuccess: () => ({
    type: 'success' as ToastType,
    title: 'Geração concluída!',
    description: 'Conteúdo gerado com sucesso',
    icon: <Sparkles className="h-5 w-5" />,
    duration: 4000
  }),

  downloadSuccess: (filename?: string) => ({
    type: 'success' as ToastType,
    title: 'Download concluído!',
    description: filename || 'Arquivo baixado com sucesso',
    icon: <Download className="h-5 w-5" />,
    duration: 3000
  }),

  uploadSuccess: (filename?: string) => ({
    type: 'success' as ToastType,
    title: 'Upload concluído!',
    description: filename || 'Arquivo enviado com sucesso',
    icon: <Upload className="h-5 w-5" />,
    duration: 3000
  }),

  // Error variants
  genericError: (message?: string) => ({
    type: 'error' as ToastType,
    title: 'Erro!',
    description: message || 'Algo deu errado. Tente novamente.',
    duration: 5000
  }),

  quotaExceeded: () => ({
    type: 'error' as ToastType,
    title: 'Limite excedido!',
    description: 'Você atingiu o limite do seu plano',
    icon: <AlertCircle className="h-5 w-5" />,
    duration: 6000,
    action: {
      label: 'Fazer upgrade',
      onClick: () => window.location.href = '/dashboard/upgrade'
    }
  }),

  networkError: () => ({
    type: 'error' as ToastType,
    title: 'Erro de conexão',
    description: 'Verifique sua internet e tente novamente',
    duration: 5000
  }),

  // Warning variants
  unsavedChanges: () => ({
    type: 'warning' as ToastType,
    title: 'Alterações não salvas',
    description: 'Você tem alterações que não foram salvas',
    duration: 0, // Don't auto-close
    action: {
      label: 'Salvar agora',
      onClick: () => console.log('Save')
    }
  }),

  // Info variants
  proFeature: (feature: string) => ({
    type: 'info' as ToastType,
    title: 'Recurso PRO',
    description: `${feature} está disponível no plano PRO`,
    icon: <Zap className="h-5 w-5" />,
    duration: 5000,
    action: {
      label: 'Ver planos',
      onClick: () => window.location.href = '/dashboard/pricing'
    }
  }),

  newFeature: (feature: string) => ({
    type: 'info' as ToastType,
    title: 'Nova funcionalidade!',
    description: feature,
    icon: <Gift className="h-5 w-5" />,
    duration: 6000
  }),

  // Loading variants
  generating: (what: string = 'conteúdo') => ({
    type: 'loading' as ToastType,
    title: `Gerando ${what}...`,
    description: 'Isso pode levar alguns segundos',
    duration: 0
  }),

  processing: () => ({
    type: 'loading' as ToastType,
    title: 'Processando...',
    description: 'Aguarde um momento',
    duration: 0
  }),

  uploading: (progress?: number) => ({
    type: 'loading' as ToastType,
    title: 'Enviando arquivo...',
    description: progress ? `${progress}% concluído` : 'Aguarde um momento',
    duration: 0
  }),

  // Custom celebration
  achievement: (title: string, description?: string) => ({
    type: 'custom' as ToastType,
    title,
    description,
    icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    duration: 6000,
    className: 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
  })
}