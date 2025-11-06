/**
 * Script para gerar um segredo seguro para DOWNLOAD_TOKEN_SECRET
 * 
 * Execute: node scripts/generate-secret.js
 */

const crypto = require('crypto');

// Gerar 64 bytes aleatórios e converter para hex (128 caracteres)
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 SEGREDO GERADO COM SUCESSO!\n');
console.log('Copie este valor e configure como variável de ambiente:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(secret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Como configurar no Railway:');
console.log('1. Acesse seu projeto no Railway');
console.log('2. Vá em "Variables"');
console.log('3. Adicione nova variável:');
console.log('   Nome: DOWNLOAD_TOKEN_SECRET');
console.log('   Valor: (cole o segredo acima)');
console.log('4. Salve e faça redeploy\n');

