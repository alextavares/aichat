# 🧪 Guia de Teste Manual - Sistema de Pagamentos e Novos Modelos IA

**URL da Aplicação**: https://seahorse-app-k5pag.ondigitalocean.app

## 📋 Checklist de Testes

### 1. Teste de Acesso Inicial
- [ ] Acesse https://seahorse-app-k5pag.ondigitalocean.app
- [ ] Verifique se a página carrega corretamente
- [ ] Confirme que o menu tem link "Preços"
- [ ] Screenshot: Página inicial

### 2. Teste de Criação de Conta
- [ ] Clique em "Cadastrar" ou "Sign up"
- [ ] Escolha um método de cadastro:
  - [ ] Google
  - [ ] Microsoft
  - [ ] GitHub
  - [ ] Apple
  - [ ] Email
- [ ] Complete o processo de cadastro
- [ ] Screenshot: Tela de cadastro

### 3. Teste da Página de Preços (Sem Login)
- [ ] Acesse diretamente: https://seahorse-app-k5pag.ondigitalocean.app/pricing
- [ ] Se redirecionar para login, anote isso
- [ ] Após login, navegue para "Preços"
- [ ] Verifique os 3 planos:
  - [ ] **Starter** - R$ 29,90/mês
  - [ ] **Pro** - R$ 59,90/mês
  - [ ] **Ultimate** - R$ 99,90/mês
- [ ] Screenshot: Página de preços

### 4. Teste de Upgrade de Conta
- [ ] Na página de preços, clique em "Assinar" no plano **Pro**
- [ ] Verifique se abre o checkout do MercadoPago
- [ ] Complete o pagamento de teste:
  - [ ] Use cartão de teste se disponível
  - [ ] Ou cancele antes de confirmar pagamento real
- [ ] Screenshot: Tela do MercadoPago

### 5. Verificação pós-Upgrade
- [ ] Após o upgrade (ou simulação), volte para a aplicação
- [ ] Acesse a área de chat
- [ ] Verifique o dropdown de seleção de modelos
- [ ] Screenshot: Dropdown de modelos

### 6. Teste dos Modelos de IA

#### Plano Starter (padrão):
- [ ] gpt-4o-mini
- [ ] claude-3-haiku
- [ ] gemini-1.5-flash

#### Plano Pro (após upgrade):
Deve incluir os do Starter mais:
- [ ] gpt-4o
- [ ] claude-3.5-sonnet
- [ ] gemini-1.5-pro
- [ ] command-r

#### Plano Ultimate:
Deve incluir todos os anteriores mais:
- [ ] o1-preview
- [ ] o1-mini
- [ ] claude-3-opus
- [ ] gpt-4-turbo
- [ ] gemini-2.0-flash

### 7. Teste de Funcionalidade do Chat
- [ ] Selecione um modelo disponível
- [ ] Envie uma mensagem de teste: "Olá, você pode me dizer qual modelo você é?"
- [ ] Verifique se recebe resposta
- [ ] Teste com 2-3 modelos diferentes
- [ ] Screenshot: Chat funcionando

### 8. Verificação de Limites
- [ ] Verifique se há indicador de mensagens usadas/restantes
- [ ] Confirme os limites por plano:
  - Starter: 100 mensagens/mês
  - Pro: 1.000 mensagens/mês
  - Ultimate: Ilimitado

## 📊 Relatório de Problemas

### ❌ Problemas Encontrados:
1. **Redirecionamentos**: Páginas protegidas redirecionam para `/auth/signin`
2. **Conteúdo não visível sem login**: Preços podem não estar públicos

### ✅ Funcionalidades Confirmadas:
1. Aplicação está online e respondendo
2. Sistema de autenticação funciona
3. Múltiplos providers OAuth disponíveis

## 🔍 Logs para Verificar

No painel do Digital Ocean:
1. Acesse https://cloud.digitalocean.com/apps
2. Clique na aplicação
3. Vá em "Runtime Logs"
4. Procure por:
   - Erros de conexão com MercadoPago
   - Erros de API com OpenRouter
   - Falhas de autenticação

## 📝 Template de Reporte

Após completar os testes, preencha:

```
DATA DO TESTE: ___________
TESTADOR: ___________

RESUMO:
- Login/Cadastro: [ ] Funcionando [ ] Com problemas
- Página de Preços: [ ] Visível [ ] Requer login
- Checkout MercadoPago: [ ] Funcionando [ ] Com problemas
- Modelos de IA: [ ] Todos disponíveis [ ] Parcialmente [ ] Nenhum
- Chat: [ ] Funcionando [ ] Com problemas

OBSERVAÇÕES:
_________________________________
_________________________________
_________________________________
```

## 🚨 Ações Recomendadas

1. **Se a página de preços não for pública**:
   - Considerar criar uma landing page pública
   - Ou permitir visualização sem login

2. **Se o MercadoPago não aparecer**:
   - Verificar variáveis de ambiente no Digital Ocean
   - Checar logs de erro

3. **Se os modelos não aparecerem**:
   - Verificar OPENROUTER_API_KEY
   - Confirmar configuração no código