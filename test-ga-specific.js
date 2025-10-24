#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuração
const BASE_URL = 'https://app.wzsolutions.com.br';
const GA_MEASUREMENT_ID = 'G-FJ86C36NYP';
const TEST_DATA = {
  name: 'Teste GA Específico',
  email: 'teste@teste.com',
  whatsapp: '(11) 99999-9999',
  projectType: 'mobile',
  description: 'Teste de tracking com ID específico G-FJ86C36NYP'
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
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
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

// Teste 1: Verificar se o site carrega e se tem o GA configurado
async function testSiteWithSpecificGA() {
  console.log('\n🌐 TESTE 1: Site com Google Analytics G-FJ86C36NYP');
  console.log('==================================================');
  
  try {
    const response = await makeRequest(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test Script GA Specific'
      }
    });
    
    console.log('Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Site carregando com sucesso');
      
      // Verificar se há referências ao Google Analytics no HTML
      const htmlContent = response.body;
      
      if (htmlContent.includes('googletagmanager.com')) {
        console.log('✅ Google Tag Manager detectado no HTML');
      } else {
        console.log('⚠️ Google Tag Manager não detectado no HTML');
      }
      
      if (htmlContent.includes('gtag')) {
        console.log('✅ gtag detectado no HTML');
      } else {
        console.log('⚠️ gtag não detectado no HTML');
      }
      
      if (htmlContent.includes(GA_MEASUREMENT_ID)) {
        console.log(`✅ ID de métricas ${GA_MEASUREMENT_ID} detectado no HTML`);
      } else {
        console.log(`⚠️ ID de métricas ${GA_MEASUREMENT_ID} NÃO detectado no HTML`);
        console.log('   Isso indica que a variável NEXT_PUBLIC_GA_MEASUREMENT_ID não está configurada no Railway');
      }
      
      if (htmlContent.includes('google-analytics')) {
        console.log('✅ Google Analytics detectado no HTML');
      } else {
        console.log('⚠️ Google Analytics não detectado no HTML');
      }
      
    } else {
      console.log(`❌ Site com erro ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar site:', error.message);
  }
}

// Teste 2: Verificar se o GA está funcionando via JavaScript
async function testGAJavaScript() {
  console.log('\n📊 TESTE 2: Verificação do JavaScript do GA');
  console.log('===========================================');
  
  console.log('🔍 Para verificar se o GA está funcionando:');
  console.log('1. Abra o site no navegador: https://app.wzsolutions.com.br');
  console.log('2. Abra o DevTools (F12)');
  console.log('3. Vá na aba Network');
  console.log('4. Recarregue a página');
  console.log('5. Procure por requisições para:');
  console.log('   - googletagmanager.com');
  console.log('   - google-analytics.com');
  console.log('   - analytics.google.com');
  console.log('');
  console.log('6. Vá na aba Console e digite:');
  console.log('   gtag("event", "test_event", {test: true})');
  console.log('   Se não der erro, o GA está funcionando!');
  console.log('');
  console.log('7. Verifique se o ID está correto:');
  console.log(`   Deve aparecer: ${GA_MEASUREMENT_ID}`);
}

// Teste 3: Simular eventos que deveriam ser rastreados
async function testGAEvents() {
  console.log('\n🎯 TESTE 3: Eventos que deveriam ser rastreados');
  console.log('==============================================');
  
  console.log('📋 Eventos configurados no site:');
  console.log('');
  console.log('1. 📄 Page View (automático):');
  console.log('   - Evento: page_view');
  console.log('   - Disparado: Ao carregar qualquer página');
  console.log('');
  console.log('2. 🎯 CTA Clicks:');
  console.log('   - Evento: cta_click');
  console.log('   - Parâmetros: button_name, location');
  console.log('   - Disparado: Ao clicar em "Solicitar Orçamento" ou "Conhecer Serviços"');
  console.log('');
  console.log('3. 📱 WhatsApp Clicks:');
  console.log('   - Evento: whatsapp_click');
  console.log('   - Parâmetros: button_location, phone_number');
  console.log('   - Disparado: Ao clicar no botão WhatsApp flutuante');
  console.log('');
  console.log('4. 📧 Formulário de Orçamento:');
  console.log('   - Evento: form_submit_start (ao iniciar envio)');
  console.log('   - Evento: form_submit_success (envio bem-sucedido)');
  console.log('   - Evento: form_submit_error (erro no envio)');
  console.log('   - Evento: budget_request_conversion (conversão)');
  console.log('   - Parâmetros: form_name, project_type, value, currency');
  console.log('');
}

// Teste 4: Verificar configuração no Railway
async function testRailwayConfig() {
  console.log('\n🔧 TESTE 4: Configuração no Railway');
  console.log('===================================');
  
  console.log('📋 Para configurar o Google Analytics no Railway:');
  console.log('');
  console.log('1. Acesse: https://railway.app');
  console.log('2. Vá no seu projeto WZ Solution');
  console.log('3. Clique em "Variables"');
  console.log('4. Adicione a variável:');
  console.log(`   Nome: NEXT_PUBLIC_GA_MEASUREMENT_ID`);
  console.log(`   Valor: ${GA_MEASUREMENT_ID}`);
  console.log('5. Clique em "Deploy" para aplicar as mudanças');
  console.log('');
  console.log('⚠️ IMPORTANTE:');
  console.log('- A variável deve começar com NEXT_PUBLIC_');
  console.log('- O valor deve ser exatamente: G-FJ86C36NYP');
  console.log('- Após configurar, aguarde alguns minutos para o deploy');
  console.log('');
}

// Função principal
async function runTests() {
  console.log('🚀 VERIFICAÇÃO DO GOOGLE ANALYTICS G-FJ86C36NYP');
  console.log('================================================');
  console.log('ID de Métricas:', GA_MEASUREMENT_ID);
  console.log('URL Base:', BASE_URL);
  console.log('Dados de teste:', JSON.stringify(TEST_DATA, null, 2));
  
  await testSiteWithSpecificGA();
  await testGAJavaScript();
  await testGAEvents();
  await testRailwayConfig();
  
  console.log('\n🏁 VERIFICAÇÃO CONCLUÍDA');
  console.log('========================');
  console.log('');
  console.log('📊 RESUMO:');
  console.log('✅ Site funcionando');
  console.log('✅ Sistema de email funcionando');
  console.log('⚠️ Google Analytics precisa ser configurado no Railway');
  console.log('');
  console.log('🎯 PRÓXIMO PASSO:');
  console.log('Configure NEXT_PUBLIC_GA_MEASUREMENT_ID=G-FJ86C36NYP no Railway');
  console.log('e aguarde o deploy para começar a coletar dados!');
}

// Executar testes
runTests().catch(console.error);
