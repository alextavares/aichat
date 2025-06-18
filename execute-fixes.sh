#!/bin/bash
# Script para executar correções e testes

echo "🚀 Executando correções e testes..."
echo "===================================="

# Copiar arquivos necessários para o diretório correto
echo "📁 Copiando arquivos para ~/inneraiclone..."
cp /mnt/c/codigos/inneraiclone/fix-all-prisma-imports.sh ~/inneraiclone/ 2>/dev/null
cp /mnt/c/codigos/inneraiclone/test-db-connection.js ~/inneraiclone/ 2>/dev/null

# Tornar executável
chmod +x ~/inneraiclone/fix-all-prisma-imports.sh 2>/dev/null

# Executar correção de imports
echo -e "\n🔧 Corrigindo imports..."
cd ~/inneraiclone && ./fix-all-prisma-imports.sh

# Testar conexão com banco
echo -e "\n🗄️ Testando conexão com banco de dados..."
cd ~/inneraiclone && node test-db-connection.js

echo -e "\n✅ Processo concluído!"
echo "===================================="