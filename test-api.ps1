# Script PowerShell para testar a API WZ Solutions
# Executar com: .\test-api.ps1

$BaseUrl = "https://app.wzsolutions.com.br"
$TestData = @{
    name = "Teste Script PowerShell"
    email = "teste@teste.com"
    whatsapp = "(11) 99999-9999"
    projectType = "mobile"
    description = "Teste automatizado via PowerShell"
} | ConvertTo-Json

Write-Host "🚀 INICIANDO TESTES DA API WZ SOLUTIONS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "URL Base: $BaseUrl" -ForegroundColor Yellow
Write-Host "Dados de teste: $TestData" -ForegroundColor Yellow

# Teste 1: Site online
Write-Host "`n🌐 TESTE 1: Site online" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site online e funcionando" -ForegroundColor Green
    } else {
        Write-Host "❌ Site com erro $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar site: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Endpoint de teste AWS
Write-Host "`n🔍 TESTE 2: Endpoint de teste AWS" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/test-aws" -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    $body = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($body | ConvertTo-Json -Depth 3)" -ForegroundColor White
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Endpoint de teste AWS funcionando" -ForegroundColor Green
    } else {
        Write-Host "❌ Endpoint de teste AWS com erro" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar endpoint AWS: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Teste 3: API de envio de email
Write-Host "`n📧 TESTE 3: API de envio de email" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/send-email" -Method POST -Body $TestData -Headers $headers -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    $body = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($body | ConvertTo-Json -Depth 3)" -ForegroundColor White
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API de email funcionando" -ForegroundColor Green
    } elseif ($response.StatusCode -eq 500) {
        Write-Host "❌ Erro 500 - Erro interno do servidor" -ForegroundColor Red
    } elseif ($response.StatusCode -eq 503) {
        Write-Host "⚠️ Erro 503 - Serviço indisponível" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erro $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar API de email: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🏁 TESTES CONCLUÍDOS" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green
