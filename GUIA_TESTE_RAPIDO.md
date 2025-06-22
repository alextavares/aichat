# 🚀 Guia de Teste Rápido - InnerAI Clone

O sistema está rodando em: **http://localhost:3000**

## 📝 Credenciais de Teste

Use estas credenciais para fazer login:
- **Email**: test@example.com
- **Senha**: test123

## 🧪 Roteiro de Teste

### 1. Autenticação
1. Acesse http://localhost:3000
2. Clique em "Entrar" ou vá direto para http://localhost:3000/auth/signin
3. Faça login com as credenciais de teste
4. Ou crie uma nova conta em http://localhost:3000/auth/signup

### 2. Dashboard Principal
Após login, você verá:
- **Cards de Métricas**: Mensagens hoje, Tokens mensais, Conversas totais, Custo mensal
- **Ações Rápidas**: Nova Conversa, Histórico, Templates
- **Seção de Analytics**: Gráficos de uso diário, distribuição por modelo, atividade recente
- **Informações do Plano**: Status do plano atual (FREE/PRO/ENTERPRISE)

### 3. Chat com IA
1. Clique em "Nova Conversa" ou acesse http://localhost:3000/dashboard/chat
2. **Funcionalidades para testar**:
   - Selecione diferentes modelos (GPT-3.5, GPT-4, GPT-4 Turbo)
   - Digite uma mensagem e veja a resposta em streaming
   - Use o botão de copiar nas mensagens
   - Teste o botão "Nova Conversa"

### 4. Sistema de Templates
1. Acesse via dashboard ou http://localhost:3000/dashboard/templates
2. **Templates disponíveis**:
   - Email Marketing
   - Análise de Código
   - Proposta Comercial
   - Job Description
   - Briefing de Design
   - Conteúdo para Redes Sociais
3. **Ações para testar**:
   - Buscar templates
   - Filtrar por categoria
   - Clicar em um template para visualizar
   - Usar um template (será carregado no chat)
   - Criar um novo template personalizado

### 5. Histórico de Conversas
1. Acesse via dashboard ou http://localhost:3000/dashboard/history
2. **Funcionalidades**:
   - Visualizar conversas anteriores
   - Buscar em conversas
   - Filtrar por status (Todas/Ativas/Arquivadas)
   - Ordenar (Mais recentes/Mais antigas/Mais mensagens)
   - Continuar uma conversa anterior
   - Arquivar/Desarquivar conversas
   - Exportar conversas (formato JSON)
   - Excluir conversas

### 6. Analytics Detalhado
No dashboard principal, role para baixo para ver:
- **Overview Cards**: Total de mensagens, conversas, tokens e custos
- **Gráfico de Uso Diário**: Últimos 7 dias de atividade
- **Uso por Modelo**: Distribuição entre GPT-3.5, GPT-4, etc.
- **Atividade Recente**: Últimas 5 conversas com detalhes

## 🔥 Funcionalidades Especiais

### Templates com Variáveis
1. Ao criar um template, use `{variavel}` para criar campos dinâmicos
2. Exemplo: "Crie um email para {produto} direcionado a {publico_alvo}"

### Exportação de Dados
- Conversas podem ser exportadas em JSON
- Útil para backup ou análise externa

### Limites por Plano
- **FREE**: 10 mensagens/dia, 100k tokens/mês, apenas GPT-3.5
- **PRO**: 500 mensagens/dia, 5M tokens/mês, todos os modelos
- **ENTERPRISE**: Sem limites

## ⚠️ Problemas Conhecidos

1. **Avisos de páginas duplicadas**: Normal, devido aos arquivos .jsx e .tsx coexistindo
2. **Velocidade inicial**: Primeira requisição pode ser lenta (compilação)

## 🎯 Teste Rápido de 5 Minutos

1. **Login** com test@example.com / test123
2. **Chat**: Envie "Olá, me ajude a criar um plano de marketing"
3. **Templates**: Use o template "Email Marketing"
4. **Histórico**: Veja a conversa que acabou de criar
5. **Analytics**: Confira as métricas atualizadas no dashboard

---

**Dica**: Abra o console do navegador (F12) para ver possíveis erros durante os testes.