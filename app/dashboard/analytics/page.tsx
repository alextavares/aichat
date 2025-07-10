"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  Users,
  MousePointer,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart3,
  TrendingDown
} from 'lucide-react'
import { useToast } from '@/providers/toast-provider'

interface AnalyticsData {
  summary: {
    totalClicks: number
    uniqueTemplates: number
    period: string
  }
  templateUsage: Record<string, number>
  categoryUsage: Record<string, number>
  planUsage: Record<string, number>
  trendingTemplates: Array<{ templateId: string; count: number }>
  recentActivity: Array<{
    templateId: string
    category: string
    timestamp: string
    source: string
  }>
}

const COLORS = ['#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4']

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics/template-usage?period=${period}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Analytics error:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error('Erro', 'Não foi possível carregar os analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    toast.loading('Atualizando dados...')
    fetchAnalytics()
  }

  const exportData = () => {
    if (!data) return
    
    const exportObj = {
      period,
      exportedAt: new Date().toISOString(),
      data
    }
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    toast.downloadSuccess('analytics.json')
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

  // Prepare chart data
  const templateChartData = data ? Object.entries(data.templateUsage)
    .map(([templateId, count]) => ({
      name: getTemplateDisplayName(templateId),
      usage: count,
      templateId
    }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 8) : []

  const categoryChartData = data ? Object.entries(data.categoryUsage)
    .map(([category, count]) => ({
      name: getCategoryDisplayName(category),
      value: count,
      percentage: Math.round((count / data.summary.totalClicks) * 100)
    })) : []

  const planChartData = data ? Object.entries(data.planUsage)
    .map(([plan, count]) => ({
      name: plan,
      users: count,
      percentage: Math.round((count / data.summary.totalClicks) * 100)
    })) : []

  // Recent activity timeline
  const activityData = data ? data.recentActivity
    .slice(0, 24)
    .reduce((acc, activity) => {
      const hour = new Date(activity.timestamp).getHours()
      const existing = acc.find(item => item.hour === hour)
      if (existing) {
        existing.clicks++
      } else {
        acc.push({ hour, clicks: 1 })
      }
      return acc
    }, [] as Array<{ hour: number; clicks: number }>)
    .sort((a, b) => a.hour - b.hour) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Carregando analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <TrendingDown className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Análise detalhada do uso de templates e ferramentas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MousePointer className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Cliques</p>
                <p className="text-2xl font-bold">{data?.summary.totalClicks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Templates Únicos</p>
                <p className="text-2xl font-bold">{data?.summary.uniqueTemplates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mais Popular</p>
                <p className="text-lg font-semibold">
                  {templateChartData[0] ? templateChartData[0].name : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atividade Recente</p>
                <p className="text-2xl font-bold">{data?.recentActivity.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Templates Mais Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={templateChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="usage" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart3 className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade por Hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => `${value}:00`}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#7C3AED"
                  fill="#7C3AED"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Uso por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planChartData.map((plan, index) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <Badge 
                      variant={plan.name === 'FREE' ? 'secondary' : plan.name === 'PRO' ? 'default' : 'outline'}
                    >
                      {plan.name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{plan.users}</p>
                    <p className="text-xs text-muted-foreground">{plan.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Templates */}
      {data && data.trendingTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Templates em Alta (Últimas 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.trendingTemplates.map((template, index) => (
                <div key={template.templateId} className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2 bg-green-500 text-white">
                    #{index + 1}
                  </Badge>
                  <h4 className="font-medium text-sm mb-1">
                    {getTemplateDisplayName(template.templateId)}
                  </h4>
                  <p className="text-2xl font-bold text-green-500">
                    {template.count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    usos
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}