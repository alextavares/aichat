"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart,
  Activity
} from 'lucide-react'

interface CreditStats {
  currentBalance: number
  totalConsumed: number
  totalPurchased: number
}

export function CreditStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<CreditStats>({
    currentBalance: 0,
    totalConsumed: 0,
    totalPurchased: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      // For now, we'll use the balance endpoint and simulate other stats
      const response = await fetch('/api/credits/balance')
      if (response.ok) {
        const data = await response.json()
        setStats({
          currentBalance: data.balance,
          totalConsumed: 0, // TODO: Implement in backend
          totalPurchased: 0  // TODO: Implement in backend
        })
      }
    } catch (error) {
      console.error('Error fetching credit stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color 
  }: { 
    title: string
    value: number
    description: string
    icon: any
    color: string
  }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {isLoading ? (
            <div className="w-16 h-6 bg-gray-600 rounded animate-pulse"></div>
          ) : (
            value.toLocaleString('pt-BR')
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <>
      <StatCard
        title="Saldo Atual"
        value={stats.currentBalance}
        description="Créditos disponíveis"
        icon={Coins}
        color="text-purple-400"
      />
      
      <StatCard
        title="Total Consumido"
        value={stats.totalConsumed}
        description="Créditos utilizados"
        icon={TrendingDown}
        color="text-red-400"
      />
      
      <StatCard
        title="Total Comprado"
        value={stats.totalPurchased}
        description="Créditos adquiridos"
        icon={ShoppingCart}
        color="text-green-400"
      />
    </>
  )
}