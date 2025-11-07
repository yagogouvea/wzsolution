// Script para extrair o design do site gerado
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const conversationId = 'cff1c752-dda2-4859-aa4e-34ade1b8b4e7';

async function extractDesign() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Buscando código do site gerado...\n');
  
  const { data, error } = await supabase
    .from('site_versions')
    .select('site_code')
    .eq('conversation_id', conversationId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error('❌ Erro ao buscar:', error);
    return;
  }

  const siteCode = typeof data.site_code === 'string' ? data.site_code : JSON.stringify(data.site_code);
  
  // Salvar código completo
  fs.writeFileSync('extracted-site-code.html', siteCode);
  console.log('✅ Código salvo em: extracted-site-code.html');
  console.log('📏 Tamanho:', siteCode.length, 'caracteres');
}

extractDesign().catch(console.error);







