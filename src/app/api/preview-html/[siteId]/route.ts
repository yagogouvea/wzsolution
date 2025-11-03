/**
 * API para retornar HTML processado do preview
 * Permite usar srcDoc em iframes evitando X-Frame-Options
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { convertJSXToHTML, processAIGeneratedCode } from "@/lib/jsx-to-html";
import { injectSecurityProtections, sanitizeCodeForPreview } from "@/lib/security-protection";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✅ BUSCAR VERSÃO: Primeiro tentar pelo ID exato, depois pela última versão da conversa
    let versionData: any = null;
    
    // Tentativa 1: Buscar pelo ID exato (se for UUID de versão específica)
    const { data: byIdData, error: byIdError } = await supabase
      .from("site_versions")
      .select("site_code, conversation_id")
      .eq("id", siteId)
      .maybeSingle();

    if (!byIdError && byIdData) {
      versionData = byIdData;
      console.log(`📄 [preview-html] Versão encontrada pelo ID exato: ${siteId}`);
    } else {
      // Tentativa 2: Se não encontrou pelo ID, tratar como conversationId e buscar última versão
      const { data: byConvData, error: byConvError } = await supabase
        .from("site_versions")
        .select("site_code, conversation_id")
        .eq("conversation_id", siteId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!byConvError && byConvData) {
        versionData = byConvData;
        console.log(`📄 [preview-html] Última versão encontrada por conversationId: ${siteId}`);
      }
    }

    if (!versionData?.site_code) {
      console.error("❌ [preview-html] Site não encontrado ou sem código");
      return NextResponse.json(
        { error: "Site não encontrado" },
        { status: 404 }
      );
    }

    console.log(`📄 [preview-html] Código encontrado: ${versionData.site_code.length} chars`);
    console.log(`📄 [preview-html] Primeiros 200 chars: ${versionData.site_code.substring(0, 200)}`);

    // Processar código gerado pela IA
    let processedCode = processAIGeneratedCode(versionData.site_code);
    console.log(`⚙️ [preview-html] Código processado: ${processedCode.length} chars`);

    // Converter JSX para HTML renderizável
    let fullHtml = convertJSXToHTML(processedCode, {
      removeComplexExpressions: true,
      convertClassName: true,
      preserveInlineStyles: true,
      addTailwind: true,
    });

    console.log(`✅ [preview-html] HTML gerado: ${fullHtml.length} chars`);

    // 🔒 Aplicar proteções de segurança
    fullHtml = sanitizeCodeForPreview(fullHtml);
    fullHtml = injectSecurityProtections(fullHtml, siteId);

    console.log(`🔒 [preview-html] Proteções de segurança aplicadas`);

    return NextResponse.json({
      html: fullHtml,
      siteId: siteId,
    }, {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error("Erro ao gerar preview HTML:", error);
    return NextResponse.json(
      { error: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}

