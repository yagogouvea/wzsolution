#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuração
const BASE_URL = 'https://app.wzsolutions.com.br';
const TEST_DATA = {
  name: 'Teste Script',
  email: 'teste@teste.com',
  whatsapp: '(11) 99999-9999',
  projectType: 'mobile',
  description: 'Teste automatizado via script'
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

// Teste 1: Endpoint de teste AWS
async function testAwsEndpoint() {
  console.log('\n🔍 TESTE 1: Endpoint de teste AWS');
  console.log('=====================================');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-aws`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.statusCode);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      console.log('✅ Endpoint de teste AWS funcionando');
    } else {
      console.log('❌ Endpoint de teste AWS com erro');
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar endpoint AWS:', error.message);
  }
}

// Teste 2: API de envio de email
async function testEmailApi() {
  console.log('\n📧 TESTE 2: API de envio de email');
  console.log('==================================');
  
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
      console.log('✅ API de email funcionando');
    } else if (response.statusCode === 500) {
      console.log('❌ Erro 500 - Erro interno do servidor');
    } else if (response.statusCode === 503) {
      console.log('⚠️ Erro 503 - Serviço indisponível');
    } else {
      console.log(`❌ Erro ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar API de email:', error.message);
  }
}

// Teste 3: Verificar se o site está online
async function testSiteOnline() {
  console.log('\n🌐 TESTE 3: Site online');
  console.log('========================');
  
  try {
    const response = await makeRequest(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test Script'
      }
    });
    
    console.log('Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Site online e funcionando');
    } else {
      console.log(`❌ Site com erro ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar site:', error.message);
  }
}

// Função principal
async function runTests() {
  console.log('🚀 INICIANDO TESTES DA API WZ SOLUTIONS');
  console.log('========================================');
  console.log('URL Base:', BASE_URL);
  console.log('Dados de teste:', JSON.stringify(TEST_DATA, null, 2));
  
  await testSiteOnline();
  await testAwsEndpoint();
  await testEmailApi();
  
  console.log('\n🏁 TESTES CONCLUÍDOS');
  console.log('====================');
}

// Executar testes
runTests().catch(console.error);
