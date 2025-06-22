"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TemplateCategoriesProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export const templateCategories = [
  { id: 'all', name: 'Todos', emoji: '✨' },
  { id: 'work', name: 'Trabalho', emoji: '💼' },
  { id: 'popular', name: 'Popular', emoji: '🔥' },
  { id: 'marketing', name: 'Marketing', emoji: '📊' },
  { id: 'writing', name: 'Escrita', emoji: '✍️' },
  { id: 'business', name: 'Negócios', emoji: '📈' },
  { id: 'social', name: 'Social Media', emoji: '📱' },
  { id: 'email', name: 'Email', emoji: '📧' },
  { id: 'academic', name: 'Acadêmico', emoji: '🎓' },
]

export default function TemplateCategories({ 
  selectedCategory, 
  onCategoryChange 
}: TemplateCategoriesProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {templateCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all",
            "hover:scale-105 hover:shadow-md",
            selectedCategory === category.id
              ? "bg-primary text-white shadow-lg"
              : "bg-card border border-border hover:border-primary/50"
          )}
        >
          <span className="text-lg">{category.emoji}</span>
          <span className="text-sm font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  )
}