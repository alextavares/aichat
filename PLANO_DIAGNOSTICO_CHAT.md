# 🔍 PLANO DE DIAGNÓSTICO E CORREÇÃO - CHAT NÃO FUNCIONAL

## 1. DIAGNÓSTICO SISTEMÁTICO

### A. Verificação de Deploy
```bash
# 1. Verificar se deploy completou
# 2. Confirmar que build foi bem-sucedido
# 3. Verificar se assets estão sendo servidos
```

### B. Teste Direto da API
```bash
# Testar health check
curl https://seahorse-app-k5pag.ondigitalocean.app/api/health

# Testar endpoint do chat (com session cookie)
curl -X POST https://seahorse-app-k5pag.ondigitalocean.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"model":"mistral-7b"}'
```

### C. Verificar Variáveis de Ambiente
- [ ] OPENROUTER_API_KEY está configurada no Digital Ocean?
- [ ] DATABASE_URL está correta?
- [ ] NEXTAUTH_SECRET está configurada?

### D. Análise de Logs Específicos
```javascript
// Script para capturar erros do chat
const checkChatErrors = async () => {
  // 1. Logs de API calls
  // 2. Erros de autenticação
  // 3. Falhas de conexão com OpenRouter
  // 4. Erros de banco de dados
}
```

## 2. POSSÍVEIS CAUSAS

### 🔴 Causa 1: OPENROUTER_API_KEY não configurada
**Sintoma**: Chat retorna erro 500 ou resposta vazia
**Solução**: Configurar chave no Digital Ocean App Platform

### 🔴 Causa 2: Modelos não existem no banco
**Sintoma**: Foreign key constraint error
**Solução**: Executar script de migração em produção

### 🔴 Causa 3: Problema de autenticação
**Sintoma**: API retorna 401 mesmo logado
**Solução**: Verificar configuração do NextAuth

### 🔴 Causa 4: Erro no frontend
**Sintoma**: Requisição não chega na API
**Solução**: Verificar console do navegador

## 3. PLANO DE AÇÃO

### Passo 1: Diagnóstico Inicial (5 min)
1. Acessar app em produção
2. Abrir DevTools (F12)
3. Tentar enviar mensagem no chat
4. Capturar:
   - Erro no console
   - Request/Response na aba Network
   - Status code da requisição

### Passo 2: Verificar Backend (10 min)
```typescript
// test-chat-production.ts
async function testChatEndpoint() {
  // 1. Test health
  // 2. Test chat with auth
  // 3. Check OpenRouter connection
  // 4. Verify database models
}
```

### Passo 3: Configuração de Ambiente (5 min)
1. Acessar Digital Ocean Dashboard
2. App Platform > Settings > Environment Variables
3. Adicionar:
   ```
   OPENROUTER_API_KEY=sk-or-v1-[SUA_CHAVE_REAL]
   ```

### Passo 4: Verificar Banco de Dados (10 min)
```sql
-- Verificar se modelos existem
SELECT id, name, provider FROM ai_models;

-- Verificar conversas recentes
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;

-- Verificar erros
SELECT * FROM _prisma_migrations WHERE rolled_back_at IS NOT NULL;
```

## 4. IMPLEMENTAÇÃO DE CORREÇÕES

### Correção A: Adicionar Fallback para Modelos
```typescript
// lib/ai/openrouter-provider.ts
const FALLBACK_MODEL = 'openai/gpt-3.5-turbo';

async function getModelOrFallback(modelId: string) {
  try {
    // Tentar usar modelo solicitado
    return modelMappings[modelId] || modelId;
  } catch {
    // Usar fallback se falhar
    return FALLBACK_MODEL;
  }
}
```

### Correção B: Melhorar Tratamento de Erros
```typescript
// app/api/chat/route.ts
try {
  const response = await openRouterChat(messages, model);
  return NextResponse.json(response);
} catch (error) {
  console.error('Chat error:', error);
  
  // Retornar erro específico
  if (error.message.includes('API key')) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured' },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Failed to process chat', details: error.message },
    { status: 500 }
  );
}
```

### Correção C: Script de Emergência
```bash
#!/bin/bash
# emergency-fix.sh

# 1. Verificar e adicionar OPENROUTER_API_KEY
echo "Checking OpenRouter configuration..."

# 2. Testar conexão
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     https://openrouter.ai/api/v1/models

# 3. Reiniciar app se necessário
echo "Restarting application..."
```

## 5. VALIDAÇÃO

### Teste 1: Básico
- [ ] Login funciona
- [ ] Interface carrega sem erros
- [ ] Botão de enviar está habilitado

### Teste 2: Funcional
- [ ] Mensagem é enviada
- [ ] Loading aparece
- [ ] Resposta é recebida
- [ ] Resposta é exibida

### Teste 3: Avançado
- [ ] Trocar de modelo funciona
- [ ] Conversas são salvas
- [ ] Histórico carrega

## 6. MONITORAMENTO PÓS-CORREÇÃO

```javascript
// monitor-chat.js
setInterval(async () => {
  const response = await fetch('/api/health');
  const chatTest = await fetch('/api/chat/test');
  
  if (!response.ok || !chatTest.ok) {
    console.error('Chat system unhealthy');
    // Enviar alerta
  }
}, 60000); // A cada minuto
```

## 7. AÇÕES IMEDIATAS

1. **AGORA**: Acessar produção e capturar erro exato
2. **+5 MIN**: Verificar variáveis de ambiente
3. **+10 MIN**: Implementar correção identificada
4. **+15 MIN**: Deploy e validar correção

## COMANDOS ÚTEIS

```bash
# Ver logs em tempo real (se tiver acesso SSH)
tail -f /var/log/app.log | grep -i "chat\|error"

# Testar OpenRouter diretamente
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "test"}]
  }'
```