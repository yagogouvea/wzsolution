import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import { convertJSXToHTML, processAIGeneratedCode } from '@/lib/jsx-to-html';
import { 
  addWatermark, 
  sanitizePreviewCode, 
  getSecurityHeaders,
  isProduction 
} from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    if (!siteId || (!siteId.startsWith('site_') && !siteId.startsWith('builder_'))) {
      return new NextResponse('Site ID inválido', { status: 400 });
    }

    const parts = siteId.split('_');
    const conversationId = parts.length >= 2 ? parts[1] : null;
    if (!conversationId) return new NextResponse('Conversa não encontrada', { status: 404 });

    // Buscar versão pelo ID exato
    let latestVersion: any | null = null;
    const byId = await DatabaseService.supabase
      .from('site_versions')
      .select('*')
      .eq('site_code_id', siteId)
      .limit(1);
    if (!byId.error && byId.data && byId.data.length > 0) latestVersion = byId.data[0];

    // Fallback: última versão por conversa
    if (!latestVersion) {
      const byConv = await DatabaseService.supabase
        .from('site_versions')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('version_number', { ascending: false })
        .limit(1);
      if (!byConv.error && byConv.data && byConv.data.length > 0) latestVersion = byConv.data[0];
    }

    if (!latestVersion) return new NextResponse('Site não encontrado', { status: 404 });

    let siteCode = latestVersion.site_code;
    if (typeof siteCode !== 'string') siteCode = String(siteCode ?? '');

    // ✅ DETECTAR SE É JSX/REACT E CONVERTER PARA HTML
    const isJSX = siteCode.includes('import React') || 
                  siteCode.includes('export default') || 
                  siteCode.includes('from "react"') ||
                  siteCode.includes("from 'react'") ||
                  siteCode.includes('className=') ||
                  siteCode.includes('const ') && siteCode.includes('=> {');
    
    if (isJSX) {
      console.log('🔄 [site-preview] Detectado JSX/React, convertendo para HTML...');
      try {
        // Processar código gerado pela IA primeiro
        siteCode = processAIGeneratedCode(siteCode);
        
        // Converter JSX para HTML
        siteCode = convertJSXToHTML(siteCode, {
          removeComplexExpressions: true,
          convertClassName: true,
          preserveInlineStyles: true,
          addTailwind: true
        });
        console.log('✅ [site-preview] JSX convertido para HTML com sucesso!');
      } catch (conversionError) {
        console.error('❌ [site-preview] Erro ao converter JSX:', conversionError);
        // Continuar com código original se conversão falhar
      }
    }

    // Sanitização: substituir WZ Solution por company_name/business_type
    const { data: proj } = await DatabaseService.supabase
      .from('project_data')
      .select('company_name, business_type, logo_url')
      .eq('conversation_id', conversationId)
      .single();
    const companyTitle = (proj?.company_name as string) || (proj?.business_type as string) || 'Site do Cliente';
    const logoUrl = (proj?.logo_url as string) || '';

    siteCode = siteCode
      .replace(/WZ\s*Solutions?/gi, companyTitle)
      .replace(/wz\s*solutions?/gi, companyTitle);

    const wzLogoRegex = /(images|img)\/wzlogo[^"')]+/gi;
    try {
      if (logoUrl) siteCode = siteCode.replace(wzLogoRegex, logoUrl);
      siteCode = siteCode.replace(/<title>\s*[^<]*\s*<\/title>/i, `<title>${companyTitle}<\/title>`);
    } catch {}
    
    // ✅ SEGURANÇA: Adicionar watermark e sanitizar preview
    if (isProduction) {
      siteCode = addWatermark(siteCode, {
        text: 'PREVIEW • WZ SOLUTION • CÓDIGO PROTEGIDO',
        opacity: 0.15,
        position: 'fixed'
      });
      siteCode = sanitizePreviewCode(siteCode);
    }

    return new NextResponse(siteCode, {
      headers: {
        ...getSecurityHeaders(),
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow' // Prevenir indexação do preview
      }
    });
  } catch (error) {
    console.error('❌ [site-preview] Erro:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
