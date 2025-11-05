import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando variáveis de ambiente...');
    console.log('📊 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
    console.log('📊 NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `✅ DEFINIDA (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars)` : '❌ NÃO DEFINIDA');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const envStatus = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      HUBSPOT_API_KEY: !!process.env.HUBSPOT_API_KEY,
      HUBSPOT_PORTAL_ID: !!process.env.HUBSPOT_PORTAL_ID,
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    };

    // ⚠️ Diagnóstico detalhado para Supabase
    const diagnostics = {
      supabaseUrl: {
        defined: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        prefix: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NÃO DEFINIDA',
        // Em desenvolvimento, mostrar valor completo para debug
        value: process.env.NODE_ENV === 'development' ? supabaseUrl : undefined
      },
      supabaseAnonKey: {
        defined: !!supabaseAnonKey,
        length: supabaseAnonKey?.length || 0,
        prefix: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NÃO DEFINIDA',
        // Em desenvolvimento, mostrar valor completo para debug
        value: process.env.NODE_ENV === 'development' ? supabaseAnonKey : undefined
      }
    };

    return NextResponse.json({
      success: true,
      message: '✅ Teste de variáveis de ambiente',
      env: envStatus,
      diagnostics,
      // 🔒 SEGURANÇA: Não expor tokens mesmo parcialmente em produção
      hubspotKey: process.env.NODE_ENV === 'development' && process.env.HUBSPOT_API_KEY ? 
        `${process.env.HUBSPOT_API_KEY.substring(0, 8)}...` : 
        'Configurada', // Em produção, apenas indicar presença
      portalId: process.env.HUBSPOT_PORTAL_ID || 'Não encontrado',
      // ⚠️ IMPORTANTE: Aviso sobre variáveis NEXT_PUBLIC_*
      warning: !supabaseUrl || !supabaseAnonKey 
        ? '⚠️ Variáveis NEXT_PUBLIC_SUPABASE_* não estão disponíveis. Estas variáveis precisam estar disponíveis durante o BUILD do Next.js. Verifique se estão configuradas no Railway ANTES do build.'
        : null
    });

  } catch (error: unknown) {
    console.error('❌ Erro no teste ENV:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : String(error),
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
