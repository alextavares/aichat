"use client"

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TemplateSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TemplateSearch({ 
  value, 
  onChange,
  placeholder = "Buscar templates..."
}: TemplateSearchProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative">
      <div className={`
        relative flex items-center transition-all duration-200
        ${isFocused ? 'scale-105' : ''}
      `}>
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-background"
        />

        {value && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 p-1 h-7 w-7"
            onClick={() => onChange('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}