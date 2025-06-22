import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const plan = searchParams.get('plan')

  // Mock checkout page
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Stripe Checkout</title>
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
          max-width: 400px;
          width: 100%;
        }
        h1 {
          margin: 0 0 20px;
          font-size: 24px;
        }
        .plan-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          background: #5469d4;
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
          background: #4456c7;
        }
        .mock-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="checkout-container">
        <h1>Complete sua assinatura</h1>
        
        <div class="mock-notice">
          ⚠️ Este é um checkout de teste. Nenhuma cobrança real será feita.
        </div>
        
        <div class="plan-info">
          <h3>Plano ${plan}</h3>
          <p>R$ ${plan === 'PRO' ? '49,90' : '199,90'}/mês</p>
        </div>
        
        <form id="payment-form">
          <div class="form-group">
            <label>Número do cartão</label>
            <input type="text" value="4242 4242 4242 4242" readonly />
          </div>
          
          <div class="form-group">
            <label>Data de validade</label>
            <input type="text" value="12/34" readonly />
          </div>
          
          <div class="form-group">
            <label>CVV</label>
            <input type="text" value="123" readonly />
          </div>
          
          <button type="submit">Confirmar Pagamento (Teste)</button>
        </form>
      </div>
      
      <script>
        document.getElementById('payment-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          // Simulate payment processing
          const button = e.target.querySelector('button');
          button.textContent = 'Processando...';
          button.disabled = true;
          
          // Call webhook to update subscription
          await fetch('/api/stripe/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'stripe-signature': 'mock-signature'
            },
            body: JSON.stringify({
              type: 'checkout.session.completed',
              data: {
                object: {
                  id: '${sessionId}',
                  metadata: {
                    planType: '${plan}'
                  }
                }
              }
            })
          });
          
          // Redirect to success page
          setTimeout(() => {
            window.location.href = '/dashboard?payment=success';
          }, 1500);
        });
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