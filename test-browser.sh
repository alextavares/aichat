#!/bin/bash

echo "🧪 Inner AI Clone - Browser Test"
echo "================================"
echo ""
echo "Este script vai abrir o navegador para você testar manualmente."
echo ""
echo "📋 Checklist de Teste:"
echo ""
echo "1. LOGIN:"
echo "   - Email: test@example.com"
echo "   - Senha: test123"
echo ""
echo "2. CHAT:"
echo "   - Envie uma mensagem"
echo "   - Veja a resposta em streaming"
echo ""
echo "3. TEMPLATES:"
echo "   - Clique em '📝 Templates'"
echo "   - Escolha um template"
echo "   - Use com variáveis"
echo ""
echo "4. ANALYTICS:"
echo "   - Clique em '📊 Analytics'"
echo "   - Veja estatísticas de uso"
echo ""
echo "Abrindo navegador em 3 segundos..."
sleep 3

# Try to open browser based on OS
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
elif command -v cmd.exe > /dev/null; then
    cmd.exe /c start http://localhost:3000
elif command -v wslview > /dev/null; then
    wslview http://localhost:3000
else
    echo "❌ Não foi possível abrir o navegador automaticamente."
    echo "Por favor, abra manualmente: http://localhost:3000"
fi

echo ""
echo "✅ Navegador aberto! Siga o checklist acima para testar."