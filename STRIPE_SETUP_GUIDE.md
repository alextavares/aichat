# Guia de Configuração do Stripe - InnerAI Clone

## 📋 Pré-requisitos

- Conta no Stripe (crie em https://stripe.com)
- Projeto InnerAI Clone rodando localmente
- Node.js instalado

## 🚀 Passo a Passo

### 1. Criar Conta no Stripe

1. Acesse https://dashboard.stripe.com/register
2. Preencha os dados da sua empresa/pessoa
3. Confirme seu email

### 2. Obter as Chaves de API

1. No Dashboard do Stripe, clique no seu nome no canto superior direito
2. Vá em **Developers** → **API keys**
3. Você verá duas chaves:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

4. Copie ambas as chaves

### 3. Configurar Variáveis de Ambiente

No arquivo `.env.local` do projeto, adicione:

```env
# Stripe - Modo Teste
STRIPE_SECRET_KEY=sk_test_SEU_SECRET_KEY_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SEU_PUBLISHABLE_KEY_AQUI

# URLs para redirecionamento
STRIPE_SUCCESS_URL=http://localhost:3001/dashboard/subscription?success=true
STRIPE_CANCEL_URL=http://localhost:3001/pricing?cancelled=true
```

### 4. Criar Produtos e Preços no Stripe

#### Via Dashboard (Recomendado para iniciantes):

1. No Dashboard do Stripe, vá em **Products** → **Add product**

2. **Criar Produto "Pro":**
   - Name: `InnerAI Pro`
   - Description: `Plano Pro com recursos avançados`
   - Pricing:
     - Price: `R$ 47,00`
     - Billing period: `Monthly`
   - Clique em **Save product**

3. **Criar Produto "Enterprise":**
   - Name: `InnerAI Enterprise`
   - Description: `Plano Enterprise com recursos ilimitados`
   - Pricing:
     - Price: `R$ 197,00`
     - Billing period: `Monthly`
   - Clique em **Save product**

4. **Obter os Price IDs:**
   - Após criar cada produto, clique nele
   - Copie o **Price ID** (algo como `price_1234567890abcdef`)

#### Via Stripe CLI (Avançado):

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Fazer login
stripe login

# Criar produtos
stripe products create \
  --name="InnerAI Pro" \
  --description="Plano Pro com recursos avançados"

stripe products create \
  --name="InnerAI Enterprise" \
  --description="Plano Enterprise com recursos ilimitados"

# Criar preços (substitua prod_XXX pelo ID do produto criado)
stripe prices create \
  --product="prod_XXX" \
  --unit-amount=4700 \
  --currency=brl \
  --recurring[interval]=month

stripe prices create \
  --product="prod_YYY" \
  --unit-amount=19700 \
  --currency=brl \
  --recurring[interval]=month
```

### 5. Atualizar Variáveis com Price IDs

Adicione ao `.env.local`:

```env
# Price IDs dos produtos
STRIPE_PRICE_PRO=price_SEU_PRICE_ID_PRO
STRIPE_PRICE_ENTERPRISE=price_SEU_PRICE_ID_ENTERPRISE
```

### 6. Configurar Webhooks

#### Para desenvolvimento local:

1. Instale o Stripe CLI (se ainda não instalou)
2. Execute o webhook listener:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

3. Copie o **webhook signing secret** que aparece
4. Adicione ao `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET
```

#### Para produção:

1. No Dashboard: **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://seudominio.com/api/stripe/webhook`
3. Eventos a escutar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 7. Testar a Integração

Use os cartões de teste do Stripe:

- **Sucesso:** `4242 4242 4242 4242`
- **Requer autenticação:** `4000 0025 0000 3155`
- **Falha:** `4000 0000 0000 9995`

Data de validade: Qualquer data futura
CVV: Qualquer 3 dígitos

### 8. Script de Teste

Crie um arquivo `scripts/test-stripe.ts`:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

async function testStripeConnection() {
  try {
    console.log('🔍 Testando conexão com Stripe...\n')
    
    // Testar conexão
    const account = await stripe.accounts.retrieve()
    console.log('✅ Conectado com sucesso!')
    console.log(`   Conta: ${account.email}`)
    console.log(`   País: ${account.country}\n`)
    
    // Listar produtos
    console.log('📦 Produtos cadastrados:')
    const products = await stripe.products.list({ limit: 10 })
    
    for (const product of products.data) {
      console.log(`\n   ${product.name}`)
      console.log(`   ID: ${product.id}`)
      
      // Buscar preços do produto
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 10
      })
      
      for (const price of prices.data) {
        const amount = price.unit_amount ? price.unit_amount / 100 : 0
        console.log(`   Preço: R$ ${amount.toFixed(2)}/${price.recurring?.interval || 'once'}`)
        console.log(`   Price ID: ${price.id}`)
      }
    }
    
    // Testar criação de sessão de checkout
    console.log('\n🧪 Testando criação de checkout session...')
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_PRO || 'price_test',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'http://localhost:3001/success',
      cancel_url: 'http://localhost:3001/cancel',
    })
    
    console.log('✅ Checkout session criada!')
    console.log(`   ID: ${session.id}`)
    console.log(`   URL: ${session.url}\n`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testStripeConnection()
```

Execute com: `npx tsx scripts/test-stripe.ts`

### 9. Modo Produção

Quando estiver pronto para produção:

1. Ative sua conta Stripe (complete a verificação)
2. Troque as chaves de teste pelas chaves de produção
3. Atualize os Price IDs para os produtos em produção
4. Configure webhooks para o domínio de produção

## 🔒 Segurança

- **NUNCA** commite as chaves de API
- Use variáveis de ambiente sempre
- Em produção, use serviços como Vercel/Netlify que gerenciam secrets
- Valide sempre os webhooks usando a assinatura

## 📚 Recursos Úteis

- [Documentação Stripe](https://stripe.com/docs)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## 🆘 Troubleshooting

### Erro: "No such price"
- Verifique se o Price ID está correto
- Certifique-se de estar usando a chave correta (test vs live)

### Erro: "API key expired"
- Gere uma nova chave no Dashboard
- Atualize o `.env.local`

### Webhook não funciona
- Verifique se o Stripe CLI está rodando
- Confirme o endpoint URL
- Valide o webhook secret

## ✅ Checklist Final

- [ ] Conta Stripe criada e verificada
- [ ] Chaves de API configuradas no `.env.local`
- [ ] Produtos e preços criados no Dashboard
- [ ] Price IDs adicionados ao `.env.local`
- [ ] Webhook configurado (local ou produção)
- [ ] Teste com cartão 4242... realizado com sucesso
- [ ] Script de teste executado sem erros