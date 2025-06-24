# Guia de Configuração do Mercado Pago

## Pré-requisitos
- Conta no Mercado Pago Developers
- Aplicação criada no painel

## 1. Obtenção de Credenciais

### Ambiente de Teste
1. Acesse https://www.mercadopago.com.br/developers/panel/app/[SEU_APP_ID]/credentials/sandbox
2. Copie:
   - Access Token (TEST-xxx)
   - Public Key (TEST-xxx)

### Ambiente de Produção
1. Complete a homologação primeiro
2. Acesse credentials/production
3. Use as credenciais de produção

## 2. Configuração do Webhook

### No Painel do Mercado Pago:
1. Vá em Webhooks: https://www.mercadopago.com.br/developers/panel/app/[SEU_APP_ID]/webhooks
2. Clique em "Configurar notificações"
3. URL: `https://seu-dominio.com/api/mercadopago/webhook`
4. Eventos: Marque `Pagamentos`
5. Copie o Secret gerado

### Teste Local com ngrok:
```bash
# Instale o ngrok
npm install -g ngrok

# Inicie seu servidor local
npm run dev

# Em outro terminal, exponha a porta 3000
ngrok http 3000

# Use a URL do ngrok para webhooks
```

## 3. Fluxo de Pagamento

### PIX
1. Cliente seleciona PIX
2. Sistema gera QR Code via API
3. Cliente paga
4. Webhook recebe notificação
5. Sistema atualiza status

### Boleto
1. Cliente seleciona Boleto
2. Sistema gera boleto via API
3. Cliente imprime/paga
4. Webhook recebe notificação (pode levar dias)
5. Sistema atualiza status

## 4. Testes

### Cartões de Teste
Use os cartões disponíveis em:
https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards

### Usuários de Teste
Crie usuários de teste em:
https://www.mercadopago.com.br/developers/panel/app/[SEU_APP_ID]/test-users

## 5. Homologação

Antes de ir para produção:
1. Complete todos os testes
2. Implemente todos os status de pagamento
3. Teste cancelamentos e reembolsos
4. Solicite homologação no painel

## 6. Monitoramento

- Logs de webhook em: /api/mercadopago/webhook
- Status de pagamentos no banco de dados
- Alertas para falhas de pagamento

## Troubleshooting

### Webhook não recebe notificações
- Verifique se a URL está acessível publicamente
- Confirme que o webhook está ativo no painel
- Teste com ngrok para desenvolvimento local

### Erro de assinatura inválida
- Verifique se MERCADOPAGO_WEBHOOK_SECRET está correto
- Confirme que está usando o secret do ambiente correto (test/prod)

### Pagamento não atualiza no sistema
- Verifique logs do webhook
- Confirme que o user_id está sendo passado corretamente
- Verifique permissões do banco de dados