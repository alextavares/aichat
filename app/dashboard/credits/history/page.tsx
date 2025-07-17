import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { CreditTransactionList } from '@/components/dashboard/credit-transaction-list'
import { CreditStats } from '@/components/dashboard/credit-stats'

export default async function CreditHistoryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Histórico de Créditos</h1>
            <p className="text-gray-400 mt-1">
              Acompanhe todas as suas transações de créditos
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CreditStats />
      </div>

      {/* Transactions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="h-5 w-5" />
            Transações Recentes
          </CardTitle>
          <CardDescription className="text-gray-400">
            Histórico completo de compras e consumo de créditos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreditTransactionList />
        </CardContent>
      </Card>
    </div>
  )
}