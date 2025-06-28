# 🧪 Guia Completo de Testes - InnerAI Clone

Este guia documenta toda a estrutura de testes implementada para garantir a qualidade e confiabilidade do InnerAI Clone.

## 📋 Visão Geral

O projeto implementa uma estratégia de testes abrangente com 5 fases:

1. **Fase 1**: Correções e Fixtures
2. **Fase 2**: Testes Unitários
3. **Fase 3**: Testes de Integração
4. **Fase 4**: Testes E2E (End-to-End)
5. **Fase 5**: Performance, Segurança e Acessibilidade

## 🏗️ Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── ai-service.test.ts
│   ├── auth-service.test.ts
│   ├── payment-service.test.ts
│   ├── usage-tracking.test.ts
│   ├── token-calculator.test.ts
│   ├── utils.test.ts
│   └── hooks.test.tsx
├── integration/             # Testes de integração
│   ├── auth.test.ts
│   ├── chat.test.ts
│   ├── payment.test.ts
│   ├── usage.test.ts
│   └── templates-knowledge.test.ts
├── e2e/                     # Testes End-to-End
│   ├── auth/
│   │   └── complete-auth-flow.spec.ts
│   ├── chat/
│   │   └── complete-chat-flow.spec.ts
│   ├── payment/
│   │   └── complete-payment-flow.spec.ts
│   ├── dashboard/
│   │   └── complete-dashboard-flow.spec.ts
│   └── features/
│       └── templates-knowledge-flow.spec.ts
├── performance/             # Testes de performance
│   └── load-test.spec.ts
├── security/                # Testes de segurança
│   └── security-test.spec.ts
├── accessibility/           # Testes de acessibilidade
│   └── a11y-test.spec.ts
├── mobile/                  # Testes mobile
│   └── mobile-test.spec.ts
├── fixtures/                # Dados de teste
│   ├── auth.fixtures.ts
│   ├── ai.fixtures.ts
│   ├── payment.fixtures.ts
│   └── data.fixtures.ts
├── helpers/                 # Utilitários de teste
│   ├── auth.helpers.ts
│   ├── chat.helpers.ts
│   └── navigation.helpers.ts
└── config/                  # Configurações
    ├── test-users.json
    └── jest.config.js
```

## 🚀 Como Executar os Testes

### Pré-requisitos

```bash
# Instalar dependências
npm install

# Configurar banco de teste
npx prisma migrate deploy
npx prisma db seed

# Instalar Playwright (para testes E2E)
npx playwright install --with-deps
```

### Comandos de Teste

#### Testes Unitários
```bash
# Executar todos os testes unitários
npm run test:unit

# Com coverage
npm run test:unit -- --coverage

# Executar teste específico
npm run test:unit -- ai-service.test.ts

# Watch mode
npm run test:unit -- --watch
```

#### Testes de Integração
```bash
# Executar todos os testes de integração
npm run test:integration

# Teste específico
npm run test:integration -- auth.test.ts
```

#### Testes E2E
```bash
# Executar todos os testes E2E
npm run test:e2e

# Interface visual
npx playwright test --ui

# Modo debug
npx playwright test --debug

# Teste específico
npm run test:e2e -- complete-auth-flow.spec.ts

# Executar em browser específico
npx playwright test --project=chromium
```

#### Testes de Performance
```bash
# Executar testes de performance
npm run test:performance

# Com relatório detalhado
npm run test:performance -- --reporter=html
```

#### Testes de Segurança
```bash
# Executar testes de segurança
npm run test:security

# Auditoria de dependências
npm audit --audit-level=moderate
```

#### Testes de Acessibilidade
```bash
# Executar testes de acessibilidade
npm run test:a11y

# Com relatório WCAG
npm run test:a11y -- --reporter=html
```

#### Testes Mobile
```bash
# Executar testes mobile
npm run test:mobile

# Dispositivo específico
npm run test:mobile -- --project="iPhone 13"
```

#### Executar Todos os Testes
```bash
# Executar toda a suíte de testes
npm run test:all

# Pipeline de CI/CD
npm run test:ci
```

## 📊 Scripts do package.json

Adicione estes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "test:unit": "jest --config tests/config/jest.config.js",
    "test:integration": "jest --config tests/config/jest.integration.config.js",
    "test:e2e": "playwright test tests/e2e",
    "test:performance": "playwright test tests/performance",
    "test:security": "playwright test tests/security",
    "test:a11y": "playwright test tests/accessibility",
    "test:mobile": "playwright test tests/mobile",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:ci": "npm run test:unit -- --coverage && npm run test:integration && npm run test:e2e -- --reporter=github",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "audit-check": "better-npm-audit audit --level moderate"
  }
}
```

## 🔧 Configuração

### Variáveis de Ambiente para Testes

Crie um arquivo `.env.test`:

```env
# Database
DATABASE_URL="postgresql://test:test@localhost:5432/innerai_test"

# Auth
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# APIs (use test keys)
OPENAI_API_KEY="sk-test-fake-key"
STRIPE_SECRET_KEY="sk_test_fake"
MERCADOPAGO_ACCESS_TOKEN="TEST-fake-token"

# Test flags
NODE_ENV="test"
SKIP_ENV_VALIDATION="true"
```

### Configuração do Jest

```javascript
// tests/config/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Configuração do Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['github'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 📈 Métricas e Relatórios

### Coverage Reports
- **Localização**: `coverage/`
- **Formato**: HTML, LCOV, JSON
- **Threshold**: 80% para branches, functions, lines, statements

### E2E Reports
- **Localização**: `playwright-report/`
- **Inclui**: Screenshots, traces, videos
- **Formatos**: HTML, JUnit, GitHub Actions

### Performance Reports
- **Métricas**: Load time, memory usage, API response times
- **Thresholds**: FCP < 1.5s, LCP < 2.5s
- **Tools**: Lighthouse, Performance API

### Security Reports
- **Vulnerability scanning**: npm audit, CodeQL
- **OWASP Testing**: XSS, SQL Injection, CSRF
- **Dependency checks**: Known vulnerabilities

### Accessibility Reports
- **Standard**: WCAG 2.1 AA compliance
- **Tools**: axe-core, Lighthouse
- **Coverage**: Keyboard navigation, screen readers

## 🐛 Debug e Troubleshooting

### Debug Testes E2E

```bash
# Modo debug com Playwright
npx playwright test --debug

# Executar com interface visual
npx playwright test --ui

# Screenshots em caso de falha
npx playwright test --screenshot=only-on-failure
```

### Debug Testes Unitários

```bash
# Debug com Jest
npm run test:unit -- --detectOpenHandles --forceExit

# Debug específico
npx jest --debug ai-service.test.ts
```

### Problemas Comuns

1. **Banco de dados**: Verificar se PostgreSQL está rodando
2. **Portas**: Garantir que porta 3000 está livre
3. **Dependências**: Executar `npm ci` para instalação limpa
4. **Playwright**: Executar `npx playwright install --with-deps`

## 🔄 CI/CD Pipeline

O pipeline de CI/CD executa automaticamente:

1. **Push/PR**: Testes unitários e integração
2. **Daily**: Testes completos incluindo performance
3. **Release**: Todos os testes + security scan

### Status Badges

```markdown
![Tests](https://github.com/username/innerai-clone/workflows/Tests/badge.svg)
![Coverage](https://codecov.io/gh/username/innerai-clone/branch/main/graph/badge.svg)
![Security](https://img.shields.io/badge/security-scanned-green)
```

## 📚 Recursos Adicionais

### Documentação
- [Jest Documentation](https://jestjs.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)

### Ferramentas Recomendadas
- **VS Code Extensions**: Jest, Playwright Test
- **Browser Extensions**: axe DevTools
- **CLI Tools**: lighthouse-ci, better-npm-audit

### Best Practices
1. **Test Naming**: Descreva o comportamento esperado
2. **Test Isolation**: Cada teste deve ser independente
3. **Mock Strategy**: Mock external dependencies
4. **Data Management**: Use fixtures e factories
5. **Assertions**: Específicas e claras

## 🎯 Próximos Passos

1. **Visual Regression Testing**: Implementar testes de regressão visual
2. **Contract Testing**: Testes de contrato para APIs
3. **Cross-browser Testing**: Expandir cobertura de browsers
4. **Performance Monitoring**: Integrar com ferramentas de APM
5. **Chaos Engineering**: Testes de resiliência

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0  
**Autor**: Sistema de Testes InnerAI Clone