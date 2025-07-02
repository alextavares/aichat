import { NextRequest, NextResponse } from 'next/server'

// Temporariamente público para testes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[Test Webhook] Received body:', JSON.stringify(body, null, 2))
    console.log('[Test Webhook] Body structure:', {
      hasData: !!body.data,
      hasId: !!body.id,
      hasDataId: !!(body.data?.id),
      topic: body.topic,
      type: body.type,
      action: body.action
    })
    
    // Test different webhook formats
    const formats = {
      format1: { id: body.id, topic: body.topic },
      format2: { id: body.data?.id, topic: body.type },
      format3: { id: body.resource?.id, topic: body.topic },
      actualBody: body
    }
    
    return NextResponse.json({
      message: 'Webhook test received',
      formats,
      headers: Object.fromEntries(request.headers.entries())
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test webhook error',
      message: error.message
    }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint',
    expectedFormats: [
      { format: 'MercadoPago IPN', structure: '{ id: string, topic: "payment" }' },
      { format: 'MercadoPago Webhooks', structure: '{ data: { id: string }, type: "payment" }' }
    ]
  })
}