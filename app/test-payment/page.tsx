"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function TestPaymentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const testCheckout = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'pro',
          paymentMethod: 'pix',
          billingCycle: 'monthly'
        })
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data: data
      })

      if (data.url) {
        // Auto redirect after 3 seconds
        setTimeout(() => {
          window.location.href = data.url
        }, 3000)
      }
    } catch (error: any) {
      setResult({
        status: 'error',
        data: { error: error.message }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Pagamento</CardTitle>
          <CardDescription>
            Teste do checkout do MercadoPago com valor de R$ 1,00
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Este botão irá criar uma sessão de checkout para:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Plano: Pro</li>
              <li>Valor: R$ 1,00</li>
              <li>Método: PIX</li>
              <li>Ciclo: Mensal</li>
            </ul>
          </div>

          <Button 
            onClick={testCheckout} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando checkout...
              </>
            ) : (
              'Testar Checkout'
            )}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold text-sm mb-2">Resultado:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.data?.url && (
                <p className="mt-2 text-sm text-green-600">
                  Redirecionando em 3 segundos...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}