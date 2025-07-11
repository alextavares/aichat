"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Coins, 
  Zap, 
  TrendingUp, 
  Info,
  AlertTriangle,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UsageData {
  planType: string
  tokensUsed: number
  tokensLimit: number
  messagesUsed: number
  messagesLimit: number
  monthlyCost: number
  resetDate: string
}

interface UsageIndicatorProps {
  className?: string
  compact?: boolean
}

export function UsageIndicator({ className, compact = false }: UsageIndicatorProps) {
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/usage')
        if (response.ok) {
          const data = await response.json()
          setUsage(data)
        }
      } catch (error) {
        console.error('Failed to load usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsage()
  }, [session])

  if (!session?.user || loading) {
    return null
  }

  if (!usage) {
    return (
      <div className={cn("text-center text-sm text-gray-500", className)}>
        Failed to load usage data
      </div>
    )
  }

  const tokenProgress = usage.tokensLimit ? (usage.tokensUsed / usage.tokensLimit) * 100 : 0
  const messageProgress = usage.messagesLimit ? (usage.messagesUsed / usage.messagesLimit) * 100 : 0
  
  const isNearLimit = tokenProgress > 80 || messageProgress > 80
  const isPremium = usage.planType !== 'FREE'

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Coins className="w-4 h-4 text-blue-600" />
        <span className="text-gray-600">
          {usage.tokensUsed.toLocaleString()} tokens
        </span>
        {isNearLimit && (
          <Badge variant="destructive" className="text-xs">
            {Math.round(100 - tokenProgress)}% left
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isPremium ? (
              <Crown className="w-5 h-5 text-yellow-600" />
            ) : (
              <Coins className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-semibold text-gray-900">
              Plano {usage.planType === 'FREE' ? 'Gratuito' : usage.planType}
            </span>
          </div>
          
          {isNearLimit && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Limite próximo
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {/* Tokens Usage */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Tokens utilizados</span>
              <span className="font-medium">
                {usage.tokensUsed.toLocaleString()} / {usage.tokensLimit === 999999999 ? '∞' : usage.tokensLimit.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={tokenProgress} 
              className={cn(
                "h-2",
                tokenProgress > 90 ? "bg-red-100" : tokenProgress > 70 ? "bg-yellow-100" : "bg-blue-100"
              )}
            />
          </div>

          {/* Messages Usage */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Mensagens hoje</span>
              <span className="font-medium">
                {usage.messagesUsed} / {usage.messagesLimit === 999999 ? '∞' : usage.messagesLimit}
              </span>
            </div>
            <Progress 
              value={messageProgress} 
              className={cn(
                "h-2",
                messageProgress > 90 ? "bg-red-100" : messageProgress > 70 ? "bg-yellow-100" : "bg-green-100"
              )}
            />
          </div>

          {/* Cost Information */}
          {usage.monthlyCost > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Custo mensal</span>
              <span className="font-semibold text-green-600">
                R$ {usage.monthlyCost.toFixed(2)}
              </span>
            </div>
          )}

          {/* Reset Information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Redefine em: {new Date(usage.resetDate).toLocaleDateString()}</span>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Info className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Upgrade CTA */}
        {usage.planType === 'FREE' && (isNearLimit || tokenProgress > 50) && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Precisa de mais tokens?
                </p>
                <p className="text-xs text-gray-600">
                  Upgrade para tokens ilimitados
                </p>
              </div>
              <Link href="/pricing">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}