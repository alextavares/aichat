"use client"

import { useState, useRef } from 'react'
import { 
  BookOpen, 
  Search, 
  FileText, 
  Link,
  Calendar,
  X,
  Loader2,
  Plus,
  Folder
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface KnowledgeItem {
  id: string
  title: string
  type: 'document' | 'webpage' | 'note'
  content: string
  source?: string
  tags: string[]
  createdAt: string
  lastAccessed?: string
}

interface KnowledgeBaseProps {
  onItemsSelected?: (items: KnowledgeItem[]) => void
  onClose?: () => void
  className?: string
}

export function KnowledgeBase({ 
  onItemsSelected,
  onClose,
  className 
}: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock knowledge base data
  const knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'AI Model Comparison Guide',
      type: 'document',
      content: 'Comprehensive comparison of different AI models including GPT-4, Claude, and Gemini...',
      tags: ['AI', 'Models', 'Comparison'],
      createdAt: '2024-01-15',
      lastAccessed: '2 hours ago'
    },
    {
      id: '2',
      title: 'Web Development Best Practices',
      type: 'webpage',
      content: 'Modern web development practices including performance optimization, security...',
      source: 'https://web.dev/best-practices',
      tags: ['Web Dev', 'Performance', 'Security'],
      createdAt: '2024-01-14',
      lastAccessed: '1 day ago'
    },
    {
      id: '3',
      title: 'Project Requirements Notes',
      type: 'note',
      content: 'Meeting notes from client discussion about project requirements and timeline...',
      tags: ['Project', 'Requirements', 'Meeting'],
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      title: 'Machine Learning Algorithms',
      type: 'document',
      content: 'Overview of popular ML algorithms, their use cases, and implementation examples...',
      tags: ['ML', 'Algorithms', 'Implementation'],
      createdAt: '2024-01-12',
      lastAccessed: '3 days ago'
    }
  ]

  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>(knowledgeItems)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)

    // Simulate search delay
    setTimeout(() => {
      if (!query.trim()) {
        setFilteredItems(knowledgeItems)
      } else {
        const filtered = knowledgeItems.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        setFilteredItems(filtered)
      }
      setIsSearching(false)
    }, 300)
  }

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleUseSelected = () => {
    const selected = filteredItems.filter(item => selectedItems.has(item.id))
    onItemsSelected?.(selected)
    onClose?.()
  }

  const getItemIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'document':
        return FileText
      case 'webpage':
        return Link
      case 'note':
        return BookOpen
      default:
        return FileText
    }
  }

  const getTypeColor = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800'
      case 'webpage':
        return 'bg-green-100 text-green-800'
      case 'note':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn("bg-white rounded-lg border shadow-lg p-6 w-full max-w-3xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              All Items
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Web Pages
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Notes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search your knowledge base..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {filteredItems.length} items
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <div className="flex items-center gap-2">
          {selectedItems.size > 0 && (
            <Button 
              onClick={handleUseSelected}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Use Selected ({selectedItems.size})
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => {
          const ItemIcon = getItemIcon(item.type)
          
          return (
            <div
              key={item.id}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors",
                selectedItems.has(item.id)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => toggleItemSelection(item.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <ItemIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <Badge variant="secondary" className={cn("text-xs", getTypeColor(item.type))}>
                      {item.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {item.content}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex items-center gap-1 mb-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {item.createdAt}</span>
                    </div>
                    {item.lastAccessed && (
                      <span>Last accessed {item.lastAccessed}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {searchQuery ? `No items found for "${searchQuery}"` : 'No items in your knowledge base'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery ? 'Try different keywords' : 'Add documents, web pages, or notes to get started'}
          </p>
        </div>
      )}
    </div>
  )
}