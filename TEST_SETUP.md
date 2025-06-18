# 🧪 Inner AI Clone - Configuração de Testes

## ✅ Estrutura de Testes Implementada

### 📁 Organização dos Testes

```
tests/
├── e2e/                    # Testes End-to-End (Playwright)
│   ├── auth.spec.ts       # Testes de autenticação
│   ├── chat.spec.ts       # Testes do chat principal
│   ├── templates.spec.ts  # Testes do sistema de templates
│   └── analytics.spec.ts  # Testes do dashboard analytics
├── unit/                   # Testes Unitários (Jest)
│   ├── ai-service.test.ts # Testes do serviço de IA
│   └── usage-tracking.test.ts # Testes de controle de uso
└── integration/            # Testes de Integração
    └── api-chat.test.ts   # Testes da API de chat
```

### 🛠️ Ferramentas Configuradas

1. **Playwright** - Testes E2E com browsers reais
2. **Jest** - Testes unitários e integração
3. **Puppeteer** - Testes de automação browser
4. **Testing Library** - Testes de componentes React

### 🚀 Como Executar os Testes

#### Executar todos os testes:
```bash
npm run test:all
# ou
./run-tests.sh
```

#### Executar tipos específicos:
```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Teste Puppeteer
node puppeteer-test.js
```

### 📊 Cenários de Teste Cobertos

#### 🔐 Autenticação (auth.spec.ts)
- ✅ Login com credenciais válidas
- ✅ Tratamento de credenciais inválidas
- ✅ Logout funcional
- ✅ Redirecionamentos corretos

#### 💬 Chat (chat.spec.ts)
- ✅ Envio de mensagem e resposta da IA
- ✅ Streaming de respostas
- ✅ Histórico de conversas
- ✅ Limites de uso (10 msgs/dia FREE)

#### 📝 Templates (templates.spec.ts)
- ✅ Abertura do seletor de templates
- ✅ Uso de template com variáveis
- ✅ Tracking de uso de templates
- ✅ Templates populares no dashboard

#### 📊 Analytics (analytics.spec.ts)
- ✅ Navegação para analytics
- ✅ Exibição de estatísticas
- ✅ Gráficos de uso
- ✅ Atualização em tempo real
- ✅ Breakdown por modelo

### 🔧 Configurações Necessárias

1. **Instalar dependências de teste:**
```bash
npm install --save-dev @playwright/test puppeteer jest @testing-library/react @testing-library/jest-dom
npx playwright install
```

2. **Variáveis de ambiente para testes:**
Crie um `.env.test.local`:
```env
DATABASE_URL=sua_url_de_teste
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_de_teste
```

3. **Banco de dados de teste:**
```bash
# Criar banco de teste
npx prisma migrate dev --name test_db

# Seed com dados de teste
npx prisma db seed
```

### 🎯 Credenciais de Teste

```
Email: test@example.com
Senha: test123
```

### 📈 Relatórios de Teste

- **Playwright Report**: `playwright-report/index.html`
- **Jest Coverage**: `coverage/lcov-report/index.html`

### ⚡ Dicas de Performance

1. Execute testes em paralelo quando possível
2. Use o modo headless para testes mais rápidos
3. Reutilize sessões de autenticação em E2E
4. Mocke chamadas externas em testes unitários

### 🐛 Troubleshooting

**Problema**: Testes E2E falhando no WSL
**Solução**: Instale Chrome com `./install-chrome.sh`

**Problema**: Timeout em testes de IA
**Solução**: Aumente timeout em playwright.config.ts

**Problema**: Erro de permissão
**Solução**: `chmod +x run-tests.sh`

---

## 🎉 Testes Prontos!

A suíte de testes está configurada e pronta para garantir a qualidade do código!