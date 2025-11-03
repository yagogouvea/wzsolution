import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando limites da conta OpenAI...');

    // Fazer uma request simples para ver os headers de limite
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Hello! Just testing limits.'
        }
      ],
      max_tokens: 50
    });

    // Os headers não são acessíveis diretamente na response, mas podemos ver no log
    console.log('✅ Request bem-sucedida para verificação de limites');

    return NextResponse.json({
      success: true,
      message: '✅ Conta OpenAI funcionando!',
      model_used: 'gpt-3.5-turbo',
      response: completion.choices[0]?.message?.content,
      usage: completion.usage,
      instructions: {
        step1: 'Verifique os headers no terminal/console',
        step2: 'Procure por x-ratelimit-limit-requests',
        step3: 'Procure por x-ratelimit-remaining-requests',
        step4: 'Isso mostrará seus limites reais'
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erro ao verificar limites OpenAI:', error);
    const statusCode = (error as { status?: number }).status;
    
    if (statusCode === 429) {
      return NextResponse.json({
        success: false,
        error: 'Rate Limit Ativo',
        message: 'Sua conta tem limites muito baixos para requests por minuto',
        suggestions: {
          option1: 'Aguarde 1-2 minutos e tente novamente',
          option2: 'Adicione payment method na conta OpenAI',
          option3: 'Use gpt-3.5-turbo em vez de gpt-4',
          billing_url: 'https://platform.openai.com/account/billing'
        },
        error_details: {
          status: statusCode,
          code: (error as { code?: string }).code,
          type: (error as { type?: string }).type
        }
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erro na verificação de limites',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
