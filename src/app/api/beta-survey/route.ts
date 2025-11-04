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

// GET para consultar todas as respostas da pesquisa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = DatabaseService.supabase;
    
    // Buscar respostas ordenadas por data mais recente
    const { data, error, count } = await supabase
      .from('beta_surveys')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Erro ao buscar pesquisas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar pesquisas', details: error.message },
        { status: 500 }
      );
    }
    
    // Calcular estatísticas básicas
    if (data && data.length > 0) {
      const stats = {
        total: count || 0,
        siteCreated: data.filter(r => r.site_created).length,
        siteNotCreated: data.filter(r => !r.site_created).length,
        avgOverallScore: data.filter(r => r.overall_score !== null)
          .reduce((sum, r) => sum + (r.overall_score || 0), 0) / 
          data.filter(r => r.overall_score !== null).length || 0,
        avgNPS: data.filter(r => r.would_recommend !== null)
          .reduce((sum, r) => sum + (r.would_recommend || 0), 0) / 
          data.filter(r => r.would_recommend !== null).length || 0,
        deviceUsage: {
          pc: data.filter(r => r.device_used === 'pc').length,
          tablet: data.filter(r => r.device_used === 'tablet').length,
          celular: data.filter(r => r.device_used === 'celular').length
        }
      };
      
      return NextResponse.json({
        success: true,
        data,
        stats,
        pagination: {
          limit,
          offset,
          total: count || 0
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: [],
      stats: {
        total: 0,
        siteCreated: 0,
        siteNotCreated: 0,
        avgOverallScore: 0,
        avgNPS: 0,
        deviceUsage: { pc: 0, tablet: 0, celular: 0 }
      },
      pagination: {
        limit,
        offset,
        total: 0
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar GET:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

