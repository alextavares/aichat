"use client"

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { MODEL_CATEGORIES, getModelById } from '@/constants/models'
import { cn } from '@/lib/utils'

interface ModelSelectorProps {
  selectedModel: string
  onModelSelect: (model: string) => void
  userPlan: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'
  className?: string
}

const TIER_COLORS = {
  FREE: 'bg-green-100 text-green-800 border-green-200',
  LITE: 'bg-blue-100 text-blue-800 border-blue-200', 
  PRO: 'bg-purple-100 text-purple-800 border-purple-200',
  ENTERPRISE: 'bg-orange-100 text-orange-800 border-orange-200'
}

const TIER_ORDER = ['FREE', 'LITE', 'PRO', 'ENTERPRISE']

export function ModelSelector({ selectedModel, onModelSelect, userPlan, className }: ModelSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    FAST: true // Fast models open by default
  })

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const isModelAvailable = (modelTier: string) => {
    const userTierIndex = TIER_ORDER.indexOf(userPlan)
    const modelTierIndex = TIER_ORDER.indexOf(modelTier)
    return userTierIndex >= modelTierIndex
  }

  const getSelectedModelInfo = () => {
    return getModelById(selectedModel)
  }

  const selectedModelInfo = getSelectedModelInfo()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Selection Display */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Modelo Selecionado</p>
              <p className="font-medium">{selectedModelInfo?.name || selectedModel}</p>
            </div>
            {selectedModelInfo && (
              <Badge variant="outline" className={TIER_COLORS[selectedModelInfo.tier]}>
                {selectedModelInfo.tier}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Model Categories */}
      <div className="space-y-2">
        {Object.entries(MODEL_CATEGORIES).map(([categoryKey, category]) => {
          const Icon = category.icon
          const isOpen = openCategories[categoryKey]
          
          return (
            <Collapsible key={categoryKey} open={isOpen} onOpenChange={() => toggleCategory(categoryKey)}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-auto p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.models.length}
                    </Badge>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 pl-4">
                {category.models.map((model) => {
                  const isAvailable = isModelAvailable(model.tier)
                  const isSelected = selectedModel === model.id
                  
                  return (
                    <Button
                      key={model.id}
                      variant={isSelected ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-between h-auto p-3 text-left",
                        !isAvailable && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => isAvailable && onModelSelect(model.id)}
                      disabled={!isAvailable}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        {!isAvailable && (
                          <span className="text-xs text-muted-foreground">
                            Requer plano {model.tier}
                          </span>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          isAvailable ? TIER_COLORS[model.tier] : "opacity-50"
                        )}
                      >
                        {model.tier}
                      </Badge>
                    </Button>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      {/* Quick Model Selector */}
      <div>
        <p className="text-sm font-medium mb-2">Seleção Rápida</p>
        <Select value={selectedModel} onValueChange={onModelSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha um modelo..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MODEL_CATEGORIES).map(([categoryKey, category]) => (
              <div key={categoryKey}>
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  {category.name}
                </div>
                {category.models.map((model) => {
                  const isAvailable = isModelAvailable(model.tier)
                  
                  return (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={!isAvailable}
                      className={cn(!isAvailable && "opacity-50")}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="outline" className={cn("ml-2 text-xs", TIER_COLORS[model.tier])}>
                          {model.tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}