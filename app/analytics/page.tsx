'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface UsageStats {
  today: {
    messages: number
    tokens: number
    cost: number
  }
  thisMonth: {
    messages: number
    tokens: number
    cost: number
  }
  dailyUsage: Array<{
    date: string
    messages: number
    tokens: number
    cost: number
  }>
  modelUsage: Array<{
    model: string
    messages: number
    tokens: number
    cost: number
  }>
}

interface PlanInfo {
  type: string
  dailyLimit: number | null
  monthlyLimit: number | null
  features: string[]
}

export default function Analytics() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsResponse, planResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/plan')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (planResponse.ok) {
        const planData = await planResponse.json()
        setPlanInfo(planData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Por favor, faça login para acessar as analytics.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe seu uso da plataforma Inner AI
        </p>
      </div>

      {/* Plan Info */}
      {planInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Plano Atual</h2>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              {planInfo.type}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Limite Diário</p>
              <p className="text-2xl font-bold">
                {planInfo.dailyLimit ? `${planInfo.dailyLimit} msg` : 'Ilimitado'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Limite Mensal</p>
              <p className="text-2xl font-bold">
                {planInfo.monthlyLimit ? `${planInfo.monthlyLimit} tokens` : 'Ilimitado'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Recursos</p>
              <p className="text-lg font-medium">{planInfo.features.length} recursos</p>
            </div>
          </div>

          {planInfo.type === 'FREE' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                🚀 Upgrade para PRO e tenha acesso a modelos mais avançados, mais mensagens e recursos exclusivos!
              </p>
              <Button className="mt-2" size="sm">
                Fazer Upgrade
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Usage Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Today's Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Uso Hoje</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mensagens</span>
                <span className="font-medium">{stats.today.messages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tokens</span>
                <span className="font-medium">{stats.today.tokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Custo</span>
                <span className="font-medium">R$ {stats.today.cost.toFixed(4)}</span>
              </div>
            </div>
            
            {planInfo?.dailyLimit && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Limite diário</span>
                  <span>{stats.today.messages}/{planInfo.dailyLimit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stats.today.messages / planInfo.dailyLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Este Mês</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mensagens</span>
                <span className="font-medium">{stats.thisMonth.messages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tokens</span>
                <span className="font-medium">{stats.thisMonth.tokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Custo</span>
                <span className="font-medium">R$ {stats.thisMonth.cost.toFixed(2)}</span>
              </div>
            </div>

            {planInfo?.monthlyLimit && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Limite mensal</span>
                  <span>{stats.thisMonth.tokens.toLocaleString()}/{planInfo.monthlyLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stats.thisMonth.tokens / planInfo.monthlyLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage by Model */}
      {stats?.modelUsage && stats.modelUsage.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Uso por Modelo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Modelo</th>
                  <th className="px-4 py-2 text-right">Mensagens</th>
                  <th className="px-4 py-2 text-right">Tokens</th>
                  <th className="px-4 py-2 text-right">Custo</th>
                </tr>
              </thead>
              <tbody>
                {stats.modelUsage.map((usage, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 font-medium">{usage.model}</td>
                    <td className="px-4 py-2 text-right">{usage.messages}</td>
                    <td className="px-4 py-2 text-right">{usage.tokens.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">R$ {usage.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Usage Chart */}
      {stats?.dailyUsage && stats.dailyUsage.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Uso Diário (Últimos 7 dias)</h3>
          <div className="space-y-2">
            {stats.dailyUsage.slice(-7).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">{new Date(day.date).toLocaleDateString('pt-BR')}</span>
                <div className="flex gap-4 text-sm">
                  <span>{day.messages} msg</span>
                  <span>{day.tokens} tokens</span>
                  <span>R$ {day.cost.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}