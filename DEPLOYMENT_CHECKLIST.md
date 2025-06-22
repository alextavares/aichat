# Checklist para Colocar o Site no Ar

## 1. Sistema de Pagamento (Prioridade Alta)

### Opções Recomendadas para o Brasil:

#### **1. Stripe + Mercado Pago (Recomendado)**
- **Stripe**: Para pagamentos internacionais e cartões
- **Mercado Pago**: Para Pix e boleto bancário
- **Vantagens**: Cobertura completa de métodos de pagamento

#### **2. Configurações Necessárias:**
- [ ] Criar conta no Stripe
- [ ] Criar conta no Mercado Pago
- [ ] Obter API Keys de produção
- [ ] Configurar webhooks para ambos
- [ ] Implementar Pix (essencial no Brasil)
- [ ] Implementar parcelamento no cartão

### Ajustes no Código:
```typescript
// Adicionar ao .env.production
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

## 2. Banco de Dados de Produção

### Opções Recomendadas:
- [ ] **Supabase** (já configurado)
- [ ] **PostgreSQL no Railway/Render**
- [ ] **Neon Database**

### Configurações:
- [ ] Criar banco de produção
- [ ] Executar migrations
- [ ] Configurar backups automáticos
- [ ] Configurar SSL/TLS

## 3. Hospedagem

### Opções Recomendadas:
1. **Vercel** (Recomendado para Next.js)
   - [ ] Criar conta
   - [ ] Conectar repositório GitHub
   - [ ] Configurar variáveis de ambiente
   - [ ] Configurar domínio customizado

2. **Railway** (Alternativa)
   - [ ] Deploy do app
   - [ ] Configurar PostgreSQL
   - [ ] Configurar domínio

## 4. Autenticação e Segurança

- [ ] Configurar NextAuth para produção
- [ ] Gerar NEXTAUTH_SECRET seguro
- [ ] Configurar URLs de callback corretas
- [ ] Implementar rate limiting
- [ ] Adicionar CORS apropriado
- [ ] Configurar CSP (Content Security Policy)

## 5. Provedores de IA

### OpenAI:
- [ ] Verificar limites de API
- [ ] Configurar rate limiting
- [ ] Implementar fallback para outros modelos
- [ ] Monitorar custos

### Alternativas Brasileiras:
- [ ] Considerar OpenRouter para múltiplos provedores
- [ ] Implementar cache de respostas

## 6. Domínio e DNS

- [ ] Registrar domínio (.com.br ou .com)
- [ ] Configurar DNS
- [ ] Certificado SSL (automático na Vercel)
- [ ] Configurar emails profissionais

## 7. Compliance e Legal

### Documentos Necessários:
- [ ] Termos de Uso
- [ ] Política de Privacidade
- [ ] Política de Cookies
- [ ] Conformidade com LGPD
- [ ] Registro de empresa/CNPJ

### Implementar:
- [ ] Banner de cookies
- [ ] Opção de deletar dados do usuário
- [ ] Exportação de dados (LGPD)

## 8. Monitoramento e Analytics

- [ ] Google Analytics 4
- [ ] Sentry para erros
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Logs estruturados

## 9. Otimizações de Performance

- [ ] Comprimir imagens
- [ ] Configurar CDN (Cloudflare)
- [ ] Implementar cache Redis
- [ ] Otimizar bundle size
- [ ] Lazy loading de componentes

## 10. Email e Comunicação

- [ ] Configurar serviço de email (SendGrid/Resend)
- [ ] Templates de email transacional
- [ ] Email de boas-vindas
- [ ] Recuperação de senha
- [ ] Notificações de pagamento

## 11. Ajustes Finais no Código

### Variáveis de Ambiente de Produção:
```env
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://seudominio.com.br
DATABASE_URL=postgresql://...

# Pagamentos
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MERCADOPAGO_ACCESS_TOKEN=...

# IA
OPENAI_API_KEY=sk-...

# Email
SENDGRID_API_KEY=...

# Analytics
NEXT_PUBLIC_GA_ID=G-...
```

### Features a Implementar:
- [ ] Sistema de referral/afiliados
- [ ] Dashboard administrativo
- [ ] Sistema de tickets/suporte
- [ ] Chat de suporte (Crisp/Intercom)

## 12. Testes Finais

- [ ] Testar fluxo completo de pagamento
- [ ] Testar em diferentes dispositivos
- [ ] Verificar SEO (meta tags, sitemap)
- [ ] Testar performance (Lighthouse)
- [ ] Verificar acessibilidade

## 13. Lançamento

### Soft Launch:
- [ ] Beta fechado com usuários selecionados
- [ ] Coletar feedback inicial
- [ ] Ajustar baseado no feedback

### Launch Oficial:
- [ ] Preparar material de marketing
- [ ] Anunciar em redes sociais
- [ ] Email marketing
- [ ] Press release

## Prioridades Imediatas:

1. **Configurar Pagamento**: Stripe + Mercado Pago
2. **Deploy na Vercel**: Mais simples para Next.js
3. **Domínio**: Registrar e configurar
4. **Legal**: Termos e LGPD básicos
5. **Testar**: Fluxo completo antes do lançamento

## Custos Estimados Mensais:

- Vercel: $20/mês (Pro)
- Supabase: $25/mês (Pro)
- Domínio: ~R$ 40/ano
- Email: $15/mês
- Total: ~$60/mês + custos de API

## Próximos Passos:

1. Criar contas nos serviços necessários
2. Configurar variáveis de ambiente
3. Fazer deploy de teste
4. Configurar pagamentos
5. Testar fluxo completo
6. Lançar!