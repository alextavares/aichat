# 🔐 Setup do GitHub Token

## Problema:
O GitHub não aceita mais senhas normais para push via HTTPS.

## ✅ Solução: Personal Access Token

### 1. **Criar Token no GitHub:**
1. Vá para: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `aichat-project`
4. Selecione permissões:
   - ✅ **repo** (todos os sub-items)
   - ✅ **workflow** (se usar GitHub Actions)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (aparece apenas uma vez!)

### 2. **Fazer Push com Token:**
```bash
# Quando executar o push, use o token como senha:
git push -u origin main

# Username: alextavares
# Password: [COLE_SEU_TOKEN_AQUI]
```

### 3. **Ou Configure Git Credential Manager:**
```bash
# Para não ter que digitar toda vez
git config --global credential.helper store
git push -u origin main
# Digite token uma vez, será salvo
```

## 🚀 Comandos Prontos:

Execute no terminal:
```bash
git push -u origin main
```

Quando pedir:
- **Username**: `alextavares`
- **Password**: `[SEU_TOKEN_PESSOAL]`

## 📋 Status Atual:
- ✅ Repositório criado: https://github.com/alextavares/aichat
- ✅ Remote configurado
- ✅ Branch renomeada para main
- ⏳ **Aguardando push com token**

## 💡 Dica:
Salve o token em um local seguro! Você vai precisar dele para futuros pushes.