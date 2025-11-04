/**
 * Script para baixar código do site do Supabase
 * Execute: npx tsx scripts/download-site-code.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function downloadSiteCode() {
  try {
    console.log('🔍 Buscando código do site no banco de dados...');
    
    // Buscar todas as versões
    const { data: versions, error } = await supabase
      .from('site_versions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao buscar versões:', error);
      return;
    }
    
    if (!versions || versions.length === 0) {
      console.error('❌ Nenhuma versão encontrada no banco');
      return;
    }
    
    console.log(`✅ Encontradas ${versions.length} versões`);
    
    // Criar diretório de output
    const outputDir = path.join(process.cwd(), 'downloaded-site-codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Salvar cada versão
    for (const version of versions) {
      const conversationId = version.conversation_id || 'unknown';
      const versionNumber = version.version_number || 1;
      const filename = `site-code-${conversationId}-v${versionNumber}.txt`;
      const filepath = path.join(outputDir, filename);
      
      const siteCode = version.site_code || '';
      
      // Determinar extensão baseado no conteúdo
      const isJSX = siteCode.includes('import React') || 
                    siteCode.includes('export default') ||
                    siteCode.includes('className=');
      
      const extension = isJSX ? 'jsx' : 'html';
      const finalFilename = `site-code-${conversationId}-v${versionNumber}.${extension}`;
      const finalFilepath = path.join(outputDir, finalFilename);
      
      // Salvar código
      fs.writeFileSync(finalFilepath, siteCode, 'utf-8');
      
      console.log(`✅ Salvo: ${finalFilename} (${siteCode.length} caracteres)`);
      
      // Salvar também informações da versão em JSON
      const infoFilename = `site-info-${conversationId}-v${versionNumber}.json`;
      const infoFilepath = path.join(outputDir, infoFilename);
      fs.writeFileSync(infoFilepath, JSON.stringify({
        id: version.id,
        conversation_id: version.conversation_id,
        version_number: version.version_number,
        created_at: version.created_at,
        code_length: siteCode.length,
        is_jsx: isJSX,
        has_code: !!siteCode
      }, null, 2), 'utf-8');
    }
    
    console.log(`\n✅ Códigos salvos em: ${outputDir}`);
    console.log(`📁 Arquivos criados:`);
    fs.readdirSync(outputDir).forEach(file => {
      console.log(`   - ${file}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

downloadSiteCode();



