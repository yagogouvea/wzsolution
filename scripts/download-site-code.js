/**
 * Script para baixar código do site do Supabase (versão JavaScript)
 * Execute: node scripts/download-site-code.js
 * 
 * Certifique-se de ter as variáveis de ambiente configuradas no .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Tentar carregar variáveis de ambiente do .env.local manualmente (sem dotenv)
try {
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (e) {
  console.warn('⚠️ Não foi possível carregar .env.local, usando variáveis de ambiente do sistema');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas');
  console.error('   Verifique se o arquivo .env.local existe e contém essas variáveis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function downloadSiteCode() {
  try {
    // SiteId específico para baixar (da URL preview/cff1c752-dda2-4859-aa4e-34ade1b8b4e7)
    const siteId = process.argv[2] || 'cff1c752-dda2-4859-aa4e-34ade1b8b4e7';
    
    console.log('🔍 Buscando código do site no banco de dados...');
    console.log('📊 URL Supabase:', supabaseUrl);
    console.log('🎯 Site ID:', siteId);
    console.log('');
    
    // Usar a mesma lógica da rota /preview/[siteId]
    // Tentativa 1: Buscar pelo ID exato (se for UUID de versão específica)
    console.log(`🔍 Tentativa 1: Buscando pelo ID exato: ${siteId}...`);
    let { data: latestVersion, error: dbError } = await supabase
      .from('site_versions')
      .select('*')
      .eq('id', siteId)
      .maybeSingle();
    
    if (!dbError && latestVersion) {
      console.log(`✅ Versão encontrada pelo ID exato: ${siteId}`);
    } else {
      // Tentativa 2: Se não encontrou pelo ID, tratar como conversationId e buscar última versão
      console.log(`🔍 Tentativa 2: Buscando por conversation_id: ${siteId}...`);
      const { data: byConvData, error: byConvError } = await supabase
        .from('site_versions')
        .select('*')
        .eq('conversation_id', siteId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!byConvError && byConvData) {
        latestVersion = byConvData;
        console.log(`✅ Última versão encontrada por conversation_id: ${siteId}`);
      } else {
        dbError = byConvError || dbError;
        console.error('❌ Erro ao buscar:', dbError);
      }
    }
    
    if (dbError) {
      console.error('❌ Erro ao buscar do banco:', dbError);
      return;
    }
    
    if (!latestVersion) {
      console.error('❌ Nenhuma versão encontrada no banco para:', siteId);
      return;
    }
    
    console.log(`\n✅ Versão encontrada:`);
    console.log(`   - ID: ${latestVersion.id}`);
    console.log(`   - Conversation ID: ${latestVersion.conversation_id}`);
    console.log(`   - Versão: ${latestVersion.version_number}`);
    console.log(`   - Criado em: ${latestVersion.created_at}\n`);
    
    // Obter código do site
    const siteCode = latestVersion.site_code || '';
    
    if (!siteCode) {
      console.error('❌ Código do site está vazio!');
      return;
    }
    
    // Determinar extensão baseado no conteúdo
    const isJSX = siteCode.includes('import React') || 
                  siteCode.includes('export default') ||
                  siteCode.includes('className=');
    
    // Criar diretório de output
    const outputDir = path.join(process.cwd(), 'downloaded-site-codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Criar nome do arquivo
    const conversationId = latestVersion.conversation_id || 'unknown';
    const versionNumber = latestVersion.version_number || 1;
    const extension = isJSX ? 'jsx' : 'html';
    const filename = `site-code-${conversationId}-v${versionNumber}.${extension}`;
    const filepath = path.join(outputDir, filename);
    
    // Salvar código
    fs.writeFileSync(filepath, siteCode, 'utf-8');
    
    console.log(`\n✅ Arquivo salvo com sucesso!`);
    console.log(`   📁 Caminho: ${filepath}`);
    console.log(`   📄 Nome: ${filename}`);
    console.log(`   📊 Tamanho: ${siteCode.length} caracteres`);
    console.log(`   🔧 Tipo: ${isJSX ? 'JSX/React' : 'HTML'}`);
    console.log(`   🆔 Conversation ID: ${conversationId}`);
    console.log(`   🔢 Versão: ${versionNumber}`);
    
    // Salvar também informações da versão em JSON
    const infoFilename = `site-info-${conversationId}-v${versionNumber}.json`;
    const infoFilepath = path.join(outputDir, infoFilename);
    fs.writeFileSync(infoFilepath, JSON.stringify({
      id: latestVersion.id,
      conversation_id: latestVersion.conversation_id,
      version_number: latestVersion.version_number,
      created_at: latestVersion.created_at,
      updated_at: latestVersion.updated_at,
      code_length: siteCode.length,
      is_jsx: isJSX,
      has_code: !!siteCode,
      site_id_from_url: siteId
    }, null, 2), 'utf-8');
    
    console.log(`   📋 Info JSON: ${infoFilename}\n`);
    
    console.log(`\n✅ Todos os códigos foram salvos em: ${outputDir}`);
    console.log(`📁 Lista de arquivos criados:`);
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      const filepath = path.join(outputDir, file);
      const stats = fs.statSync(filepath);
      console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.error('Stack:', error.stack);
  }
}

downloadSiteCode();

