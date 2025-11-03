import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API para buscar conteúdo do Builder.io do banco de dados
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await params;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar versão mais recente do site no banco
    const { data: siteVersions, error } = await DatabaseService.supabase
      .from('site_versions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (error || !siteVersions || siteVersions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo não encontrado' },
        { status: 404 }
      );
    }

    const latestVersion = siteVersions[0];
    
    // Tentar parsear como JSON (se for Builder.io)
    let content;
    try {
      content = typeof latestVersion.site_code === 'string' 
        ? JSON.parse(latestVersion.site_code)
        : latestVersion.site_code;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Conteúdo inválido (não é JSON do Builder.io)' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content,
      model,
      version: latestVersion.version_number
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Erro ao buscar conteúdo do Builder.io:', errorObj);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar conteúdo',
        message: errorObj.message
      },
      { status: 500 }
    );
  }
}



