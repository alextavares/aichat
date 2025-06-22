"use client"

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group-simple'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, QrCode, FileText, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { PAYMENT_PLANS } from '@/lib/payment-service'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get('plan') || 'pro'
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card')
  const [installments, setInstallments] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const plan = PAYMENT_PLANS.find(p => p.id === planId)
  
  if (!plan || plan.price === 0) {
    router.push('/pricing')
    return null
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod,
          installments: paymentMethod === 'card' ? installments : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao criar sessão de checkout')
      }

      const data = await response.json()
      
      // Redirect to payment provider
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const installmentOptions = [1, 2, 3, 6, 12]
  const installmentPrice = plan.price / installments

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Finalizar Assinatura</CardTitle>
          <CardDescription>
            Complete seu pagamento para ativar o plano {plan.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Plano {plan.name}</h3>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                R$ {plan.price}/mês
              </Badge>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Método de Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-muted-foreground">Parcelamento disponível</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Pix</p>
                    <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="boleto" id="boleto" />
                <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileText className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Boleto Bancário</p>
                    <p className="text-sm text-muted-foreground">Vencimento em 3 dias</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Installments (only for credit card) */}
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Parcelamento</Label>
              <Select value={installments.toString()} onValueChange={(value) => setInstallments(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {installmentOptions.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}x de R$ {(plan.price / option).toFixed(2)} sem juros
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Total Summary */}
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <div className="text-right">
                {paymentMethod === 'card' && installments > 1 ? (
                  <>
                    <p className="text-2xl">
                      {installments}x R$ {installmentPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground font-normal">
                      Total: R$ {plan.price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl">R$ {plan.price.toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/pricing')}
              className="flex-1"
              disabled={isLoading}
            >
              Voltar
            </Button>
            <Button
              onClick={handleCheckout}
              className="flex-1 gradient-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Finalizar Pagamento'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}