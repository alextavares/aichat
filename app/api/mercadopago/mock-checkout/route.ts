import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Allow partial sessions for testing
  if (!session) {
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signinUrl.toString())
  }

  const { searchParams } = new URL(request.url)
  const plan = searchParams.get('plan')
  const billing = searchParams.get('billing') || 'monthly'
  const method = searchParams.get('method') || 'pix'

  // Mock checkout page
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mercado Pago - Checkout de Teste</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .checkout-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 40px;
          max-width: 500px;
          width: 100%;
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          height: 40px;
        }
        h1 {
          margin: 0 0 20px;
          font-size: 24px;
          text-align: center;
        }
        .plan-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .method-info {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
        }
        .pix-code {
          background: #fff;
          border: 2px dashed #009EE3;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
        }
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .qr-placeholder {
          display: inline-block;
          width: 200px;
          height: 200px;
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          position: relative;
        }
        .qr-placeholder::after {
          content: "QR Code";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #999;
        }
        button {
          background: #009EE3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          width: 100%;
          cursor: pointer;
        }
        button:hover {
          background: #0084c7;
        }
        .mock-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }
        .loading {
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="checkout-container">
        <div class="logo">
          <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M95.68 29.84C93.66 29.84 91.94 29.28 90.52 28.16C89.1 27.02 88.18 25.5 87.76 23.6H92.5C92.68 24.52 93.13 25.25 93.85 25.79C94.59 26.31 95.54 26.57 96.7 26.57C97.66 26.57 98.41 26.38 98.95 26C99.49 25.62 99.76 25.11 99.76 24.47C99.76 23.73 99.38 23.18 98.62 22.82C97.86 22.44 96.65 22.04 95 21.62C93.28 21.2 91.86 20.78 90.74 20.36C89.64 19.92 88.69 19.22 87.89 18.26C87.11 17.3 86.72 16.02 86.72 14.42C86.72 12.96 87.11 11.67 87.89 10.55C88.69 9.43 89.79 8.57 91.19 7.97C92.61 7.37 94.24 7.07 96.08 7.07C98.76 7.07 100.93 7.72 102.59 9.02C104.27 10.32 105.23 12.09 105.47 14.33H100.48C100.36 13.53 99.94 12.88 99.22 12.38C98.52 11.86 97.62 11.6 96.52 11.6C95.62 11.6 94.92 11.78 94.42 12.14C93.92 12.48 93.67 12.97 93.67 13.61C93.67 14.35 94.05 14.91 94.81 15.29C95.59 15.67 96.79 16.06 98.41 16.46C100.15 16.92 101.57 17.37 102.67 17.81C103.77 18.23 104.71 18.93 105.49 19.91C106.29 20.87 106.69 22.16 106.69 23.78C106.69 25.18 106.31 26.45 105.55 27.59C104.81 28.73 103.73 29.63 102.31 30.29C100.89 30.95 99.21 31.28 97.27 31.28L95.68 29.84Z" fill="#009EE3"/>
            <text x="10" y="28" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#00a650">mercado</text>
            <text x="110" y="28" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#009EE3">pago</text>
          </svg>
        </div>
        
        <h1>Checkout de Teste</h1>
        
        <div class="mock-notice">
          ⚠️ Este é um checkout de teste. Nenhuma cobrança real será feita.
        </div>
        
        <div class="plan-info">
          <h3>Plano ${plan} ${billing === 'yearly' ? 'Anual' : 'Mensal'}</h3>
          <p style="font-size: 24px; margin: 10px 0; color: #009EE3;">
            R$ ${plan === 'pro' ? '1,00' : '2,00'}
          </p>
        </div>
        
        ${method === 'pix' ? `
          <div class="method-info">
            <h3>Pagamento via PIX</h3>
            <p>Use o código abaixo ou escaneie o QR Code</p>
            
            <div class="qr-code">
              <div class="qr-placeholder"></div>
            </div>
            
            <div class="pix-code">
              00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${plan === 'pro' ? '1.00' : '2.00'}5802BR5913InnerAI Test6009Sao Paulo62070503***6304B3CA
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Código válido por 30 minutos
            </p>
          </div>
        ` : method === 'boleto' ? `
          <div class="method-info">
            <h3>Pagamento via Boleto</h3>
            <p>Número do boleto:</p>
            <div class="pix-code">
              34191.79001 01043.510047 91020.150008 8 96650000000${plan === 'pro' ? '100' : '200'}
            </div>
            <p style="color: #666; font-size: 14px;">
              Vencimento em 3 dias úteis
            </p>
          </div>
        ` : `
          <div class="method-info">
            <h3>Pagamento via Cartão</h3>
            <p>Cartão de teste aprovado automaticamente</p>
          </div>
        `}
        
        <button onclick="processPayment()">
          ${method === 'pix' ? 'Simular Pagamento PIX' : method === 'boleto' ? 'Simular Pagamento Boleto' : 'Confirmar Pagamento'}
        </button>
      </div>
      
      <script>
        async function processPayment() {
          const button = document.querySelector('button');
          button.textContent = 'Processando...';
          button.disabled = true;
          
          // Simulate payment processing
          setTimeout(async () => {
            // Call webhook to update subscription
            await fetch('/api/mercadopago/webhook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-signature': 'mock-signature'
              },
              body: JSON.stringify({
                action: 'payment.created',
                data: {
                  id: 'mock_payment_' + Date.now()
                }
              })
            });
            
            // Redirect to success page
            window.location.href = '/payment/success?payment_id=mock_' + Date.now() + '&status=approved';
          }, 2000);
        }
      </script>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}