# 🔍 Verificação do MercadoPago - Checklist

## Status Atual
- ❌ Endpoints de API redirecionando para login (incluindo rotas públicas)
- ⚠️ Possível middleware de autenticação muito restritivo

## Verificações Necessárias no Digital Ocean

### 1. Confirme as Variáveis de Ambiente

Acesse: https://cloud.digitalocean.com/apps

1. Clique na sua aplicação
2. Vá em **Settings** → **App-Level Environment Variables**
3. Verifique se existem EXATAMENTE assim:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=sua-senha-secreta
```

⚠️ **IMPORTANTE**: 
- O token deve começar com `APP_USR-` (produção), não `TEST-`
- Não deve ter aspas, espaços ou caracteres extras

### 2. Verifique os Logs de Runtime

No mesmo painel do Digital Ocean:
1. Clique em **Runtime Logs**
2. Procure por mensagens como:
   - "MercadoPago checkout error"
   - "invalid_token"
   - "401"

### 3. Teste Manual Direto

1. Faça login na aplicação: https://seahorse-app-k5pag.ondigitalocean.app
2. Abra o Console do navegador (F12)
3. Vá para: https://seahorse-app-k5pag.ondigitalocean.app/pricing
4. Clique em "Assinar Pro"
5. Na tela de checkout, clique em "Finalizar Pagamento"
6. Observe:
   - O console do navegador para erros
   - A aba Network para ver a requisição para `/api/mercadopago/checkout`
   - O status HTTP da resposta (deve ser 200, não 500)

### 4. Possíveis Problemas e Soluções

#### Problema A: Token Inválido ou Expirado
**Solução**: 
1. Acesse https://www.mercadopago.com.br/developers/panel/app
2. Gere novo Access Token de produção
3. Atualize no Digital Ocean

#### Problema B: Token de Teste (TEST-)
**Solução**: Use token de produção que começa com APP_USR-

#### Problema C: Variáveis não estão sendo lidas
**Solução**: 
1. Verifique se salvou as variáveis
2. Faça um novo deploy manual:
   - No painel da app → Deploy → Deploy Branch

#### Problema D: Conta MercadoPago não está ativa
**Solução**: Verifique se sua conta MercadoPago está verificada e ativa para receber pagamentos

## Comando para Verificar Diretamente

Se você conseguir fazer login na aplicação, use este comando no console do navegador:

```javascript
// Cole isso no console após fazer login
fetch('/api/mercadopago/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: 'pro',
    paymentMethod: 'card',
    billingCycle: 'monthly'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Resultado Esperado

Se estiver funcionando, você deve receber:
```json
{
  "url": "https://www.mercadopago.com.br/checkout/...",
  "preferenceId": "xxxxxxxxx"
}
```

Se estiver com problema, você verá:
```json
{
  "url": "https://seahorse-app-k5pag.ondigitalocean.app/api/mercadopago/mock-checkout...",
  "isMock": true
}
```

## Precisa de Mais Ajuda?

1. Compartilhe os logs de erro específicos
2. Mostre o resultado do comando JavaScript acima
3. Confirme qual tipo de token está usando (TEST- ou APP_USR-)