# 🔍 Diagnóstico do Sistema de Pagamentos

## ❌ Problema Identificado

O sistema de upgrade de plano não está funcionando em produção. Após análise do código, identifiquei os seguintes problemas:

### 1. **Variáveis de Ambiente do MercadoPago Não Configuradas**

As seguintes variáveis são necessárias mas provavelmente não estão configuradas no Digital Ocean:

```bash
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=
```

### 2. **Fluxo Atual do Sistema**

1. Usuário clica em "Assinar" na página de preços
2. É redirecionado para `/checkout`
3. Seleciona método de pagamento
4. Clica em "Finalizar Pagamento"
5. **FALHA**: API `/api/mercadopago/checkout` retorna erro porque o token do MercadoPago não está configurado
6. O sistema tenta usar o mock checkout como fallback

### 3. **Código de Fallback Detectado**

No arquivo `/api/mercadopago/checkout/route.ts` (linhas 104-116), existe um fallback automático para mock quando o token é inválido:

```typescript
if (error.message?.includes('invalid_token') || error.status === 401 || error.status === 400) {
  // Redireciona para mock checkout
}
```

## 🛠️ Solução Passo a Passo

### Passo 1: Configurar Variáveis no Digital Ocean

1. Acesse https://cloud.digitalocean.com/apps
2. Clique na sua aplicação
3. Vá em **Settings** → **App-Level Environment Variables**
4. Adicione as seguintes variáveis:

```bash
# MercadoPago Produção
MERCADOPAGO_ACCESS_TOKEN=APP_USR-... (seu token de produção)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-... (sua chave pública)
MERCADOPAGO_WEBHOOK_SECRET=sua-senha-webhook

# URLs de callback (confirme que está correto)
NEXTAUTH_URL=https://seahorse-app-k5pag.ondigitalocean.app
```

### Passo 2: Obter Credenciais do MercadoPago

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Crie uma aplicação ou use uma existente
3. Vá em **Credenciais de produção**
4. Copie:
   - Access Token (para `MERCADOPAGO_ACCESS_TOKEN`)
   - Public Key (para `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`)

### Passo 3: Configurar Webhook (Opcional mas Recomendado)

1. No painel do MercadoPago, vá em **Webhooks**
2. Configure a URL: `https://seahorse-app-k5pag.ondigitalocean.app/api/mercadopago/webhook`
3. Selecione os eventos: `payment`
4. Gere uma senha segura para `MERCADOPAGO_WEBHOOK_SECRET`

### Passo 4: Verificar Configuração

Após configurar, execute este teste:

```bash
curl -X POST https://seahorse-app-k5pag.ondigitalocean.app/api/mercadopago/checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: seu-cookie-de-sessao" \
  -d '{"planId": "pro", "paymentMethod": "card", "billingCycle": "monthly"}'
```

## 🧪 Solução Temporária (Desenvolvimento)

Se quiser testar rapidamente sem configurar o MercadoPago real:

1. Use o botão de "Upgrade de Teste" que aparece no checkout em modo desenvolvimento
2. Ou configure temporariamente para usar sempre o mock:

```typescript
// Em /api/mercadopago/checkout/route.ts
// Força usar mock temporariamente
const USE_MOCK = true; // Adicione esta linha no início

if (USE_MOCK || error.message?.includes('invalid_token')) {
  // Código do mock
}
```

## 📊 Checklist de Verificação

- [ ] Variáveis de ambiente configuradas no Digital Ocean
- [ ] Access Token do MercadoPago é válido
- [ ] Public Key do MercadoPago está correta
- [ ] URLs de callback estão com HTTPS
- [ ] Webhook está configurado (opcional)
- [ ] Deploy foi feito após configurar variáveis

## 🔗 Links Úteis

- [Painel MercadoPago](https://www.mercadopago.com.br/developers/panel)
- [Documentação Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Digital Ocean App Settings](https://cloud.digitalocean.com/apps)

## ⚠️ Observações Importantes

1. **Não commite credenciais**: Nunca adicione tokens no código
2. **Use HTTPS**: Sempre use HTTPS em produção
3. **Teste com sandbox primeiro**: O MercadoPago oferece credenciais de teste
4. **Monitore logs**: Verifique os Runtime Logs no Digital Ocean para erros

## 🚨 Se Ainda Não Funcionar

1. Verifique os logs no Digital Ocean para mensagens de erro específicas
2. Teste localmente com as mesmas credenciais
3. Verifique se o plano da conta MercadoPago permite Checkout Pro
4. Entre em contato com o suporte do MercadoPago