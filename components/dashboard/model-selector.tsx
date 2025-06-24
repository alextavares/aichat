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
import { ChevronDown, Sparkles, Zap, Brain, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  speed: "slow" | "medium" | "fast" | "very-fast"
  intelligence: "basic" | "good" | "advanced" | "state-of-the-art"
  cost: "$" | "$$" | "$$$" | "$$$$"
  maxTokens: number
  supportsImages?: boolean
  supportsTools?: boolean
}

const models: AIModel[] = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    description: "Modelo mais inteligente e versátil",
    icon: <Brain className="h-4 w-4" />,
    badge: "Recomendado",
    badgeVariant: "default",
    speed: "medium",
    intelligence: "state-of-the-art",
    cost: "$$$",
    maxTokens: 128000,
    supportsImages: true,
    supportsTools: true
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Rápido e eficiente para tarefas gerais",
    icon: <Zap className="h-4 w-4" />,
    badge: "Popular",
    badgeVariant: "secondary",
    speed: "fast",
    intelligence: "good",
    cost: "$",
    maxTokens: 16384,
    supportsTools: true
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Excelente para análise e escrita",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "Poderoso",
    badgeVariant: "default",
    speed: "medium",
    intelligence: "state-of-the-art",
    cost: "$$$$",
    maxTokens: 200000,
    supportsImages: true
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Equilíbrio entre velocidade e inteligência",
    icon: <Brain className="h-4 w-4" />,
    speed: "fast",
    intelligence: "advanced",
    cost: "$$",
    maxTokens: 200000,
    supportsImages: true
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Ultra rápido para tarefas simples",
    icon: <Gauge className="h-4 w-4" />,
    badge: "Mais rápido",
    badgeVariant: "outline",
    speed: "very-fast",
    intelligence: "basic",
    cost: "$",
    maxTokens: 200000
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Contexto massivo de 2M tokens",
    icon: <Sparkles className="h-4 w-4" />,
    badge: "2M tokens",
    badgeVariant: "destructive",
    speed: "medium",
    intelligence: "advanced",
    cost: "$$",
    maxTokens: 2097152,
    supportsImages: true
  }
]

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(models[0])

  // Load saved model from localStorage
  useEffect(() => {
    const savedModelId = localStorage.getItem("selectedModel")
    if (savedModelId) {
      const model = models.find(m => m.id === savedModelId)
      if (model) setSelectedModel(model)
    }
  }, [])

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="min-w-[200px] justify-between"
        >
          <div className="flex items-center space-x-2">
            {selectedModel.icon}
            <span className="font-medium">{selectedModel.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel>Selecione um Modelo de IA</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => handleModelSelect(model)}
            className={cn(
              "flex flex-col items-start space-y-1 p-3 cursor-pointer",
              selectedModel.id === model.id && "bg-accent"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                {model.icon}
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">• {model.provider}</span>
              </div>
              {model.badge && (
                <Badge variant={model.badgeVariant} className="ml-2 text-xs">
                  {model.badge}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">{model.description}</p>
            
            <div className="flex items-center space-x-4 text-xs">
              <span title="Velocidade">{getSpeedIcon(model.speed)}</span>
              <span title="Inteligência">{getIntelligenceIcon(model.intelligence)}</span>
              <span title="Custo" className="font-mono">{model.cost}</span>
              <span className="text-muted-foreground">
                {model.maxTokens >= 1000000 
                  ? `${(model.maxTokens / 1000000).toFixed(1)}M tokens`
                  : `${(model.maxTokens / 1000).toFixed(0)}K tokens`
                }
              </span>
              {model.supportsImages && <span title="Suporta imagens">🖼️</span>}
              {model.supportsTools && <span title="Suporta ferramentas">🔧</span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}