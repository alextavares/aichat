# Configuração MercadoPago - Checklist

## Pré-requisitos
- [ ] Conta MercadoPago criada e verificada
- [ ] Dados bancários cadastrados no MercadoPago
- [ ] Aplicação criada no painel de desenvolvedores

## Credenciais de Produção
- [ ] Access Token obtido (APP_USR-...)
- [ ] Public Key obtida (APP_USR-...)
- [ ] Webhook Secret configurado

## Configuração no Digital Ocean
- [ ] MERCADOPAGO_ACCESS_TOKEN atualizado com token de produção
- [ ] NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY atualizado com chave pública
- [ ] MERCADOPAGO_WEBHOOK_SECRET configurado
- [ ] NEXTAUTH_URL configurado corretamente

## Webhooks
- [ ] Webhook criado no painel MercadoPago
- [ ] URL: https://seu-dominio.com/api/mercadopago/webhook
- [ ] Eventos selecionados: payment, preapproval (se usar assinaturas)
- [ ] Assinatura secreta copiada

## Preços
- [ ] Preços atualizados em /app/pricing/page.tsx
- [ ] Preços atualizados em /app/pricing/public/page.tsx
- [ ] Remover avisos de "preço de teste"

## Testes
- [ ] Testar com cartão de teste no ambiente sandbox
- [ ] Verificar webhook recebendo notificações
- [ ] Testar fluxo completo: checkout → pagamento → ativação do plano
- [ ] Verificar se o plano é ativado corretamente no banco de dados

## Produção
- [ ] Deploy com as novas variáveis de ambiente
- [ ] Fazer um pagamento real de teste (pode cancelar depois)
- [ ] Verificar se o dinheiro aparece no painel MercadoPago
- [ ] Configurar notificações por email para novas vendas

## Segurança
- [ ] Nunca commitar credenciais no código
- [ ] Usar sempre HTTPS
- [ ] Validar assinatura dos webhooks
- [ ] Implementar rate limiting nos endpoints

## Monitoramento
- [ ] Configurar alertas para falhas de pagamento
- [ ] Monitorar taxa de conversão
- [ ] Acompanhar chargebacks e disputas