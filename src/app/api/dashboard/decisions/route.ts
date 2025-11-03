import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

/**
 * API para buscar decisões do AI Decision Engine para o dashboard
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Buscando decisões para dashboard...');

    // Usar a view do Supabase ou query direta
    const { data, error } = await DatabaseService.supabase
      .from('project_data')
      .select(`
        conversation_id,
        business_sector,
        business_objective,
        target_audience,
        design_style,
        functionalities,
        profile_context,
        created_at,
        updated_at,
        conversations:conversation_id (
          initial_prompt
        )
      `)
      .not('profile_context', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(100); // Limitar para performance

    if (error) {
      console.error('❌ Erro ao buscar decisões:', error);
      throw error;
    }

    // Formatar dados para o dashboard
    const decisions = (data || []).map((row: Record<string, unknown>) => {
      const profile = typeof row.profile_context === 'string' 
        ? JSON.parse(row.profile_context) 
        : row.profile_context;

      // Helper para acessar conversations de forma segura
      const conversations = row.conversations;
      const conversationsArray = Array.isArray(conversations) ? conversations : [];
      const firstConversation = conversationsArray.length > 0 ? conversationsArray[0] : null;
      const initialPrompt = firstConversation && typeof firstConversation === 'object' && firstConversation !== null
        ? (firstConversation as Record<string, unknown>).initial_prompt
        : undefined;

      return {
        conversation_id: row.conversation_id,
        initial_prompt: (typeof initialPrompt === 'string' ? initialPrompt : '') || '',
        business_sector: (row.business_sector as string | undefined) || '',
        theme: (row.design_style as string | undefined) || (profile as Record<string, unknown>)?.colorStyle as string | undefined || '',
        objective: (row.business_objective as string | undefined) || (profile as Record<string, unknown>)?.stack as string | undefined || '',
        target_audience: (row.target_audience as string | undefined) || '',
        functionalities: (row.functionalities as string[] | undefined) || [],
        selected_stack: (profile as Record<string, unknown>)?.stack as string | undefined || '',
        tone_of_voice: (profile as Record<string, unknown>)?.tone as string | undefined || '',
        color_style: (profile as Record<string, unknown>)?.colorStyle as string | undefined || '',
        layout_sections: (profile as Record<string, unknown>)?.layout as string[] | undefined || [],
        required_components: (profile as Record<string, unknown>)?.components as string[] | undefined || [],
        logo_color_dominant: ((profile as Record<string, unknown>)?.logoInfo as Record<string, unknown> | undefined)?.dominant as string | undefined || '',
        logo_color_accent: ((profile as Record<string, unknown>)?.logoInfo as Record<string, unknown> | undefined)?.accent as string | undefined || '',
        profile_created_at: row.created_at,
        profile_updated_at: row.updated_at
      };
    });

    console.log(`✅ ${decisions.length} decisões encontradas`);

    return NextResponse.json({
      success: true,
      decisions,
      count: decisions.length
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Erro ao buscar decisões:', errorObj);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar decisões',
        message: errorObj.message,
        decisions: []
      },
      { status: 500 }
    );
  }
}

