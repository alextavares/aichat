"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Sparkles, Zap, Brain, Gauge, Globe, ImageIcon, Video, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { INNERAI_MODELS, type AIModel as InnerAIModel } from "@/lib/ai/innerai-models-config"

export interface AIModel {
  id: string
  name: string
  provider: string
  category: 'fast' | 'advanced' | 'reasoning'
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  speed: "slow" | "medium" | "fast" | "very-fast"
  intelligence: "basic" | "good" | "advanced" | "state-of-the-art"
  cost: "$" | "$$" | "$$$" | "$$$$"
  maxTokens: number
  features: string[]
  planRequired: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'
  isAvailable: boolean
}

// Função para mapear modelos InnerAI para interface local
const mapInnerAIModel = (model: InnerAIModel): AIModel => {
  const getIcon = () => {
    if (model.features.includes('Web Search')) return <Globe className="h-4 w-4" />
    if (model.category === 'fast') return <Zap className="h-4 w-4" />
    if (model.category === 'advanced') return <Brain className="h-4 w-4" />
    if (model.category === 'reasoning') return <Gauge className="h-4 w-4" />
    return <Sparkles className="h-4 w-4" />
  }

  const getBadge = () => {
    if (model.id === 'gpt-4o-mini') return { text: 'Recomendado', variant: 'default' as const }
    if (model.id === 'claude-3.5-haiku') return { text: 'Mais rápido', variant: 'outline' as const }
    if (model.id === 'gemini-2.5-flash') return { text: '1M tokens', variant: 'secondary' as const }
    if (model.id === 'deepseek-r1') return { text: 'Popular', variant: 'secondary' as const }
    if (model.category === 'reasoning') return { text: 'Raciocínio', variant: 'destructive' as const }
    if (model.planRequired === 'PRO') return { text: 'PRO', variant: 'default' as const }
    if (model.planRequired === 'LITE') return { text: 'LITE', variant: 'outline' as const }
    return null
  }

  const getCost = (): "$" | "$$" | "$$$" | "$$$$" => {
    const inputCost = model.costPer1kTokens.input
    if (inputCost === 0) return "$"
    if (inputCost < 0.001) return "$"
    if (inputCost < 0.005) return "$$"
    if (inputCost < 0.01) return "$$$"
    return "$$$$"
  }

  const getSpeed = (): "slow" | "medium" | "fast" | "very-fast" => {
    if (model.performance.speed === 'fast') return 'very-fast'
    return model.performance.speed as any
  }

  const getIntelligence = (): "basic" | "good" | "advanced" | "state-of-the-art" => {
    if (model.performance.quality === 'superior') return 'state-of-the-art'
    if (model.performance.quality === 'excellent') return 'advanced'
    return 'good'
  }

  const badge = getBadge()

  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
    category: model.category,
    description: model.description,
    icon: getIcon(),
    badge: badge?.text,
    badgeVariant: badge?.variant,
    speed: getSpeed(),
    intelligence: getIntelligence(),
    cost: getCost(),
    maxTokens: model.contextWindow,
    features: model.features,
    planRequired: model.planRequired,
    isAvailable: model.isAvailable
  }
}

// Converter e filtrar apenas modelos disponíveis
const models: AIModel[] = INNERAI_MODELS
  .filter(model => model.isAvailable)
  .map(mapInnerAIModel)

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(models[0])

  // Load saved model from localStorage
  useEffect(() => {
    const savedModelId = localStorage.getItem("selectedModel")
    if (savedModelId) {
      const model = models.find(m => m.id === savedModelId)
      if (model) setSelectedModel(model)
    }
  }, []) // Empty dependency array to run only once

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model)
    localStorage.setItem("selectedModel", model.id)
  }

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "very-fast": return "⚡⚡⚡"
      case "fast": return "⚡⚡"
      case "medium": return "⚡"
      default: return "🐌"
    }
  }

  const getIntelligenceIcon = (intelligence: string) => {
    switch (intelligence) {
      case "state-of-the-art": return "🧠🧠🧠"
      case "advanced": return "🧠🧠"
      case "good": return "🧠"
      default: return "💡"
    }
  }

  // Agrupar modelos por categoria - EXATAMENTE como no InnerAI
  const fastModels = models.filter(m => m.category === 'fast')
  const advancedModels = models.filter(m => m.category === 'advanced')
  const reasoningModels = models.filter(m => m.category === 'reasoning')

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fast': return '⚡ Modelos Rápidos'
      case 'advanced': return '🧠 Modelos Avançados'
      case 'reasoning': return '🎯 Raciocínio Profundo'
      case 'credit': return '💎 Modelos Premium (Créditos)'
      default: return category
    }
  }

  const renderModelGroup = (modelList: AIModel[], title: string) => (
    <div key={title}>
      <DropdownMenuLabel className="text-text-secondary text-xs font-semibold">
        {title}
      </DropdownMenuLabel>
      {modelList.map((model) => (
        <DropdownMenuItem
          key={model.id}
          onSelect={() => handleModelSelect(model)}
          className={cn(
            "flex flex-col items-start space-y-2 p-3 cursor-pointer transition-all duration-200",
            "hover:bg-surface hover:shadow-soft rounded-md mx-1",
            selectedModel.id === model.id && "bg-primary/10 border-l-2 border-primary"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="text-primary">{model.icon}</div>
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">{model.name}</span>
                <span className="text-xs text-text-tertiary">{model.provider}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {model.badge && (
                <Badge 
                  variant={model.badgeVariant} 
                  className="ml-2 text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {model.badge}
                </Badge>
              )}
              {model.planRequired === 'PRO' && (
                <Badge variant="outline" className="text-xs border-accent text-accent">
                  PRO
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-xs text-text-secondary leading-relaxed">{model.description}</p>
          
          <div className="flex items-center justify-between w-full text-xs">
            <div className="flex items-center space-x-3">
              <span title="Velocidade" className="flex items-center space-x-1">
                <span>{getSpeedIcon(model.speed)}</span>
              </span>
              <span title="Inteligência" className="flex items-center space-x-1">
                <span>{getIntelligenceIcon(model.intelligence)}</span>
              </span>
              <span title="Custo" className="font-mono text-text-secondary">{model.cost}</span>
            </div>
            <div className="flex items-center space-x-2 text-text-tertiary">
              <span className="text-xs">
                {model.maxTokens >= 1000000 
                  ? `${(model.maxTokens / 1000000).toFixed(1)}M`
                  : model.maxTokens >= 1000 
                  ? `${(model.maxTokens / 1000).toFixed(0)}K`
                  : `${model.maxTokens}`
                } tokens
              </span>
              {model.features.includes('Vision') && <span title="Suporta imagens">🖼️</span>}
              {model.features.includes('Function Calling') && <span title="Suporta ferramentas">🔧</span>}
              {model.planRequired !== 'FREE' && <span title="Consome créditos">💳</span>}
            </div>
          </div>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator className="my-2" />
    </div>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="min-w-[240px] justify-between bg-card hover:bg-card-hover 
                     border-border hover:border-primary/50 shadow-soft hover:shadow-soft-md
                     text-text-primary transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="text-primary">{selectedModel.icon}</div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedModel.name}</span>
              <span className="text-xs text-text-secondary">{selectedModel.provider}</span>
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[420px] bg-card border-border shadow-soft-lg">
        <div className="p-2">
          <DropdownMenuLabel className="text-text-primary font-semibold text-base">
            🤖 Selecione um Modelo de IA
          </DropdownMenuLabel>
          <p className="text-xs text-text-secondary mt-1 mb-3">
            Escolha o modelo ideal para sua tarefa
          </p>
          <DropdownMenuSeparator className="bg-border" />
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {fastModels.length > 0 && renderModelGroup(fastModels, getCategoryLabel('fast'))}
          {advancedModels.length > 0 && renderModelGroup(advancedModels, getCategoryLabel('advanced'))}
          {reasoningModels.length > 0 && renderModelGroup(reasoningModels, getCategoryLabel('reasoning'))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}