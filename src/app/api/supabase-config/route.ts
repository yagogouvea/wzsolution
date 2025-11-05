import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔧 Endpoint para fornecer configurações do Supabase ao cliente
 * 
 * Isso é necessário porque variáveis NEXT_PUBLIC_* precisam estar disponíveis
 * durante o BUILD. Se não estiverem, este endpoint pode fornecer os valores
 * em runtime.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ✅ Retornar apenas se ambas estiverem configuradas
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão configuradas no servidor',
        available: {
          url: !!supabaseUrl,
          key: !!supabaseAnonKey
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erro ao obter configuração Supabase:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao obter configuração',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

