"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

export default function PaymentPendingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle>Pagamento Pendente</CardTitle>
          <CardDescription>
            Estamos aguardando a confirmação do pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Você receberá um email assim que o pagamento for confirmado. 
            Isso pode levar alguns minutos ou até 3 dias úteis para boletos.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Ir para o Dashboard
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