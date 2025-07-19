import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, CreditCard, Lock, X, ArrowLeft, Calendar, Shield } from 'lucide-react'
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

export default async function CardPaymentPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const packageId = searchParams.package
  if (!packageId || !creditPackages[packageId]) {
    notFound()
  }

  const packageData = creditPackages[packageId]

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
          <h1 className="text-2xl font-semibold">Pagamento com Cartão</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
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

              {/* Security Features */}
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">Pagamento 100% Seguro</span>
                </div>
                <div className="space-y-2 text-sm text-green-300/80">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    <span>Criptografia SSL 256-bits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    <span>Não armazenamos dados do cartão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    <span>Processamento seguro via MercadoPago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                Dados do Cartão
              </CardTitle>
              <CardDescription className="text-gray-400">
                Preencha os dados do seu cartão de crédito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label className="text-white">Número do Cartão</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      maxLength={19}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label className="text-white">Nome no Cartão</Label>
                  <Input
                    type="text"
                    placeholder="João Silva"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Validade</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="MM/AA"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-8"
                        maxLength={5}
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">CVV</Label>
                    <Input
                      type="text"
                      placeholder="123"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-white font-medium mb-4">Endereço de Cobrança</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">CEP</Label>
                    <Input
                      type="text"
                      placeholder="12345-678"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      maxLength={9}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Estado</Label>
                      <Input
                        type="text"
                        placeholder="SP"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Cidade</Label>
                      <Input
                        type="text"
                        placeholder="São Paulo"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 mt-6"
                  type="submit"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Pagar R$ {packageData.price.toFixed(2).replace('.', ',')}
                </Button>
              </form>

              {/* Accepted Cards */}
              <div className="border-t border-gray-700 pt-4">
                <div className="text-sm text-gray-400 mb-3">Cartões aceitos:</div>
                <div className="flex gap-3">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">VISA</span>
                  </div>
                  <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">MC</span>
                  </div>
                  <div className="w-10 h-6 bg-yellow-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">ELO</span>
                  </div>
                  <div className="w-10 h-6 bg-blue-800 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">AMEX</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Info */}
        <Card className="mt-8 bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <div className="text-blue-400 font-medium">Processamento Instantâneo</div>
              <div className="text-blue-300/80 text-sm">
                Após a confirmação do pagamento, os créditos serão adicionados automaticamente à sua conta.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}