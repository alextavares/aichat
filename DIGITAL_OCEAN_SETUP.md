# Guia de Configuração Digital Ocean MCP

## 1. Obter API Token da Digital Ocean

1. Acesse [https://cloud.digitalocean.com/account/api/tokens](https://cloud.digitalocean.com/account/api/tokens)
2. Clique em **"Generate New Token"**
3. Dê um nome ao token (ex: "claude-mcp-token")
4. Selecione **"Read & Write"** para permissões completas
5. Clique em **"Generate Token"**
6. **COPIE O TOKEN IMEDIATAMENTE** (só aparece uma vez!)

## 2. Configurar o MCP no Claude Code

### Opção A: Via arquivo de configuração (Recomendado)

1. Localize o arquivo de configuração do Claude:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Adicione a configuração do MCP:

```json
{
  "mcpServers": {
    "digitalocean": {
      "command": "npx",
      "args": ["@digitalocean/mcp"],
      "env": {
        "DIGITALOCEAN_TOKEN": "SEU_TOKEN_AQUI"
      }
    }
  }
}
```

### Opção B: Via variável de ambiente

```bash
# Linux/Mac
export DIGITALOCEAN_TOKEN="seu_token_aqui"

# Windows (PowerShell)
$env:DIGITALOCEAN_TOKEN="seu_token_aqui"

# Windows (CMD)
set DIGITALOCEAN_TOKEN=seu_token_aqui
```

## 3. Reiniciar o Claude Code

Após configurar, reinicie completamente o Claude Code para carregar o MCP.

## 4. Comandos Disponíveis do MCP

Após configurado, você poderá usar comandos como:

- **Listar Droplets**: `list_droplets`
- **Criar Droplet**: `create_droplet`
- **Listar Apps**: `list_apps`
- **Deploy App**: `deploy_app`
- **Gerenciar Databases**: `list_databases`, `create_database`
- **Gerenciar Spaces**: `list_spaces`, `create_space`

## 5. Deploy do Projeto InnerAI

### Passo 1: Preparar o projeto

```bash
# Adicionar variáveis de ambiente no .env.production
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=gerar-com-openssl
OPENAI_API_KEY=sua-chave
```

### Passo 2: Criar App no Digital Ocean

```bash
# Via MCP no Claude
create_app {
  "name": "innerai-clone",
  "region": "nyc",
  "spec": {
    "name": "innerai-clone",
    "services": [
      {
        "name": "web",
        "github": {
          "repo": "seu-usuario/innerai-clone",
          "branch": "main",
          "deploy_on_push": true
        },
        "build_command": "npm run build",
        "run_command": "npm start",
        "environment_slug": "node-js",
        "instance_size_slug": "basic-xxs",
        "instance_count": 1,
        "http_port": 3000,
        "envs": [
          {
            "key": "DATABASE_URL",
            "type": "SECRET"
          },
          {
            "key": "NEXTAUTH_SECRET",
            "type": "SECRET"
          }
        ]
      }
    ],
    "databases": [
      {
        "name": "innerai-db",
        "engine": "PG",
        "version": "15",
        "size": "db-s-dev-database",
        "num_nodes": 1
      }
    ]
  }
}
```

### Passo 3: Configurar domínio (opcional)

```bash
# Adicionar domínio customizado
add_domain {
  "app_id": "app-id-aqui",
  "domain": "innerai.seudominio.com"
}
```

## Troubleshooting

### Erro: "Token inválido"
- Verifique se copiou o token completo
- Confirme que o token tem permissões Read & Write

### Erro: "MCP não encontrado"
- Reinicie o Claude Code completamente
- Verifique o arquivo de configuração

### Erro: "Comando não reconhecido"
- O MCP pode precisar ser reinstalado: `npx @digitalocean/mcp`

## Custos Estimados

- **App Platform (Basic)**: $5/mês
- **PostgreSQL Database**: $15/mês
- **Spaces (Storage)**: $5/mês
- **Total**: ~$25/mês para começar

## Suporte

- [Documentação Digital Ocean](https://docs.digitalocean.com/)
- [Digital Ocean MCP GitHub](https://github.com/digitalocean/mcp)