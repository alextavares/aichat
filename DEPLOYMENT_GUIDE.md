# InnerAI Clone - Guia de Deploy Completo

## Visão Geral
Este guia detalha o processo completo de deploy do InnerAI Clone na Vercel, incluindo configuração de pagamentos, banco de dados e variáveis de ambiente.

## 1. Preparação do Código

### Verificar arquivos essenciais:
- [x] `.env.example` - Template de variáveis de ambiente
- [x] `prisma/schema.prisma` - Schema do banco de dados
- [x] `package.json` - Dependências e scripts
- [x] Sistema de pagamento implementado (Stripe + Mercado Pago)

## 2. Banco de Dados (Supabase)

### Criar projeto no Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais:
   - `DATABASE_URL` - Connection string (Transaction)
   - `DIRECT_URL` - Connection string (Session)

### Configurar Prisma:
```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrations
npx prisma migrate deploy

# (Opcional) Popular com dados iniciais
npx prisma db seed
```

## 3. Autenticação (NextAuth)

### Gerar secret:
```bash
openssl rand -base64 32
```

### Variáveis necessárias:
```env
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=seu_secret_gerado
```

## 4. Sistema de Pagamento

### Stripe (Pagamentos Internacionais)

1. **Criar conta no Stripe:**
   - Acesse [stripe.com](https://stripe.com)
   - Complete o cadastro empresarial

2. **Obter credenciais:**
   - Dashboard → Developers → API keys
   - Copie `Publishable key` e `Secret key`

3. **Configurar produtos:**
   ```
   Plano Pro: R$ 47/mês
   Plano Enterprise: R$ 197/mês
   ```

4. **Configurar webhook:**
   - Endpoint: `https://seu-dominio.vercel.app/api/stripe/webhook`
   - Eventos:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### Mercado Pago (Pagamentos Brasil)

1. **Criar conta no Mercado Pago:**
   - Acesse [mercadopago.com.br/developers](https://mercadopago.com.br/developers)
   - Crie uma aplicação

2. **Obter credenciais:**
   - Access Token (Production)
   - Public Key

3. **Configurar webhook:**
   - URL: `https://seu-dominio.vercel.app/api/mercadopago/webhook`
   - Eventos: `payment`

## 5. API de IA (OpenAI)

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma API key
3. Configure limites de uso e billing

## 6. Variáveis de Ambiente Completas

Crie um arquivo `.env.production` com:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Authentication
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="seu_secret_32_caracteres"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
MERCADOPAGO_WEBHOOK_SECRET="seu_webhook_secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Email (opcional - para notificações)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="senha-de-app"
SMTP_FROM="InnerAI <noreply@innerai.com.br>"
```

## 7. Deploy na Vercel

### Via GitHub:

1. **Fazer push do código:**
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   git push origin main
   ```

2. **Importar no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - New Project → Import Git Repository
   - Selecione o repositório

3. **Configurar projeto:**
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `prisma generate && next build`
   - Install Command: `npm install`

4. **Adicionar variáveis de ambiente:**
   - Settings → Environment Variables
   - Adicione todas as variáveis do `.env.production`

### Via CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 8. Pós-Deploy

### Verificar funcionalidades:

1. **Autenticação:**
   - [ ] Registro de novo usuário
   - [ ] Login/logout
   - [ ] Recuperação de senha

2. **Pagamentos:**
   - [ ] Checkout com cartão
   - [ ] Checkout com Pix
   - [ ] Webhooks processando

3. **Chat AI:**
   - [ ] Envio de mensagens
   - [ ] Streaming de respostas
   - [ ] Limites do plano

4. **Dashboard:**
   - [ ] Estatísticas de uso
   - [ ] Histórico de conversas
   - [ ] Gerenciamento de assinatura

### Monitoramento:

1. **Vercel Analytics:**
   - Ativar em Settings → Analytics

2. **Logs:**
   - Functions → Ver logs de API routes

3. **Banco de dados:**
   - Supabase Dashboard → Monitorar queries

## 9. Domínio Personalizado

1. **Registrar domínio:**
   - Sugestões: innerai.com.br, innerai.app.br

2. **Configurar no Vercel:**
   - Settings → Domains
   - Add Domain
   - Seguir instruções DNS

3. **SSL:**
   - Automático pela Vercel

## 10. Otimizações de Produção

### Performance:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['seu-dominio.com'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### Segurança:
```javascript
// middleware.ts
// Rate limiting já implementado
// CORS configurado
```

### Cache:
- Vercel Edge Cache automático
- Redis (opcional) para sessões

## 11. Custos Estimados

### Infraestrutura:
- Vercel: $0-20/mês (Hobby/Pro)
- Supabase: $0-25/mês
- Total: ~R$ 125/mês

### APIs:
- OpenAI: ~$0.002/mensagem
- Stripe: 2.9% + R$ 0.30/transação
- Mercado Pago: 3.79% (Pix) ou 4.99% (cartão)

## 12. Checklist Final

- [ ] Código no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Webhooks configurados
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Testes de pagamento realizados
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] LGPD compliance

## Suporte

Para dúvidas ou problemas:
1. Vercel Docs: vercel.com/docs
2. Supabase Docs: supabase.com/docs
3. Stripe Docs: stripe.com/docs
4. Mercado Pago Docs: mercadopago.com.br/developers

## Comandos Úteis

```bash
# Verificar build local
npm run build

# Testar produção local
npm run start

# Verificar tipos
npm run type-check

# Lint
npm run lint

# Prisma Studio (visualizar DB)
npx prisma studio
```

---

Deploy realizado com sucesso! 🚀