# 🧪 Guia de Teste - Estrutura Modular

## 🚀 Como Executar os Testes

### 1. Testar TODOS os módulos
```bash
npm run test:e2e
```

### 2. Testar módulo específico
```bash
# Testar apenas Autenticação
npx playwright test tests/e2e/auth/

# Testar apenas Dashboard
npx playwright test tests/e2e/dashboard/

# Testar apenas Chat (quando criado)
npx playwright test tests/e2e/chat/
```

### 3. Testar arquivo específico
```bash
# Testar apenas login
npx playwright test tests/e2e/auth/login.spec.ts

# Testar apenas navegação do dashboard
npx playwright test tests/e2e/dashboard/navigation.spec.ts
```

### 4. Testar em modo UI (interface visual)
```bash
# Abre o Playwright UI - RECOMENDADO para debug
npx playwright test --ui

# Ou para módulo específico
npx playwright test tests/e2e/auth/ --ui
```

### 5. Testar com modo debug
```bash
# Executa com browser visível
npx playwright test --debug

# Ou específico
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

### 6. Testar apenas um teste específico
```bash
# Usando grep para filtrar por nome
npx playwright test -g "should login successfully"
```

## 📊 Ver Relatório de Testes
```bash
# Após executar testes, ver relatório
npx playwright show-report
```

## 🔧 Configurações Úteis

### Executar em modo headed (ver browser)
```bash
npx playwright test --headed
```

### Executar apenas em um navegador
```bash
# Apenas Chrome
npx playwright test --project=chromium

# Apenas Firefox
npx playwright test --project=firefox
```

### Executar em paralelo (padrão) ou sequencial
```bash
# Sequencial (útil para debug)
npx playwright test --workers=1
```

## 🏃 Teste Rápido - 2 Minutos

Para testar rapidamente se tudo está funcionando:

```bash
# 1. Garantir que o servidor está rodando
npm run dev

# 2. Em outro terminal, testar apenas login (mais rápido)
npx playwright test tests/e2e/auth/login.spec.ts --headed

# 3. Ver resultado
npx playwright show-report
```

## 🐛 Debugging

### Ver o que está acontecendo
```bash
# Modo UI é o melhor para debug
npx playwright test --ui
```

### Pausar em um ponto específico
Adicione no teste:
```typescript
await page.pause(); // Pausa a execução aqui
```

### Ver console do browser
```bash
npx playwright test --debug
```

## 📝 Estrutura dos Testes

```
tests/e2e/
├── auth/
│   ├── login.spec.ts      ✅ Criado
│   ├── signup.spec.ts     ✅ Criado  
│   └── logout.spec.ts     ✅ Criado
├── dashboard/
│   ├── main-page.spec.ts  ✅ Criado
│   └── navigation.spec.ts ✅ Criado
└── chat/                  🔄 Próximo
```

## ⚡ Comandos Essenciais

```bash
# Rodar todos os testes
npm run test:e2e

# Rodar com UI (recomendado)
npx playwright test --ui

# Rodar específico
npx playwright test tests/e2e/auth/

# Ver relatório
npx playwright show-report
```

## 🎯 Teste Agora!

1. **Abra dois terminais**
2. **Terminal 1**: `npm run dev`
3. **Terminal 2**: `npx playwright test --ui`
4. **Clique em "Run all"** na interface do Playwright