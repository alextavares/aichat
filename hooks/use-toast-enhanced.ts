"use client"

import { useState, useCallback } from 'react'
import { ToastProps, ToastType, toastVariants } from '@/components/ui/toast-enhanced'

interface ToastOptions {
  type?: ToastType
  title: string
  description?: string
  duration?: number
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  position?: ToastProps['position']
}

export function useToastEnhanced() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback((options: ToastOptions | ((typeof toastVariants)[keyof typeof toastVariants])) => {
    const id = Date.now().toString()
    
    // If it's a function from toastVariants, call it
    const toastConfig = typeof options === 'function' ? options() : options

    const newToast: ToastProps = {
      id,
      type: toastConfig.type || 'info',
      title: toastConfig.title,
      description: toastConfig.description,
      duration: toastConfig.duration ?? 5000,
      icon: toastConfig.icon,
      action: toastConfig.action,
      onClose: () => removeToast(id),
      className: (toastConfig as any).className,
      position: (toastConfig as any).position
    }

    setToasts((prev) => [...prev, newToast])

    // Return dismiss function
    return {
      dismiss: () => removeToast(id),
      update: (updates: Partial<ToastOptions>) => updateToast(id, updates)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id
          ? { ...toast, ...updates }
          : toast
      )
    )
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((title: string, description?: string) => {
    return toast({ type: 'success', title, description })
  }, [toast])

  const error = useCallback((title: string, description?: string) => {
    return toast({ type: 'error', title, description })
  }, [toast])

  const warning = useCallback((title: string, description?: string) => {
    return toast({ type: 'warning', title, description })
  }, [toast])

  const info = useCallback((title: string, description?: string) => {
    return toast({ type: 'info', title, description })
  }, [toast])

  const loading = useCallback((title: string, description?: string) => {
    return toast({ type: 'loading', title, description, duration: 0 })
  }, [toast])

  // Promise-based toast
  const promise = useCallback(async <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    const toastRef = loading(options.loading)

    try {
      const data = await promise
      const successMessage = typeof options.success === 'function' ? options.success(data) : options.success
      toastRef.update({ type: 'success', title: successMessage, duration: 5000 })
      return data
    } catch (error) {
      const errorMessage = typeof options.error === 'function' ? options.error(error) : options.error
      toastRef.update({ type: 'error', title: errorMessage, duration: 5000 })
      throw error
    }
  }, [loading])

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismissAll,
    // Pre-configured variants
    ...Object.fromEntries(
      Object.entries(toastVariants).map(([key, variant]) => [
        key,
        (...args: any[]) => toast(variant(...args))
      ])
    )
  }
}