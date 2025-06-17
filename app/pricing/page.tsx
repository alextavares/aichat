'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    dailyMessages: number | null
    monthlyTokens: number | null
    models: string[]
  }
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    features: [
      '10 mensagens por dia',
      '100k tokens por mês',
      'Modelo GPT-3.5 Turbo',
      'Chat básico',
      'Histórico de conversas',
      'Templates públicos'
    ],
    limits: {
      dailyMessages: 10,
      monthlyTokens: 100000,
      models: ['gpt-3.5-turbo']
    }
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 49.90,
    popular: true,
    features: [
      '500 mensagens por dia',
      '5M tokens por mês',
      'Todos os modelos GPT',
      'Prioridade nas respostas',
      'Templates premium',
      'Exportar conversas',
      'Suporte prioritário'
    ],
    limits: {
      dailyMessages: 500,
      monthlyTokens: 5000000,
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    }
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 199.90,
    features: [
      'Mensagens ilimitadas',
      'Tokens ilimitados',
      'Todos os modelos de IA',
      'API personalizada',
      'Integrações customizadas',
      'Suporte 24/7',
      'SLA garantido',
      'Treinamento personalizado'
    ],
    limits: {
      dailyMessages: null,
      monthlyTokens: null,
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude', 'gemini']
    }
  }
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (planId === 'free') {
      return
    }

    setLoading(planId)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          priceId: planId === 'pro' ? 'price_pro' : 'price_enterprise'
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold">Planos e Preços</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-xl text-muted-foreground">
            Comece grátis e faça upgrade quando precisar
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-lg border p-8 transition-all
                ${plan.popular 
                  ? 'border-blue-600 shadow-lg scale-105' 
                  : 'border-border'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  {plan.price === 0 ? (
                    'Grátis'
                  ) : (
                    <>R$ {plan.price}<span className="text-lg font-normal">/mês</span></>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? (
                  'Processando...'
                ) : plan.price === 0 ? (
                  'Plano Atual'
                ) : (
                  'Começar Agora'
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h3>
          
          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                Como funciona o limite de tokens?
              </h4>
              <p className="text-muted-foreground">
                Tokens são unidades de texto processadas pela IA. Em média, 1000 tokens equivalem a cerca de 750 palavras.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                Posso trocar de plano depois?
              </h4>
              <p className="text-muted-foreground">
                Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}