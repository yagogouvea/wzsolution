import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando variáveis de ambiente...');

    const envStatus = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      HUBSPOT_API_KEY: !!process.env.HUBSPOT_API_KEY,
      HUBSPOT_PORTAL_ID: !!process.env.HUBSPOT_PORTAL_ID,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    };

    return NextResponse.json({
      success: true,
      message: '✅ Teste de variáveis de ambiente',
      env: envStatus,
      // 🔒 SEGURANÇA: Não expor tokens mesmo parcialmente em produção
      hubspotKey: process.env.NODE_ENV === 'development' && process.env.HUBSPOT_API_KEY ? 
        `${process.env.HUBSPOT_API_KEY.substring(0, 8)}...` : 
        'Configurada', // Em produção, apenas indicar presença
      portalId: process.env.HUBSPOT_PORTAL_ID || 'Não encontrado'
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
