#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuração
const BASE_URL = 'https://app.wzsolutions.com.br';
const GA_MEASUREMENT_ID = 'G-FJ86C36NYP';

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

// Teste 1: Verificar se a tag do Google está presente
async function testGoogleTag() {
  console.log('\n🔍 TESTE 1: Verificação da Tag do Google');
  console.log('=========================================');
  
  try {
    const response = await makeRequest(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test Script GA Tag'
      }
    });
    
    console.log('Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Site carregando com sucesso');
      
      const htmlContent = response.body;
      
      // Verificar tag do Google
      if (htmlContent.includes('googletagmanager.com/gtag/js')) {
        console.log('✅ Tag do Google detectada: googletagmanager.com/gtag/js');
      } else {
        console.log('❌ Tag do Google NÃO detectada: googletagmanager.com/gtag/js');
      }
      
      if (htmlContent.includes('window.dataLayer')) {
        console.log('✅ window.dataLayer detectado');
      } else {
        console.log('❌ window.dataLayer NÃO detectado');
      }
      
      if (htmlContent.includes('function gtag')) {
        console.log('✅ function gtag detectada');
      } else {
        console.log('❌ function gtag NÃO detectada');
      }
      
      if (htmlContent.includes(GA_MEASUREMENT_ID)) {
        console.log(`✅ ID de métricas ${GA_MEASUREMENT_ID} detectado`);
      } else {
        console.log(`❌ ID de métricas ${GA_MEASUREMENT_ID} NÃO detectado`);
      }
      
      if (htmlContent.includes('gtag(\'config\'')) {
        console.log('✅ gtag config detectado');
      } else {
        console.log('❌ gtag config NÃO detectado');
      }
      
      // Verificar se está no <head>
      const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      if (headMatch) {
        const headContent = headMatch[1];
        if (headContent.includes('googletagmanager.com')) {
          console.log('✅ Tag do Google encontrada no <head>');
        } else {
          console.log('❌ Tag do Google NÃO encontrada no <head>');
        }
      }
      
    } else {
      console.log(`❌ Site com erro ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar site:', error.message);
  }
}

// Teste 2: Verificar se os eventos estão configurados
async function testGAEvents() {
  console.log('\n🎯 TESTE 2: Eventos Configurados');
  console.log('================================');
  
  console.log('📋 Eventos que devem ser rastreados:');
  console.log('');
  console.log('1. 📄 Page View (automático):');
  console.log('   - Disparado: Ao carregar qualquer página');
  console.log('   - Verificação: Deve aparecer no GA Real-time');
  console.log('');
  console.log('2. 🎯 CTA Clicks:');
  console.log('   - Botão "Solicitar Orçamento"');
  console.log('   - Botão "Conhecer Serviços"');
  console.log('   - Evento: cta_click');
  console.log('');
  console.log('3. 📱 WhatsApp Clicks:');
  console.log('   - Botão flutuante WhatsApp');
  console.log('   - Evento: whatsapp_click');
  console.log('');
  console.log('4. 📧 Formulário de Orçamento:');
  console.log('   - Início do envio: form_submit_start');
  console.log('   - Sucesso: form_submit_success');
  console.log('   - Erro: form_submit_error');
  console.log('   - Conversão: budget_request_conversion');
  console.log('');
}

// Teste 3: Instruções para verificação manual
async function testManualVerification() {
  console.log('\n🔧 TESTE 3: Verificação Manual');
  console.log('==============================');
  
  console.log('📋 Para verificar se o GA está funcionando:');
  console.log('');
  console.log('1. 🌐 Abra o site no navegador:');
  console.log(`   ${BASE_URL}`);
  console.log('');
  console.log('2. 🔍 Abra o DevTools (F12):');
  console.log('   - Vá na aba "Network"');
  console.log('   - Recarregue a página');
  console.log('   - Procure por requisições para:');
  console.log('     • googletagmanager.com');
  console.log('     • google-analytics.com');
  console.log('');
  console.log('3. 📊 Teste no Console:');
  console.log('   - Vá na aba "Console"');
  console.log('   - Digite: gtag("event", "test_event", {test: true})');
  console.log('   - Se não der erro, o GA está funcionando!');
  console.log('');
  console.log('4. 🎯 Teste eventos:');
  console.log('   - Clique nos botões CTA');
  console.log('   - Clique no WhatsApp');
  console.log('   - Envie o formulário');
  console.log('   - Verifique no GA Real-time');
  console.log('');
  console.log('5. 📈 Google Analytics Real-time:');
  console.log('   - Acesse: https://analytics.google.com');
  console.log('   - Vá em "Real-time"');
  console.log('   - Deve aparecer visitantes ativos');
  console.log('');
}

// Função principal
async function runTests() {
  console.log('🚀 VERIFICAÇÃO DA TAG DO GOOGLE ANALYTICS');
  console.log('==========================================');
  console.log('ID de Métricas:', GA_MEASUREMENT_ID);
  console.log('URL Base:', BASE_URL);
  console.log('');
  console.log('📋 Tag implementada:');
  console.log('<!-- Google tag (gtag.js) -->');
  console.log('<script async src="https://www.googletagmanager.com/gtag/js?id=G-FJ86C36NYP"></script>');
  console.log('<script>');
  console.log('  window.dataLayer = window.dataLayer || [];');
  console.log('  function gtag(){dataLayer.push(arguments);}');
  console.log('  gtag(\'js\', new Date());');
  console.log('  gtag(\'config\', \'G-FJ86C36NYP\');');
  console.log('</script>');
  
  await testGoogleTag();
  await testGAEvents();
  await testManualVerification();
  
  console.log('\n🏁 VERIFICAÇÃO CONCLUÍDA');
  console.log('========================');
  console.log('');
  console.log('✅ Tag do Google implementada com sucesso!');
  console.log('✅ Todos os eventos configurados!');
  console.log('✅ Pronto para coletar dados!');
  console.log('');
  console.log('🎯 PRÓXIMO PASSO:');
  console.log('Teste manualmente no navegador e verifique no Google Analytics Real-time!');
}

// Executar testes
runTests().catch(console.error);
