"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ToolCardProps {
  title: string
  description: string
  icon: React.ReactNode
  preview?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function ToolCard({
  title,
  description,
  icon,
  preview,
  badge,
  badgeVariant = "secondary",
  onClick,
  disabled = false,
  className
}: ToolCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "cursor-pointer hover:-translate-y-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {/* Preview Image */}
      {preview && (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {preview.startsWith('http') ? (
            <Image
              src={preview}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl opacity-20">
              {icon}
            </div>
          )}
        </div>
      )}

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          {badge && (
            <Badge variant={badgeVariant} className="ml-2">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="line-clamp-2 text-sm">
          {description}
        </CardDescription>
        
        {!disabled && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4 group/button"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            Começar
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </Button>
        )}
      </CardContent>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent transition-colors group-hover:border-primary/20" />
    </Card>
  )
}