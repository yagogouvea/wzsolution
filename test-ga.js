#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuração
const BASE_URL = 'https://app.wzsolutions.com.br';
const TEST_DATA = {
  name: 'Teste GA',
  email: 'teste@teste.com',
  whatsapp: '(11) 99999-9999',
  projectType: 'mobile',
  description: 'Teste de tracking do Google Analytics'
};

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Teste 1: Verificar se o site carrega com GA
async function testSiteWithGA() {
  console.log('\n🌐 TESTE 1: Site com Google Analytics');
  console.log('=====================================');
  
  try {
    const response = await makeRequest(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test Script GA'
      }
    });
    
    console.log('Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Site carregando com sucesso');
      
      // Verificar se há referências ao Google Analytics no HTML
      if (response.body.includes('googletagmanager.com') || 
          response.body.includes('gtag') || 
          response.body.includes('google-analytics')) {
        console.log('✅ Google Analytics detectado no HTML');
      } else {
        console.log('⚠️ Google Analytics não detectado no HTML (pode estar carregando via JS)');
      }
    } else {
      console.log(`❌ Site com erro ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar site:', error.message);
  }
}

// Teste 2: Simular envio de formulário para testar tracking
async function testFormSubmission() {
  console.log('\n📧 TESTE 2: Envio de formulário (tracking GA)');
  console.log('==============================================');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, TEST_DATA);
    
    console.log('Status:', response.statusCode);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Formulário enviado com sucesso');
      console.log('📊 Eventos GA que deveriam ser disparados:');
      console.log('   - form_submit_start');
      console.log('   - form_submit_success');
      console.log('   - budget_request_conversion');
    } else if (response.statusCode === 500) {
      console.log('❌ Erro 500 - Erro interno do servidor');
      console.log('📊 Eventos GA que deveriam ser disparados:');
      console.log('   - form_submit_start');
      console.log('   - form_submit_error');
    } else if (response.statusCode === 503) {
      console.log('⚠️ Erro 503 - Serviço indisponível');
      console.log('📊 Eventos GA que deveriam ser disparados:');
      console.log('   - form_submit_start');
      console.log('   - form_submit_error');
    } else {
      console.log(`❌ Erro ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar formulário:', error.message);
    console.log('📊 Eventos GA que deveriam ser disparados:');
    console.log('   - form_submit_start');
    console.log('   - form_submit_error (network_error)');
  }
}

// Teste 3: Verificar configuração de ambiente
async function testEnvironmentConfig() {
  console.log('\n🔧 TESTE 3: Configuração de ambiente');
  console.log('====================================');
  
  console.log('📋 Variáveis necessárias:');
  console.log('   - NEXT_PUBLIC_GA_MEASUREMENT_ID: Deve estar configurada');
  console.log('   - Formato esperado: G-XXXXXXXXXX');
  console.log('');
  console.log('🔍 Para verificar:');
  console.log('   1. Acesse o Railway Dashboard');
  console.log('   2. Vá em Variables');
  console.log('   3. Verifique se NEXT_PUBLIC_GA_MEASUREMENT_ID está configurada');
  console.log('   4. Teste no Google Analytics Real-time');
}

// Função principal
async function runTests() {
  console.log('🚀 INICIANDO TESTES DO GOOGLE ANALYTICS');
  console.log('========================================');
  console.log('URL Base:', BASE_URL);
  console.log('Dados de teste:', JSON.stringify(TEST_DATA, null, 2));
  
  await testSiteWithGA();
  await testFormSubmission();
  await testEnvironmentConfig();
  
  console.log('\n🏁 TESTES CONCLUÍDOS');
  console.log('====================');
  console.log('');
  console.log('📊 PRÓXIMOS PASSOS:');
  console.log('1. Configure NEXT_PUBLIC_GA_MEASUREMENT_ID no Railway');
  console.log('2. Faça deploy da aplicação');
  console.log('3. Teste no Google Analytics Real-time');
  console.log('4. Configure objetivos no GA4');
  console.log('5. Monitore as métricas regularmente');
}

// Executar testes
runTests().catch(console.error);
