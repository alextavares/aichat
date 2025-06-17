# 🚨 INSTRUÇÕES IMPORTANTES DE TESTE

## ⚠️ O servidor está rodando na porta 3001!

### URLs corretas para acessar:

1. **Página inicial**: http://localhost:3001

2. **Cadastro normal** (com banco de dados):
   - http://localhost:3001/auth/signup
   - Se der erro de conexão, clique no botão para modo mock

3. **Cadastro mock** (sem banco de dados):
   - http://localhost:3001/auth/signup-mock
   - ✅ Funciona sem banco de dados!

4. **Login**: http://localhost:3001/auth/signin

5. **Dashboard**: http://localhost:3001/dashboard

---

## 🧪 Teste Rápido do Modo Mock

1. Acesse: **http://localhost:3001/auth/signup-mock**
2. Preencha o formulário:
   - Nome: Teste User
   - Email: teste@example.com
   - Senha: teste123
3. Clique em "Criar conta"
4. Você verá uma mensagem de sucesso
5. Será redirecionado para o login

⚠️ **Nota**: No modo mock, os dados não são salvos permanentemente. É apenas para testar a interface!

---

## 📝 Logs do Servidor

Para ver os logs detalhados:
```bash
tail -f /tmp/nextjs.log
```

---

## 🔍 Verificar Status

Para confirmar em qual porta está rodando:
```bash
lsof -i :3000
lsof -i :3001
```

---

## 🛠️ Solução de Problemas

### Se a página não carregar:
1. Verifique se está usando porta 3001 (não 3000)
2. Aguarde o servidor inicializar completamente
3. Verifique os logs em /tmp/nextjs.log

### Se o cadastro normal falhar:
1. Use o modo mock: http://localhost:3001/auth/signup-mock
2. Ou clique no botão "🧪 Usar Modo de Teste" quando aparecer o erro

---

## ✅ Funcionalidades Testáveis

Mesmo sem banco de dados, você pode testar:
- ✅ Interface de cadastro/login
- ✅ Proteção de rotas (middleware)
- ✅ Layout do dashboard
- ✅ Tema dark
- ✅ Responsividade
- ✅ Componentes de UI

Para testar chat com streaming e histórico, você precisará resolver a conexão com o banco primeiro.