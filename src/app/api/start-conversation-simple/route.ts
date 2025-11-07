/**
 * 🧪 API SIMPLIFICADA DE TESTE - start-conversation
 * 
 * Versão mínima para testar se o problema está nas dependências
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [start-conversation-simple] Iniciando...');
    
    const body = await request.json();
    console.log('📝 [start-conversation-simple] Body recebido:', Object.keys(body));
    
    const { 
      initialPrompt, 
      projectType = 'site',
      clientEmail,
      clientName
    } = body;

    if (!initialPrompt) {
      return NextResponse.json(
        { error: 'Prompt inicial é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📝 [start-conversation-simple] Criando conversa...');
    
    // Criar nova conversa (sem IA, sem project_data)
    const conversation = await DatabaseService.createConversation({
      initial_prompt: initialPrompt,
      project_type: projectType,
      client_email: clientEmail,
      client_name: clientName,
      status: 'active'
    });

    console.log('✅ [start-conversation-simple] Conversa criada:', conversation.id);

    // Salvar prompt inicial do usuário
    try {
      await DatabaseService.addMessage({
        conversation_id: conversation.id,
        sender_type: 'user',
        content: `Quero criar: ${initialPrompt}`,
        message_type: 'text',
      });
      console.log('✅ [start-conversation-simple] Mensagem salva');
    } catch (msgError) {
      console.warn('⚠️ [start-conversation-simple] Erro ao salvar mensagem:', msgError);
      // Continuar mesmo se falhar
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      initialResponse: 'Olá! Vamos criar seu site. Me conte mais sobre seu projeto.',
      stage: 1,
      mode: 'simple'
    });

  } catch (error) {
    console.error('❌ [start-conversation-simple] Erro:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}






