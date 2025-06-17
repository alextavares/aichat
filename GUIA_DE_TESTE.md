# 🧪 Guia de Teste - Inner AI Clone

## 🚀 Iniciando o Projeto

### 1. Verificar se o servidor está rodando
```bash
# O servidor já deve estar rodando, mas se não estiver:
npm run dev
```

### 2. Acessar a aplicação
Abra seu navegador em: http://localhost:3000

---

## 📝 Teste 1: Criação de Conta (Cadastro)

1. **Na página inicial**, clique em "Cadastrar" no canto superior direito
2. **Preencha o formulário** com dados de teste:
   - Nome completo: `Teste User`
   - Email: `teste@example.com`
   - Profissão: `Desenvolvedor`
   - Organização: `Teste Org`
   - Senha: `senha123`
   - Confirmar senha: `senha123`
3. **Clique em "Criar conta"**

⚠️ **Possível Problema**: Se houver erro 500, o banco de dados pode estar com problemas de conexão.

---

## 🔐 Teste 2: Middleware de Autenticação

### Teste de Proteção de Rotas:
1. **Sem estar logado**, tente acessar: http://localhost:3000/dashboard
   - ✅ Deve redirecionar para `/auth/signin`

2. **Após fazer login**, tente acessar: http://localhost:3000/auth/signin
   - ✅ Deve redirecionar para `/dashboard`

---

## 💬 Teste 3: Chat com Streaming

### Após fazer login:
1. **No dashboard**, você verá a interface de chat
2. **Digite uma pergunta** como:
   - "Explique o que é React em 3 pontos"
   - "Como fazer um bolo de chocolate?"
3. **Observe o streaming**:
   - ✅ A resposta deve aparecer palavra por palavra
   - ✅ Um cursor piscante deve aparecer durante a digitação
   - ✅ O timestamp deve aparecer quando terminar

---

## 🤖 Teste 4: Seletor de Modelos

1. **No canto superior direito do chat**, procure o dropdown de modelos
2. **Opções disponíveis**:
   - Plano FREE: Apenas "GPT-3.5 Turbo"
   - Plano PRO/ENTERPRISE: "GPT-3.5 Turbo", "GPT-4", "GPT-4 Turbo"
3. **Mude o modelo** e envie uma nova mensagem
   - ✅ A resposta deve usar o modelo selecionado

---

## 📚 Teste 5: Histórico de Conversas

### Sidebar de Conversas:
1. **À esquerda do chat**, você verá o histórico de conversas
2. **Funcionalidades para testar**:
   
   a) **Nova Conversa**:
   - Clique em "+ Nova Conversa"
   - Digite uma mensagem
   - ✅ Uma nova conversa deve aparecer no histórico

   b) **Alternar entre Conversas**:
   - Clique em uma conversa antiga
   - ✅ As mensagens dessa conversa devem carregar

   c) **Deletar Conversa**:
   - Passe o mouse sobre uma conversa
   - Clique no ícone 🗑️
   - ✅ A conversa deve ser removida

   d) **Agrupamento por Data**:
   - ✅ Conversas devem estar agrupadas: "Hoje", "Ontem", "Últimos 7 dias", "Mais antigos"

---

## 🎨 Teste 6: Interface e UX

### Verifique:
1. **Dark Theme**: Interface deve estar em tema escuro
2. **Responsividade**: Redimensione a janela para testar
3. **Templates Rápidos**: Clique nos cards de templates (Resumo, FAQ, etc.)
4. **Indicadores de Loading**: 
   - Durante envio de mensagem
   - Durante carregamento de conversas

---

## 🐛 Teste 7: Tratamento de Erros

### Teste limites do plano FREE:
1. **Envie 10 mensagens** (limite diário do plano FREE)
2. **Tente enviar a 11ª mensagem**
   - ✅ Deve mostrar erro: "Limite diário de mensagens atingido"

### Teste de erro de API:
1. **Desconecte a internet** ou pare o servidor
2. **Tente enviar uma mensagem**
   - ✅ Deve mostrar mensagem de erro apropriada

---

## 🔧 Solução de Problemas Comuns

### Erro 500 ao criar conta:
```bash
# Verificar conexão com banco de dados
npx prisma db push

# Se falhar, verificar as credenciais em .env.local
```

### Chat não está fazendo streaming:
- Verifique se está usando o componente correto
- O endpoint deve ser `/api/chat/stream` (não `/api/chat`)

### Histórico não aparece:
- Verificar console do navegador (F12) para erros
- Confirmar que a API `/api/conversations` está respondendo

---

## 📊 Checklist de Testes

- [ ] Criar nova conta
- [ ] Fazer login
- [ ] Enviar mensagem no chat
- [ ] Ver streaming funcionando
- [ ] Trocar modelo de AI
- [ ] Criar nova conversa
- [ ] Alternar entre conversas
- [ ] Deletar conversa
- [ ] Testar limite de mensagens (plano FREE)
- [ ] Verificar proteção de rotas

---

## 💡 Dicas Extras

1. **Console do Navegador** (F12):
   - Aba Network: Ver requisições para APIs
   - Aba Console: Ver erros JavaScript

2. **Testar com múltiplos usuários**:
   - Crie 2-3 contas diferentes
   - Verifique isolamento de dados

3. **Performance**:
   - O streaming deve ser fluido
   - Transições entre conversas devem ser rápidas

---

## 🎯 Resultado Esperado

Se todos os testes passarem, você terá validado:
- ✅ Autenticação funcionando
- ✅ Proteção de rotas ativa
- ✅ Chat com streaming em tempo real
- ✅ Seletor de modelos operacional
- ✅ Histórico de conversas completo
- ✅ Interface responsiva e intuitiva

Boa sorte com os testes! 🚀