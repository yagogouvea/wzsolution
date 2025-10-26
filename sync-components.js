#!/usr/bin/env node

/**
 * Script para sincronizar componentes entre versões PT e EN
 * Uso: node sync-components.js [componente]
 * 
 * Exemplo: node sync-components.js Hero
 */

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];

if (!componentName) {
  console.log('❌ Uso: node sync-components.js [componente]');
  console.log('📋 Componentes disponíveis: Hero, About, Budget, Contact');
  process.exit(1);
}

const components = ['Hero', 'About', 'Budget', 'Contact'];

if (!components.includes(componentName)) {
  console.log(`❌ Componente "${componentName}" não encontrado.`);
  console.log('📋 Componentes disponíveis:', components.join(', '));
  process.exit(1);
}

const ptFile = `src/components/${componentName}.tsx`;
const enFile = `src/components/${componentName}EN.tsx`;

// Verificar se os arquivos existem
if (!fs.existsSync(ptFile)) {
  console.log(`❌ Arquivo ${ptFile} não encontrado.`);
  process.exit(1);
}

if (!fs.existsSync(enFile)) {
  console.log(`❌ Arquivo ${enFile} não encontrado.`);
  process.exit(1);
}

console.log(`🔄 Sincronizando ${componentName}...`);

// Ler arquivo em português
const ptContent = fs.readFileSync(ptFile, 'utf8');
const enContent = fs.readFileSync(enFile, 'utf8');

// Extrair textos em português (simplificado)
const ptTexts = extractTexts(ptContent);
const enTexts = extractTexts(enContent);

console.log(`📝 Textos encontrados em PT: ${ptTexts.length}`);
console.log(`📝 Textos encontrados em EN: ${enTexts.length}`);

// Mostrar diferenças
console.log('\n🔍 Verificando diferenças...');
const differences = findDifferences(ptTexts, enTexts);

if (differences.length === 0) {
  console.log('✅ Nenhuma diferença encontrada!');
} else {
  console.log(`⚠️  ${differences.length} diferenças encontradas:`);
  differences.forEach((diff, index) => {
    console.log(`\n${index + 1}. ${diff.type}:`);
    console.log(`   PT: "${diff.pt}"`);
    console.log(`   EN: "${diff.en}"`);
  });
}

console.log('\n✅ Sincronização concluída!');
console.log('💡 Lembre-se de testar ambas as versões após alterações.');

// Função para extrair textos (simplificada)
function extractTexts(content) {
  const texts = [];
  
  // Extrair strings entre aspas duplas
  const doubleQuotes = content.match(/"([^"]+)"/g);
  if (doubleQuotes) {
    doubleQuotes.forEach(match => {
      const text = match.slice(1, -1);
      if (text.length > 3 && !text.includes('className') && !text.includes('id=')) {
        texts.push(text);
      }
    });
  }
  
  // Extrair strings entre aspas simples
  const singleQuotes = content.match(/'([^']+)'/g);
  if (singleQuotes) {
    singleQuotes.forEach(match => {
      const text = match.slice(1, -1);
      if (text.length > 3 && !text.includes('className') && !text.includes('id=')) {
        texts.push(text);
      }
    });
  }
  
  return texts;
}

// Função para encontrar diferenças
function findDifferences(ptTexts, enTexts) {
  const differences = [];
  
  // Verificar se há textos em PT que não estão em EN
  ptTexts.forEach((ptText, index) => {
    if (enTexts[index] && ptText !== enTexts[index]) {
      differences.push({
        type: 'Texto diferente',
        pt: ptText,
        en: enTexts[index]
      });
    }
  });
  
  return differences;
}


