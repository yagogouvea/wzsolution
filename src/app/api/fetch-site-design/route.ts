import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId') || 'cff1c752-dda2-4859-aa4e-34ade1b8b4e7';

    console.log('🔍 [fetch-site-design] Buscando site para conversationId:', conversationId);
    
    // Usar a mesma lógica do site-preview que funciona
    let latestVersion: any | null = null;
    
    // Tentativa 1: Buscar última versão por conversationId
    const { data: byConvData, error: byConvError } = await DatabaseService.supabase
      .from('site_versions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!byConvError && byConvData) {
      latestVersion = byConvData;
      console.log('✅ [fetch-site-design] Versão encontrada por conversationId');
    } else {
      // Tentativa 2: Buscar por ID exato (caso seja um ID de versão)
      const { data: byIdData, error: byIdError } = await DatabaseService.supabase
        .from('site_versions')
        .select('*')
        .eq('id', conversationId)
        .limit(1)
        .maybeSingle();

      if (!byIdError && byIdData) {
        latestVersion = byIdData;
        console.log('✅ [fetch-site-design] Versão encontrada por ID');
      } else {
        // Tentativa 3: Buscar por site_code_id
        const { data: byCodeIdData, error: byCodeIdError } = await DatabaseService.supabase
          .from('site_versions')
          .select('*')
          .eq('site_code_id', conversationId)
          .limit(1)
          .maybeSingle();

        if (!byCodeIdError && byCodeIdData) {
          latestVersion = byCodeIdData;
          console.log('✅ [fetch-site-design] Versão encontrada por site_code_id');
        } else {
          console.error('❌ [fetch-site-design] Erros:', {
            byConv: byConvError?.message,
            byId: byIdError?.message,
            byCodeId: byCodeIdError?.message
          });
        }
      }
    }

    if (!latestVersion || !latestVersion.site_code) {
      console.log('⚠️ [fetch-site-design] Site não encontrado para conversationId:', conversationId);
      
      // Debug: listar algumas versões para ajudar
      const { data: allVersions } = await DatabaseService.supabase
        .from('site_versions')
        .select('conversation_id, version_number, id')
        .limit(5);
      
      console.log('📋 [fetch-site-design] Últimas 5 versões no banco:', allVersions);
      
      return NextResponse.json(
        { 
          error: 'Site não encontrado', 
          conversationId,
          debug: {
            totalVersions: allVersions?.length || 0,
            sampleVersions: allVersions?.slice(0, 3) || []
          }
        },
        { status: 404 }
      );
    }

    let siteCode = typeof latestVersion.site_code === 'string' 
      ? latestVersion.site_code 
      : String(latestVersion.site_code ?? '');

    console.log('✅ [fetch-site-design] Site encontrado:', {
      id: latestVersion.id,
      version: latestVersion.version_number,
      conversationId: latestVersion.conversation_id,
      tamanho: siteCode.length
    });

    return NextResponse.json({
      success: true,
      html: siteCode,
      length: siteCode.length,
      version: latestVersion.version_number,
      id: latestVersion.id,
    });
  } catch (error) {
    console.error('❌ [fetch-site-design] Erro ao buscar site:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
