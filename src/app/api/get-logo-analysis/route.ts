import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

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

    const projectData = await DatabaseService.getProjectData(conversationId);

    if (!projectData) {
      return NextResponse.json(
        { error: 'Dados do projeto não encontrados' },
        { status: 404 }
      );
    }

    // Parsear logo_analysis se for string
    let logoAnalysis = null;
    if (projectData.logo_analysis) {
      try {
        logoAnalysis = typeof projectData.logo_analysis === 'string'
          ? JSON.parse(projectData.logo_analysis)
          : projectData.logo_analysis;
      } catch (e) {
        console.warn('Erro ao parsear logo_analysis:', e);
      }
    }

    return NextResponse.json({
      success: true,
      logoAnalysis: logoAnalysis,
      logoUrl: projectData.logo_url || null,
    });
  } catch (error: any) {
    console.error('Erro ao buscar análise do logo:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        success: false 
      },
      { status: 500 }
    );
  }
}



