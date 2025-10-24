#!/bin/bash

# Script Bash para testar a API WZ Solutions
# Executar com: chmod +x test-api.sh && ./test-api.sh

BASE_URL="https://app.wzsolutions.com.br"
TEST_DATA='{
  "name": "Teste Script Bash",
  "email": "teste@teste.com",
  "whatsapp": "(11) 99999-9999",
  "projectType": "mobile",
  "description": "Teste automatizado via Bash"
}'

echo "🚀 INICIANDO TESTES DA API WZ SOLUTIONS"
echo "========================================"
echo "URL Base: $BASE_URL"
echo "Dados de teste: $TEST_DATA"

# Teste 1: Site online
echo ""
echo "🌐 TESTE 1: Site online"
echo "========================"

response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
echo "Status: $response"

if [ "$response" -eq 200 ]; then
    echo "✅ Site online e funcionando"
else
    echo "❌ Site com erro $response"
fi

# Teste 2: Endpoint de teste AWS
echo ""
echo "🔍 TESTE 2: Endpoint de teste AWS"
echo "=================================="

response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/test-aws")
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "Status: $status_code"
echo "Response: $body"

if [ "$status_code" -eq 200 ]; then
    echo "✅ Endpoint de teste AWS funcionando"
else
    echo "❌ Endpoint de teste AWS com erro"
fi

# Teste 3: API de envio de email
echo ""
echo "📧 TESTE 3: API de envio de email"
echo "=================================="

response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "$BASE_URL/api/send-email")

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "Status: $status_code"
echo "Response: $body"

if [ "$status_code" -eq 200 ]; then
    echo "✅ API de email funcionando"
elif [ "$status_code" -eq 500 ]; then
    echo "❌ Erro 500 - Erro interno do servidor"
elif [ "$status_code" -eq 503 ]; then
    echo "⚠️ Erro 503 - Serviço indisponível"
else
    echo "❌ Erro $status_code"
fi

echo ""
echo "🏁 TESTES CONCLUÍDOS"
echo "===================="
