import { NextRequest, NextResponse } from 'next/server'
import { dalleProvider } from '@/lib/ai/dalle-provider'

export async function GET(request: NextRequest) {
  try {
    const isConfigured = dalleProvider.isConfigured()
    const availableModels = dalleProvider.getAvailableModels()
    
    return NextResponse.json({
      configured: isConfigured,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      availableModels,
      status: isConfigured ? 'ready' : 'not_configured'
    })
  } catch (error) {
    console.error('Image status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check image generation status',
        configured: false,
        status: 'error'
      },
      { status: 500 }
    )
  }
}