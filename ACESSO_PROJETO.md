# 🌐 Como Acessar o Projeto Inner AI Clone

## ✅ O servidor está rodando!

### 📍 URL de Acesso:
```
http://localhost:3000
```

### ⚠️ IMPORTANTE: Projeto rodando no WSL
O projeto está em `/mnt/c/` (disco do Windows), o que causa **LENTIDÃO EXTREMA**.
- Primeira página pode demorar 1-2 minutos para carregar
- Após compilar, fica mais rápido

## 🔐 Credenciais de Teste:
```
Email: test@example.com
Senha: test123
```

## 📋 Páginas Disponíveis:

1. **Página Inicial**: http://localhost:3000
2. **Login**: http://localhost:3000/auth/signin
3. **Cadastro**: http://localhost:3000/auth/signup
4. **Dashboard** (após login): http://localhost:3000/dashboard

## 🚀 Funcionalidades Implementadas:

### ✅ Fase 1 - Completa:
- Autenticação funcional
- Chat com streaming de respostas
- Persistência de mensagens no banco
- Histórico de conversas
- Controle de uso (10 msgs/dia FREE)
- Seletor de modelos AI

### 📊 O que testar:
1. Fazer login com usuário de teste
2. Enviar mensagens no chat
3. Ver streaming em tempo real
4. Criar múltiplas conversas
5. Alternar entre conversas
6. Observar indicador de uso

## 🐌 Solução para Lentidão:

### Opção 1: Aguardar compilação inicial
- Primeira vez demora ~1 minuto
- Depois fica mais rápido

### Opção 2: Mover projeto para WSL
```bash
# Copiar para home do WSL (mais rápido)
cp -r /mnt/c/codigos/inneraiclone ~/inneraiclone
cd ~/inneraiclone
npm run dev
```

## 🎯 Status do Projeto:
- **MVP: 85% completo**
- Chat totalmente funcional
- Pronto para Fase 2 (Templates, Dashboard, Pagamentos)

---

**Aguarde a página carregar completamente na primeira vez!**