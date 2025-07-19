import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Copy, QrCode, Clock, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PixPaymentComponent } from '@/components/payment/pix-payment'

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

export default async function PixPaymentPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const packageId = searchParams.package
  if (!packageId || !creditPackages[packageId]) {
    notFound()
  }

  const packageData = creditPackages[packageId]

  // Generate fake PIX code for demo
  const pixCode = `00020126360014BR.GOV.BCB.PIX0114+551234567890123520400005303986540${packageData.price.toFixed(2)}5802BR5925Inner AI Clone6009SAO PAULO62070503***63041234`

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
          <h1 className="text-2xl font-semibold">Pagamento via PIX</h1>
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
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-white font-medium">Abra seu app do banco</div>
                      <div className="text-gray-400 text-sm">Acesse a função PIX no seu aplicativo bancário</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="text-white font-medium">Escaneie o QR Code</div>
                      <div className="text-gray-400 text-sm">Use a câmera para ler o código ou copie a chave PIX</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="text-white font-medium">Confirme o pagamento</div>
                      <div className="text-gray-400 text-sm">Os créditos serão adicionados automaticamente</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="bg-orange-900/20 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-orange-400 font-medium">Este PIX expira em 30 minutos</div>
                    <div className="text-orange-300/80 text-sm">Após expirar, será necessário gerar um novo código</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code and PIX Key */}
          <div className="space-y-6">
            {/* QR Code */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-white">QR Code PIX</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="w-64 h-64 mx-auto bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-black" />
                </div>
                <p className="text-gray-400 text-sm">
                  Escaneie este código com o app do seu banco
                </p>
              </CardContent>
            </Card>

            {/* PIX Copy & Paste */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Chave PIX</CardTitle>
                <CardDescription className="text-gray-400">
                  Copie e cole no seu app bancário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <textarea
                    value={pixCode}
                    readOnly
                    className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-300 text-sm resize-none"
                  />
                  <Button
                    className="absolute top-2 right-2 bg-teal-600 hover:bg-teal-700"
                    size="sm"
                    onClick={() => navigator.clipboard?.writeText(pixCode)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Monitoring */}
        <Card className="mt-8 bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-blue-400 font-medium">Aguardando pagamento...</div>
              <div className="text-blue-300/80 text-sm">
                Assim que o pagamento for confirmado, os créditos serão adicionados automaticamente à sua conta.
              </div>
              <div className="flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}