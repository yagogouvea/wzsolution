import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

/**
 * API para verificar status de geração em andamento
 * Usado para recuperar geração quando usuário volta ao app (iOS)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar última versão do site
    const siteVersions = await DatabaseService.getSiteVersions(conversationId);
    const latestVersion = siteVersions && siteVersions.length > 0 
      ? siteVersions[siteVersions.length - 1] 
      : null;

    // Buscar conversa
    const conversation = await DatabaseService.getConversation(conversationId);
    
    // Se não tem versão mas tem conversa ativa, pode estar gerando
    const isGenerating = !latestVersion && conversation?.status === 'active';

    // Se tem versão recente (últimos 5 minutos), pode ter acabado de completar
    const recentlyCompleted = latestVersion && 
      (Date.now() - new Date(latestVersion.created_at).getTime()) < 5 * 60 * 1000;

    return NextResponse.json({
      isGenerating,
      hasCompleted: !!latestVersion,
      recentlyCompleted,
      latestVersion: latestVersion ? {
        id: latestVersion.id,
        versionNumber: latestVersion.version_number,
        createdAt: latestVersion.created_at
      } : null,
      conversationStatus: conversation?.status || 'unknown'
    });
  } catch (error) {
    console.error('❌ [generation-status] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}

