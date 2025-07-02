"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function TestFlowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  
  // Generate unique test data
  const testEmail = `test_${Date.now()}@innerai.com`
  const testPassword = 'Test123!@#'
  
  const [formData, setFormData] = useState({
    email: testEmail,
    password: testPassword,
    name: 'Test User',
    profession: 'Developer',
    organization: 'Test Org'
  })

  const createAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      setResults(prev => ({ ...prev, register: { status: response.status, data } }))
      
      if (response.ok) {
        setStep(2)
      }
    } catch (error: any) {
      setResults(prev => ({ ...prev, register: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const loginAccount = async () => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })
      
      setResults(prev => ({ ...prev, login: result }))
      
      if (result?.ok) {
        setStep(3)
      }
    } catch (error: any) {
      setResults(prev => ({ ...prev, login: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const testCheckout = async () => {
    setLoading(true)
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
      setResults(prev => ({ ...prev, checkout: { status: response.status, data } }))
      
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error: any) {
      setResults(prev => ({ ...prev, checkout: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste Completo do Fluxo de Pagamento</CardTitle>
          <CardDescription>
            Teste passo a passo do sistema de pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Create Account */}
          <div className={`space-y-4 ${step !== 1 ? 'opacity-50' : ''}`}>
            <h3 className="font-semibold flex items-center gap-2">
              {step > 1 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>}
              Criar Conta
            </h3>
            
            {step === 1 && (
              <div className="space-y-4 pl-6">
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email} readOnly />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input value={formData.password} type="password" readOnly />
                </div>
                <Button onClick={createAccount} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Criar Conta
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Login */}
          <div className={`space-y-4 ${step !== 2 ? 'opacity-50' : ''}`}>
            <h3 className="font-semibold flex items-center gap-2">
              {step > 2 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>}
              Fazer Login
            </h3>
            
            {step === 2 && (
              <div className="pl-6">
                <Button onClick={loginAccount} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
              </div>
            )}
          </div>

          {/* Step 3: Test Checkout */}
          <div className={`space-y-4 ${step !== 3 ? 'opacity-50' : ''}`}>
            <h3 className="font-semibold flex items-center gap-2">
              {step > 3 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>}
              Testar Checkout
            </h3>
            
            {step === 3 && (
              <div className="pl-6 space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Plano: Pro</p>
                  <p>Valor: R$ 1,00</p>
                  <p>Método: PIX</p>
                </div>
                <Button onClick={testCheckout} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Criar Checkout
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/subscription')}
                >
                  Ver Status da Assinatura
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          {Object.keys(results).length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Resultados:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}