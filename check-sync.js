#!/usr/bin/env node

/**
 * Script para verificar se os componentes estão sincronizados
 * Uso: node check-sync.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sincronização dos componentes...\n');

const components = ['Hero', 'About', 'Budget', 'Contact'];
let allSynced = true;

components.forEach(component => {
  const ptFile = `src/components/${component}.tsx`;
  const enFile = `src/components/${component}EN.tsx`;
  
  if (!fs.existsSync(ptFile) || !fs.existsSync(enFile)) {
    console.log(`❌ ${component}: Arquivos não encontrados`);
    allSynced = false;
    return;
  }
  
  const ptContent = fs.readFileSync(ptFile, 'utf8');
  const enContent = fs.readFileSync(enFile, 'utf8');
  
  // Verificar se têm a mesma estrutura básica
  const ptLines = ptContent.split('\n').length;
  const enLines = enContent.split('\n').length;
  
  const ptFunctions = (ptContent.match(/function|const.*=.*\(/g) || []).length;
  const enFunctions = (enContent.match(/function|const.*=.*\(/g) || []).length;
  
  const ptJSX = (ptContent.match(/<[A-Z]/g) || []).length;
  const enJSX = (enContent.match(/<[A-Z]/g) || []).length;
  
  const isStructureSimilar = Math.abs(ptLines - enLines) < 10 && 
                            Math.abs(ptFunctions - enFunctions) < 3 &&
                            Math.abs(ptJSX - enJSX) < 5;
  
  if (isStructureSimilar) {
    console.log(`✅ ${component}: Estrutura similar (PT: ${ptLines} linhas, EN: ${enLines} linhas)`);
  } else {
    console.log(`⚠️  ${component}: Estrutura diferente (PT: ${ptLines} linhas, EN: ${enLines} linhas)`);
    allSynced = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allSynced) {
  console.log('✅ Todos os componentes estão sincronizados!');
  console.log('🚀 Pronto para deploy.');
} else {
  console.log('⚠️  Alguns componentes precisam de atenção.');
  console.log('💡 Execute: node sync-components.js [componente] para verificar detalhes.');
}

console.log('\n📋 URLs para testar:');
console.log('🇧🇷 Português: http://localhost:3000/pt');
console.log('🇺🇸 English: http://localhost:3000/en');

