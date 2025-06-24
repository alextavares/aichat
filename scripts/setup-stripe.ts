#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import readline from 'readline'
import chalk from 'chalk'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function setupStripe() {
  console.log(chalk.blue.bold('\n🚀 Configuração do Stripe para InnerAI Clone\n'))
  
  // Check if .env.local exists
  const envPath = join(process.cwd(), '.env.local')
  let envContent = ''
  
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8')
    console.log(chalk.yellow('✓ Arquivo .env.local encontrado\n'))
  } else {
    console.log(chalk.yellow('✓ Criando arquivo .env.local\n'))
  }
  
  console.log(chalk.cyan('📝 Por favor, forneça as seguintes informações:\n'))
  
  // Collect Stripe keys
  console.log(chalk.white('1. Acesse https://dashboard.stripe.com/apikeys'))
  console.log(chalk.white('2. Copie as chaves de API (modo teste)\n'))
  
  const secretKey = await question(chalk.green('Secret Key (sk_test_...): '))
  const publishableKey = await question(chalk.green('Publishable Key (pk_test_...): '))
  
  console.log(chalk.cyan('\n📦 Agora vamos configurar os produtos:'))
  console.log(chalk.white('1. Crie os produtos no Dashboard do Stripe'))
  console.log(chalk.white('2. Copie os Price IDs de cada produto\n'))
  
  const proPriceId = await question(chalk.green('Price ID do Plano Pro: '))
  const enterprisePriceId = await question(chalk.green('Price ID do Plano Enterprise: '))
  
  console.log(chalk.cyan('\n🔗 Configuração de Webhooks (opcional por agora):'))
  const webhookSecret = await question(chalk.green('Webhook Secret (whsec_... ou deixe vazio): '))
  
  // Build environment variables
  const stripeEnvVars = `
# Stripe Configuration
STRIPE_SECRET_KEY=${secretKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publishableKey}

# Stripe Price IDs
STRIPE_PRICE_PRO=${proPriceId}
STRIPE_PRICE_ENTERPRISE=${enterprisePriceId}

# Stripe Webhook (optional)
${webhookSecret ? `STRIPE_WEBHOOK_SECRET=${webhookSecret}` : '# STRIPE_WEBHOOK_SECRET=whsec_...'}

# Stripe URLs
STRIPE_SUCCESS_URL=http://localhost:3001/dashboard/subscription?success=true
STRIPE_CANCEL_URL=http://localhost:3001/pricing?cancelled=true
`

  // Check if Stripe vars already exist
  if (envContent.includes('STRIPE_SECRET_KEY')) {
    console.log(chalk.yellow('\n⚠️  Variáveis do Stripe já existem no .env.local'))
    const overwrite = await question(chalk.green('Deseja sobrescrever? (s/n): '))
    
    if (overwrite.toLowerCase() !== 's') {
      console.log(chalk.red('✗ Configuração cancelada'))
      rl.close()
      return
    }
    
    // Remove existing Stripe vars
    envContent = envContent.replace(/# Stripe.*[\s\S]*?(?=\n# |$)/gm, '')
  }
  
  // Append new vars
  envContent += stripeEnvVars
  
  // Write to file
  writeFileSync(envPath, envContent.trim() + '\n')
  
  console.log(chalk.green('\n✅ Configuração salva com sucesso!\n'))
  
  // Show next steps
  console.log(chalk.blue.bold('🎯 Próximos passos:\n'))
  console.log(chalk.white('1. Reinicie o servidor de desenvolvimento:'))
  console.log(chalk.gray('   npm run dev\n'))
  
  console.log(chalk.white('2. Para testar webhooks localmente:'))
  console.log(chalk.gray('   stripe listen --forward-to localhost:3001/api/stripe/webhook\n'))
  
  console.log(chalk.white('3. Use o cartão de teste:'))
  console.log(chalk.gray('   Número: 4242 4242 4242 4242'))
  console.log(chalk.gray('   Validade: Qualquer data futura'))
  console.log(chalk.gray('   CVV: Qualquer 3 dígitos\n'))
  
  console.log(chalk.white('4. Execute o teste de conexão:'))
  console.log(chalk.gray('   npx tsx scripts/test-stripe.ts\n'))
  
  rl.close()
}

// Create test script
async function createTestScript() {
  const testScriptPath = join(process.cwd(), 'scripts', 'test-stripe.ts')
  
  if (!existsSync(testScriptPath)) {
    const testScript = `import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

async function testStripeConnection() {
  try {
    console.log('🔍 Testando conexão com Stripe...\\n')
    
    // Test connection
    const account = await stripe.accounts.retrieve()
    console.log('✅ Conectado com sucesso!')
    console.log(\`   Conta: \${account.email}\`)
    console.log(\`   País: \${account.country}\\n\`)
    
    // List products
    console.log('📦 Produtos cadastrados:')
    const products = await stripe.products.list({ limit: 10 })
    
    if (products.data.length === 0) {
      console.log('   Nenhum produto encontrado.')
      console.log('   Crie produtos no Dashboard do Stripe primeiro.\\n')
    } else {
      for (const product of products.data) {
        console.log(\`\\n   \${product.name}\`)
        console.log(\`   ID: \${product.id}\`)
        
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 10
        })
        
        for (const price of prices.data) {
          const amount = price.unit_amount ? price.unit_amount / 100 : 0
          console.log(\`   Preço: R$ \${amount.toFixed(2)}/\${price.recurring?.interval || 'once'}\`)
          console.log(\`   Price ID: \${price.id}\`)
        }
      }
    }
    
    console.log('\\n✅ Teste concluído com sucesso!')
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    console.log('\\nVerifique se:')
    console.log('1. As chaves de API estão corretas')
    console.log('2. Você tem conexão com a internet')
    console.log('3. Sua conta Stripe está ativa')
  }
}

testStripeConnection()
`
    
    writeFileSync(testScriptPath, testScript)
    console.log(chalk.green('✓ Script de teste criado: scripts/test-stripe.ts'))
  }
}

// Run setup
setupStripe()
  .then(() => createTestScript())
  .catch(console.error)