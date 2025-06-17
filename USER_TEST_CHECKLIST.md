# 🧪 Checklist de Teste - Inner AI Clone

## 📋 Teste Completo do Sistema como Usuário

Acesse: **http://localhost:3000**

---

## 1️⃣ **JORNADA INICIAL** (5 min)

### Landing Page
- [ ] A página inicial carrega corretamente
- [ ] O botão "Criar conta" está visível
- [ ] O botão "Entrar" está visível
- [ ] O tema dark/light funciona (toggle no canto)

### Criar Conta
- [ ] Clique em "Criar conta"
- [ ] Preencha:
  - Email: `teste@usuario.com`
  - Senha: `senha123`
  - Nome: `Usuário Teste`
- [ ] Clique em "Criar conta"
- [ ] Você foi redirecionado ao dashboard?

### Se a conta já existe:
- [ ] Use "Entrar" com as mesmas credenciais
- [ ] O login funcionou?

---

## 2️⃣ **DASHBOARD PRINCIPAL** (5 min)

### Elementos Visuais
- [ ] Mensagem "Olá Usuário Teste 👋" aparece
- [ ] Sidebar com navegação está visível
- [ ] 6 cards de templates populares aparecem
- [ ] Histórico de conversas na lateral esquerda
- [ ] Indicador de uso mostra "0/10 mensagens"
- [ ] Card "Plano FREE" com botão upgrade

### Templates Populares
- [ ] Clique em um card de template (ex: "Email Marketing")
- [ ] As informações do template aparecem no card
- [ ] Veja o contador de usos e categoria

---

## 3️⃣ **CHAT COM IA** (10 min)

### Primeira Mensagem
- [ ] Digite: "Olá, me ajude a criar um email de boas-vindas"
- [ ] Pressione Enter ou clique "Enviar"
- [ ] A mensagem aparece à direita (azul)
- [ ] Os 3 pontos de "digitando" aparecem
- [ ] A resposta aparece com streaming (letra por letra)
- [ ] O contador mudou para "1/10 mensagens"

### Templates no Chat
- [ ] Clique no botão "📝 Templates"
- [ ] O modal de templates abre
- [ ] Veja as categorias: Marketing, Engenharia, Vendas, etc
- [ ] Clique na categoria "MARKETING"
- [ ] Escolha "Email Marketing"
- [ ] Preencha as variáveis:
  - Produto: `Curso de IA`
  - Público-alvo: `desenvolvedores`
  - Tom de voz: `profissional e amigável`
- [ ] Clique "Usar Template"
- [ ] O texto aparece no campo de mensagem
- [ ] Envie e veja a resposta

### Trocar Modelo
- [ ] No seletor superior direito, tente mudar para "GPT-4"
- [ ] Aparece mensagem pedindo upgrade? (plano FREE)
- [ ] O modelo volta para GPT-3.5 Turbo

### Exportar Conversa
- [ ] Clique em "📥 Exportar" (aparece após ter mensagens)
- [ ] Escolha "📝 Markdown"
- [ ] O download iniciou?
- [ ] Abra o arquivo e verifique se tem suas mensagens

---

## 4️⃣ **GERENCIAMENTO DE CONVERSAS** (5 min)

### Renomear Conversa
- [ ] No histórico lateral, passe o mouse sobre uma conversa
- [ ] Clique no ícone ✏️ (editar)
- [ ] Digite: "Minha primeira conversa"
- [ ] Pressione Enter ou clique ✓
- [ ] O nome foi atualizado?

### Nova Conversa
- [ ] Clique em "+ Nova Conversa"
- [ ] A área de chat foi limpa?
- [ ] Digite uma nova mensagem
- [ ] A nova conversa aparece no histórico?

### Alternar Conversas
- [ ] Clique na primeira conversa
- [ ] As mensagens antigas aparecem?
- [ ] Clique na segunda conversa
- [ ] As mensagens mudaram?

### Deletar Conversa
- [ ] Passe o mouse sobre uma conversa
- [ ] Clique no ícone 🗑️
- [ ] Confirme a exclusão
- [ ] A conversa sumiu do histórico?

---

## 5️⃣ **ANALYTICS** (3 min)

- [ ] Clique em "📊 Analytics" na sidebar
- [ ] A página de analytics carrega

### Verificar Dados
- [ ] Card "Plano Atual" mostra FREE
- [ ] "Uso Hoje" mostra suas mensagens (ex: 3)
- [ ] "Este Mês" mostra totais acumulados
- [ ] Barra de progresso do limite diário (3/10 = 30%)
- [ ] Tabela "Uso por Modelo" mostra GPT-3.5 Turbo
- [ ] "Últimos 7 dias" mostra histórico

---

## 6️⃣ **PERFIL** (5 min)

- [ ] Clique em "👤 Perfil" na sidebar

### Visualizar Informações
- [ ] Email correto aparece
- [ ] Nome está preenchido
- [ ] Plano FREE está visível

### Editar Perfil
- [ ] Clique em "Editar"
- [ ] Adicione:
  - Profissão: `Desenvolvedor`
  - Organização: `Minha Empresa`
- [ ] Clique "Salvar"
- [ ] As informações foram atualizadas?

### Plano e Assinatura
- [ ] Veja o card "Plano Atual"
- [ ] O botão "Fazer Upgrade 🚀" está visível?
- [ ] Data de cadastro está correta?

---

## 7️⃣ **UPGRADE DE PLANO** (5 min)

- [ ] Clique em "Fazer Upgrade 🚀" (perfil ou dashboard)
- [ ] A página de preços carrega

### Página de Preços
- [ ] 3 planos aparecem: FREE, PRO, ENTERPRISE
- [ ] PRO está marcado como "Mais Popular"
- [ ] Preços corretos: Grátis, R$ 49,90, R$ 199,90
- [ ] Lista de features de cada plano visível

### Checkout Simulado
- [ ] Clique "Começar Agora" no plano PRO
- [ ] A página de checkout mock abre
- [ ] Veja o aviso "Este é um checkout de teste"
- [ ] Cartão pré-preenchido: 4242 4242 4242 4242
- [ ] Clique "Confirmar Pagamento (Teste)"
- [ ] Você voltou ao dashboard?
- [ ] O plano mudou para PRO?

### Verificar Upgrade
- [ ] Volte ao perfil
- [ ] O plano agora mostra "PRO"
- [ ] Informações da assinatura aparecem
- [ ] Botão "Cancelar Assinatura" visível

---

## 8️⃣ **FUNCIONALIDADES PRO** (5 min)

### Mais Mensagens
- [ ] O limite agora é "3/500 mensagens"
- [ ] Envie mais algumas mensagens
- [ ] Não há bloqueio após 10 mensagens

### Modelos Avançados
- [ ] Troque para "GPT-4" no seletor
- [ ] Funciona sem pedir upgrade?
- [ ] Envie uma mensagem com GPT-4
- [ ] A resposta indica o modelo usado

### Cancelar Assinatura
- [ ] No perfil, clique "Cancelar Assinatura"
- [ ] Confirme o cancelamento
- [ ] O plano voltou para FREE?
- [ ] O limite voltou para 10 mensagens?

---

## 9️⃣ **LIMITES E RESTRIÇÕES** (3 min)

### Testar Limite FREE
- [ ] Continue enviando mensagens até 10
- [ ] Após a 10ª mensagem, aparece bloqueio?
- [ ] Mensagem sugere fazer upgrade?
- [ ] O indicador mostra "10/10 mensagens"
- [ ] Barra de progresso está 100% vermelha?

---

## 🔟 **TESTE DE ERROS** (2 min)

### Conexão
- [ ] Desligue a internet
- [ ] Tente enviar mensagem
- [ ] Aparece erro de conexão?
- [ ] Religue a internet

### Sessão
- [ ] Abra aba anônima/privada
- [ ] Acesse o dashboard direto
- [ ] Foi redirecionado para login?

### Dados Inválidos
- [ ] Tente criar conta com email inválido
- [ ] Tente senha muito curta
- [ ] Mensagens de erro aparecem?

---

## ✅ **CHECKLIST FINAL**

### Funcionalidades Testadas:
- [ ] ✅ Autenticação (login/registro)
- [ ] ✅ Chat com streaming
- [ ] ✅ Sistema de templates
- [ ] ✅ Gerenciamento de conversas
- [ ] ✅ Exportação (JSON/MD/TXT)
- [ ] ✅ Analytics detalhado
- [ ] ✅ Perfil editável
- [ ] ✅ Sistema de pagamentos
- [ ] ✅ Limites de uso
- [ ] ✅ Upgrade/Downgrade

### Experiência Geral:
- [ ] Interface responsiva
- [ ] Navegação intuitiva
- [ ] Feedback visual claro
- [ ] Erros tratados adequadamente
- [ ] Performance adequada

---

## 📝 **Notas de Teste**

### O que funcionou bem:
```
(Anote aqui o que impressionou)
```

### Problemas encontrados:
```
(Liste bugs ou melhorias necessárias)
```

### Sugestões:
```
(Ideias para melhorar a experiência)
```

---

**Tempo total estimado: 40-45 minutos**

💡 **Dica**: Execute o teste em diferentes navegadores (Chrome, Firefox, Edge) e dispositivos (desktop, tablet, mobile) para garantir compatibilidade completa.