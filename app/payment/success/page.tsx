"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Processar o pagamento e atualizar o plano do usuário
    const processPayment = async () => {
      try {
        const paymentId = searchParams.get('payment_id')
        const status = searchParams.get('status')
        const merchantOrderId = searchParams.get('merchant_order_id')

        if (status === 'approved' && paymentId) {
          // Aqui você pode fazer uma chamada para sua API para confirmar o pagamento
          // e atualizar o plano do usuário
          console.log('Payment approved:', { paymentId, merchantOrderId })
          
          // Simular processamento
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          toast({
            title: "Pagamento confirmado!",
            description: "Seu plano foi ativado com sucesso.",
          })
        }
      } catch (error) {
        console.error('Error processing payment:', error)
        toast({
          title: "Erro ao processar pagamento",
          description: "Entre em contato com o suporte.",
          variant: "destructive"
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isProcessing ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <CardTitle>Processando seu pagamento...</CardTitle>
              <CardDescription>
                Aguarde enquanto confirmamos sua assinatura
              </CardDescription>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Pagamento Aprovado!</CardTitle>
              <CardDescription>
                Sua assinatura foi ativada com sucesso
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isProcessing && (
            <>
              <p className="text-center text-muted-foreground">
                Você já pode aproveitar todos os recursos do seu novo plano.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/dashboard/chat')} className="w-full">
                  Ir para o Chat
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Ir para o Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <CardTitle>Carregando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}