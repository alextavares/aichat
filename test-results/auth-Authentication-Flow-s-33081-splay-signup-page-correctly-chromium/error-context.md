# Page snapshot

```yaml
- text: Criar sua conta Junte-se ao InnerAI e comece sua jornada Nome completo
- textbox "Nome completo"
- text: Email
- textbox "Email"
- text: Profissão
- textbox "Profissão"
- text: Organização
- textbox "Organização"
- text: Senha
- textbox "Senha"
- text: Confirmar senha
- textbox "Confirmar senha"
- button "Criar conta"
- text: Já tem uma conta?
- link "Entrar":
  - /url: /auth/signin
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
```