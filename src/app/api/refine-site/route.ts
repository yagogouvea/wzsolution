import { NextRequest, NextResponse } from "next/server";
import { analyzeAndRefineSite, getRefinementHistory } from "@/lib/ai-refinement-engine";
import { supabase } from "@/lib/supabase";

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { siteId, action } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId é obrigatório" },
        { status: 400 }
      );
    }

    // Ação: buscar histórico
    if (action === 'history') {
      console.log('📜 [Refine API] Buscando histórico de refinamentos...');
      const history = await getRefinementHistory(siteId);
      return NextResponse.json({ success: true, history });
    }

    // Ação padrão: analisar e refinar
    console.log('🎨 [Refine API] Iniciando refinamento...');

    // Buscar código atual
    const { data: siteData, error: fetchError } = await supabase
      .from("site_versions")
      .select("site_code, conversation_id")
      .eq("id", siteId)
      .single();

    if (fetchError || !siteData) {
      return NextResponse.json(
        { error: "Site não encontrado" },
        { status: 404 }
      );
    }

    console.log('✅ [Refine API] Site encontrado, iniciando análise...');

    // Analisar e refinar
    const result = await analyzeAndRefineSite(siteData.site_code, siteId);

    console.log(`✅ [Refine API] Refinamento completo - Score: ${result.score}/100`);

    // Buscar conversation_id para retornar no response
    const conversationId = siteData.conversation_id;

    return NextResponse.json({
      success: true,
      score: result.score,
      issues: result.issues,
      suggestions: result.suggestions,
      refinedCode: result.refinedCode,
      siteId,
      conversationId
    });

  } catch (error) {
    console.error('❌ [Refine API] Erro ao processar requisição:', error);
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Buscar histórico de refinamentos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId é obrigatório" },
        { status: 400 }
      );
    }

    console.log('📜 [Refine API] Buscando histórico...');
    const history = await getRefinementHistory(siteId);

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('❌ [Refine API] Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

