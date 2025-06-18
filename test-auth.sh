#!/bin/bash
# Teste de autenticação do Inner AI Clone

echo "🧪 Testando autenticação do Inner AI Clone..."
echo "==========================================="

# URL base
BASE_URL="http://localhost:3000"

# Credenciais de teste
EMAIL="test@example.com"
PASSWORD="test123"

echo -e "\n1️⃣ Testando página de login..."
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/auth/signin")
if [ "$LOGIN_RESPONSE" = "200" ]; then
    echo "✅ Página de login acessível"
else
    echo "❌ Erro ao acessar página de login (HTTP $LOGIN_RESPONSE)"
fi

echo -e "\n2️⃣ Tentando login com credenciais de teste..."
# Fazer login via API
LOGIN_API_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL&password=$PASSWORD&csrfToken=test" \
  -w "\n%{http_code}")

echo "Resposta da API: $LOGIN_API_RESPONSE"

echo -e "\n3️⃣ Verificando dashboard..."
DASHBOARD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")
if [ "$DASHBOARD_RESPONSE" = "200" ] || [ "$DASHBOARD_RESPONSE" = "302" ]; then
    echo "✅ Dashboard respondendo"
else
    echo "❌ Erro ao acessar dashboard (HTTP $DASHBOARD_RESPONSE)"
fi

echo -e "\n4️⃣ Testando APIs principais..."
# Testar API de conversas
CONV_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/conversations")
echo "API Conversations: HTTP $CONV_RESPONSE"

# Testar API de templates
TEMP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/templates")
echo "API Templates: HTTP $TEMP_RESPONSE"

# Testar API de uso
USAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/usage/today")
echo "API Usage: HTTP $USAGE_RESPONSE"

echo -e "\n==========================================="
echo "📊 Resumo do teste:"
echo "- Login Page: $LOGIN_RESPONSE"
echo "- Dashboard: $DASHBOARD_RESPONSE"
echo "- APIs: Conv($CONV_RESPONSE) Temp($TEMP_RESPONSE) Usage($USAGE_RESPONSE)"
echo ""
echo "💡 Se as APIs retornaram 500, execute:"
echo "   cd ~/inneraiclone && ./fix-all-imports.sh"