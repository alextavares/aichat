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
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full",
        "cursor-pointer hover:-translate-y-1 bg-gray-900 border-gray-700 hover:bg-gray-800",
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {/* Preview Image */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
        {preview && preview.startsWith('http') ? (
          <Image
            src={preview}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-8xl opacity-30 text-gray-500">
            {icon}
          </div>
        )}
        
        {/* Badge overlay */}
        {badge && (
          <div className="absolute top-4 right-4">
            <Badge 
              variant={badgeVariant} 
              className={cn(
                "text-xs font-medium",
                badgeVariant === "secondary" && "bg-purple-600 text-white border-purple-500",
                badgeVariant === "default" && "bg-blue-600 text-white border-blue-500"
              )}
            >
              {badge}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-400 flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold text-white mb-1 line-clamp-1">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-400 line-clamp-2">
                {description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent transition-colors group-hover:border-gray-600" />
    </Card>
  )
}