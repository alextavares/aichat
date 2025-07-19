import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Coins, Star, Crown, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreditService } from '@/lib/credit-service'

const creditPackages = [
  {
    id: 'basic',
    credits: 5000,
    price: 59.00,
    originalPrice: null,
    discount: null,
    icon: Coins,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    features: [
      '56 imagens com Flux Pro ou 37 imagens com GPT Images',
      '30 minutos de modo de voz da IA',
      '32 mil caracteres no recurso de áudio sintético',
      '14 vídeos com Haiper'
    ]
  },
  {
    id: 'popular',
    credits: 10000,
    price: 99.00,
    originalPrice: 116.47,
    discount: '15% off',
    icon: Star,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    popular: true,
    features: [
      '112 imagens com Flux Pro ou 74 imagens com GPT Images',
      '60 minutos de modo de voz da IA',
      '64 mil caracteres no recurso de áudio sintético',
      '28 vídeos com Haiper'
    ]
  },
  {
    id: 'premium',
    credits: 20000,
    price: 159.00,
    originalPrice: 227.06,
    discount: '30% off',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    features: [
      '224 imagens com Flux Pro ou 148 imagens com GPT Images',
      '120 minutos de modo de voz da IA',
      '128 mil caracteres no recurso de áudio sintético',
      '56 vídeos com Haiper'
    ]
  }
]

export default async function PurchaseCreditsPage() {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">Adicionar Créditos</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Description */}
        <div className="text-center mb-12">
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Créditos adicionais nunca expiram e podem ser usados enquanto você tem uma assinatura ativa.
          </p>
        </div>

        {/* Credit Packages */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {creditPackages.map((pkg) => {
            const Icon = pkg.icon
            return (
              <Card 
                key={pkg.id}
                className="relative bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200"
              >
                {/* Discount Badge */}
                {pkg.discount && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <Badge className="bg-red-600 text-white px-3 py-1 text-sm">
                      {pkg.discount}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 pb-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {pkg.credits.toLocaleString('pt-BR')} créditos
                    </h3>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-white">
                        R$ {pkg.price.toFixed(2).replace('.', ',')}
                      </div>
                      {pkg.originalPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          R$ {pkg.originalPrice.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-sm text-gray-300">
                    Com {pkg.credits.toLocaleString('pt-BR')} créditos você pode:
                  </div>

                  <div className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3"
                    asChild
                  >
                    <Link href={`/dashboard/credits/purchase/${pkg.id}`}>
                      Comprar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Payment Methods */}
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center gap-6">
            <div className="flex items-center gap-2 bg-teal-600 rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold text-teal-600">PIX</span>
              </div>
              <span className="text-white font-medium">PIX</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-gray-300">Mastercard</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">V</span>
              </div>
              <span className="text-gray-300">Visa</span>
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-gray-300">e outros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}