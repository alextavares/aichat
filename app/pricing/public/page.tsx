"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Para começar a explorar',
    price: 0,
    features: [
      '10 mensagens por dia',
      '100k tokens por mês',
      'Modelo GPT-3.5 Turbo',
      'Templates públicos',
    ],
    limitations: [
      'Sem modelos avançados',
      'Sem suporte prioritário',
      'Sem base de conhecimento',
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais',
    price: 1, // Preço de teste
    originalPrice: 49,
    features: [
      'Mensagens ilimitadas',
      '1M tokens por mês',
      'Todos os modelos de IA',
      'Templates personalizados',
      'Base de conhecimento',
      'Suporte prioritário',
      'API access',
    ],
    limitations: []
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para empresas',
    price: 2, // Preço de teste
    originalPrice: 199,
    features: [
      'Tudo do Pro',
      'Tokens ilimitados',
      'SSO/SAML',
      'SLA garantido',
      'Suporte dedicado',
      'Treinamento personalizado',
      'Implantação on-premise',
    ],
    limitations: []
  }
]

export default function PublicPricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/signup')
      return
    }

    setLoading(planId)
    
    try {
      // Primeiro verificar se o usuário está logado
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentMethod: 'pix',
          billingCycle,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // Não está logado, redirecionar para login
        router.push(`/auth/signin?callbackUrl=/pricing`)
        return
      }

      if (data.url) {
        // Redirecionar para o checkout
        window.location.href = data.url
      } else {
        console.error('Erro ao criar checkout:', data.error)
        alert('Erro ao processar pagamento. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">InnerAI - Preços</h1>
          <Button variant="ghost" onClick={() => router.push('/')}>
            Voltar
          </Button>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Escolha seu plano</h2>
            <p className="text-muted-foreground mb-6">
              Comece gratuitamente e faça upgrade quando precisar
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center space-x-4 p-1 bg-muted rounded-lg">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  billingCycle === 'monthly' 
                    ? 'bg-background shadow-sm' 
                    : 'text-muted-foreground'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Mensal
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  billingCycle === 'yearly' 
                    ? 'bg-background shadow-sm' 
                    : 'text-muted-foreground'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Anual
                <span className="ml-1 text-xs text-green-600">-60%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              const isYearly = billingCycle === 'yearly'
              const price = plan.price
              const displayPrice = isYearly && plan.price > 0 
                ? (price * 12 * 0.4).toFixed(2) // 60% de desconto
                : price

              return (
                <Card 
                  key={plan.id} 
                  className={plan.id === 'pro' ? 'border-primary shadow-lg' : ''}
                >
                  <CardHeader>
                    {plan.id === 'pro' && (
                      <div className="text-center mb-2">
                        <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                          Mais Popular
                        </span>
                      </div>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          R$ {plan.originalPrice}
                        </div>
                      )}
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">R$ {displayPrice}</span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground ml-2">
                            /{isYearly ? 'ano' : 'mês'}
                          </span>
                        )}
                      </div>
                      {plan.price > 0 && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Preço promocional de teste
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start">
                          <X className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.id === 'pro' ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading !== null}
                    >
                      {loading === plan.id ? 'Processando...' : 
                       plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-12 text-center text-muted-foreground">
            <p>Todos os planos incluem 14 dias de garantia</p>
            <p className="mt-2">
              Dúvidas? Entre em contato: suporte@innerai.com
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}