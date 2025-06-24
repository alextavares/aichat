# Page snapshot

```yaml
- text: Entrar na sua conta Entre com sua conta para acessar o InnerAI
- button "Continuar com Google":
  - img
  - text: Continuar com Google
- button "Continuar com Microsoft":
  - img
  - text: Continuar com Microsoft
- button "Continuar com Apple":
  - img
  - text: Continuar com Apple
- button "Continuar com GitHub":
  - img
  - text: Continuar com GitHub
- text: Ou continue com email Email
- textbox "Email": test@example.com
- text: Senha
- textbox "Senha": WrongPassword123
- alert:
  - img
  - text: Erro ao fazer login. Tente novamente.
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