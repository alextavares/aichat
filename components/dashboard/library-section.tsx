"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Zap, Users, Brain, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const templateCategories = [
  {
    id: 'writing',
    name: 'Writing & Content',
    icon: FileText,
    count: 12,
    templates: [
      { id: 'blog-post', name: 'Blog Post Writer', description: 'Create engaging blog posts' },
      { id: 'email-copy', name: 'Email Copywriting', description: 'Professional email templates' },
      { id: 'social-media', name: 'Social Media Posts', description: 'Engaging social content' },
      { id: 'product-desc', name: 'Product Descriptions', description: 'Compelling product copy' },
    ]
  },
  {
    id: 'business',
    name: 'Business & Marketing',
    icon: Zap,
    count: 8,
    templates: [
      { id: 'business-plan', name: 'Business Plan', description: 'Comprehensive business planning' },
      { id: 'pitch-deck', name: 'Pitch Deck Content', description: 'Investor presentation content' },
      { id: 'market-analysis', name: 'Market Analysis', description: 'Industry research and insights' },
      { id: 'competitor-analysis', name: 'Competitor Analysis', description: 'Competitive landscape study' },
    ]
  },
  {
    id: 'education',
    name: 'Education & Learning',
    icon: Brain,
    count: 6,
    templates: [
      { id: 'lesson-plan', name: 'Lesson Plans', description: 'Educational content structure' },
      { id: 'quiz-generator', name: 'Quiz Generator', description: 'Interactive learning quizzes' },
      { id: 'study-guide', name: 'Study Guides', description: 'Comprehensive study materials' },
      { id: 'research-paper', name: 'Research Assistant', description: 'Academic research support' },
    ]
  },
  {
    id: 'personal',
    name: 'Personal Productivity',
    icon: Users,
    count: 5,
    templates: [
      { id: 'daily-planner', name: 'Daily Planner', description: 'Organize your daily tasks' },
      { id: 'goal-setting', name: 'Goal Setting', description: 'SMART goal framework' },
      { id: 'habit-tracker', name: 'Habit Tracker', description: 'Build positive habits' },
      { id: 'reflection', name: 'Weekly Reflection', description: 'Self-improvement insights' },
    ]
  }
]

interface LibrarySectionProps {
  isExpanded: boolean
  onToggle: () => void
}

export function LibrarySection({ isExpanded, onToggle }: LibrarySectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['writing'])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleTemplateClick = (templateId: string) => {
    // Navigate to template or start chat with template
    console.log('Template clicked:', templateId)
  }

  return (
    <div className="space-y-1">
      {/* Library Main Button */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
          isExpanded
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Library className="w-5 h-5" />
        <span className="flex-1">Library</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Expanded Categories */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {templateCategories.map((category) => {
            const isCategoryExpanded = expandedCategories.includes(category.id)
            const Icon = category.icon
            
            return (
              <div key={category.id}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  {isCategoryExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{category.name}</span>
                  <span className="text-xs text-gray-400">{category.count}</span>
                </button>

                {/* Templates List */}
                {isCategoryExpanded && (
                  <div className="ml-5 mt-1 space-y-1">
                    {category.templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template.id)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {template.description}
                        </div>
                      </button>
                    ))}
                    
                    {/* View All Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                    >
                      View all {category.name.toLowerCase()} templates →
                    </Button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Browse All Templates */}
          <div className="pt-2 border-t border-gray-100 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
            >
              <FileText className="w-4 h-4 mr-2" />
              Browse all templates
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}