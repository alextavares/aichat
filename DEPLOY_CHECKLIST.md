# Deploy Checklist - Digital Ocean

## Pré-requisitos ✅

- [ ] Conta na Digital Ocean
- [ ] API Token com permissões Read & Write
- [ ] Repositório no GitHub
- [ ] Chaves de API necessárias (OpenAI, MercadoPago, etc)

## Variáveis de Ambiente Necessárias 🔐

### No Digital Ocean App Platform:

```env
# Database (será criado automaticamente)
DATABASE_URL=<gerado-automaticamente>
DIRECT_URL=<gerado-automaticamente>

# Authentication
NEXTAUTH_URL=https://seu-app.ondigitalocean.app
NEXTAUTH_SECRET=<gerar-com-openssl>

# OpenAI
OPENAI_API_KEY=sk-...

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
MERCADOPAGO_WEBHOOK_SECRET=<seu-webhook-secret>
```

### Nos GitHub Secrets (para CI/CD):

```
DIGITALOCEAN_ACCESS_TOKEN=<seu-token-do>
DIGITALOCEAN_APP_ID=<id-do-app-criado>
```

## Passos para Deploy 🚀

### 1. Preparar o Projeto

```bash
# Verificar tipos
npm run type-check

# Verificar lint
npm run lint

# Testar build local
npm run build
```

### 2. Criar App no Digital Ocean

Usando o MCP no Claude:

```javascript
// Primeiro, listar regiões disponíveis
list_regions()

// Criar o app
create_app({
  "name": "innerai-clone",
  "region": "nyc1",
  "spec": {
    // Usar o conteúdo do app.yaml
  }
})
```

### 3. Configurar GitHub Actions

1. Adicione os secrets no GitHub:
   - `DIGITALOCEAN_ACCESS_TOKEN`
   - `DIGITALOCEAN_APP_ID`

2. Push para main irá iniciar o deploy automático

### 4. Configurar Domínio (Opcional)

```javascript
// Via MCP
add_domain({
  "app_id": "<app-id>",
  "domain": "innerai.seudominio.com"
})
```

### 5. Monitorar Deploy

```bash
# Via script local
./scripts/deploy-do.sh

# Ou via doctl
doctl apps get <app-id>
doctl apps logs <app-id>
```

## Comandos Úteis 🛠️

### Deploy Manual
```bash
# Com script
./scripts/deploy-do.sh production

# Com doctl direto
doctl apps update <app-id> --spec app.yaml
```

### Logs
```bash
# Ver logs do app
doctl apps logs <app-id> --follow

# Ver logs de build
doctl apps logs <app-id> --type build
```

### Rollback
```bash
# Listar deployments
doctl apps list-deployments <app-id>

# Fazer rollback
doctl apps create-deployment <app-id> --rollback <deployment-id>
```

## Troubleshooting 🔧

### Build falha
- Verificar logs: `doctl apps logs <app-id> --type build`
- Confirmar versão do Node: deve ser 20.x
- Verificar se todas as dependências estão no package.json

### App não inicia
- Verificar variáveis de ambiente
- Confirmar que o banco foi criado
- Verificar health check em /api/health

### Erro de conexão com banco
- Verificar DATABASE_URL
- Confirmar que o banco está na mesma região
- Verificar se migrations rodaram

## Custos Estimados 💰

- **App Platform (Professional XS)**: $12/mês
- **PostgreSQL Database**: $15/mês
- **Total inicial**: ~$27/mês

Para produção com mais tráfego:
- **App Platform (Professional S)**: $25/mês
- **Database com backup**: $25/mês
- **CDN/Spaces**: $5/mês
- **Total**: ~$55/mês

## Próximos Passos 📋

1. [ ] Configurar backups automáticos do banco
2. [ ] Adicionar monitoramento (Sentry/LogRocket)
3. [ ] Configurar CDN para assets
4. [ ] Implementar rate limiting
5. [ ] Adicionar alertas de erro