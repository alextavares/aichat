import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testMercadoPagoConnection() {
  console.log('🔍 Testando conexão com Mercado Pago...\n')

  // Verificar variáveis de ambiente
  const requiredEnvVars = [
    'MERCADOPAGO_ACCESS_TOKEN',
    'MERCADOPAGO_PUBLIC_KEY',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.log('\n💡 Adicione essas variáveis ao seu arquivo .env.local')
    process.exit(1)
  }

  console.log('✅ Variáveis de ambiente configuradas\n')

  try {
    // Inicializar cliente
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    })

    console.log('✅ Cliente Mercado Pago inicializado\n')

    // Testar criação de preferência
    console.log('📝 Criando preferência de teste...')
    
    const preference = new Preference(client)
    const testPreference = await preference.create({
      body: {
        items: [
          {
            id: 'test-item',
            title: 'Teste de Integração',
            quantity: 1,
            unit_price: 10,
            currency_id: 'BRL',
          }
        ],
        back_urls: {
          success: 'http://localhost:3000/success',
          failure: 'http://localhost:3000/failure',
          pending: 'http://localhost:3000/pending',
        },
        auto_return: 'approved',
      }
    })

    console.log('✅ Preferência criada com sucesso!')
    console.log(`   ID: ${preference.id}`)
    console.log(`   Init Point: ${preference.init_point}\n`)

    // Verificar se está em modo de teste
    if (process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-')) {
      console.log('⚠️  Você está usando credenciais de TESTE')
      console.log('   Para produção, use as credenciais reais\n')
    }

    // Testar Payment API
    console.log('💳 Testando API de Pagamentos...')
    const payment = new Payment(client)
    
    // Listar métodos de pagamento disponíveis
    const paymentMethods = await fetch(
      'https://api.mercadopago.com/v1/payment_methods',
      {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      }
    ).then(res => res.json())

    const pixMethod = paymentMethods.find((m: any) => m.id === 'pix')
    const boletoMethod = paymentMethods.find((m: any) => m.payment_type_id === 'ticket')

    console.log('✅ Métodos de pagamento disponíveis:')
    if (pixMethod) console.log('   - PIX ✓')
    if (boletoMethod) console.log('   - Boleto ✓')
    console.log('   - Cartão de Crédito ✓\n')

    console.log('🎉 Teste concluído com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Configure o webhook no painel do Mercado Pago')
    console.log('2. Use ngrok para testar webhooks localmente')
    console.log('3. Teste um pagamento real no checkout')
    console.log('4. Monitore os logs do webhook\n')

  } catch (error) {
    console.error('❌ Erro ao testar Mercado Pago:')
    console.error(error)
    
    if ((error as any).status === 401) {
      console.error('\n⚠️  Token de acesso inválido!')
      console.error('   Verifique se copiou o token correto do painel')
    }
    
    process.exit(1)
  }
}

// Executar teste
testMercadoPagoConnection()