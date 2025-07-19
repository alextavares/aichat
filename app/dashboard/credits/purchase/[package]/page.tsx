import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Coins, Star, Crown, X, ArrowLeft, CreditCard, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { CreditService } from '@/lib/credit-service'

const creditPackages: Record<string, any> = {
  basic: {
    id: 'basic',
    credits: 5000,
    price: 59.00,
    originalPrice: null,
    discount: null,
    icon: Coins,
    features: [
      '56 imagens com Flux Pro ou 37 imagens com GPT Images',
      '30 minutos de modo de voz da IA',
      '32 mil caracteres no recurso de áudio sintético',
      '14 vídeos com Haiper'
    ]
  },
  popular: {
    id: 'popular',
    credits: 10000,
    price: 99.00,
    originalPrice: 116.47,
    discount: '15% off',
    icon: Star,
    popular: true,
    features: [
      '112 imagens com Flux Pro ou 74 imagens com GPT Images',
      '60 minutos de modo de voz da IA',
      '64 mil caracteres no recurso de áudio sintético',
      '28 vídeos com Haiper'
    ]
  },
  premium: {
    id: 'premium',
    credits: 20000,
    price: 159.00,
    originalPrice: 227.06,
    discount: '30% off',
    icon: Crown,
    features: [
      '224 imagens com Flux Pro ou 148 imagens com GPT Images',
      '120 minutos de modo de voz da IA',
      '128 mil caracteres no recurso de áudio sintético',
      '56 vídeos com Haiper'
    ]
  }
}

interface PageProps {
  params: {
    package: string
  }
}

export default async function PackagePurchasePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const packageData = creditPackages[params.package]
  if (!packageData) {
    notFound()
  }

  const Icon = packageData.icon

  let creditBalance = 0
  try {
    creditBalance = await CreditService.getBalance(session.user.id)
  } catch (error) {
    console.error('Error fetching credit balance:', error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/credits/purchase">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Finalizar Compra</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Package Summary */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {packageData.credits.toLocaleString('pt-BR')} créditos
                  </div>
                  {packageData.discount && (
                    <Badge className="bg-red-600 text-white text-xs">
                      {packageData.discount}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price */}
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  R$ {packageData.price.toFixed(2).replace('.', ',')}
                </div>
                {packageData.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    De: R$ {packageData.originalPrice.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-white">O que você recebe:</h4>
                {packageData.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Current Balance */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Saldo atual:</span>
                  <span className="text-white font-medium">
                    {creditBalance.toLocaleString('pt-BR')} créditos
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Após compra:</span>
                  <span className="text-green-400 font-medium">
                    {(creditBalance + packageData.credits).toLocaleString('pt-BR')} créditos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Escolha a forma de pagamento</CardTitle>
              <CardDescription className="text-gray-400">
                Selecione como você deseja pagar pelos créditos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PIX */}
              <Button 
                className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white justify-start gap-4"
                asChild
              >
                <Link href={`/dashboard/credits/payment/pix?package=${params.package}`}>
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-teal-600">PIX</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">PIX</div>
                    <div className="text-sm opacity-90">Aprovação instantânea</div>
                  </div>
                </Link>
              </Button>

              {/* Credit Card */}
              <Button 
                className="w-full h-16 bg-gray-800 hover:bg-gray-700 text-white justify-start gap-4 border border-gray-600"
                asChild
              >
                <Link href={`/dashboard/credits/payment/card?package=${params.package}`}>
                  <CreditCard className="h-6 w-6 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium">Cartão de Crédito</div>
                    <div className="text-sm text-gray-400">Visa, Mastercard, Elo</div>
                  </div>
                </Link>
              </Button>

              {/* Boleto */}
              <Button 
                className="w-full h-16 bg-gray-800 hover:bg-gray-700 text-white justify-start gap-4 border border-gray-600"
                asChild
              >
                <Link href={`/dashboard/credits/payment/boleto?package=${params.package}`}>
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">B</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Boleto Bancário</div>
                    <div className="text-sm text-gray-400">Aprovação em 1-3 dias úteis</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Info */}
        <Card className="mt-8 bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Créditos adicionados automaticamente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Suporte 24/7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}