"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Zap,
  Loader2,
  TrendingUp,
  MessageSquare,
  Coins,
  Shield,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

interface Subscription {
  id: string
  planType: 'FREE' | 'PRO' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  startedAt: string
  expiresAt: string | null
  stripeSubscriptionId: string | null
}

interface Usage {
  dailyMessages: {
    used: number
    limit: number | null
  }
  monthlyTokens: {
    used: number
    limit: number | null
  }
}

const PLAN_DETAILS = {
  FREE: {
    name: 'Plano Gratuito',
    price: 0,
    color: 'secondary',
    icon: Shield,
    features: [
      '10 mensagens por dia',
      '100k tokens por mês',
      'Modelo GPT-3.5 Turbo',
      'Templates públicos',
    ],
  },
  PRO: {
    name: 'Plano Pro',
    price: 49.90,
    color: 'blue',
    icon: Zap,
    features: [
      '500 mensagens por dia',
      '5M tokens por mês',
      'Todos os modelos GPT',
      'Templates premium',
      'Suporte prioritário',
    ],
  },
  ENTERPRISE: {
    name: 'Plano Enterprise',
    price: 199.90,
    color: 'purple',
    icon: TrendingUp,
    features: [
      'Mensagens ilimitadas',
      'Tokens ilimitados',
      'Todos os modelos de IA',
      'API personalizada',
      'Suporte 24/7',
    ],
  },
}

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [hasSubscriptionError, setHasSubscriptionError] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const [subResponse, usageResponse] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/usage/today'),
      ])

      if (subResponse.ok) {
        const data = await subResponse.json()
        if (data.subscription === null) {
          // This indicates an inconsistency from the API (e.g., paid plan in User table but no Subscription record)
          setHasSubscriptionError(true)
          setSubscription(null)
        } else {
          // This will correctly set either a paid plan's subscription object
          // or the default FREE plan object if that's what the API returned.
          setSubscription(data.subscription)
          setHasSubscriptionError(false)
        }
      } else {
        // Handle non-ok response for subscription fetch
        setHasSubscriptionError(true)
        setSubscription(null)
        toast({
          title: "Erro de Rede",
          description: "Não foi possível carregar os dados da assinatura.",
          variant: "destructive",
        })
      }

      if (usageResponse.ok) {
        const data = await usageResponse.json()
        setUsage(data)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da assinatura.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription?.stripeSubscriptionId) return

    setIsCancelling(true)
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripeSubscriptionId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Assinatura cancelada",
          description: "Sua assinatura foi cancelada com sucesso.",
        })
        setShowCancelDialog(false)
        fetchSubscriptionData()
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a assinatura.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (hasSubscriptionError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano e acompanhe seu uso
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Houve um problema ao carregar os detalhes da sua assinatura.
            Por favor, tente recarregar a página. Se o problema persistir, entre em contato com o suporte técnico.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // If subscription is null here, it means it's genuinely a FREE plan (or an unhandled case after error checking)
  // The API now returns a FREE plan structure if user is FREE and no active paid subscription.
  // If subscription was null due to error, hasSubscriptionError would be true.
  const planDetails = subscription ? PLAN_DETAILS[subscription.planType] : PLAN_DETAILS.FREE;
  const PlanIcon = planDetails.icon;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e acompanhe seu uso
        </p>
      </div>

      {/* Success Alert */}
      {new URLSearchParams(window.location.search).get('success') === 'true' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Parabéns! Sua assinatura foi ativada com sucesso.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg bg-${planDetails.color}-100 dark:bg-${planDetails.color}-900`}>
                <PlanIcon className={`h-6 w-6 text-${planDetails.color}-600 dark:text-${planDetails.color}-400`} />
              </div>
              <div>
                <CardTitle>{planDetails.name}</CardTitle>
                <CardDescription>
                  {subscription?.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {subscription?.status || 'FREE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Iniciado em:{' '}
                {subscription && format(new Date(subscription.startedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            {subscription?.expiresAt && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Expira em:{' '}
                  {format(new Date(subscription.expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Recursos incluídos:</h4>
            <ul className="space-y-1">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            {subscription?.planType !== 'ENTERPRISE' && (
              <Button onClick={handleUpgrade} className="flex-1">
                Fazer Upgrade
              </Button>
            )}
            {subscription?.planType !== 'FREE' && subscription?.status === 'ACTIVE' && (
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
                className="flex-1"
              >
                Cancelar Assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mensagens Diárias</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Usadas hoje</span>
                <span className="font-medium">
                  {usage?.dailyMessages.used || 0} / {usage?.dailyMessages.limit || '∞'}
                </span>
              </div>
              {usage?.dailyMessages.limit && (
                <Progress
                  value={(usage.dailyMessages.used / usage.dailyMessages.limit) * 100}
                  className="h-2"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              O limite de mensagens diárias é zerado à meia-noite (UTC).
            </p>
          </CardContent>
        </Card>

        {/* Monthly Tokens */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tokens Mensais</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Usados este mês</span>
                <span className="font-medium">
                  {usage?.monthlyTokens.used?.toLocaleString() || 0} / {usage?.monthlyTokens.limit?.toLocaleString() || '∞'}
                </span>
              </div>
              {usage?.monthlyTokens.limit && (
                <Progress
                  value={(usage.monthlyTokens.used / usage.monthlyTokens.limit) * 100}
                  className="h-2"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              O limite de tokens mensais é zerado no primeiro dia de cada mês.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
          <CardDescription>
            Visualize seu método de pagamento atual ou acesse o portal seguro para gerenciá-lo e ver seu histórico de faturas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expira 12/25</p>
                {/* Em uma implementação real, você buscaria e exibiria dados reais aqui, se disponíveis e seguros. */}
                {/* Ex: <p className="text-sm text-muted-foreground">Cartão Visa terminando em 4242</p> */}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              // Lógica para redirecionar ao portal do Stripe/MercadoPago
              // Ex: router.push('/api/user/manage-subscription') que redirecionaria
              toast({ title: "Redirecionando...", description: "Você será redirecionado para o portal de pagamento." });
              // Por enquanto, apenas um placeholder:
              if (process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL_MOCK) {
                 window.location.href = process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL_MOCK;
              } else {
                 alert("A funcionalidade de portal de pagamento será implementada aqui.");
              }
            }}>
              Gerenciar Assinatura e Faturas
            </Button>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Você será redirecionado para o portal seguro do nosso processador de pagamentos (ex: Stripe) para gerenciar seus dados.
          </p>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar assinatura?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium
              no final do período atual de cobrança.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Manter assinatura
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Cancelar assinatura'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}