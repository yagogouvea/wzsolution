import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando conexão Supabase...');

    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'NEXT_PUBLIC_SUPABASE_URL não configurada'
      }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada'
      }, { status: 400 });
    }

    console.log('📊 Variáveis Supabase:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
    });

    // Teste básico: criar conversa simples
    const testConversation = {
      // Não fornecer ID - deixar PostgreSQL gerar automaticamente
      project_type: 'site',
      initial_prompt: 'Teste de conexão Supabase',
      status: 'active' as const
    };

    console.log('💾 Tentando criar conversa teste:', testConversation);

    try {
      const createdConversation = await DatabaseService.createConversation(testConversation);
      console.log('✅ Conversa criada com sucesso:', createdConversation);

      return NextResponse.json({
        success: true,
        message: '✅ Supabase funcionando perfeitamente!',
        data: {
          conversationId: createdConversation.id,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          connection: 'OK'
        }
      });

    } catch (createError: unknown) {
      const errorObj = createError instanceof Error ? createError : new Error(String(createError));
      const errorDetails = createError instanceof Error ? {
        message: errorObj.message,
        code: (createError as { code?: string }).code,
        hint: (createError as { hint?: string }).hint || 'Tabela conversations pode não existir'
      } : {};
      console.error('❌ Erro ao criar conversa:', createError);

      return NextResponse.json({
        success: false,
        error: 'Erro ao criar conversa no Supabase',
        details: errorDetails
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('❌ Erro geral no teste Supabase:', error);

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
