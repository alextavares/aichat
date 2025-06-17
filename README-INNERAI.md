# Inner AI Clone

Clone da plataforma Inner AI com múltiplos provedores de IA, controle de consumo robusto e sistema de planos.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Database Host**: Supabase
- **IA Providers**: OpenAI + OpenRouter

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd innerai-clone
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas chaves:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# OpenRouter Configuration  
OPENROUTER_API_KEY=your_openrouter_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database URL (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
```

4. Configure o banco de dados:
```bash
npx prisma db push
npx prisma generate
```

5. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais:
- `users` - Usuários do sistema
- `conversations` - Conversas/chats
- `messages` - Mensagens individuais
- `user_usage` - Controle de consumo por usuário
- `ai_models` - Modelos de IA disponíveis
- `subscriptions` - Assinaturas dos usuários

### Recursos Avançados:
- `ai_response_cache` - Cache de respostas para economia de tokens
- `ai_error_logs` - Logs de erros da API
- `user_feedback` - Feedback dos usuários sobre respostas

## 🎯 Funcionalidades

### MVP (Fase 1):
- [x] Setup do projeto Next.js + TypeScript
- [x] Configuração Tailwind CSS + Shadcn/ui  
- [x] Setup Supabase + Prisma
- [x] Schema do banco de dados
- [ ] Autenticação NextAuth.js
- [ ] Chat básico com GPT-3.5
- [ ] Controle de limite simples

### Fase 2:
- [ ] Camada AIProvider (abstração)
- [ ] Integração OpenRouter
- [ ] Sistema de planos (Free/Pro)
- [ ] Controle de tokens
- [ ] Templates de prompts
- [ ] Dashboard do usuário

### Fase 3:
- [ ] Academy (cursos)
- [ ] Ferramentas (voz, transcrição)
- [ ] Cache de respostas
- [ ] Painel administrativo

## 💰 Sistema de Planos

### Free
- 1000 tokens/dia
- Apenas GPT-3.5
- 10 mensagens/dia

### Pro ($29/mês)
- 100k tokens/mês
- Todos os modelos
- Ferramentas ilimitadas

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter ESLint
```

## 📁 Estrutura de Pastas

```
src/
├── app/              # Next.js App Router
├── components/       # Componentes UI
├── lib/             # Utilitários e configurações
│   ├── ai/          # Provedores de IA
│   ├── auth/        # Configuração auth
│   ├── db.ts        # Cliente Prisma
│   └── utils.ts     # Utilitários gerais
├── hooks/           # React hooks customizados
└── types/           # Definições TypeScript
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outros
- Railway
- Netlify
- AWS/GCP

## 📊 Monitoramento

- **Errors**: Sentry (planejado)
- **Analytics**: Vercel Analytics
- **Database**: Supabase Dashboard

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.