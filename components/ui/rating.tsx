"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Rating({ 
  value, 
  onChange, 
  readonly = false, 
  size = 'md',
  className 
}: RatingProps) {
  const [hoveredValue, setHoveredValue] = useState(0)
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }
  
  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoveredValue(rating)
    }
  }
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredValue(0)
    }
  }
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = (hoveredValue || value) >= rating
        
        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-150",
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}