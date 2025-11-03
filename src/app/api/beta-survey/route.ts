import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const surveyData = await request.json();

    // Validar dados básicos
    if (!surveyData.name || !surveyData.age || !surveyData.profession) {
      return NextResponse.json(
        { error: 'Dados básicos são obrigatórios' },
        { status: 400 }
      );
    }

    // Salvar no banco de dados (criar tabela se necessário)
    // Por enquanto, vamos salvar em uma tabela de pesquisas
    try {
      const supabase = DatabaseService.supabase;
      
      // Tentar inserir na tabela beta_surveys (criar se não existir)
      const { data, error } = await supabase
        .from('beta_surveys')
        .insert({
          name: surveyData.name,
          age: parseInt(surveyData.age) || null,
          profession: surveyData.profession,
          heard_about_ai: surveyData.heardAboutAI === 'sim',
          site_created: surveyData.siteCreated === 'sim',
          problems: surveyData.problems || null,
          prompt_matched: surveyData.promptMatched === 'sim' || null,
          prompt_issues: surveyData.promptIssues || null,
          layout_score: surveyData.layoutScore || null,
          aesthetics_score: surveyData.aestheticsScore || null,
          functionality_score: surveyData.functionalityScore || null,
          ease_of_use_score: surveyData.easeOfUseScore || null,
          overall_score: surveyData.overallScore || null,
          creation_time: surveyData.creationTime || null,
          device_used: surveyData.deviceUsed || null,
          would_recommend: surveyData.wouldRecommend || null,
          features_most_valued: surveyData.featuresMostValued || [],
          improvements: surveyData.improvements || null,
          submitted_at: surveyData.submittedAt || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // Se a tabela não existir, criar um log alternativo
        console.error('Erro ao salvar pesquisa:', error);
        
        // Salvar em arquivo de log ou outra estrutura temporária
        // Por enquanto, apenas log
        console.log('📊 Pesquisa Beta:', JSON.stringify(surveyData, null, 2));
        
        // Retornar sucesso mesmo se não conseguir salvar no banco
        // (você pode criar a tabela depois)
        return NextResponse.json({
          success: true,
          message: 'Pesquisa recebida com sucesso!',
          data: surveyData
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Pesquisa salva com sucesso!',
        surveyId: data?.id
      });

    } catch (dbError) {
      console.error('Erro no banco de dados:', dbError);
      
      // Log alternativo
      console.log('📊 Pesquisa Beta (fallback):', JSON.stringify(surveyData, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Pesquisa recebida! (salva em log)',
        note: 'A tabela beta_surveys pode não existir ainda. Dados salvos em log.'
      });
    }

  } catch (error) {
    console.error('Erro ao processar pesquisa:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// GET para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'API de Pesquisa Beta ativa',
    version: '1.0.0'
  });
}

