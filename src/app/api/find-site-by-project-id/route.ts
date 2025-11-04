import { NextRequest, NextResponse } from 'next/server';
import { findConversationByProjectId } from '@/lib/project-limits';
import { DatabaseService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API para buscar um site pelo ID do projeto
 * GET /api/find-site-by-project-id?projectId=812156
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');
    
    if (!projectIdParam) {
      return NextResponse.json(
        { error: 'projectId é obrigatório' },
        { status: 400 }
      );
    }
    
    const projectId = parseInt(projectIdParam, 10);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'projectId deve ser um número válido' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 [find-site-by-project-id] Buscando site para projectId: ${projectId}`);
    
    // Buscar conversationId a partir do projectId
    const conversationId = await findConversationByProjectId(projectId);
    
    if (!conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Site não encontrado para este ID de projeto',
          projectId
        },
        { status: 404 }
      );
    }
    
    // Buscar dados completos do projeto
    const conversation = await DatabaseService.getConversation(conversationId);
    const projectData = await DatabaseService.getProjectData(conversationId);
    const siteVersions = await DatabaseService.getSiteVersions(conversationId);
    const latestVersion = siteVersions.length > 0 ? siteVersions[0] : null;
    
    if (!latestVersion) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Site encontrado mas sem versões disponíveis',
          projectId,
          conversationId
        },
        { status: 404 }
      );
    }
    
    // Retornar informações do site
    return NextResponse.json({
      success: true,
      projectId,
      conversationId,
      conversation: {
        id: conversation?.id,
        initial_prompt: conversation?.initial_prompt,
        project_type: conversation?.project_type,
        created_at: conversation?.created_at,
        status: conversation?.status
      },
      projectData: {
        company_name: projectData?.company_name,
        business_type: projectData?.business_type,
        business_objective: projectData?.business_objective,
        design_style: projectData?.design_style,
        design_colors: projectData?.design_colors
      },
      siteVersion: {
        id: latestVersion.id,
        version_number: latestVersion.version_number,
        created_at: latestVersion.created_at,
        modification_description: latestVersion.modification_description,
        preview_url: `/preview/${conversationId}`,
        chat_url: `/chat/${conversationId}`
      },
      totalVersions: siteVersions.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar site por projectId:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar site',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

