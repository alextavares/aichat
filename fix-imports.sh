#!/bin/bash
# Script para corrigir imports do prisma

echo "🔧 Corrigindo imports do prisma..."

# Lista de arquivos para corrigir
files=(
  "app/api/subscription/route.ts"
  "app/api/stripe/webhook/route.ts"
  "app/api/stripe/mock-checkout/route.ts"
  "app/api/stripe/checkout/route.ts"
  "app/api/profile/route.ts"
  "app/api/dashboard/plan/route.ts"
  "app/api/dashboard/stats/route.ts"
  "app/api/templates/[id]/use/route.ts"
  "app/api/templates/route.ts"
)

# Corrigir cada arquivo
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Corrigindo $file"
    sed -i "s|import { prisma } from '@/lib/prisma-fix'|import { prisma } from '@/lib/db'|g" "$file"
  fi
done

echo "✨ Correção concluída!"
echo ""
echo "🔄 Reinicie o servidor (Ctrl+C e npm run dev) para aplicar as mudanças"