"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function PaymentFailurePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle>Pagamento não aprovado</CardTitle>
          <CardDescription>
            Não foi possível processar seu pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Verifique os dados do pagamento e tente novamente. Se o problema persistir, entre em contato com o suporte.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push('/pricing')} className="w-full">
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}