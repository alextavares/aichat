# Estrutura Modular de Testes E2E - InnerAI Clone

## 📋 Módulos Identificados

### 1. **Autenticação** (auth)
- Login (signin)
- Cadastro (signup)
- Cadastro Mock (signup-mock)
- Logout
- Recuperação de senha
- Validações de formulário

### 2. **Dashboard**
- Página principal
- Navegação
- Widgets/Cards
- Estatísticas
- Ações rápidas

### 3. **Chat**
- Chat principal
- Demo chat
- Histórico de conversas
- Streaming de respostas
- Templates de chat
- Export de conversas

### 4. **Perfil & Configurações**
- Perfil de usuário
- Configurações gerais
- Preferências
- Alteração de senha
- Exclusão de conta
- Export de dados

### 5. **Assinatura & Pagamento**
- Planos disponíveis
- Checkout
- Gerenciamento de assinatura
- Cancelamento
- Webhooks Stripe

### 6. **Templates**
- Lista de templates
- Criação de templates
- Uso de templates
- Edição/Exclusão

### 7. **Analytics**
- Dashboard de analytics
- Estatísticas de uso
- Gráficos
- Relatórios

### 8. **Modelos de IA**
- Seleção de modelos
- Configuração
- Uso por modelo
- Limites

### 9. **API & Integrações**
- Testes de API
- Rate limiting
- Autenticação de API
- Webhooks

## 🗂️ Nova Estrutura de Pastas

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   ├── signup-mock.spec.ts
│   │   ├── logout.spec.ts
│   │   ├── password-recovery.spec.ts
│   │   └── form-validation.spec.ts
│   │
│   ├── dashboard/
│   │   ├── navigation.spec.ts
│   │   ├── main-page.spec.ts
│   │   ├── widgets.spec.ts
│   │   ├── stats.spec.ts
│   │   └── quick-actions.spec.ts
│   │
│   ├── chat/
│   │   ├── main-chat.spec.ts
│   │   ├── demo-chat.spec.ts
│   │   ├── streaming.spec.ts
│   │   ├── history.spec.ts
│   │   ├── templates.spec.ts
│   │   └── export.spec.ts
│   │
│   ├── profile/
│   │   ├── view-profile.spec.ts
│   │   ├── edit-profile.spec.ts
│   │   ├── change-password.spec.ts
│   │   ├── delete-account.spec.ts
│   │   └── export-data.spec.ts
│   │
│   ├── settings/
│   │   ├── general.spec.ts
│   │   ├── preferences.spec.ts
│   │   ├── notifications.spec.ts
│   │   └── privacy.spec.ts
│   │
│   ├── subscription/
│   │   ├── pricing-page.spec.ts
│   │   ├── checkout.spec.ts
│   │   ├── manage-subscription.spec.ts
│   │   ├── cancel-subscription.spec.ts
│   │   └── payment-methods.spec.ts
│   │
│   ├── templates/
│   │   ├── list-templates.spec.ts
│   │   ├── create-template.spec.ts
│   │   ├── use-template.spec.ts
│   │   ├── edit-template.spec.ts
│   │   └── delete-template.spec.ts
│   │
│   ├── analytics/
│   │   ├── dashboard.spec.ts
│   │   ├── usage-stats.spec.ts
│   │   ├── charts.spec.ts
│   │   └── reports.spec.ts
│   │
│   ├── models/
│   │   ├── model-selection.spec.ts
│   │   ├── model-config.spec.ts
│   │   ├── usage-by-model.spec.ts
│   │   └── model-limits.spec.ts
│   │
│   └── api/
│       ├── authentication.spec.ts
│       ├── rate-limiting.spec.ts
│       ├── endpoints.spec.ts
│       └── webhooks.spec.ts
│
├── fixtures/
│   ├── auth.fixtures.ts
│   ├── chat.fixtures.ts
│   └── user.fixtures.ts
│
├── helpers/
│   ├── auth.helpers.ts
│   ├── navigation.helpers.ts
│   └── api.helpers.ts
│
└── config/
    ├── test-users.json
    └── test-data.json
```

## 🎯 Priorização dos Testes

### Alta Prioridade (Core Features)
1. **Autenticação** - Login/Signup/Logout
2. **Chat Principal** - Envio/Recepção de mensagens
3. **Dashboard** - Navegação e funcionalidades básicas
4. **Perfil** - Visualização e edição

### Média Prioridade
5. **Templates** - CRUD completo
6. **Analytics** - Visualização de dados
7. **Configurações** - Preferências do usuário
8. **Assinatura** - Fluxo de pagamento

### Baixa Prioridade
9. **Modelos de IA** - Configurações avançadas
10. **API** - Testes de integração

## 📝 Exemplo de Estrutura de Teste Modular

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import { testUsers } from '../../config/test-users.json';

test.describe('Authentication - Login Module', () => {
  test.describe('Login Form', () => {
    test('should display all form elements', async ({ page }) => {
      // ...
    });
    
    test('should validate email format', async ({ page }) => {
      // ...
    });
  });
  
  test.describe('Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      // ...
    });
    
    test('should show error with invalid credentials', async ({ page }) => {
      // ...
    });
  });
  
  test.describe('Post-Login', () => {
    test('should redirect to dashboard after login', async ({ page }) => {
      // ...
    });
    
    test('should maintain session across pages', async ({ page }) => {
      // ...
    });
  });
});
```

## 🚀 Benefícios da Estrutura Modular

1. **Organização Clara** - Fácil encontrar e manter testes
2. **Reusabilidade** - Helpers e fixtures compartilhados
3. **Escalabilidade** - Fácil adicionar novos módulos
4. **Paralelização** - Executar módulos independentemente
5. **CI/CD Otimizado** - Executar apenas testes relevantes
6. **Debugging Facilitado** - Isolar problemas por módulo

## 📊 Métricas por Módulo

Cada módulo terá suas próprias métricas:
- Cobertura de funcionalidades
- Tempo de execução
- Taxa de sucesso
- Criticidade dos bugs encontrados

## 🔄 Próximos Passos

1. Criar estrutura de pastas
2. Migrar testes existentes
3. Implementar helpers compartilhados
4. Criar fixtures de dados
5. Implementar testes por módulo (começando pelos prioritários)
6. Configurar execução paralela
7. Integrar com CI/CD