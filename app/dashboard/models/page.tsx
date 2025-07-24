"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  Zap,
  TrendingUp,
  Clock,
  Coins,
  Info,
  Check,
  Lock,
  Sparkles,
  Activity,
  BarChart3,
  MessageSquare,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { PLAN_LIMITS } from '@/lib/usage-limits'

interface AIModel {
  id: string
  name: string
  provider: string
  category: string
  description: string
  contextWindow: number
  costPer1kTokens: {
    input: number
    output: number
  }
  features: string[]
  planRequired: 'FREE' | 'PRO' | 'ENTERPRISE'
  isAvailable: boolean
  performance: {
    speed: 'fast' | 'medium' | 'slow'
    quality: 'good' | 'excellent' | 'superior'
  }
}

interface ModelUsage {
  modelId: string
  messagesCount: number
  tokensUsed: number
  cost: number
}

import { INNERAI_MODELS } from '@/lib/ai/innerai-models-config'

export default function ModelsPage() {
  const { data: session } = useSession()
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fast' | 'advanced' | 'credit'>('all')
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE')

  const fetchModelUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/models/usage')
      if (response.ok) {
        const data = await response.json()
        setModelUsage(data.usage || [])
      }
    } catch (error) {
      console.error('Error fetching model usage:', error)
    }
  }, [])

  const fetchUserPlan = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserPlan(data.planType || 'FREE')
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }, [])

  useEffect(() => {
    fetchModelUsage()
    fetchUserPlan()
  }, [fetchModelUsage, fetchUserPlan])

  const getUsageForModel = (modelId: string) => {
    return modelUsage.find(u => u.modelId === modelId) || {
      modelId,
      messagesCount: 0,
      tokensUsed: 0,
      cost: 0,
    }
  }

  const filteredModels = INNERAI_MODELS.filter(model => {
    if (selectedCategory === 'all') return true
    return model.category === selectedCategory
  })
  
  const availableModels = filteredModels.filter(model => model.isAvailable)
  const unavailableModels = filteredModels.filter(model => !model.isAvailable)
  
  // Get unique categories
  const categories = ['all', 'fast', 'advanced', 'credit']

  const canUseModel = (model: any) => {
    if (model.planRequired === 'FREE') return true
    if (model.planRequired === 'PRO' && (userPlan === 'PRO' || userPlan === 'ENTERPRISE')) return true
    if (model.planRequired === 'ENTERPRISE' && userPlan === 'ENTERPRISE') return true
    return false
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fast': return 'Modelos Rápidos'
      case 'advanced': return 'Modelos Avançados'
      case 'credit': return 'Modelos de Crédito'
      default: return 'Todos os Modelos'
    }
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'fast': return 'Modelos otimizados para velocidade e eficiência'
      case 'advanced': return 'Modelos premium com máxima qualidade'
      case 'credit': return 'Modelos para geração de mídia (imagens, vídeos, áudio)'
      default: return 'Todos os modelos de IA disponíveis'
    }
  }

  const getPerformanceColor = (value: string) => {
    const numValue = value === 'superior' ? 10 : value === 'excellent' ? 8 : value === 'good' ? 6 : 4
    if (numValue >= 8) return 'text-green-500'
    if (numValue >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getPerformanceValue = (value: string) => {
    return value === 'superior' ? 'superior/10' : 
           value === 'excellent' ? 'excellent/10' : 
           value === 'good' ? 'good/10' : 
           value === 'fast' ? 'fast/10' : 
           value === 'medium' ? 'medium/10' : 
           value === 'slow' ? 'slow/10' : value
  }

  const totalUsage = modelUsage.reduce((acc, usage) => ({
    messages: acc.messages + usage.messagesCount,
    tokens: acc.tokens + usage.tokensUsed,
    cost: acc.cost + usage.cost,
  }), { messages: 0, tokens: 0, cost: 0 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getCategoryLabel(selectedCategory)}
        </h1>
        <p className="text-muted-foreground">
          {getCategoryDescription(selectedCategory)}
        </p>
      </div>

      {/* Usage Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.messages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.tokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalUsage.cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Em uso de API
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 8)}, minmax(0, 1fr))` }}>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => {
              const usage = getUsageForModel(model.id)
              const isAccessible = canUseModel(model)
              
              return (
                <Card
                  key={model.id}
                  className={`relative ${!isAccessible ? 'opacity-60' : ''}`}
                >
                  {!isAccessible && (
                    <div className="absolute top-4 right-4">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          {model.name}
                        </CardTitle>
                        <CardDescription>{model.provider}</CardDescription>
                      </div>
                      <Badge variant={model.planRequired === 'FREE' ? 'secondary' : 
                                     model.planRequired === 'PRO' ? 'default' : 'outline'}>
                        {model.planRequired}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {model.description}
                    </p>

                    {/* Model Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contexto:</span>
                        <span className="font-medium">
                          {model.contextWindow.toLocaleString()} tokens
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custo (1k tokens):</span>
                        <span className="font-medium">
                          ${model.costPer1kTokens.input} / ${model.costPer1kTokens.output}
                        </span>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className={`h-4 w-4 ${getPerformanceColor(model.performance.speed)}`} />
                        <span>Velocidade: {getPerformanceValue(model.performance.speed)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className={`h-4 w-4 ${getPerformanceColor(model.performance.quality)}`} />
                        <span>Qualidade: {getPerformanceValue(model.performance.quality)}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Usage Stats */}
                    {isAccessible && usage.messagesCount > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Seu uso:</span>
                          <span>{usage.messagesCount} mensagens</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Tokens:</span>
                          <span>{usage.tokensUsed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Custo:</span>
                          <span>R$ {usage.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      variant={isAccessible ? 'default' : 'outline'}
                      disabled={!model.isAvailable || !isAccessible}
                      onClick={() => {
                        if (isAccessible && model.isAvailable) {
                          window.location.href = `/dashboard/chat?model=${model.id}`
                        } else if (!isAccessible) {
                          toast({
                            title: "Upgrade necessário",
                            description: `Este modelo requer o plano ${model.planRequired}`,
                          })
                        }
                      }}
                    >
                      {!isAccessible ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Requer {model.planRequired}
                        </>
                      ) : !model.isAvailable ? (
                        'Em breve'
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Usar modelo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Modelos mais avançados oferecem melhor qualidade mas consomem mais tokens.
          Escolha o modelo adequado para cada tarefa para otimizar custos.
        </AlertDescription>
      </Alert>
    </div>
  )
}