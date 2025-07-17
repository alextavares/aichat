"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  MessageSquare, 
  Image, 
  Mic,
  Gift,
  RefreshCw,
  ChevronRight
} from 'lucide-react'

interface CreditTransaction {
  id: string
  type: 'PURCHASE' | 'CONSUMPTION' | 'BONUS' | 'REFUND'
  amount: number
  description: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
  package?: {
    name: string
    credits: number
  }
}

const TransactionIcon = ({ type, description }: { type: string; description: string }) => {
  if (type === 'PURCHASE') return <ShoppingCart className="h-4 w-4 text-green-400" />
  if (type === 'BONUS') return <Gift className="h-4 w-4 text-purple-400" />
  if (type === 'REFUND') return <RefreshCw className="h-4 w-4 text-blue-400" />
  
  // For consumption, try to detect the type from description
  if (description.toLowerCase().includes('chat') || description.toLowerCase().includes('conversa')) {
    return <MessageSquare className="h-4 w-4 text-orange-400" />
  }
  if (description.toLowerCase().includes('imagem')) {
    return <Image className="h-4 w-4 text-blue-400" />
  }
  if (description.toLowerCase().includes('voz') || description.toLowerCase().includes('voice')) {
    return <Mic className="h-4 w-4 text-pink-400" />
  }
  
  return <TrendingDown className="h-4 w-4 text-red-400" />
}

const TransactionBadge = ({ type }: { type: string }) => {
  const variants = {
    PURCHASE: 'bg-green-500/10 text-green-400 border-green-500/20',
    CONSUMPTION: 'bg-red-500/10 text-red-400 border-red-500/20',
    BONUS: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    REFUND: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }
  
  const labels = {
    PURCHASE: 'Compra',
    CONSUMPTION: 'Consumo',
    BONUS: 'Bônus',
    REFUND: 'Reembolso'
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`${variants[type as keyof typeof variants]} border text-xs`}
    >
      {labels[type as keyof typeof labels]}
    </Badge>
  )
}

export function CreditTransactionList() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions()
    }
  }, [session])

  const fetchTransactions = async (offset = 0) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/credits/history?limit=20&offset=${offset}`)
      if (response.ok) {
        const data = await response.json()
        
        if (offset === 0) {
          setTransactions(data.transactions)
        } else {
          setTransactions(prev => [...prev, ...data.transactions])
        }
        
        setHasMore(data.transactions.length === 20)
        setPage(Math.floor(offset / 20) + 1)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchTransactions(page * 20)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0
    return (
      <span className={`flex items-center gap-1 font-medium ${
        isPositive ? 'text-green-400' : 'text-red-400'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isPositive ? '+' : ''}{amount.toLocaleString('pt-BR')}
      </span>
    )
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-600 rounded w-1/3"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-600 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Nenhuma transação encontrada</h3>
        <p className="text-gray-400 mb-4">
          Suas transações de créditos aparecerão aqui conforme você usar a plataforma
        </p>
        <Button asChild variant="outline" className="text-purple-400 border-purple-500/30">
          <a href="/dashboard/credits/purchase">Comprar Créditos</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id}
          className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer group"
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gray-600/50 rounded-full flex items-center justify-center">
            <TransactionIcon type={transaction.type} description={transaction.description} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-white truncate">
                {transaction.description}
              </h4>
              <TransactionBadge type={transaction.type} />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{formatDate(transaction.createdAt)}</span>
              {transaction.package && (
                <span className="text-purple-400">
                  {transaction.package.name}
                </span>
              )}
            </div>
          </div>
          
          {/* Amount and Balance */}
          <div className="flex-shrink-0 text-right">
            <div className="mb-1">
              {formatAmount(transaction.amount)}
            </div>
            <div className="text-xs text-gray-400">
              Saldo: {transaction.balanceAfter.toLocaleString('pt-BR')}
            </div>
          </div>
          
          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>
      ))}
      
      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button 
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            {isLoading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  )
}