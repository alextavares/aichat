# 📦 Como Criar o Repositório no GitHub

## 🚀 Passo a Passo:

### 1. **Acesse o GitHub**
- Vá para: https://github.com
- Faça login na sua conta

### 2. **Criar Novo Repositório**
- Clique no botão **"+"** no canto superior direito
- Selecione **"New repository"**

### 3. **Configurar o Repositório**

#### Nome do Repositório:
```
innerai-clone
```

#### Descrição (opcional):
```
Clone completo da plataforma Inner AI com chat GPT, streaming de respostas, controle de uso e sistema de planos. Built with Next.js 14, TypeScript, Prisma e Supabase.
```

#### Configurações:
- ✅ **Public** (ou Private se preferir)
- ❌ **NÃO** marque "Initialize this repository with a README"
- ❌ **NÃO** adicione .gitignore
- ❌ **NÃO** adicione licença

### 4. **Criar Repositório**
- Clique em **"Create repository"**

### 5. **Conectar Repositório Local**

Após criar, o GitHub mostrará comandos. Use estes no terminal:

```bash
# Adicionar origem remota
git remote add origin https://github.com/SEU_USUARIO/innerai-clone.git

# Verificar branch atual
git branch -M main

# Fazer primeiro push
git push -u origin main
```

## 🔐 Se pedir autenticação:

### Opção 1: Token de Acesso Pessoal (Recomendado)
1. Vá em: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em "Generate new token"
3. Dê um nome: "innerai-clone-access"
4. Selecione permissões: `repo` (todas)
5. Gere o token e copie
6. Use o token como senha quando solicitado

### Opção 2: SSH Key
```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub: Settings → SSH and GPG keys → New SSH key
```

## 📝 Comandos Completos:

```bash
# 1. Adicionar remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/innerai-clone.git

# 2. Renomear branch para main
git branch -M main

# 3. Fazer push inicial
git push -u origin main
```

## 🎯 Após o Push:

### Adicionar README no GitHub:
1. Vá para a página do repositório
2. Clique em "Add a README"
3. Cole o conteúdo do README.md local

### Configurar Projeto:
1. Aba "Settings" → "General"
2. Adicione topics: `nextjs`, `typescript`, `ai`, `gpt`, `chat`, `streaming`
3. Ative Issues e Discussions se quiser

### Proteger Branch Main:
1. Settings → Branches
2. Add rule → Branch name: `main`
3. Marque "Require pull request reviews"

## 🚨 Importante:

**NÃO commite o arquivo `.env.local`!** 
Ele contém chaves secretas. Já está no .gitignore.

## 📋 Checklist:

- [ ] Criar repositório no GitHub
- [ ] Adicionar remote origin
- [ ] Fazer push do código
- [ ] Configurar README
- [ ] Adicionar topics
- [ ] Configurar proteções (opcional)

---

Após completar, você terá o projeto no GitHub pronto para colaboração! 🎉