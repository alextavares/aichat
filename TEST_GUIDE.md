# 🧪 Guia de Teste - Inner AI Clone

## 🚀 Como Testar o Projeto

### 1. Certifique-se que o servidor está rodando:
```bash
npm run dev
```

### 2. Acesse http://localhost:3000

## 📋 Checklist de Funcionalidades

### ✅ 1. Página Inicial
- [ ] Landing page com botões "Criar conta" e "Entrar"
- [ ] Toggle de tema dark/light funcionando
- [ ] Design responsivo

### ✅ 2. Autenticação
- [ ] Criar conta com test@example.com / test123
- [ ] Login funcionando
- [ ] Redirecionamento para dashboard após login

### ✅ 3. Dashboard Principal
- [ ] Mensagem de boas-vindas personalizada
- [ ] 6 templates populares em cards
- [ ] Histórico de conversas na lateral
- [ ] Indicador de uso diário (0/10 mensagens)
- [ ] Sidebar com navegação

### ✅ 4. Chat com Streaming
- [ ] Envio de mensagens funcionando
- [ ] Respostas com streaming em tempo real
- [ ] Indicador de "digitando" (3 pontos)
- [ ] Timestamps nas mensagens
- [ ] Seletor de modelo de AI

### ✅ 5. Sistema de Templates
- [ ] Botão "📝 Templates" abre modal
- [ ] Categorias: Marketing, Engenharia, Vendas, etc
- [ ] Templates com contador de uso
- [ ] Templates com variáveis mostram formulário
- [ ] Substituição de variáveis funcionando

### ✅ 6. Analytics Dashboard
- [ ] Acesso via botão "📊 Analytics" na sidebar
- [ ] Card "Uso Hoje" com mensagens/tokens/custo
- [ ] Card "Este Mês" com estatísticas
- [ ] Tabela de uso por modelo
- [ ] Histórico dos últimos 7 dias
- [ ] Barras de progresso para limites

### ✅ 7. Gestão de Conversas
- [ ] Criar nova conversa
- [ ] Alternar entre conversas
- [ ] Carregar histórico de mensagens
- [ ] Conversas persistem após recarregar página

### ✅ 8. Limites do Plano FREE
- [ ] Limite de 10 mensagens/dia
- [ ] Aviso ao atingir limite
- [ ] Botão "Fazer Upgrade" visível
- [ ] Apenas GPT-3.5 disponível

## 🔍 O que verificar em cada tela:

### Tela de Login/Registro
```
Inner AI Clone
[Logo]

Email: [_______________]
Senha: [_______________]

[Entrar] ou [Criar Conta]
```

### Dashboard Principal
```
Header: Inner AI | Olá, Test User | [Sair]

Sidebar:          | Conversas:        | Chat Principal:
🏠 Início         | + Nova Conversa   | Olá Test User 👋
📊 Analytics      | • Conversa 1      | Como posso ajudar?
🎓 Cursos         | • Conversa 2      |
🛠️ Ferramentas    |                   | [6 Cards de Templates]
                  |                   |
Uso: 0/10 msgs    |                   | [Área do Chat]
Plano FREE        |                   | 📝 Templates | Enviar
```

### Analytics
```
Analytics - Acompanhe seu uso

[Card Plano FREE - 10 msgs/dia]

Uso Hoje:         | Este Mês:
0 mensagens       | 0 mensagens
0 tokens          | 0 tokens  
R$ 0.0000         | R$ 0.00

[Tabela de Uso por Modelo]
[Histórico Últimos 7 Dias]
```

### Modal de Templates
```
Templates de Prompts                    [X]

[Todos] [Marketing] [Engenharia] [Vendas] ...

┌─────────────────────────┐ ┌─────────────────────────┐
│ Email Marketing         │ │ Análise de Código       │
│ Template para criar...  │ │ Template para revisão...│
│ MARKETING | 0 usos      │ │ ENGENHARIA | 0 usos     │
└─────────────────────────┘ └─────────────────────────┘
```

## 🐛 Problemas Comuns e Soluções

### Erro de Conexão com Banco
- Execute: `npx prisma db push`
- Execute: `npm run seed`

### Templates não aparecem
- Execute: `npx tsx prisma/seed.ts`

### Limite de mensagens não funciona
- Verifique se o usuário tem planType: 'FREE'
- Verifique a tabela user_usage no banco

## 🎯 Resultado Esperado

Após completar todos os testes, você terá verificado:

1. ✅ Sistema de autenticação completo
2. ✅ Chat com streaming de respostas
3. ✅ Sistema de templates com variáveis
4. ✅ Dashboard de analytics funcional
5. ✅ Controle de uso e limites
6. ✅ Persistência de conversas
7. ✅ Interface responsiva e intuitiva

## 📝 Notas de Teste

- Use test@example.com / test123 para login
- O limite do plano FREE é 10 mensagens/dia
- Templates populares são carregados do banco
- Analytics mostram dados em tempo real
- Conversas são salvas automaticamente