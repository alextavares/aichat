# Configuração de Pagamento - Mercado Pago

## Data: 2025-06-30

### Mudanças Implementadas

1. **Valores de Teste Configurados**
   - Plano Pro: R$ 1,00 (mensal) / R$ 0,40 (mensal no anual)
   - Plano Enterprise: R$ 2,00 (mensal) / R$ 0,80 (mensal no anual)
   - Desconto anual mantido em 60%

2. **API do Mercado Pago**
   - Criada rota `/api/mercadopago/checkout/route.ts`
   - Suporta cartão de crédito, PIX e boleto
   - Configuração de parcelamento
   - URLs de retorno configuradas

3. **Páginas de Pagamento**
   - `/payment/success` - Confirmação de pagamento aprovado
   - `/payment/failure` - Pagamento recusado
   - `/payment/pending` - Pagamento pendente (boleto)

4. **Mudança no Checkout**
   - Alterado de Stripe para Mercado Pago
   - Mantida interface de seleção de método de pagamento

### Como Testar

1. **Acesse o site**: https://seahorse-app-k5pag.ondigitalocean.app
2. **Faça login** com: teste@innerai.com / Test@123456
3. **Vá para Pricing**: Clique em "Upgrade" ou acesse `/pricing`
4. **Escolha um plano**: Pro (R$ 1,00) ou Enterprise (R$ 2,00)
5. **No checkout**:
   - Escolha o método de pagamento (Cartão, PIX ou Boleto)
   - Se cartão, pode parcelar até 12x
   - Clique em "Finalizar Pagamento"
6. **Será redirecionado** para o Mercado Pago
7. **Use cartão de teste** ou faça pagamento real de R$ 1,00

### Cartões de Teste do Mercado Pago

Para testes sem pagamento real:
- Mastercard: 5031 4332 1540 6351
- Visa: 4235 6477 2802 5682
- CPF: 123.456.789-09
- CVV: 123

### Status do Deployment
- Deployment ID: febc0be0-2e79-431e-899c-8f05a5c3c359
- Status: BUILDING (aguardar ~5-10 minutos)

### Próximos Passos
1. Aguardar deployment concluir
2. Testar fluxo completo de pagamento
3. Verificar se o plano é atualizado após pagamento
4. Testar se o chat funciona com plano Pro

### Observações
- O webhook do Mercado Pago já existe em `/api/mercadopago/webhook`
- As credenciais do Mercado Pago estão configuradas no Digital Ocean
- Para produção, lembre-se de voltar os valores reais dos planos