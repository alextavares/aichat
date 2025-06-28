# Script para configurar Digital Ocean MCP no Claude Code (Windows)
# Usage: .\scripts\setup-do-mcp.ps1

Write-Host "🔧 Configurador do Digital Ocean MCP" -ForegroundColor Green
Write-Host ""

# Definir caminho do config
if ($env:APPDATA) {
    $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
} else {
    # Para WSL ou Linux
    $configPath = "$HOME/.config/Claude/claude_desktop_config.json"
}
Write-Host "📁 Caminho do config: $configPath" -ForegroundColor Yellow

# Criar diretório se não existir
$configDir = Split-Path -Parent $configPath
if (!(Test-Path $configDir)) {
    Write-Host "Criando diretório de configuração..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Backup do arquivo existente
if (Test-Path $configPath) {
    $backupPath = "$configPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host "Fazendo backup do config existente..." -ForegroundColor Yellow
    Copy-Item -Path $configPath -Destination $backupPath
    Write-Host "✅ Backup salvo em: $backupPath" -ForegroundColor Green
}

# Solicitar token
Write-Host ""
$doToken = Read-Host -Prompt "Digite seu token da Digital Ocean" -AsSecureString
$doTokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($doToken))

# Criar ou atualizar configuração
if (Test-Path $configPath) {
    # Ler config existente
    $config = Get-Content -Path $configPath -Raw | ConvertFrom-Json
    
    # Adicionar mcpServers se não existir
    if (-not $config.mcpServers) {
        $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
    }
} else {
    # Criar novo objeto
    $config = @{
        mcpServers = @{}
    }
}

# Adicionar configuração do Digital Ocean
$config.mcpServers.digitalocean = @{
    command = "npx"
    args = @("@digitalocean/mcp")
    env = @{
        DIGITALOCEAN_TOKEN = $doTokenPlain
    }
}

# Salvar configuração
$config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
Write-Host "✅ Configuração atualizada com sucesso!" -ForegroundColor Green

# Criar arquivo .env.local
Write-Host ""
Write-Host "Criando .env.local com o token..." -ForegroundColor Yellow

$envContent = @"
# Digital Ocean
DIGITALOCEAN_ACCESS_TOKEN=$doTokenPlain
DIGITALOCEAN_APP_ID=
"@

Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8
Write-Host "✅ Arquivo .env.local criado" -ForegroundColor Green
Write-Host "⚠️  Adicione o DIGITALOCEAN_APP_ID depois de criar o app" -ForegroundColor Yellow

# Instruções finais
Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor White
Write-Host "1. Feche completamente o Claude Code" -ForegroundColor Yellow
Write-Host "2. Abra o Claude Code novamente" -ForegroundColor Yellow
Write-Host "3. O MCP da Digital Ocean estará disponível" -ForegroundColor Yellow
Write-Host ""
Write-Host "Comandos disponíveis:" -ForegroundColor White
Write-Host "- list_droplets"
Write-Host "- create_droplet"
Write-Host "- list_apps"
Write-Host "- create_app"
Write-Host "- list_databases"
Write-Host "- E muitos outros!"
Write-Host ""
Write-Host "Dica: Use 'list_apps' para verificar se está funcionando" -ForegroundColor Yellow