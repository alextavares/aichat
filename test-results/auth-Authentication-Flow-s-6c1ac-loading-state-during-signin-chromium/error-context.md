# Page snapshot

```yaml
- text: Entrar na sua conta Entre com sua conta para acessar o InnerAI Email
- textbox "Email" [disabled]: test@example.com
- text: Senha
- textbox "Senha" [disabled]: password123
- button "Aguarde fazendo login..." [disabled]:
  - img
  - text: Aguarde fazendo login...
- text: Não tem uma conta?
- link "Criar conta":
  - /url: /auth/signup
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
```