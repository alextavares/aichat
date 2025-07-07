import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  // Check critical environment variables
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    MERCADOPAGO_ACCESS_TOKEN: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
  }

  // Test database connection
  let dbStatus = 'unknown'
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch (error: any) {
    dbStatus = `error: ${error.message}`
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp,
    deployment: {
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV,
      region: process.env.DO_REGION || 'unknown',
      appName: process.env.DO_APP_NAME || 'unknown',
      commit: process.env.GITHUB_SHA?.substring(0, 8) || 'unknown',
    },
    services: {
      database: dbStatus,
      auth: envCheck.NEXTAUTH_SECRET ? 'configured' : 'missing_secret',
      payments: {
        mercadopago: envCheck.MERCADOPAGO_ACCESS_TOKEN ? 'configured' : 'missing_token',
        stripe: envCheck.STRIPE_SECRET_KEY ? 'configured' : 'missing_key',
      },
      ai: {
        openrouter: envCheck.OPENROUTER_API_KEY ? 'configured' : 'missing_key',
      }
    },
    environment: envCheck,
    build: {
      builtAt: timestamp,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    }
  })
}