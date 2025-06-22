"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Zap, Crown, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'

const plans = [
  {
    id: 'free',
    name: 'Grátis',
    description: 'Perfeito para começar',
    price: 0,
    icon: Zap,
    features: [
      { text: '50 mensagens por dia', included: true },
      { text: 'Acesso a GPT-3.5', included: true },
      { text: 'Histórico de 7 dias', included: true },
      { text: 'Templates básicos', included: true },
      { text: 'Modelos avançados', included: false },
      { text: 'API Access', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
    buttonText: 'Plano Atual',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais',
    price: 47,
    icon: Crown,
    features: [
      { text: 'Mensagens ilimitadas', included: true },
      { text: 'Todos os modelos de IA', included: true },
      { text: 'Histórico ilimitado', included: true },
      { text: 'Todos os templates', included: true },
      { text: 'Exportação de dados', included: true },
      { text: 'API Access básico', included: true },
      { text: 'Suporte por email', included: true },
    ],
    buttonText: 'Assinar Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para equipes e empresas',
    price: 197,
    icon: Building2,
    features: [
      { text: 'Tudo do plano Pro', included: true },
      { text: 'API Access completo', included: true },
      { text: 'Modelos customizados', included: true },
      { text: 'SLA garantido', included: true },
      { text: 'Treinamento dedicado', included: true },
      { text: 'Suporte 24/7', included: true },
      { text: 'Compliance LGPD', included: true },
    ],
    buttonText: 'Falar com Vendas',
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      toast({
        title: "Plano Grátis",
        description: "Você já está no plano grátis!",
      })
      return
    }

    if (!session) {
      router.push(`/auth/signin?callbackUrl=/pricing`)
      return
    }

    if (planId === 'enterprise') {
      // Redirect to contact form or email
      window.location.href = 'mailto:vendas@innerai.com?subject=Interesse no Plano Enterprise'
      return
    }

    setIsLoading(planId)
    router.push(`/checkout?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e faça upgrade conforme sua necessidade. 
            Cancele a qualquer momento.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative overflow-hidden border-2 transition-all hover:shadow-2xl",
                  plan.popular 
                    ? "border-primary shadow-xl scale-105" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg px-4 py-1 gradient-primary text-white">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/mês</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          !feature.included && "text-muted-foreground/50"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className={cn(
                      "w-full",
                      plan.popular ? "gradient-primary text-white" : ""
                    )}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading === plan.id}
                  >
                    {isLoading === plan.id ? "Carregando..." : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento. 
                Você continuará tendo acesso até o final do período pago.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                Quais formas de pagamento são aceitas?
              </h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito (Visa, Mastercard, Amex), 
                Pix e boleto bancário. Parcelamos em até 12x sem juros.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                Existe período de teste?
              </h3>
              <p className="text-muted-foreground">
                Oferecemos o plano grátis para você experimentar. 
                Para os planos pagos, garantimos reembolso em até 7 dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}