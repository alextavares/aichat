"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing')

  useEffect(() => {
    // Processar o pagamento e atualizar o plano do usuário
    const processPayment = async () => {
      try {
        const paymentId = searchParams.get('payment_id')
        const status = searchParams.get('status')
        const externalReference = searchParams.get('external_reference')

        console.log('Payment params:', {
          paymentId,
          status,
          externalReference
        })

        if (status === 'approved' && paymentId) {
          // Chamar a API para processar o pagamento
          const response = await fetch('/api/mercadopago/subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId,
              externalReference
            })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erro ao processar pagamento')
          }

          console.log('Payment processed:', data)
          
          setPaymentStatus('success')
          toast({
            title: "Pagamento confirmado!",
            description: "Seu plano foi ativado com sucesso.",
          })

          // Redirecionar após 3 segundos
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          throw new Error('Pagamento não aprovado')
        }
      } catch (error) {
        console.error('Error processing payment:', error)
        setPaymentStatus('error')
        toast({
          title: "Erro ao processar pagamento",
          description: error instanceof Error ? error.message : "Entre em contato com o suporte.",
          variant: "destructive"
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [searchParams, router])

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
          ) : paymentStatus === 'success' ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Pagamento Aprovado!</CardTitle>
              <CardDescription>
                Sua assinatura foi ativada com sucesso
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>Erro no Pagamento</CardTitle>
              <CardDescription>
                Não foi possível processar seu pagamento
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isProcessing && paymentStatus === 'success' && (
            <>
              <p className="text-center text-muted-foreground">
                Você já pode aproveitar todos os recursos do seu novo plano.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Redirecionando para o dashboard...
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
          {!isProcessing && paymentStatus === 'error' && (
            <>
              <p className="text-center text-muted-foreground">
                Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/pricing')} className="w-full">
                  Tentar Novamente
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Voltar ao Dashboard
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