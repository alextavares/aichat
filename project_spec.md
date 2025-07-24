PROJECT: InnerAI Clone - Sistema de Chat Multi-IA
GOAL: Manter e melhorar o sistema de chat com múltiplos modelos de IA, integração de pagamentos e funcionalidades avançadas

CONSTRAINTS:
- Usar Next.js 15+ com TypeScript
- Manter integração com Prisma/PostgreSQL
- Preservar autenticação NextAuth
- Seguir padrões de código estabelecidos
- Commit a cada 30 minutos de trabalho
- Executar testes antes de qualquer deploy
- Manter compatibilidade com MercadoPago e Stripe

TECNOLOGIAS PRINCIPAIS:
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM
- Banco: PostgreSQL
- Autenticação: NextAuth.js
- Pagamentos: MercadoPago, Stripe
- Testes: Playwright, Jest
- UI: Radix UI Components

DELIVERABLES PRIORITÁRIOS:
1. Sistema de chat funcionando com múltiplos modelos de IA
2. Interface de usuário responsiva e intuitiva
3. Sistema de autenticação robusto
4. Integração de pagamentos estável
5. Testes automatizados cobrindo funcionalidades críticas
6. Deploy automatizado em produção

ÁREAS DE FOCO:
- Chat System: Melhorar fluxo de conversação e gerenciamento de contexto
- Model Integration: Otimizar integração com diferentes provedores de IA
- Payment Flow: Garantir processamento seguro de pagamentos
- User Experience: Interface intuitiva e responsiva
- Performance: Otimização de carregamento e responsividade
- Security: Validação de dados e proteção contra vulnerabilidades

SUCCESS CRITERIA:
- Chat funciona sem erros com todos os modelos configurados
- Autenticação funciona corretamente (login/logout/registro)
- Pagamentos processam sem falhas
- Testes automatizados passam com 100% de sucesso
- Deploy em produção funciona corretamente
- Performance mantém tempos de resposta < 2s

COMANDOS IMPORTANTES:
- Desenvolvimento: `npm run dev`
- Testes: `npm run test:all`
- Build: `npm run build`
- Linting: `npm run lint`
- Diagnóstico: `npm run diagnose`

ESTRUTURA DO PROJETO:
- /app - Páginas e layouts Next.js
- /components - Componentes React reutilizáveis
- /lib - Utilitários e configurações
- /prisma - Schema do banco e migrações
- /contexts - Context providers React
- /hooks - Custom hooks
- /types - Definições TypeScript