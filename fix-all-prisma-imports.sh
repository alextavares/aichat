#!/bin/bash
# Script completo para corrigir TODOS os imports do prisma

echo "🔧 Corrigindo TODOS os imports do prisma..."
echo "=========================================="

# Função para corrigir arquivo
fix_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Verificar se contém import errado
        if grep -q "from '@/lib/prisma-fix'" "$file"; then
            echo "✅ Corrigindo: $file"
            sed -i "s|from '@/lib/prisma-fix'|from '@/lib/db'|g" "$file"
        fi
    fi
}

# Corrigir todos os arquivos .ts e .tsx
echo "🔍 Buscando e corrigindo arquivos..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" -not -path "./.next/*" | while read file; do
    fix_file "$file"
done

# Verificar especificamente o arquivo de usage que está dando erro
echo -e "\n📝 Verificando arquivo api/usage/today/route.ts..."
if [ -f "app/api/usage/today/route.ts" ]; then
    echo "Conteúdo atual das importações:"
    head -10 app/api/usage/today/route.ts | grep -E "(import|from)"
fi

echo -e "\n✨ Correção concluída!"
echo ""
echo "🎯 Próximos passos:"
echo "1. O servidor deve recarregar automaticamente"
echo "2. Verifique o navegador novamente"
echo "3. Se ainda houver erros, execute: npm run build"