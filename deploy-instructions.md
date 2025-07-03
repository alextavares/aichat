# Instruções de Deploy

## 1. Fazer Push das Alterações

O código já foi commitado. Para fazer o push, execute:

```bash
git push origin main
```

Você precisará autenticar com GitHub usando uma das opções:
- Personal Access Token (como senha)
- SSH key configurada
- GitHub CLI (`gh auth login`)

## 2. Configurar Variáveis de Ambiente no Servidor

Adicione a seguinte variável ao seu servidor de produção:

```env
OPENROUTER_API_KEY=sk-or-v1-SUA_CHAVE_AQUI
```

## 3. Deploy Automático

Se você tiver CI/CD configurado (Vercel, Netlify, etc.), o deploy será automático após o push.

## 4. Deploy Manual

Se precisar fazer deploy manual:

```bash
# No servidor
git pull origin main
npm install
npm run build
npm run start
```

## Alterações Realizadas

- ✅ Novos modelos de LLM adicionados
- ✅ Interface atualizada com categorias
- ✅ Integração com OpenRouter configurada
- ✅ Scripts de teste incluídos

## Modelos Adicionados

### Modelos Avançados
- GPT-4.1
- GPT-4o
- Claude 4 Sonnet
- Gemini 2.5 Pro
- Llama 4 Maverick
- Perplexity Sonar
- Sabiá 3.1
- Mistral Large 2
- Grok 3
- Amazon Nova Premier

### Raciocínio Profundo
- o3
- o4 Mini
- Qwen QwQ
- Claude 4 Sonnet Thinking
- Deepseek R1 (Small)
- Grok 3 Mini