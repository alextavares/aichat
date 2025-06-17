# 🚀 Teste Rápido - Inner AI Clone

## Acesse: http://localhost:3000

### 1️⃣ **Login** (30 segundos)
```
Email: test@example.com
Senha: test123
```
→ Você deve ver o dashboard principal

### 2️⃣ **Teste o Chat** (1 minuto)
- Digite: "Olá, como você está?"
- Veja a resposta em streaming
- O contador deve mostrar 1/10 mensagens

### 3️⃣ **Teste Templates** (1 minuto)
- Clique em "📝 Templates"
- Escolha "Email Marketing"
- Preencha as variáveis:
  - Produto: "iPhone 15"
  - Público-alvo: "jovens profissionais"
  - Tom de voz: "moderno e casual"
- Use o template

### 4️⃣ **Veja Analytics** (30 segundos)
- Clique em "📊 Analytics" na sidebar
- Verifique:
  - Uso Hoje: 2 mensagens
  - Gráfico de progresso: 20% (2/10)
  - Custo estimado

### 5️⃣ **Funcionalidades Extras** (1 minuto)
- Volte ao chat
- Troque para GPT-4 (deve pedir upgrade)
- Crie nova conversa (+)
- Volte para conversa anterior
- Mensagens devem estar salvas

## ✅ Sucesso!
Se tudo funcionou, você verificou:
- ✓ Autenticação
- ✓ Chat com streaming
- ✓ Templates dinâmicos
- ✓ Analytics em tempo real
- ✓ Persistência de dados
- ✓ Controle de limites

## 🔧 Problemas?
```bash
# Resetar banco e recriar dados:
npx prisma db push --force-reset
npx tsx prisma/seed.ts

# Verificar logs:
npm run dev
```

**Total: ~4 minutos de teste**