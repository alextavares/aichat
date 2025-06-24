# Page snapshot

```yaml
- text: Entrar na sua conta Entre com sua conta para acessar o InnerAI Email
- textbox "Email"
- text: Senha
- textbox "Senha"
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