#!/bin/bash
# Script para executar teste Puppeteer

echo "🧪 Executando teste completo com Puppeteer..."
echo "============================================"

cd ~/inneraiclone

# Instalar Puppeteer se necessário
if ! npm list puppeteer > /dev/null 2>&1; then
    echo "📦 Instalando Puppeteer..."
    npm install puppeteer --save-dev
fi

# Copiar arquivo de teste
cp /mnt/c/codigos/inneraiclone/test-complete-flow.js .

# Executar teste
echo -e "\n🚀 Iniciando testes..."
node test-complete-flow.js

echo -e "\n📸 Screenshots gerados:"
ls -la *.png 2>/dev/null || echo "Nenhum screenshot foi gerado"

echo -e "\n✅ Teste concluído!"