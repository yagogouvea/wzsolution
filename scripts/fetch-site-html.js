// Script para buscar e salvar o HTML completo do site gerado
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const conversationId = 'cff1c752-dda2-4859-aa4e-34ade1b8b4e7';

async function fetchSiteHTML() {
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

  let siteCode = typeof data.site_code === 'string' ? data.site_code : JSON.stringify(data.site_code);
  
  // Salvar código completo
  const outputFile = path.join(__dirname, 'extracted-site-code.html');
  fs.writeFileSync(outputFile, siteCode);
  console.log('✅ Código salvo em:', outputFile);
  console.log('📏 Tamanho:', siteCode.length, 'caracteres');
  console.log('\n📄 Primeiros 1000 caracteres:\n');
  console.log(siteCode.substring(0, 1000));
}

fetchSiteHTML().catch(console.error);






