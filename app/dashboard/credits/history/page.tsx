import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Minus, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  X, 
  ArrowLeft,
  Calendar,
  FileText,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { CreditService } from '@/lib/credit-service'

// Mock transaction data - in a real app, this would come from the database
const mockTransactions = [
  {
    id: '1',
    type: 'purchase',
    amount: 10000,
    price: 99.00,
    description: 'Compra de créditos - Pacote Popular',
    method: 'PIX',
    status: 'completed',
    date: new Date('2024-01-15T10:30:00'),
    packageName: 'Pacote Popular'
  },
  {
    id: '2',
    type: 'usage',
    amount: -150,
    description: 'Geração de imagem - Flux Pro',
    model: 'Flux Pro',
    status: 'completed',
    date: new Date('2024-01-14T15:45:00')
  },
  {
    id: '3',
    type: 'usage',
    amount: -200,
    description: 'Síntese de voz - 5 minutos',
    model: 'TTS',
    status: 'completed',
    date: new Date('2024-01-14T09:20:00')
  },
  {
    id: '4',
    type: 'purchase',
    amount: 5000,
    price: 59.00,
    description: 'Compra de créditos - Pacote Básico',
    method: 'Cartão de Crédito',
    status: 'completed',
    date: new Date('2024-01-10T14:15:00'),
    packageName: 'Pacote Básico'
  },
  {
    id: '5',
    type: 'usage',
    amount: -100,
    description: 'Geração de vídeo - Haiper',
    model: 'Haiper',
    status: 'completed',
    date: new Date('2024-01-09T11:30:00')
  }
]

const monthlyStats = {
  totalPurchased: 15000,
  totalSpent: 450,
  currentBalance: 14550,
  totalTransactions: 23,
  purchaseAmount: 158.00
}

export default async function CreditHistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  let creditBalance = 0
  try {
    creditBalance = await CreditService.getBalance(session.user.id)
  } catch (error) {
    console.error('Error fetching credit balance:', error)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    return type === 'purchase' ? Plus : Minus
  }

  const getTransactionColor = (type: string) => {
    return type === 'purchase' ? 'text-green-400' : 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-600',
      pending: 'bg-yellow-600',
      failed: 'bg-red-600'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-600'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Histórico de Créditos</h1>
        </div>
        <Link href="/dashboard/credits/purchase">
          <Button className="bg-white text-black hover:bg-gray-100">
            <Plus className="h-4 w-4 mr-2" />
            Comprar Créditos
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Saldo Atual</p>
                  <p className="text-2xl font-bold text-white">
                    {creditBalance.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Comprados este mês</p>
                  <p className="text-2xl font-bold text-green-400">
                    {monthlyStats.totalPurchased.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Gastos este mês</p>
                  <p className="text-2xl font-bold text-red-400">
                    {monthlyStats.totalSpent.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Minus className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total investido</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {monthlyStats.purchaseAmount.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">Todas as transações</SelectItem>
                    <SelectItem value="purchase">Apenas compras</SelectItem>
                    <SelectItem value="usage">Apenas gastos</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-time">
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all-time">Todo o período</SelectItem>
                    <SelectItem value="this-month">Este mês</SelectItem>
                    <SelectItem value="last-month">Mês passado</SelectItem>
                    <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
              Todas ({mockTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-gray-700">
              Compras ({mockTransactions.filter(t => t.type === 'purchase').length})
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-gray-700">
              Gastos ({mockTransactions.filter(t => t.type === 'usage').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type)
              const colorClass = getTransactionColor(transaction.type)
              
              return (
                <Card key={transaction.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'purchase' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-gray-400 text-sm">
                            {formatDate(transaction.date)}
                            {transaction.method && ` • ${transaction.method}`}
                            {transaction.model && ` • ${transaction.model}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-semibold ${colorClass}`}>
                          {transaction.type === 'purchase' ? '+' : ''}{transaction.amount.toLocaleString('pt-BR')} créditos
                        </div>
                        {transaction.price && (
                          <div className="text-gray-400 text-sm">
                            R$ {transaction.price.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        <Badge className={`${getStatusBadge(transaction.status)} text-white text-xs mt-1`}>
                          {transaction.status === 'completed' ? 'Concluído' : 
                           transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            {mockTransactions.filter(t => t.type === 'purchase').map((transaction) => {
              const Icon = getTransactionIcon(transaction.type)
              const colorClass = getTransactionColor(transaction.type)
              
              return (
                <Card key={transaction.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-gray-400 text-sm">
                            {formatDate(transaction.date)} • {transaction.method}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-semibold ${colorClass}`}>
                          +{transaction.amount.toLocaleString('pt-BR')} créditos
                        </div>
                        <div className="text-gray-400 text-sm">
                          R$ {transaction.price?.toFixed(2).replace('.', ',')}
                        </div>
                        <Badge className="bg-green-600 text-white text-xs mt-1">
                          Concluído
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            {mockTransactions.filter(t => t.type === 'usage').map((transaction) => {
              const Icon = getTransactionIcon(transaction.type)
              const colorClass = getTransactionColor(transaction.type)
              
              return (
                <Card key={transaction.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-gray-400 text-sm">
                            {formatDate(transaction.date)} • {transaction.model}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-semibold ${colorClass}`}>
                          {transaction.amount.toLocaleString('pt-BR')} créditos
                        </div>
                        <Badge className="bg-red-600 text-white text-xs mt-1">
                          Concluído
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {mockTransactions.length === 0 && (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-400 mb-6">
                Você ainda não possui histórico de transações de créditos.
              </p>
              <Link href="/dashboard/credits/purchase">
                <Button className="bg-white text-black hover:bg-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Comprar Primeiros Créditos
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}