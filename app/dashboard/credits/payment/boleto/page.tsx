import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Download, FileText, Clock, X, ArrowLeft, Calendar, Copy } from 'lucide-react'
import Link from 'next/link'

const creditPackages: Record<string, any> = {
  basic: {
    id: 'basic',
    credits: 5000,
    price: 59.00,
    name: 'Pacote Básico'
  },
  popular: {
    id: 'popular',
    credits: 10000,
    price: 99.00,
    name: 'Pacote Popular'
  },
  premium: {
    id: 'premium',
    credits: 20000,
    price: 159.00,
    name: 'Pacote Premium'
  }
}

interface PageProps {
  searchParams: {
    package?: string
  }
}

export default async function BoletoPaymentPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const packageId = searchParams.package
  if (!packageId || !creditPackages[packageId]) {
    notFound()
  }

  const packageData = creditPackages[packageId]

  // Generate fake boleto data for demo
  const boletoCode = `23791.23456 78901.234567 89012.345678 9 12340000${Math.floor(packageData.price * 100).toString().padStart(8, '0')}`
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3) // 3 days from now

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/credits/purchase/${packageId}`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Pagamento via Boleto</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{packageData.name}</span>
                  <span className="text-white">{packageData.credits.toLocaleString('pt-BR')} créditos</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold border-t border-gray-700 pt-4">
                  <span className="text-white">Total</span>
                  <span className="text-white">R$ {packageData.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Como pagar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-white font-medium">Baixe o boleto</div>
                      <div className="text-gray-400 text-sm">Clique no botão para baixar o PDF do boleto</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="text-white font-medium">Pague no banco</div>
                      <div className="text-gray-400 text-sm">Use o app do banco ou vá a uma agência/lotérica</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="text-white font-medium">Aguarde confirmação</div>
                      <div className="text-gray-400 text-sm">Os créditos serão adicionados em até 3 dias úteis</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Due Date Warning */}
            <Card className="bg-orange-900/20 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-orange-400 font-medium">
                      Vencimento: {dueDate.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-orange-300/80 text-sm">
                      Após o vencimento, será necessário gerar um novo boleto
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Boleto Download and Code */}
          <div className="space-y-6">
            {/* Download Boleto */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-white">Boleto Bancário</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="w-full h-48 bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-600">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <div className="text-gray-400 text-sm">
                    Boleto bancário pronto para download
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  onClick={() => {
                    // In a real app, this would trigger boleto generation and download
                    alert('Em uma implementação real, o boleto seria gerado e baixado automaticamente.')
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Boleto PDF
                </Button>
                
                <p className="text-gray-400 text-sm">
                  Arquivo PDF com código de barras para pagamento
                </p>
              </CardContent>
            </Card>

            {/* Boleto Code */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Código do Boleto</CardTitle>
                <CardDescription className="text-gray-400">
                  Digite este código no app do seu banco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <textarea
                    value={boletoCode}
                    readOnly
                    className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 text-sm resize-none font-mono"
                  />
                  <Button
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    onClick={() => navigator.clipboard?.writeText(boletoCode)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                
                <div className="text-sm text-gray-400">
                  Use este código para pagar via app bancário ou internet banking
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Informações do Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Beneficiário:</span>
                  <span className="text-white">Inner AI Clone LTDA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CNPJ:</span>
                  <span className="text-white">12.345.678/0001-90</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-white">R$ {packageData.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vencimento:</span>
                  <span className="text-white">{dueDate.toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Monitoring */}
        <Card className="mt-8 bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-blue-400 font-medium">Aguardando pagamento do boleto</div>
              <div className="text-blue-300/80 text-sm">
                Após a confirmação do pagamento pelo banco, os créditos serão adicionados automaticamente à sua conta em até 3 dias úteis.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}