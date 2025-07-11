"use client"

import { useState, useRef } from 'react'
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Calendar,
  X,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  url: string
  snippet: string
  favicon?: string
  timestamp?: string
}

interface WebSearchProps {
  onResultsSelected?: (results: SearchResult[]) => void
  onClose?: () => void
  className?: string
}

export function WebSearch({ 
  onResultsSelected,
  onClose,
  className 
}: WebSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'OpenAI GPT-4 Documentation',
      url: 'https://platform.openai.com/docs/models/gpt-4',
      snippet: 'GPT-4 is a large multimodal model that can accept image and text inputs and produce text outputs...',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      title: 'Latest AI Research Papers',
      url: 'https://arxiv.org/list/cs.AI/recent',
      snippet: 'Recent submissions to the Artificial Intelligence section of arXiv, including breakthrough research...',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      title: 'Machine Learning Best Practices',
      url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
      snippet: 'Rules of Machine Learning: Best Practices for ML Engineering. This document is intended to help...',
      timestamp: '1 day ago'
    }
  ]

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      // TODO: Replace with actual search API
      // For now, using mock data that matches the query
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      const filteredResults = mockResults.filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.snippet.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (filteredResults.length === 0) {
        // If no matches, show all results as if it's a broader search
        setResults(mockResults)
      } else {
        setResults(filteredResults)
      }
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const toggleResultSelection = (resultId: string) => {
    const newSelected = new Set(selectedResults)
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId)
    } else {
      newSelected.add(resultId)
    }
    setSelectedResults(newSelected)
  }

  const handleUseSelected = () => {
    const selected = results.filter(result => selectedResults.has(result.id))
    onResultsSelected?.(selected)
    onClose?.()
  }

  const formatTimeAgo = (timestamp: string) => {
    return timestamp // For now, return as-is since it's already formatted
  }

  return (
    <div className={cn("bg-white rounded-lg border shadow-lg p-6 w-full max-w-2xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Web Search</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search the web..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSearching || !query.trim()}
            className="px-6"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {results.length} results
            </p>
            {selectedResults.size > 0 && (
              <Button 
                onClick={handleUseSelected}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Use Selected ({selectedResults.size})
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  selectedResults.has(result.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => toggleResultSelection(result.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedResults.has(result.id)}
                      onChange={() => toggleResultSelection(result.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
                        {result.title}
                      </h4>
                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {result.url}
                    </p>
                    
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {result.snippet}
                    </p>
                    
                    {result.timestamp && (
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(result.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && query && !isSearching && !error && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No results found for "{query}"
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Initial State */}
      {results.length === 0 && !query && (
        <div className="text-center py-8">
          <Globe className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Search the web for the latest information
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Results will appear here when you search
          </p>
        </div>
      )}
    </div>
  )
}