# Playwright Testing Guide - InnerAI Clone

## Configuração de Testes E2E com Playwright

Este projeto agora conta com uma suíte completa de testes end-to-end usando Playwright, configurada para testar todas as principais funcionalidades da aplicação.

## Estrutura dos Testes

```
tests/e2e/
├── auth.spec.ts          # Testes de autenticação (login/signup)
├── demo-chat.spec.ts     # Testes do chat demo (sem autenticação)
├── chat.spec.ts          # Testes do chat no dashboard
├── analytics.spec.ts     # Testes do painel de analytics
└── templates.spec.ts     # Testes do sistema de templates
```

## Configuração

### Playwright Config
- **Arquivo**: `playwright.config.ts`
- **Browser**: Chromium (padrão)
- **Base URL**: `http://localhost:3000`
- **Diretório de testes**: `./tests/e2e`
- **Modo**: Headless por padrão
- **Servidor web**: Inicia automaticamente `npm run dev`

### Configurações importantes:
- ✅ Porto corrigido para 3000 (era 3001)
- ✅ Screenshots apenas em falhas
- ✅ Trace em primeira tentativa de retry
- ✅ Timeout de 120s para subir o servidor
- ✅ Retry automático no CI

## Como Executar os Testes

### 1. Todos os testes
```bash
npm run test:e2e
# ou
npx playwright test
```

### 2. Testes específicos
```bash
# Apenas testes de autenticação
npx playwright test auth.spec.ts

# Apenas testes do chat demo
npx playwright test demo-chat.spec.ts

# Teste específico por nome
npx playwright test -g "should display signup page correctly"
```

### 3. Modo debug/headed
```bash
# Com interface visual (cabeça)
npx playwright test --headed

# Modo debug interativo
npx playwright test --debug

# Interface UI interativa
npx playwright test --ui
```

### 4. Filtros úteis
```bash
# Apenas testes que falham
npx playwright test --last-failed

# Com relatório HTML
npx playwright test --reporter=html

# Executar em paralelo
npx playwright test --workers=4
```

## Cobertura dos Testes

### 🔐 Autenticação (`auth.spec.ts`)
- ✅ Exibição correta da página de cadastro
- ✅ Exibição correta da página de login
- ✅ Validação de senhas não coincidentes
- ✅ Estados de loading nos formulários
- ✅ Navegação entre páginas de auth
- ✅ Submissão de formulários e feedback de erro
- ✅ Botão de modo de teste quando há erro de DB

### 💬 Demo Chat (`demo-chat.spec.ts`)
- ✅ Interface do chat carregada corretamente
- ✅ Interação com input de mensagem
- ✅ Envio de mensagem e estado de loading
- ✅ Envio com tecla Enter
- ✅ Exibição de mensagens do usuário
- ✅ Tratamento de erros de API
- ✅ Múltiplas mensagens na conversa
- ✅ Prevenção de mensagens vazias
- ✅ Indicadores de streaming
- ✅ Estado da conversa (não persiste)

### 🏠 Dashboard Chat (`chat.spec.ts`)
- ✅ Acesso à interface de chat
- ✅ Envio e resposta de mensagens
- ✅ Indicadores de streaming
- ✅ Múltiplas mensagens
- ✅ Prevenção de mensagens vazias
- ✅ Tratamento de erros de API
- ✅ Estados da UI durante interação

### 📊 Analytics (`analytics.spec.ts`)
- ✅ Navegação para página de analytics
- ✅ Exibição de estatísticas de uso
- ✅ Gráfico de uso
- ✅ Atualização após envio de mensagem
- ✅ Breakdown por modelo

### 📝 Templates (`templates.spec.ts`)
- ✅ Abertura do seletor de templates
- ✅ Uso de template
- ✅ Tracking de uso de templates
- ✅ Templates populares no dashboard

## Estratégia de Testes

### 1. Testes sem autenticação
Os testes começam com funcionalidades públicas como:
- Páginas de login/signup
- Demo chat
- Páginas de erro

### 2. Testes com autenticação
Para funcionalidades protegidas, os testes:
- Tentam acessar o dashboard
- Se redirecionados, usam funcionalidades públicas
- Ou fazem login quando necessário

### 3. Tratamento de erros
Todos os testes lidam graciosamente com:
- ❌ Erros de API (chaves não configuradas)
- ❌ Erros de banco de dados
- ❌ Timeouts de rede
- ❌ Estados de loading

## Relatórios

### HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

### JSON Report
```bash
npx playwright test --reporter=json
```

### Traces
Os traces são automaticamente capturados em falhas e podem ser visualizados:
```bash
npx playwright show-trace test-results/[nome-do-teste]/trace.zip
```

## Configurações de CI/CD

O projeto está preparado para CI com:
- ✅ Retry automático (2x) no CI
- ✅ Worker único no CI para estabilidade
- ✅ Forbid de `.only` no CI
- ✅ Configuração de timeout adequada

### GitHub Actions (exemplo)
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install chromium

- name: Run Playwright tests
  run: npm run test:e2e
```

## Debugging

### 1. Falhas de teste
```bash
# Ver último relatório
npx playwright show-report

# Ver trace específico
npx playwright show-trace test-results/.../trace.zip

# Executar com screenshots
npx playwright test --headed --screenshot=on
```

### 2. Desenvolvimento de testes
```bash
# Modo debug
npx playwright test --debug auth.spec.ts

# UI mode para desenvolvimento
npx playwright test --ui
```

### 3. Seletores
Use o Playwright Inspector para encontrar seletores:
```bash
npx playwright codegen localhost:3000
```

## Próximos Passos

1. **Configurar CI/CD** com GitHub Actions
2. **Adicionar testes de performance** 
3. **Configurar testes cross-browser** (Firefox, Safari)
4. **Adicionar testes de acessibilidade**
5. **Configurar testes visuais** (screenshots)

## Comandos Úteis

```bash
# Instalar browsers do Playwright
npx playwright install

# Atualizar screenshots
npx playwright test --update-snapshots

# Executar apenas testes modificados
npx playwright test --only-changed

# Estatísticas dos testes
npx playwright test --reporter=dot

# Limpar cache de testes
rm -rf test-results playwright-report
```

## Status Atual ✅

- ✅ **Playwright configurado** e funcionando
- ✅ **35 testes criados** cobrindo funcionalidades principais
- ✅ **Scripts no package.json** configurados
- ✅ **Correção de configuração** (porta 3000)
- ✅ **Testes otimizados** para aplicação atual
- ✅ **Documentação completa** criada

A suíte de testes está pronta para uso e pode ser executada com `npm run test:e2e`!