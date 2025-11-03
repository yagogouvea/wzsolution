// Script temporário para analisar o site gerado pela IA
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const siteId = 'cff1c752-dda2-4859-aa4e-34ade1b8b4e7';

async function analyzeSite() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Buscando site gerado...\n');
  
  // Tentar buscar pelo ID como conversationId primeiro
  let data = null;
  
  // Tentativa 1: Buscar última versão por conversationId
  const { data: byConvData, error: byConvError } = await supabase
    .from('site_versions')
    .select('*')
    .eq('conversation_id', siteId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!byConvError && byConvData) {
    data = byConvData;
    console.log('✅ Site encontrado por conversationId');
  } else {
    // Tentativa 2: Buscar pelo ID exato
    const { data: byIdData, error: byIdError } = await supabase
      .from('site_versions')
      .select('*')
      .eq('id', siteId)
      .maybeSingle();

    if (!byIdError && byIdData) {
      data = byIdData;
      console.log('✅ Site encontrado por ID');
    } else {
      // Tentativa 3: Buscar por site_code_id
      const { data: byCodeIdData, error: byCodeIdError } = await supabase
        .from('site_versions')
        .select('*')
        .eq('site_code_id', siteId)
        .maybeSingle();

      if (!byCodeIdError && byCodeIdData) {
        data = byCodeIdData;
        console.log('✅ Site encontrado por site_code_id');
      } else {
        console.error('❌ Site não encontrado');
        console.error('Erro conversationId:', byConvError);
        console.error('Erro ID:', byIdError);
        console.error('Erro site_code_id:', byCodeIdError);
        return;
      }
    }
  }

  if (!data) {
    console.error('❌ Nenhum dado encontrado');
    return;
  }

  console.log('\n📊 Informações do Site:');
  console.log('ID:', data.id);
  console.log('Conversation ID:', data.conversation_id);
  console.log('Versão:', data.version_number);
  console.log('Tamanho do código:', data.site_code?.length || 0, 'caracteres');
  
  const siteCode = typeof data.site_code === 'string' ? data.site_code : JSON.stringify(data.site_code);
  
  console.log('\n📄 Primeiros 1000 caracteres do código:');
  console.log('─'.repeat(80));
  console.log(siteCode.substring(0, 1000));
  console.log('─'.repeat(80));
  
  console.log('\n📄 Últimos 500 caracteres do código:');
  console.log('─'.repeat(80));
  console.log(siteCode.substring(Math.max(0, siteCode.length - 500)));
  console.log('─'.repeat(80));
  
  // Análise básica
  console.log('\n🔍 Análise do Código:');
  console.log('É JSX/React:', siteCode.includes('className') || siteCode.includes('export default'));
  console.log('Usa Tailwind:', siteCode.includes('tailwind') || siteCode.includes('className='));
  console.log('Tem imagens:', siteCode.includes('<img') || siteCode.includes('src='));
  console.log('Tem formulários:', siteCode.includes('<form') || siteCode.includes('<input'));
  console.log('Tem seções:', (siteCode.match(/<section/g) || []).length);
  console.log('Tem divs:', (siteCode.match(/<div/g) || []).length);
  
  // Salvar código completo em arquivo para análise
  const fs = require('fs');
  fs.writeFileSync('generated-site-code.html', siteCode);
  console.log('\n💾 Código completo salvo em: generated-site-code.html');
}

analyzeSite().catch(console.error);

