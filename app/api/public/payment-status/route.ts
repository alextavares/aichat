import { NextResponse } from 'next/server'

// Endpoint público temporário para verificar configuração
export async function GET() {
  const hasToken = !!process.env.MERCADOPAGO_ACCESS_TOKEN
  const tokenType = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'TEST' : 
                   process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR-') ? 'PRODUCTION' : 
                   'NOT_SET'
  
  // Teste básico de conectividade
  let apiTest = { success: false, error: null }
  
  if (hasToken) {
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      })
      
      apiTest.success = response.ok
      if (!response.ok) {
        apiTest.error = `${response.status} ${response.statusText}`
      }
    } catch (error: any) {
      apiTest.error = error.message
    }
  }
  
  return NextResponse.json({
    status: 'Payment Configuration Check',
    environment: process.env.NODE_ENV,
    mercadopago: {
      configured: hasToken,
      tokenType,
      publicKeyConfigured: !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
      webhookConfigured: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
      apiConnection: apiTest
    },
    urls: {
      configured: process.env.NEXTAUTH_URL || 'not set',
      expected: 'https://seahorse-app-k5pag.ondigitalocean.app'
    },
    recommendation: !hasToken ? 
      'Configure MERCADOPAGO_ACCESS_TOKEN in Digital Ocean' :
      tokenType === 'TEST' ? 
      'Use production token (APP_USR-) instead of test token' :
      apiTest.success ? 
      'Configuration looks good!' : 
      'Check if token is valid and not expired'
  })
}