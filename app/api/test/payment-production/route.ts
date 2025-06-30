import { NextResponse } from 'next/server'
import { MercadoPago } from '@/lib/mercadopago'

export async function POST() {
  try {
    // Verificar se as credenciais de produção estão configuradas
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!publicKey || !accessToken) {
      return NextResponse.json({
        error: 'Credenciais do MercadoPago não configuradas',
        publicKey: publicKey ? 'Configurada' : 'Não configurada',
        accessToken: accessToken ? 'Configurada' : 'Não configurada'
      }, { status: 500 })
    }
    
    // Verificar se são credenciais de produção
    const isProduction = accessToken.startsWith('APP_USR-')
    
    // Criar preferência de pagamento
    const mercadopago = new MercadoPago()
    const preference = await mercadopago.createPaymentPreference({
      plan: 'PRO',
      period: 'MONTHLY',
      email: 'payment-test@example.com',
      userId: 'test-user-production'
    })
    
    return NextResponse.json({
      success: true,
      environment: isProduction ? 'PRODUCTION' : 'SANDBOX',
      publicKey: publicKey.substring(0, 20) + '...',
      preferenceId: preference.id,
      checkoutUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
      details: {
        items: preference.items,
        payer: preference.payer,
        back_urls: preference.back_urls,
        auto_return: preference.auto_return,
        external_reference: preference.external_reference
      }
    })
    
  } catch (error: any) {
    console.error('Erro no teste de pagamento:', error)
    return NextResponse.json({
      error: 'Erro ao criar preferência de pagamento',
      message: error.message,
      details: error.response?.data || error
    }, { status: 500 })
  }
}