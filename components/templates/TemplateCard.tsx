"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Copy, Check, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description: string
    category: string
    icon?: string
    gradient?: string
    usageCount: number
    isFavorite?: boolean
  }
  onFavorite: (id: string) => void
  onUse: (id: string) => void
}

export default function TemplateCard({ template, onFavorite, onUse }: TemplateCardProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.name)
    setIsCopied(true)
    toast({
      title: "Template copiado!",
      description: "O nome do template foi copiado para a área de transferência.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  const gradient = template.gradient || gradients.blue

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-300 cursor-pointer",
        "hover:shadow-xl hover:-translate-y-1",
        "bg-card border-border"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onUse(template.id)}
    >
      {/* Gradient Background Effect */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none",
          `bg-gradient-to-br ${gradient}`
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
              `bg-gradient-to-br ${gradient} text-white`
            )}>
              {template.icon || '📝'}
            </div>

            {/* Title and Usage */}
            <div>
              <CardTitle className="text-lg font-semibold">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {template.usageCount.toLocaleString()} usos
                </span>
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "p-2 transition-all",
              template.isFavorite && "text-yellow-500"
            )}
            onClick={(e) => {
              e.stopPropagation()
              onFavorite(template.id)
            }}
          >
            <Star 
              className={cn(
                "w-4 h-4 transition-all",
                template.isFavorite && "fill-yellow-500"
              )} 
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <CardDescription className="text-sm line-clamp-2">
          {template.description}
        </CardDescription>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 h-9">
          <Button 
            size="sm" 
            variant="secondary"
            className="flex-1 text-xs h-8 opacity-30 hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation()
              onUse(template.id)
            }}
          >
            Usar Template
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="p-0 w-8 h-8 shrink-0 opacity-30 hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </CardContent>

      {/* Category Badge */}
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="text-xs capitalize">
          {template.category}
        </Badge>
      </div>
    </Card>
  )
}