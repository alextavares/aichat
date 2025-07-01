import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Verificar autenticação (opcional, mas recomendado)
    const session = await getServerSession(authOptions)
    
    // Verificar variáveis de ambiente
    const config = {
      mercadopago: {
        hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
        tokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) + '...',
        tokenType: process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'TEST' : 
                   process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('APP_USR-') ? 'PRODUCTION' : 'UNKNOWN',
        hasPublicKey: !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
        publicKeyPrefix: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.substring(0, 10) + '...',
        hasWebhookSecret: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
      },
      urls: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        currentUrl: process.env.VERCEL_URL || process.env.NEXTAUTH_URL,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === 'production',
      },
      user: session ? {
        email: session.user?.email,
        id: session.user?.id,
      } : null,
    }

    // Testar conexão com MercadoPago
    let mercadopagoTest = {
      canConnect: false,
      error: null,
      response: null
    }

    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      try {
        const testResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        })

        mercadopagoTest.canConnect = testResponse.ok
        mercadopagoTest.response = {
          status: testResponse.status,
          statusText: testResponse.statusText,
        }

        if (!testResponse.ok) {
          const errorData = await testResponse.text()
          mercadopagoTest.error = errorData
        }
      } catch (error: any) {
        mercadopagoTest.error = error.message
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      config,
      mercadopagoTest,
      debug: {
        message: 'Este endpoint ajuda a diagnosticar problemas de configuração',
        nextSteps: [
          'Verifique se as variáveis estão configuradas corretamente',
          'Confirme se está usando token de produção (APP_USR-) e não teste (TEST-)',
          'Verifique os logs do Digital Ocean para erros específicos'
        ]
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}