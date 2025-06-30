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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const plans = [
  {
    id: 'free',
    name: 'Grátis',
    description: 'Experimente gratuitamente',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    features: [
      { text: 'Mensagens ilimitadas com modelos rápidos', included: true },
      { text: '120 mensagens/mês com modelos avançados', included: true },
      { text: 'GPT-4o Mini, Deepseek 3.1, Claude 3.5 Haiku', included: true },
      { text: 'Criação de 1 assistente personalizado', included: true },
      { text: 'Até 2 anexos por chat', included: true },
      { text: 'Geração de imagem/áudio/vídeo', included: false },
      { text: 'Assistentes ilimitados', included: false },
      { text: 'Anexos ilimitados', included: false },
    ],
    buttonText: 'Começar Grátis',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais',
    monthlyPrice: 1.00,  // Valor de teste
    yearlyPrice: 0.40,   // 60% de desconto
    yearlyTotal: 4.80,   // 0.40 * 12
    icon: Crown,
    features: [
      { text: 'Mensagens ilimitadas com modelos rápidos', included: true },
      { text: 'Mensagens ilimitadas com modelos avançados', included: true },
      { text: 'GPT-4o, Claude 4 Sonnet, Gemini 2.5 Pro', included: true },
      { text: '7.000 créditos mensais para imagem/áudio/vídeo', included: true },
      { text: 'Criação ilimitada de assistentes', included: true },
      { text: 'Anexos ilimitados nos chats', included: true },
      { text: 'Suporte prioritário', included: true },
    ],
    buttonText: 'Assinar Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para empresas',
    monthlyPrice: 2.00,   // Valor de teste
    yearlyPrice: 0.80,    // 60% de desconto
    yearlyTotal: 9.60,    // 0.80 * 12
    icon: Building2,
    features: [
      { text: 'Tudo do plano Pro', included: true },
      { text: 'API dedicada', included: true },
      { text: 'SLA garantido', included: true },
      { text: 'Modelos customizados', included: true },
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
  const [isYearly, setIsYearly] = useState(false)

  const handleSelectPlan = async (planId: string, isYearlyPlan: boolean = false) => {
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
    const billing = isYearlyPlan ? 'yearly' : 'monthly'
    router.push(`/checkout?plan=${planId}&billing=${billing}`)
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
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label 
              htmlFor="billing-toggle" 
              className={cn(
                "text-lg font-medium transition-colors",
                !isYearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Mensal
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <Label 
              htmlFor="billing-toggle" 
              className={cn(
                "text-lg font-medium transition-colors",
                isYearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Anual
              <Badge className="ml-2 bg-green-500/10 text-green-600 border-green-500/20">
                -60%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
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
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-4xl font-bold">Grátis</span>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div>
                            <span className="text-4xl font-bold">
                              R$ {isYearly ? plan.yearlyPrice?.toFixed(2) : plan.monthlyPrice.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">/mês</span>
                          </div>
                          {isYearly && plan.yearlyTotal && (
                            <p className="text-sm text-muted-foreground">
                              R$ {plan.yearlyTotal.toFixed(2)}/ano
                            </p>
                          )}
                          {isYearly && plan.monthlyPrice > 0 && (
                            <p className="text-sm text-green-600 font-medium">
                              Economia de R$ {((plan.monthlyPrice * 12 - plan.yearlyTotal!).toFixed(2))}
                            </p>
                          )}
                        </div>
                      </>
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
                    onClick={() => handleSelectPlan(plan.id, isYearly)}
                    disabled={isLoading === plan.id}
                  >
                    {isLoading === plan.id ? "Carregando..." : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Annual Discount Banner */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              🎉 Economize 60% no Plano Anual!
            </h3>
            <p className="text-muted-foreground">
              Assine qualquer plano anual e economize o equivalente a mais de 7 meses grátis
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                Vocês oferecem garantia?
              </h3>
              <p className="text-muted-foreground">
                Sim! Oferecemos garantia de reembolso de 7 dias em todos os planos pagos. 
                Se não ficar satisfeito, devolvemos 100% do seu dinheiro.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">
                Como funciona o desconto anual?
              </h3>
              <p className="text-muted-foreground">
                Ao escolher o pagamento anual, você recebe 60% de desconto. 
                Por exemplo: o plano Pro sai por apenas R$ 31,96/mês quando pago anualmente.
              </p>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}