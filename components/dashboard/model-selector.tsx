"use client"

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const aiModels = [
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    icon: '💎',
    description: 'Fast and efficient for most tasks',
    provider: 'Google'
  },
  { 
    id: 'gpt-4', 
    name: 'GPT-4', 
    icon: '🚀',
    description: 'Advanced reasoning and analysis',
    provider: 'OpenAI'
  },
  { 
    id: 'claude-3.5-sonnet', 
    name: 'Claude 3.5 Sonnet', 
    icon: '🤖',
    description: 'Excellent for writing and coding',
    provider: 'Anthropic'
  },
  { 
    id: 'gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo', 
    icon: '⚡',
    description: 'Quick responses for simple tasks',
    provider: 'OpenAI'
  },
]

interface ModelSelectorProps {
  selectedModel?: string
  onModelChange?: (modelId: string) => void
  className?: string
}

export function ModelSelector({ 
  selectedModel = 'gemini-2.5-flash', 
  onModelChange,
  className 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentModel = aiModels.find(model => model.id === selectedModel) || aiModels[0]

  const handleModelSelect = (modelId: string) => {
    onModelChange?.(modelId)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50",
            className
          )}
        >
          <span className="text-lg">{currentModel.icon}</span>
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">{currentModel.name}</span>
            <span className="text-xs text-gray-500">{currentModel.provider}</span>
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-2">
        <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
          Choose AI Model
        </div>
        
        {aiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelSelect(model.id)}
            className={cn(
              "flex items-center gap-3 p-3 cursor-pointer rounded-lg",
              "hover:bg-blue-50 focus:bg-blue-50",
              selectedModel === model.id && "bg-blue-50"
            )}
          >
            <span className="text-lg">{model.icon}</span>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{model.name}</span>
                <span className="text-xs text-gray-500">by {model.provider}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{model.description}</p>
            </div>
            
            {selectedModel === model.id && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        <div className="border-t mt-2 pt-2">
          <div className="text-xs text-gray-500 px-2">
            💡 Different models excel at different tasks. Experiment to find your favorite!
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}