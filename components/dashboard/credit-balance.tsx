"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Coins, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface CreditBalanceProps {
  className?: string
}

export function CreditBalance({ className }: CreditBalanceProps) {
  const { data: session } = useSession()
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLowBalance, setIsLowBalance] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCreditBalance()
    }
  }, [session])

  const fetchCreditBalance = async () => {
    try {
      const response = await fetch('/api/credits/balance')
      if (response.ok) {
        const data = await response.json()
        setCreditBalance(data.balance)
        setIsLowBalance(data.balance < 100) // Low balance threshold
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-3 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Credit Balance Display */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Coins className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Créditos</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold text-purple-400">
                {creditBalance.toLocaleString('pt-BR')}
              </span>
              {isLowBalance && (
                <AlertCircle className="h-4 w-4 text-yellow-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Balance Warning */}
      {isLowBalance && (
        <div className="px-3 py-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <p className="text-xs text-yellow-300">
              Saldo baixo! Adicione créditos para continuar usando todas as funcionalidades.
            </p>
          </div>
        </div>
      )}

      {/* Add Credits Button */}
      <Button 
        asChild
        variant="outline" 
        className="w-full bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200"
      >
        <Link href="/dashboard/credits/purchase" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Créditos
        </Link>
      </Button>

      {/* Credit History Link */}
      <Link 
        href="/dashboard/credits/history" 
        className="block text-center text-xs text-gray-400 hover:text-purple-400 transition-colors"
      >
        Ver histórico de créditos
      </Link>
    </div>
  )
}