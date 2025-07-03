# 🔧 PLANO DE CORREÇÃO - Chat em Produção

## 📊 Resultados do Teste Automatizado

### ✅ Funcionando
- **Navegação**: OK
- **Login**: OK - Conseguimos fazer login com sucesso
- **Redirecionamento pós-login**: OK - Leva para /dashboard

### ❌ Problemas Identificados
- **Acesso ao Chat**: FALHOU - Timeout na navegação
- **Seletor de Modelos**: NÃO ENCONTRADO
- **Novos Modelos**: 0 encontrados
- **Chat Funcional**: NÃO TESTADO (devido ao timeout)

## 🔍 Diagnóstico dos Problemas

### 1. Problema Principal: Timeout no Chat
**Sintoma**: Navigation timeout ao acessar /dashboard/chat
**Causa Provável**: 
- A página está redirecionando para login (HTTP 307)
- Problema com persistência de sessão
- Possível erro no carregamento da página

### 2. Sessão não Persistente
**Evidência**: curl mostra redirect 307 para /auth/signin
**Possíveis Causas**:
- Configuração incorreta de cookies/sessão
- Problema com NextAuth em produção
- Variáveis de ambiente faltando

## 🛠️ Plano de Correção Detalhado

### FASE 1: Diagnóstico e Correção da Autenticação

#### 1.1 Verificar Configuração do NextAuth
```bash
# Verificar se as variáveis estão configuradas em produção
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- DATABASE_URL
```

#### 1.2 Verificar Banco de Dados
```bash
# Testar conexão com o banco
npx tsx scripts/test-database-connection.ts
```

#### 1.3 Verificar Usuário de Teste
```bash
# Verificar se o usuário existe no banco de produção
npx tsx scripts/verify-test-user.ts
```

### FASE 2: Correção dos Modelos de IA

#### 2.1 Verificar Deploy dos Modelos
- Confirmar se o commit 6fa904d foi deployado
- Verificar se os arquivos foram atualizados em produção

#### 2.2 Configurar OpenRouter
```env
# Adicionar em produção
OPENROUTER_API_KEY=sk-or-v1-SUA_CHAVE_AQUI
```

#### 2.3 Verificar Componentes do Chat
- Confirmar se ModelSelector foi atualizado
- Verificar se MODEL_CATEGORIES está correto

### FASE 3: Testes e Validação

#### 3.1 Teste Manual
1. Criar nova conta em produção
2. Fazer login manual
3. Verificar se consegue acessar /dashboard/chat
4. Testar seletor de modelos

#### 3.2 Teste Automatizado Melhorado
- Aumentar timeouts
- Adicionar mais logs de debug
- Verificar cookies de sessão

## 🚀 Implementação das Correções

### Correção 1: Testar Conectividade do Banco
```typescript
// scripts/test-database-connection.ts
import { prisma } from '../lib/prisma'

async function testConnection() {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    console.log('✅ Banco conectado. Usuários:', userCount)
  } catch (error) {
    console.error('❌ Erro no banco:', error)
  }
}
```

### Correção 2: Verificar Usuário de Teste
```typescript
// scripts/verify-test-user.ts
import { prisma } from '../lib/prisma'

async function verifyTestUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })
  
  if (!user) {
    console.log('❌ Usuário de teste não existe em produção')
    // Criar usuário
  } else {
    console.log('✅ Usuário de teste existe:', user.email)
  }
}
```

### Correção 3: Melhorar Teste Automatizado
```javascript
// Adicionar ao teste
await page.setCookie({
  name: 'next-auth.session-token',
  value: sessionToken,
  domain: 'seahorse-app-k5pag.ondigitalocean.app'
});

// Aumentar timeout
await page.goto('https://seahorse-app-k5pag.ondigitalocean.app/dashboard/chat', { 
  waitUntil: 'networkidle0',
  timeout: 30000  // Aumentado de 15000
});
```

## 📋 Checklist de Execução

### ✅ Pré-requisitos
- [ ] Verificar se o deploy foi concluído
- [ ] Confirmar acesso ao servidor de produção
- [ ] Verificar logs do servidor

### 🔧 Correções
- [ ] Executar teste de conexão do banco
- [ ] Verificar/criar usuário de teste em produção
- [ ] Configurar OPENROUTER_API_KEY
- [ ] Verificar configuração do NextAuth
- [ ] Testar login manual
- [ ] Executar teste automatizado melhorado

### 🧪 Validação
- [ ] Chat acessível após login
- [ ] Seletor de modelos visível
- [ ] Novos modelos aparecendo
- [ ] Chat funcional com IA
- [ ] Teste com modelo específico

## 🎯 Critérios de Sucesso

### Mínimo Viável
- [x] Login funcionando
- [ ] Chat acessível
- [ ] Pelo menos 1 modelo funcionando

### Ideal
- [ ] Todos os novos modelos visíveis
- [ ] Categorização funcionando
- [ ] Chat totalmente funcional
- [ ] Performance adequada

## 📞 Próximos Passos

1. **IMEDIATO**: Verificar logs de produção
2. **URGENTE**: Corrigir problema de sessão/auth
3. **IMPORTANTE**: Configurar OpenRouter API
4. **DESEJÁVEL**: Otimizar performance do chat

---

**Status**: 🟡 PROBLEMAS IDENTIFICADOS - PLANO DE CORREÇÃO PRONTO
**Prioridade**: 🔴 ALTA
**Tempo Estimado**: 2-4 horas para correção completa