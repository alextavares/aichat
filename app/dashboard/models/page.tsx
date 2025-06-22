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

const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    category: 'OpenAI',
    description: 'Modelo rápido e eficiente para tarefas gerais',
    contextWindow: 16385,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    features: ['Chat', 'Completions', 'Function Calling'],
    planRequired: 'FREE',
    isAvailable: true,
    performance: { speed: 'fast', quality: 'good' },
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    category: 'OpenAI',
    description: 'Modelo mais capaz para tarefas complexas',
    contextWindow: 8192,
    costPer1kTokens: { input: 0.03, output: 0.06 },
    features: ['Chat', 'Completions', 'Function Calling', 'Vision'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'medium', quality: 'excellent' },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    category: 'OpenAI',
    description: 'GPT-4 otimizado com contexto expandido',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    features: ['Chat', 'Completions', 'Function Calling', 'Vision', 'JSON Mode'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'medium', quality: 'excellent' },
  },
  // Claude Models
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'OpenRouter',
    category: 'Claude',
    description: 'Modelo mais poderoso da Anthropic para tarefas complexas',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    features: ['Chat', 'Analysis', 'Code Generation', 'Long Context', 'Vision'],
    planRequired: 'ENTERPRISE',
    isAvailable: true,
    performance: { speed: 'slow', quality: 'superior' },
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'OpenRouter',
    category: 'Claude',
    description: 'Equilíbrio ideal entre performance e custo',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    features: ['Chat', 'Analysis', 'Code', 'Long Context'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'medium', quality: 'excellent' },
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'OpenRouter',
    category: 'Claude',
    description: 'Modelo rápido e eficiente da Anthropic',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
    features: ['Chat', 'Fast Response', 'Code'],
    planRequired: 'FREE',
    isAvailable: true,
    performance: { speed: 'fast', quality: 'good' },
  },
  // Google Models
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'OpenRouter',
    category: 'Google',
    description: 'Modelo multimodal avançado do Google',
    contextWindow: 32000,
    costPer1kTokens: { input: 0.00025, output: 0.0005 },
    features: ['Chat', 'Multimodal', 'Code', 'Analysis'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'fast', quality: 'excellent' },
  },
  // Meta Models
  {
    id: 'llama-2-70b',
    name: 'Llama 2 70B',
    provider: 'OpenRouter',
    category: 'Llama',
    description: 'Modelo open source poderoso da Meta',
    contextWindow: 4096,
    costPer1kTokens: { input: 0.0007, output: 0.0009 },
    features: ['Chat', 'Open Source', 'Customizable'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'medium', quality: 'excellent' },
  },
  {
    id: 'llama-2-13b',
    name: 'Llama 2 13B',
    provider: 'OpenRouter',
    category: 'Llama',
    description: 'Modelo open source eficiente da Meta',
    contextWindow: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0001 },
    features: ['Chat', 'Open Source', 'Fast'],
    planRequired: 'FREE',
    isAvailable: true,
    performance: { speed: 'fast', quality: 'good' },
  },
  // Mistral Models
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'OpenRouter',
    category: 'Mistral',
    description: 'Modelo MoE poderoso e eficiente',
    contextWindow: 32000,
    costPer1kTokens: { input: 0.00027, output: 0.00027 },
    features: ['Chat', 'MoE Architecture', 'Multilingual'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'fast', quality: 'excellent' },
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'OpenRouter',
    category: 'Mistral',
    description: 'Modelo compacto e eficiente',
    contextWindow: 8192,
    costPer1kTokens: { input: 0.00006, output: 0.00006 },
    features: ['Chat', 'Fast', 'Efficient'],
    planRequired: 'FREE',
    isAvailable: true,
    performance: { speed: 'fast', quality: 'good' },
  },
  // Code Models
  {
    id: 'phind-codellama-34b',
    name: 'Phind CodeLlama 34B',
    provider: 'OpenRouter',
    category: 'Código',
    description: 'Especializado em programação e debug',
    contextWindow: 16000,
    costPer1kTokens: { input: 0.0004, output: 0.0004 },
    features: ['Code Generation', 'Debug', 'Technical'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'medium', quality: 'excellent' },
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder 33B',
    provider: 'OpenRouter',
    category: 'Código',
    description: 'Otimizado para tarefas de programação',
    contextWindow: 16000,
    costPer1kTokens: { input: 0.0004, output: 0.0004 },
    features: ['Code', 'Algorithms', 'Refactoring'],
    planRequired: 'PRO',
    isAvailable: true,
    performance: { speed: 'medium', quality: 'excellent' },
  },
]

export default function ModelsPage() {
  const { data: session } = useSession()
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
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

  const filteredModels = AI_MODELS.filter(model => 
    selectedCategory === 'all' || model.category === selectedCategory
  )
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(AI_MODELS.map(m => m.category)))]

  const canUseModel = (model: AIModel) => {
    const planHierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 }
    return planHierarchy[userPlan] >= planHierarchy[model.planRequired]
  }

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'fast': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'slow': return 'text-red-500'
      case 'good': return 'text-blue-500'
      case 'excellent': return 'text-purple-500'
      case 'superior': return 'text-pink-500'
      default: return 'text-gray-500'
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Modelos de IA</h1>
        <p className="text-muted-foreground">
          Explore e compare diferentes modelos de inteligência artificial
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
              {category === 'all' ? 'Todos' : category}
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
                        <span className="capitalize">{model.performance.speed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className={`h-4 w-4 ${getPerformanceColor(model.performance.quality)}`} />
                        <span className="capitalize">{model.performance.quality}</span>
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