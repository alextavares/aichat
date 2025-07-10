"use client"

import React, { createContext, useContext } from 'react'
import { ToastContainer } from '@/components/ui/toast-enhanced'
import { useToastEnhanced } from '@/hooks/use-toast-enhanced'

const ToastContext = createContext<ReturnType<typeof useToastEnhanced> | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastMethods = useToastEnhanced()

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer toasts={toastMethods.toasts} position="top-right" />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}