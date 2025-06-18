#!/bin/bash
# Script completo para corrigir todos os imports do prisma

echo "🔧 Corrigindo todos os imports do prisma no projeto..."
echo "=================================================="

# Função para corrigir arquivo
fix_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Verificar se o arquivo contém o import errado
        if grep -q "import { prisma } from '@/lib/prisma-fix'" "$file"; then
            echo "✅ Corrigindo: $file"
            sed -i "s|import { prisma } from '@/lib/prisma-fix'|import { prisma } from '@/lib/db'|g" "$file"
        fi
    fi
}

# Corrigir arquivos conhecidos com problemas
echo -e "\n📁 Corrigindo arquivos da API..."
fix_file "app/api/subscription/route.ts"
fix_file "app/api/stripe/webhook/route.ts"
fix_file "app/api/stripe/mock-checkout/route.ts"
fix_file "app/api/stripe/checkout/route.ts"
fix_file "app/api/profile/route.ts"
fix_file "app/api/dashboard/plan/route.ts"
fix_file "app/api/dashboard/stats/route.ts"
fix_file "app/api/templates/[id]/use/route.ts"
fix_file "app/api/templates/route.ts"
fix_file "app/api/usage/today/route.ts"
fix_file "app/api/conversations/route.ts"
fix_file "app/api/conversations/[id]/route.ts"
fix_file "app/api/conversations/[id]/export/route.ts"
fix_file "app/api/chat/route.ts"
fix_file "app/api/chat/stream/route.ts"

# Buscar e corrigir qualquer outro arquivo que possa ter o import errado
echo -e "\n🔍 Buscando outros arquivos com imports incorretos..."
find . -name "*.ts" -o -name "*.tsx" | while read file; do
    fix_file "$file"
done

echo -e "\n✨ Correção concluída!"
echo "=================================================="
echo ""
echo "🎯 Próximos passos:"
echo "1. Reinicie o servidor (Ctrl+C)"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000"
echo ""
echo "💡 Se ainda houver erros, execute:"
echo "   npm run build"
echo "   Para verificar erros de compilação"