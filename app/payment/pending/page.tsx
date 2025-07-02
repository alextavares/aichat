"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'

function PaymentPendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  
  useEffect(() => {
    // Extract payment information from URL params
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalRef = searchParams.get('external_reference')
    
    if (paymentId && externalRef) {
      try {
        const parsedRef = JSON.parse(externalRef)
        setPaymentInfo({
          paymentId,
          status,
          userId: parsedRef.userId,
          planId: parsedRef.planId,
          billingCycle: parsedRef.billingCycle
        })
      } catch (e) {
        console.error('Error parsing external_reference:', e)
      }
    }
  }, [searchParams])

  const handleDashboardClick = () => {
    // If we have payment info with userId, try to go to login with pre-filled info
    if (paymentInfo?.userId) {
      // For now, redirect to login page with a return URL
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/dashboard')}&payment_pending=true`)
    } else {
      router.push('/dashboard')
    }
  }

  const getStatusIcon = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      case 'rejected':
        return <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      default:
        return <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
    }
  }

  const getStatusTitle = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    switch (status) {
      case 'approved':
        return 'Pagamento Aprovado!'
      case 'pending':
        return 'Pagamento Pendente'
      case 'rejected':
        return 'Pagamento Rejeitado'
      default:
        return 'Processando Pagamento'
    }
  }

  const getStatusDescription = () => {
    const status = paymentInfo?.status || searchParams.get('status')
    switch (status) {
      case 'approved':
        return 'Seu pagamento foi aprovado e seu plano será ativado em instantes.'
      case 'pending':
        return 'Estamos aguardando a confirmação do pagamento'
      case 'rejected':
        return 'Houve um problema com seu pagamento. Tente novamente.'
      default:
        return 'Processando seu pagamento...'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {getStatusIcon()}
          <CardTitle>{getStatusTitle()}</CardTitle>
          <CardDescription>
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentInfo && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p><strong>Plano:</strong> {paymentInfo.planId.toUpperCase()}</p>
              <p><strong>Ciclo:</strong> {paymentInfo.billingCycle === 'yearly' ? 'Anual' : 'Mensal'}</p>
              <p><strong>ID do Pagamento:</strong> {paymentInfo.paymentId}</p>
            </div>
          )}
          
          <p className="text-center text-muted-foreground text-sm">
            {paymentInfo?.status === 'pending' ? 
              'Você receberá um email assim que o pagamento for confirmado. Isso pode levar alguns minutos ou até 3 dias úteis para boletos.' :
              paymentInfo?.status === 'approved' ?
              'Faça login para acessar seu novo plano.' :
              'Entre em contato conosco se precisar de ajuda.'
            }
          </p>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleDashboardClick} className="w-full">
              {paymentInfo?.status === 'approved' ? 'Fazer Login e Acessar Dashboard' : 'Ir para o Dashboard'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/pricing')}>
              Ver Planos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Clock className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  )
}