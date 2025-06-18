#!/bin/bash
# Script para executar teste completo com Puppeteer

echo "🚀 Preparando e executando teste com Puppeteer..."
echo "================================================="

# Navegar para o diretório do projeto
cd ~/inneraiclone

# Verificar se estamos no diretório correto
echo "📍 Diretório atual: $(pwd)"

# Instalar Puppeteer
echo -e "\n📦 Instalando Puppeteer..."
npm install puppeteer --save-dev

# Verificar instalação
if npm list puppeteer > /dev/null 2>&1; then
    echo "✅ Puppeteer instalado com sucesso!"
else
    echo "❌ Erro ao instalar Puppeteer"
    exit 1
fi

# Copiar arquivo de teste
echo -e "\n📋 Copiando arquivo de teste..."
cp /mnt/c/codigos/inneraiclone/test-with-auth.js .

# Executar teste
echo -e "\n🧪 Executando teste com autenticação..."
echo "================================================="
node test-with-auth.js

echo -e "\n✅ Processo concluído!"