import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔍 Endpoint de diagnóstico detalhado para variáveis de ambiente
 * 
 * Este endpoint mostra:
 * - Quais variáveis estão disponíveis no servidor
 * - Valores (parcialmente mascarados para segurança)
 * - Informações sobre quando foram definidas
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Obter todas as variáveis de ambiente relacionadas ao Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Verificar se estão definidas e seus tamanhos
    const urlDefined = !!supabaseUrl;
    const urlLength = supabaseUrl?.length || 0;
    const urlPrefix = supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NÃO DEFINIDA';
    
    const anonKeyDefined = !!supabaseAnonKey;
    const anonKeyLength = supabaseAnonKey?.length || 0;
    const anonKeyPrefix = supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NÃO DEFINIDA';
    
    const serviceKeyDefined = !!supabaseServiceKey;
    const serviceKeyLength = supabaseServiceKey?.length || 0;
    
    // Verificar outras variáveis importantes
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const anthropicDefined = !!anthropicKey;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      diagnostics: {
        supabase: {
          url: {
            defined: urlDefined,
            length: urlLength,
            prefix: urlPrefix,
            fullValue: process.env.NODE_ENV === 'development' ? supabaseUrl : urlPrefix
          },
          anonKey: {
            defined: anonKeyDefined,
            length: anonKeyLength,
            prefix: anonKeyPrefix,
            fullValue: process.env.NODE_ENV === 'development' ? supabaseAnonKey : anonKeyPrefix
          },
          serviceRoleKey: {
            defined: serviceKeyDefined,
            length: serviceKeyLength,
            // Nunca mostrar service role key, mesmo em dev
            prefix: serviceKeyDefined ? '***DEFINIDA***' : 'NÃO DEFINIDA'
          }
        },
        anthropic: {
          apiKey: {
            defined: anthropicDefined,
            length: anthropicKey?.length || 0
          }
        }
      },
      allEnvKeys: Object.keys(process.env)
        .filter(key => 
          key.includes('SUPABASE') || 
          key.includes('ANTHROPIC') || 
          key.includes('NEXT_PUBLIC')
        )
        .sort(),
      recommendations: {
        missing: [] as string[],
        warnings: [] as string[]
      }
    });
    
  } catch (error: unknown) {
    console.error('❌ Erro no diagnóstico ENV:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao fazer diagnóstico',
      message: error instanceof Error ? error.message : String(error),
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

