import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import { convertJSXToHTML, processAIGeneratedCode } from '@/lib/jsx-to-html';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId') || 'cff1c752-dda2-4859-aa4e-34ade1b8b4e7';

    console.log('🔍 [get-site-html] Buscando HTML completo para conversationId:', conversationId);
    
    // Usar a mesma lógica do site-preview
    let latestVersion: any | null = null;
    
    const { data: byConvData, error: byConvError } = await DatabaseService.supabase
      .from('site_versions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!byConvError && byConvData) {
      latestVersion = byConvData;
    } else {
      const { data: byIdData } = await DatabaseService.supabase
        .from('site_versions')
        .select('*')
        .eq('id', conversationId)
        .limit(1)
        .maybeSingle();
      if (byIdData) latestVersion = byIdData;
    }

    if (!latestVersion || !latestVersion.site_code) {
      return NextResponse.json(
        { error: 'Site não encontrado', conversationId },
        { status: 404 }
      );
    }

    let siteCode = typeof latestVersion.site_code === 'string' 
      ? latestVersion.site_code 
      : String(latestVersion.site_code ?? '');

    // Converter JSX para HTML se necessário (igual ao preview)
    const isJSX = siteCode.includes('import React') || 
                  siteCode.includes('export default') || 
                  siteCode.includes('from "react"') ||
                  siteCode.includes("from 'react'") ||
                  siteCode.includes('className=') ||
                  (siteCode.includes('const ') && siteCode.includes('=> {'));
    
    if (isJSX) {
      console.log('🔄 [get-site-html] Detectado JSX, convertendo para HTML...');
      try {
        siteCode = processAIGeneratedCode(siteCode);
        siteCode = convertJSXToHTML(siteCode, {
          removeComplexExpressions: true,
          convertClassName: true,
          preserveInlineStyles: true,
          addTailwind: true
        });
      } catch (conversionError) {
        console.error('❌ [get-site-html] Erro ao converter JSX:', conversionError);
      }
    }

    // ✅ LIMPEZA CRÍTICA: Remover TODAS as referências a localhost:3001 ANTES de retornar
    // Isso garante que nenhuma referência escape, mesmo que venha do código gerado pela IA
    console.log('🔒 [get-site-html] Aplicando limpeza de localhost:3001...');
    
    // 1. Remover scripts inteiros que contenham localhost:3001
    siteCode = siteCode.replace(/<script[^>]*>[\s\S]*?localhost:3001[\s\S]*?<\/script>/gi, '<!-- Script com localhost:3001 removido -->');
    
    // 1.5. Remover IIFE que contenham localhost:3001
    siteCode = siteCode.replace(/<script[^>]*>[\s\S]*?\(function\s*\([^)]*\)\s*\{[\s\S]*?localhost:3001[\s\S]*?\}\)\s*\(\)[\s\S]*?<\/script>/gi, '<!-- IIFE com localhost:3001 removido -->');
    
    // 2. Remover href/src/action com localhost:3001
    siteCode = siteCode.replace(/(href|src|action)=["'][^"']*localhost:3001[^"']*["']/gi, '$1="#"');
    
    // 3. Remover window.location/window.open com localhost:3001 (todas as variações)
    siteCode = siteCode.replace(/window\.location\s*[=\.]\s*["']?[^"';)]*localhost:3001[^"';)]*["']?/gi, 'void(0);');
    siteCode = siteCode.replace(/window\.open\s*\([^)]*localhost:3001[^)]*\)/gi, 'void(0);');
    siteCode = siteCode.replace(/location\.href\s*=\s*["']?[^"';)]*localhost:3001[^"';)]*["']?/gi, 'void(0);');
    siteCode = siteCode.replace(/location\.replace\s*\([^)]*localhost:3001[^)]*\)/gi, 'void(0);');
    siteCode = siteCode.replace(/location\.assign\s*\([^)]*localhost:3001[^)]*\)/gi, 'void(0);');
    siteCode = siteCode.replace(/window\.top\.location\s*[=\.]\s*["']?[^"';)]*localhost:3001[^"';)]*["']?/gi, 'void(0);');
    siteCode = siteCode.replace(/top\.location\s*[=\.]\s*["']?[^"';)]*localhost:3001[^"';)]*["']?/gi, 'void(0);');
    
    // 4. Remover TODAS as meta refresh (podem causar redirecionamentos)
    siteCode = siteCode.replace(/<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi, '');
    
    // 5. Remover scripts com setTimeout/setInterval que redirecionam
    siteCode = siteCode.replace(/<script[^>]*>[\s\S]*?(?:setTimeout|setInterval)\s*\([^)]*localhost:3001[^)]*\)[\s\S]*?<\/script>/gi, '<!-- Script de redirecionamento removido -->');
    
    // 6. Substituir qualquer ocorrência restante de localhost:3001
    siteCode = siteCode.replace(/https?:\/\/localhost:3001[^\s"'<>]*/gi, '#');
    siteCode = siteCode.replace(/localhost:3001[^\s"'<>]*/gi, '#');
    
    // 7. Remover atributos onclick com localhost:3001
    siteCode = siteCode.replace(/onclick=["'][^"']*localhost:3001[^"']*["']/gi, 'onclick="return false;"');
    
    console.log('✅ [get-site-html] Limpeza de localhost:3001 concluída');

    // Retornar HTML completo (com <html>, <head>, <body>)
    return NextResponse.json({
      success: true,
      html: siteCode,
      length: siteCode.length,
      version: latestVersion.version_number,
    });
  } catch (error) {
    console.error('❌ [get-site-html] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

