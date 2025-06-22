"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Activity } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalMessages: number
    totalConversations: number
    totalCost: number
    totalTokens: number
  }
  chartData: Array<{
    date: string
    messages: number
    tokens: number
    cost: number
  }>
  recentActivity: Array<{
    id: string
    title: string | null
    createdAt: Date
    modelUsed: string | null
    _count: { messages: number }
  }>
  modelUsage: Array<{
    model: string
    count: number
    tokens: number
  }>
}

interface AnalyticsChartProps {
  data: AnalyticsData
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const { overview, chartData, recentActivity, modelUsage } = data

  // Simple bar chart representation
  const maxMessages = Math.max(...chartData.map(d => d.messages), 1)
  const maxTokens = Math.max(...chartData.map(d => d.tokens), 1)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Todas as mensagens enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Criadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Total de conversas iniciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Utilizados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {overview.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Messages Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Uso Diário - Mensagens</CardTitle>
            <CardDescription>Mensagens enviadas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center">
                  <div className="w-20 text-sm">
                    {new Date(day.date).toLocaleDateString('pt-BR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1 mx-3">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ 
                        width: `${Math.max((day.messages / maxMessages) * 100, 2)}%` 
                      }}
                    />
                  </div>
                  <div className="w-12 text-sm text-right">{day.messages}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso por Modelo</CardTitle>
            <CardDescription>Distribuição de uso dos modelos de IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modelUsage.map((model, index) => (
                <div key={model.model} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{model.model}</Badge>
                  </div>
                  <div className="text-sm">
                    {model.count} mensagens
                  </div>
                </div>
              ))}
              {modelUsage.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum uso registrado nos últimos 30 dias
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Suas conversas mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((conversation) => (
              <div key={conversation.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{conversation.title || 'Conversa sem título'}</p>
                  <p className="text-sm text-muted-foreground">
                    {conversation._count.messages} mensagens
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{conversation.modelUsed || 'Modelo não especificado'}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conversation.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma conversa encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}