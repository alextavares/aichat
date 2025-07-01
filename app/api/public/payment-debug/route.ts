import { NextResponse } from 'next/server'

export async function GET() {
  // Pegar valores diretos das variáveis
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'NOT_SET'
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'NOT_SET'
  
  // Analisar token
  const tokenInfo = {
    exists: accessToken !== 'NOT_SET',
    length: accessToken.length,
    prefix: accessToken.substring(0, 8),
    suffix: accessToken.substring(accessToken.length - 4),
    type: accessToken.startsWith('TEST-') ? 'TEST' : 
          accessToken.startsWith('APP_USR-') ? 'PRODUCTION' : 'UNKNOWN'
  }
  
  // Testar API do MercadoPago com mais detalhes
  let apiTest = {
    success: false,
    status: null,
    error: null,
    headers: null
  }
  
  if (tokenInfo.exists) {
    try {
      const response = await fetch('https://api.mercadopago.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      apiTest.success = response.ok
      apiTest.status = response.status
      apiTest.headers = Object.fromEntries(response.headers.entries())
      
      if (response.ok) {
        const data = await response.json()
        apiTest.userData = {
          id: data.id,
          nickname: data.nickname,
          site_id: data.site_id,
          email: data.email
        }
      } else {
        apiTest.error = await response.text()
      }
    } catch (error: any) {
      apiTest.error = error.message
    }
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    },
    mercadopago: {
      accessToken: tokenInfo,
      publicKey: {
        exists: publicKey !== 'NOT_SET',
        prefix: publicKey.substring(0, 8),
        length: publicKey.length
      },
      webhookSecret: {
        exists: !!process.env.MERCADOPAGO_WEBHOOK_SECRET
      }
    },
    apiTest,
    diagnostics: {
      possibleIssues: []
    }
  })
}