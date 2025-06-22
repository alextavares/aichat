# Page snapshot

```yaml
- text: Entrar na sua conta Entre com sua conta para acessar o InnerAI Email
- textbox "Email": test@example.com
- text: Senha
- textbox "Senha": Test123!@#
- text: Credenciais inválidas
- button "Entrar"
- text: Não tem uma conta?
- link "Criar conta":
  - /url: /auth/signup
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
```