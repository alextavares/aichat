#!/bin/bash
echo "🚀 Executando teste completo do sistema..."
echo "========================================"
cd ~/inneraiclone
cp /mnt/c/codigos/inneraiclone/full-system-test.js .

# Verificar se servidor está rodando
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Servidor não está rodando!"
    echo "Execute 'npm run dev' em outro terminal primeiro"
    exit 1
fi

# Executar teste
node full-system-test.js

# Listar screenshots gerados
echo -e "\n📸 Screenshots gerados:"
ls -la test-*.png 2>/dev/null | tail -10