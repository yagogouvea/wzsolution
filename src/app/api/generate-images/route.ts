import { NextRequest, NextResponse } from 'next/server';
import { composeContextImages } from '@/lib/ai-image-composer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.siteId || !body.companyName || !body.businessSector) {
      return NextResponse.json(
        { error: 'siteId, companyName e businessSector são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🎨 [Generate Images API] Starting image generation...');

    // Gerar imagens contextuais
    const assets = await composeContextImages({
      siteId: body.siteId,
      companyName: body.companyName,
      businessSector: body.businessSector,
      designStyle: body.designStyle || 'moderno',
      targetAudience: body.targetAudience,
      pagesNeeded: body.pagesNeeded || ['home', 'sobre', 'servicos', 'contato'],
      tone: body.tone || 'moderno e confiante',
      preferredColors: body.preferredColors || ['#1e3a8a']
    });

    console.log(`✅ [Generate Images API] Generated ${assets.length} images`);

    return NextResponse.json({
      ok: true,
      assets,
      count: assets.length
    });

  } catch (error) {
    console.error('❌ [Generate Images API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Erro ao gerar imagens',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// GET para buscar imagens existentes de uma versão de site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar media_map do site
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('site_versions')
      .select('media_map')
      .eq('id', siteId)
      .single();

    if (error || !data) {
      return NextResponse.json({
        ok: true,
        assets: []
      });
    }

    return NextResponse.json({
      ok: true,
      assets: Object.entries(data.media_map || {}).map(([slot, url]) => ({
        slot,
        publicUrl: url
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
