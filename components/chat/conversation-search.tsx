"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  Clock,
  MessageSquare,
  Sparkles,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ConversationSearchProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  className?: string
}

export interface SearchFilters {
  query: string
  dateFrom?: Date
  dateTo?: Date
  model?: string
  sortBy: 'recent' | 'oldest' | 'relevance'
  messageCount?: 'short' | 'medium' | 'long'
}

const MODEL_OPTIONS = [
  { value: 'gpt-4', label: 'GPT-4', category: 'OpenAI' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', category: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', category: 'OpenAI' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', category: 'Anthropic' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', category: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', category: 'Google' },
]

export function ConversationSearch({ 
  onSearch, 
  isLoading = false,
  className 
}: ConversationSearchProps) {
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [selectedModel, setSelectedModel] = useState<string>()
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'relevance'>('recent')
  const [messageCount, setMessageCount] = useState<'short' | 'medium' | 'long'>()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Auto-search when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      query: query.trim(),
      dateFrom,
      dateTo,
      model: selectedModel,
      sortBy,
      messageCount
    }
    
    onSearch(filters)
  }, [query, dateFrom, dateTo, selectedModel, sortBy, messageCount, onSearch])

  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case 'date':
        setDateFrom(undefined)
        setDateTo(undefined)
        break
      case 'model':
        setSelectedModel(undefined)
        break
      case 'messageCount':
        setMessageCount(undefined)
        break
      case 'all':
        setQuery('')
        setDateFrom(undefined)
        setDateTo(undefined)
        setSelectedModel(undefined)
        setMessageCount(undefined)
        setSortBy('recent')
        break
    }
  }

  const activeFiltersCount = [
    dateFrom || dateTo,
    selectedModel,
    messageCount,
    query.trim()
  ].filter(Boolean).length

  const getModelLabel = (value: string) => {
    return MODEL_OPTIONS.find(m => m.value === value)?.label || value
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={searchInputRef}
          placeholder="Buscar nas suas conversas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
          disabled={isLoading}
        />
        
        {/* Advanced Filters Toggle */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {activeFiltersCount}
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "h-7 w-7 p-0",
              showAdvanced && "bg-primary/10 text-primary"
            )}
          >
            <SlidersHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-muted/30 border rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearFilter('all')}
                className="text-xs h-7"
              >
                Limpar Tudo
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Período
              </label>
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom || dateTo ? (
                      <span className="text-xs">
                        {dateFrom && format(dateFrom, "dd/MM/yy", { locale: ptBR })}
                        {dateFrom && dateTo && " - "}
                        {dateTo && format(dateTo, "dd/MM/yy", { locale: ptBR })}
                      </span>
                    ) : (
                      <span className="text-xs">Selecionar datas</span>
                    )}
                    {(dateFrom || dateTo) && (
                      <X 
                        className="ml-auto h-3 w-3 hover:bg-muted rounded-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClearFilter('date')
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium">De:</label>
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          disabled={(date) =>
                            date > new Date() || (dateTo && date > dateTo)
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Até:</label>
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          disabled={(date) =>
                            date > new Date() || (dateFrom && date < dateFrom)
                          }
                          locale={ptBR}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Model Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Modelo de IA
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos os modelos" />
                  {selectedModel && (
                    <X 
                      className="ml-auto h-3 w-3 hover:bg-muted rounded-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearFilter('model')
                      }}
                    />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os modelos</SelectItem>
                  {MODEL_OPTIONS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        {model.label}
                        <Badge variant="outline" className="text-xs">
                          {model.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Count Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Tamanho da Conversa
              </label>
              <Select value={messageCount} onValueChange={(value: any) => setMessageCount(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Qualquer tamanho" />
                  {messageCount && (
                    <X 
                      className="ml-auto h-3 w-3 hover:bg-muted rounded-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearFilter('messageCount')
                      }}
                    />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer tamanho</SelectItem>
                  <SelectItem value="short">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Curta (1-10 mensagens)
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Média (11-50 mensagens)
                    </div>
                  </SelectItem>
                  <SelectItem value="long">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" />
                      Longa (50+ mensagens)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Mais Recente
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Mais Antigo
                    </div>
                  </SelectItem>
                  <SelectItem value="relevance">
                    <div className="flex items-center gap-2">
                      <Search className="h-3 w-3" />
                      Relevância
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {query.trim() && (
                <Badge variant="secondary" className="text-xs">
                  Busca: "{query}"
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                    onClick={() => setQuery('')}
                  />
                </Badge>
              )}
              {(dateFrom || dateTo) && (
                <Badge variant="secondary" className="text-xs">
                  Data: {dateFrom && format(dateFrom, "dd/MM", { locale: ptBR })}
                  {dateFrom && dateTo && " - "}
                  {dateTo && format(dateTo, "dd/MM", { locale: ptBR })}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                    onClick={() => handleClearFilter('date')}
                  />
                </Badge>
              )}
              {selectedModel && (
                <Badge variant="secondary" className="text-xs">
                  Modelo: {getModelLabel(selectedModel)}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                    onClick={() => handleClearFilter('model')}
                  />
                </Badge>
              )}
              {messageCount && (
                <Badge variant="secondary" className="text-xs">
                  Tamanho: {messageCount === 'short' ? 'Curta' : messageCount === 'medium' ? 'Média' : 'Longa'}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                    onClick={() => handleClearFilter('messageCount')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}