# Guia de Testes - Sistema de Pagamentos e Novos Modelos IA

## 1. Acessar a Aplicação no Digital Ocean

Para encontrar a URL da sua aplicação:
1. Acesse https://cloud.digitalocean.com/apps
2. Clique na sua aplicação
3. A URL estará no topo da página Overview (formato: `nome-da-app.ondigitalocean.app`)

## 2. Testes do Sistema de Pagamentos

### Página de Preços (/pricing)
- [ ] Acessar `https://sua-app.ondigitalocean.app/pricing`
- [ ] Verificar se os 3 planos estão visíveis:
  - **Starter**: R$ 29,90/mês
  - **Pro**: R$ 59,90/mês
  - **Ultimate**: R$ 99,90/mês
- [ ] Verificar se os limites de cada plano estão corretos

### Fluxo de Checkout
1. [ ] Clicar em "Assinar" em qualquer plano
2. [ ] Verificar redirecionamento para MercadoPago
3. [ ] Completar pagamento de teste
4. [ ] Verificar callback de sucesso/falha

### URLs de Callback
- Sucesso: `/payment/success?payment_id=XXX`
- Falha: `/payment/failure`
- Pendente: `/payment/pending`

## 3. Testes dos Novos Modelos de IA

### Modelos Disponíveis por Plano

**Starter**:
- gpt-4o-mini
- claude-3-haiku
- gemini-1.5-flash

**Pro** (inclui Starter +):
- gpt-4o
- claude-3.5-sonnet
- gemini-1.5-pro
- command-r

**Ultimate** (inclui Pro +):
- o1-preview
- o1-mini
- claude-3-opus
- gpt-4-turbo
- gemini-2.0-flash

### Como Testar
1. [ ] Fazer login na aplicação
2. [ ] Acessar a página de chat
3. [ ] Verificar dropdown de seleção de modelos
4. [ ] Testar envio de mensagem com cada modelo disponível para o plano

## 4. Verificações Adicionais

### Logs e Erros
- [ ] Verificar console do navegador para erros JavaScript
- [ ] Verificar Network tab para requisições falhadas
- [ ] Testar comportamento offline/erro de rede

### Responsividade
- [ ] Testar em dispositivos móveis
- [ ] Verificar layout da página de preços em diferentes resoluções

## 5. Comandos Úteis

```bash
# Ver logs da aplicação no Digital Ocean
doctl apps logs <APP_ID>

# Ver status do deploy
doctl apps list

# Ver detalhes da aplicação
doctl apps get <APP_ID>
```

## Problemas Comuns

1. **Erro 500 no checkout**: Verificar variáveis de ambiente do MercadoPago
2. **Modelos não aparecem**: Verificar OPENROUTER_API_KEY
3. **Callback não funciona**: Verificar NEXTAUTH_URL está configurado corretamente

---

**Nota**: Substitua `sua-app.ondigitalocean.app` pela URL real da sua aplicação.