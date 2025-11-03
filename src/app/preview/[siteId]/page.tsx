// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { convertJSXToHTML, processAIGeneratedCode } from "@/lib/jsx-to-html";
import { injectSecurityProtections, sanitizeCodeForPreview } from "@/lib/security-protection";
import PreviewInit from "@/components/PreviewInit";

export async function generateMetadata({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  return {
    title: `Preview - ${siteId.substring(0, 8)}`,
  };
}

export default async function Preview({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ✅ Buscar versão: primeiro pelo ID exato, depois pela última versão da conversa
  let data: any = null;
  let fetchError: any = null;
  
  // Tentativa 1: Buscar pelo ID exato (se for UUID de versão específica)
  const { data: byIdData, error: byIdError } = await supabase
    .from("site_versions")
    .select("site_code, id, version_number, conversation_id")
    .eq("id", siteId)
    .maybeSingle();

  if (!byIdError && byIdData) {
    data = byIdData;
    console.log(`📄 [Preview] Versão encontrada pelo ID exato: ${siteId}`);
  } else {
    // Tentativa 2: Se não encontrou pelo ID, tratar como conversationId e buscar última versão
    const { data: byConvData, error: byConvError } = await supabase
      .from("site_versions")
      .select("site_code, id, version_number, conversation_id")
      .eq("conversation_id", siteId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!byConvError && byConvData) {
      data = byConvData;
      console.log(`📄 [Preview] Última versão encontrada por conversationId: ${siteId}`);
    } else {
      fetchError = byConvError || byIdError;
    }
  }

  if (fetchError || !data) {
    console.error('❌ [Preview] Erro ao buscar do Supabase:', fetchError);
    return notFound();
  }

  if (!data) {
    console.error('❌ [Preview] Nenhum dado encontrado para siteId:', siteId);
    return notFound();
  }

  // ✅ Log do que foi recuperado do banco
  if (process.env.NODE_ENV === 'development') {
    console.log('📥 [Preview] Dados recuperados do Supabase:');
    console.log('📥 [Preview] - ID:', data.id);
    console.log('📥 [Preview] - Version:', data.version_number);
    console.log('📥 [Preview] - Tipo de site_code:', typeof data.site_code);
    console.log('📥 [Preview] - Tamanho de site_code:', data.site_code?.length || 0);
    console.log('📥 [Preview] - Primeiros 500 chars de site_code:', data.site_code?.substring(0, 500));
  }

  if (!data.site_code) {
    console.error('❌ [Preview] site_code está vazio ou null!');
    console.error('❌ [Preview] Dados completos:', JSON.stringify(data, null, 2));
    return notFound();
  }

  // ✅ Verificar código original ANTES de processar
  if (typeof data.site_code !== 'string') {
    console.error('❌ [Preview] site_code não é string! Tipo:', typeof data.site_code);
    console.error('❌ [Preview] Valor:', data.site_code);
    // Tentar converter se for objeto
    if (typeof data.site_code === 'object' && data.site_code !== null) {
      console.log('⚠️ [Preview] Tentando converter objeto para string...');
      const stringified = JSON.stringify(data.site_code);
      if (stringified === '{}' || stringified.length < 10) {
        console.error('❌ [Preview] Código parece ser um objeto vazio {}');
        return (
          <main className="min-h-screen bg-gray-50 p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-xl font-bold text-red-800 mb-2">Erro: Código inválido no banco</h1>
              <p className="text-red-600">O código salvo parece ser um objeto vazio ({}).</p>
              <p className="text-sm text-red-500 mt-2">Isso indica um problema ao salvar o código no Supabase.</p>
              <p className="text-xs text-gray-500 mt-4">ID: {siteId}</p>
            </div>
          </main>
        );
      }
      data.site_code = stringified;
    }
  }

  // Processar código gerado pela IA (remover markdown, etc)
  let processedCode = processAIGeneratedCode(data.site_code);
  
  // ✅ Log para debug (desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log('📄 [Preview] Código processado (primeiros 500 chars):', processedCode.substring(0, 500));
    console.log('📄 [Preview] Tamanho do código processado:', processedCode.length);
  }
  
  // ✅ Validar código processado
  if (!processedCode || processedCode.length < 10) {
    console.error('❌ [Preview] ERRO CRÍTICO: Código processado está vazio!');
    console.error('❌ [Preview] Código original (site_code):', data.site_code);
    console.error('❌ [Preview] Código processado:', processedCode);
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar preview</h1>
          <p className="text-red-600">O código do site não foi encontrado ou está vazio.</p>
          <p className="text-sm text-red-500 mt-2">ID: {siteId}</p>
        </div>
      </main>
    );
  }
  
  // Converter JSX para HTML renderizável usando função melhorada
  let fullHtml = convertJSXToHTML(processedCode, {
    removeComplexExpressions: false, // NÃO remover para manter scripts úteis
    convertClassName: true, // Converter className para class
    preserveInlineStyles: true, // Manter estilos inline
    addTailwind: false // Não adicionar se já existe Tailwind no HTML
  });
  
  // ✅ Validar se o HTML foi gerado corretamente
  if (!fullHtml || fullHtml.length < 500) {
    console.error('⚠️ [Preview] HTML gerado parece estar vazio ou muito curto:', fullHtml.length);
  }

  // 🔒 Aplicar proteções de segurança (mais leve para preview)
  // ✅ Aplicar sanitização apenas para remover tokens (não remover CSS/JS válido)
  fullHtml = sanitizeCodeForPreview(fullHtml);
  
  // ✅ Aplicar proteções de segurança (menos agressivo para não quebrar o preview)
  fullHtml = injectSecurityProtections(fullHtml, siteId);
  
  // ✅ Log final para debug
  if (process.env.NODE_ENV === 'development') {
    console.log('📄 [Preview] HTML final (primeiros 300 chars):', fullHtml.substring(0, 300));
    console.log('📄 [Preview] HTML final (últimos 200 chars):', fullHtml.substring(Math.max(0, fullHtml.length - 200)));
    console.log('📄 [Preview] Tamanho HTML final:', fullHtml.length);
    console.log('📄 [Preview] Contém <!DOCTYPE:', fullHtml.includes('<!DOCTYPE'));
    console.log('📄 [Preview] Contém <html:', fullHtml.includes('<html'));
    console.log('📄 [Preview] Contém <body:', fullHtml.includes('<body'));
  }

  return (
    <>
      <PreviewInit />
      <iframe
        srcDoc={fullHtml}
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
        title="Preview do Site Gerado"
        allow="script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com"
      />
    </>
  );
}

