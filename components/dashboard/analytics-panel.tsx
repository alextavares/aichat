"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  TrendingUp,
  Users,
  MousePointer,
  Search,
  Eye,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { templateTracker, TemplateAnalytics } from '@/lib/analytics/template-tracker'

interface AnalyticsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AnalyticsPanel({ isOpen, onClose }: AnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [popularTemplates, setPopularTemplates] = useState<Array<{templateId: string, analytics: TemplateAnalytics}>>([])
  const [trendingTemplates, setTrendingTemplates] = useState<Array<{templateId: string, analytics: TemplateAnalytics}>>([])
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({})
  const [planStats, setPlanStats] = useState<Record<string, number>>({})
  const [searchQueries, setSearchQueries] = useState<Array<{query: string, count: number}>>([])

  useEffect(() => {
    if (isOpen) {
      loadAnalytics()
    }
  }, [isOpen])

  const loadAnalytics = () => {
    const data = templateTracker.exportData()
    setAnalytics(data.summary)
    setPopularTemplates(templateTracker.getPopularTemplates(5))
    setTrendingTemplates(templateTracker.getTrendingTemplates(3))
    setCategoryStats(templateTracker.getCategoryAnalytics())
    setPlanStats(templateTracker.getPlanAnalytics())
    setSearchQueries(templateTracker.getSearchAnalytics().slice(0, 5))
  }

  const getTemplateDisplayName = (templateId: string) => {
    const names: Record<string, string> = {
      'chat-advanced': 'Chat IA Avançada',
      'copywriting': 'Gerador de Copy',
      'image-generation': 'Geração de Imagens',
      'content-generator': 'Criador de Conteúdo',
      'audio-transcription': 'Transcrição de Áudio',
      'translation': 'Tradutor Avançado',
      'custom-assistant': 'Assistente Personalizado'
    }
    return names[templateId] || templateId
  }

  const getCategoryDisplayName = (categoryId: string) => {
    const names: Record<string, string> = {
      'text': 'IA para Texto',
      'images': 'IA para Imagens',
      'audio': 'IA para Áudio',
      'video': 'IA para Vídeo',
      'assistants': 'Assistentes'
    }
    return names[categoryId] || categoryId
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Analytics de Templates
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Cliques</p>
                    <p className="text-2xl font-bold">{analytics?.totalClicks || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Templates Únicos</p>
                    <p className="text-2xl font-bold">{analytics?.uniqueTemplates || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mais Popular</p>
                    <p className="text-sm font-medium">
                      {popularTemplates[0] ? getTemplateDisplayName(popularTemplates[0].templateId) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Buscas Realizadas</p>
                    <p className="text-2xl font-bold">{searchQueries.reduce((sum, q) => sum + q.count, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Templates Mais Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularTemplates.map((item, index) => (
                    <div key={item.templateId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{getTemplateDisplayName(item.templateId)}</p>
                          <p className="text-xs text-muted-foreground">
                            Posição média: {item.analytics.averagePosition.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{item.analytics.totalClicks}</p>
                        <p className="text-xs text-muted-foreground">cliques</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Uso por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => {
                      const total = Object.values(categoryStats).reduce((sum, c) => sum + c, 0)
                      const percentage = total > 0 ? (count / total) * 100 : 0
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{getCategoryDisplayName(category)}</span>
                            <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Plan Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Uso por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(planStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([plan, count]) => {
                      const total = Object.values(planStats).reduce((sum, c) => sum + c, 0)
                      const percentage = total > 0 ? (count / total) * 100 : 0
                      
                      return (
                        <div key={plan}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2">
                              {plan}
                              <Badge variant={plan === 'FREE' ? 'secondary' : plan === 'PRO' ? 'default' : 'outline'} className="text-xs">
                                {plan}
                              </Badge>
                            </span>
                            <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Top Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscas Mais Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchQueries.length > 0 ? searchQueries.map((search, index) => (
                    <div key={search.query} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{search.query}</span>
                      </div>
                      <span className="text-sm font-medium">{search.count}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma busca realizada ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Templates */}
          {trendingTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  Em Alta (Últimas 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingTemplates.map((item, index) => (
                    <div key={item.templateId} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default" className="bg-green-500 text-white">
                          #{index + 1} Trending
                        </Badge>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">
                        {getTemplateDisplayName(item.templateId)}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.analytics.totalClicks} cliques totais
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const data = templateTracker.exportData()
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                  }}
                >
                  Exportar JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => templateTracker.clearOldData(30)}
                >
                  Limpar Dados Antigos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}