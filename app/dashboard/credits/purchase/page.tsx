import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  Check, 
  Zap, 
  ShoppingCart,
  ArrowLeft,
  CreditCard,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { CreditPackageCard } from '@/components/dashboard/credit-package-card'

export default async function CreditPurchasePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Adicionar Créditos</h1>
          <p className="text-gray-400 mt-1">
            Escolha o pacote ideal para suas necessidades e continue criando
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <Card className="mb-8 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-purple-400" />
            Por que usar créditos?
          </CardTitle>
          <CardDescription className="text-gray-300">
            Um sistema simples e flexível para usar todas as funcionalidades da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Check className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Uso Flexível</h4>
                <p className="text-sm text-gray-400">
                  Use créditos em qualquer ferramenta: chat, geração de imagens, voz e mais
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Check className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Sem Desperdício</h4>
                <p className="text-sm text-gray-400">
                  Créditos não expiram e você paga apenas pelo que usa
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Check className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Controle Total</h4>
                <p className="text-sm text-gray-400">
                  Monitore seu uso e histórico de créditos em tempo real
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">Pacotes de Créditos</h2>
        <p className="text-gray-400 mb-6">
          Escolha o pacote que melhor atende suas necessidades
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreditPackageCard 
            credits={5000}
            price={59.00}
            originalPrice={null}
            discount={null}
            isPopular={false}
            features={[
              "56 imagens com Flux Pro",
              "37 imagens com GPT Images",
              "30 minutos de modo de voz da IA",
              "32 mil caracteres no recurso de áudio sintético",
              "14 vídeos com Haiper"
            ]}
          />
          
          <CreditPackageCard 
            credits={10000}
            price={99.00}
            originalPrice={116.47}
            discount={15}
            isPopular={true}
            features={[
              "112 imagens com Flux Pro",
              "74 imagens com GPT Images", 
              "60 minutos de modo de voz da IA",
              "64 mil caracteres no recurso de áudio sintético",
              "28 vídeos com Haiper"
            ]}
          />
          
          <CreditPackageCard 
            credits={20000}
            price={159.00}
            originalPrice={227.06}
            discount={30}
            isPopular={false}
            features={[
              "224 imagens com Flux Pro",
              "148 imagens com GPT Images",
              "120 minutos de modo de voz da IA", 
              "128 mil caracteres no recurso de áudio sintético",
              "56 vídeos com Haiper"
            ]}
          />
        </div>
      </div>

      {/* Payment Methods */}
      <Card className="mb-8 bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5" />
            Métodos de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg">
              <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">VISA</span>
              </div>
              <span className="text-sm text-gray-300">Visa</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg">
              <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">MC</span>
              </div>
              <span className="text-sm text-gray-300">Mastercard</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg">
              <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">PIX</span>
              </div>
              <span className="text-sm text-gray-300">PIX</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Boleto</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Como funciona o sistema de créditos?</h4>
            <p className="text-sm text-gray-400">
              Cada ferramenta consome uma quantidade específica de créditos. Por exemplo, gerar uma imagem custa 135 créditos, enquanto usar o chat com GPT-4 custa entre 5-10 créditos por resposta.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Os créditos expiram?</h4>
            <p className="text-sm text-gray-400">
              Não! Seus créditos ficam disponíveis indefinidamente em sua conta até serem utilizados.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Posso pedir reembolso?</h4>
            <p className="text-sm text-gray-400">
              Sim, oferecemos reembolso total em até 7 dias após a compra, desde que menos de 10% dos créditos tenham sido utilizados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}