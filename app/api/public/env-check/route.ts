import { NextResponse } from 'next/server'

export async function GET() {
  // Verificar todas as possíveis fontes de variáveis
  const envSources = {
    // Variáveis diretas
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? 
      `${process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 15)}...` : 'NOT_SET',
    
    // Verificar se há variações no nome
    MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
    
    // Verificar se está vindo de algum arquivo .env
    NODE_ENV: process.env.NODE_ENV,
    
    // Verificar outras variáveis relacionadas
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?
      `${process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.substring(0, 15)}...` : 'NOT_SET',
  }
  
  // Listar todas as variáveis que começam com MERCADO
  const mercadoVars: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (key.includes('MERCADO') && value) {
      mercadoVars[key] = `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
    }
  }
  
  // Verificar se há arquivo .env.production ou similar
  const possibleEnvFiles = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local'
  ]
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envSources,
    mercadoVars,
    totalEnvVars: Object.keys(process.env).length,
    deployment: {
      platform: process.env.VERCEL ? 'Vercel' : 'Digital Ocean',
      buildId: process.env.BUILD_ID || 'unknown'
    },
    debug: {
      message: 'Se as variáveis estão TEST aqui mas APP_USR no Digital Ocean, pode haver:',
      possibilities: [
        '1. Arquivo .env.production com valores TEST sobrescrevendo',
        '2. Build cache não atualizado',
        '3. Variáveis definidas em múltiplos lugares',
        '4. Nome da variável com typo no Digital Ocean'
      ]
    }
  })
}