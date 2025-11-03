import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/openai';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 DEBUG: Iniciando teste de chat...');
    
    const { conversationId, message, stage = 1 } = await request.json();
    
    console.log('🧪 DEBUG: Dados recebidos:', { conversationId, message, stage });

    if (!conversationId || !message) {
      console.log('❌ DEBUG: Dados obrigatórios ausentes');
      return NextResponse.json(
        { error: 'Conversa ID e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🧪 DEBUG: 1. Verificando/criando conversa...');
    
    // TESTE 1: Verificar se a conversa existe ou criar automaticamente
    let conversation;
    try {
      conversation = await DatabaseService.getConversation(conversationId);
      
      if (!conversation) {
        console.log('🧪 DEBUG: 1.1 Criando nova conversa...');
        conversation = await DatabaseService.createConversation({
          id: conversationId,
          project_type: 'site',
          initial_prompt: message,
          status: 'active'
        });
        console.log('✅ DEBUG: 1.2 Conversa criada:', conversation.id);
      } else {
        console.log('✅ DEBUG: 1.3 Conversa já existe:', conversation.id);
      }
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error('❌ DEBUG: Erro no banco de dados:', dbError);
      return NextResponse.json({
        error: 'Erro no banco de dados',
        details: errorMessage,
        step: 'database_creation'
      }, { status: 500 });
    }

    console.log('🧪 DEBUG: 2. Salvando mensagem do usuário...');
    
    // TESTE 2: Salvar mensagem do usuário
    try {
      await DatabaseService.addMessage({
        conversation_id: conversationId,
        sender_type: 'user',
        content: message,
        message_type: 'text',
      });
      console.log('✅ DEBUG: 2.1 Mensagem do usuário salva');
    } catch (messageError: unknown) {
      const errorMessage = messageError instanceof Error ? messageError.message : String(messageError);
      console.error('❌ DEBUG: Erro ao salvar mensagem:', messageError);
      return NextResponse.json({
        error: 'Erro ao salvar mensagem',
        details: errorMessage,
        step: 'save_user_message'
      }, { status: 500 });
    }

    console.log('🧪 DEBUG: 3. Buscando histórico...');
    
    // TESTE 3: Buscar histórico de mensagens
    let conversationHistory: Array<{ sender_type: string; content: string }> = [];
    try {
      conversationHistory = await DatabaseService.getMessages(conversationId);
      console.log('✅ DEBUG: 3.1 Histórico obtido, mensagens:', conversationHistory.length);
    } catch (historyError: unknown) {
      console.error('❌ DEBUG: Erro ao buscar histórico:', historyError);
      conversationHistory = []; // Fallback
    }

    console.log('🧪 DEBUG: 4. Buscando dados do projeto...');
    
    // TESTE 4: Buscar dados do projeto
    let projectData;
    try {
      projectData = await DatabaseService.getProjectData(conversationId);
      console.log('✅ DEBUG: 4.1 Dados do projeto obtidos');
    } catch (projectError: unknown) {
      console.error('⚠️ DEBUG: Erro ao buscar projeto (não crítico):', projectError);
      projectData = {}; // Fallback
    }

    console.log('🧪 DEBUG: 5. Chamando OpenAI...');
    
    // TESTE 5: Gerar resposta da IA
    let aiResponse;
    try {
      aiResponse = await generateAIResponse(
        conversationId,
        message,
        stage,
        conversationHistory,
        (projectData || {}) as Record<string, unknown>
      );
      console.log('✅ DEBUG: 5.1 Resposta da IA obtida');
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
      console.error('❌ DEBUG: Erro na IA:', aiError);
      return NextResponse.json({
        error: 'Erro na geração de resposta da IA',
        details: errorMessage,
        step: 'ai_generation'
      }, { status: 500 });
    }

    console.log('🧪 DEBUG: 6. Salvando resposta da IA...');
    
    // TESTE 6: Salvar resposta da IA
    try {
      await DatabaseService.addMessage({
        conversation_id: conversationId,
        sender_type: 'ai',
        content: aiResponse.response,
        message_type: 'text',
        metadata: {
          stage: aiResponse.nextStage,
          shouldGenerateImages: aiResponse.shouldGenerateImages
        }
      });
      console.log('✅ DEBUG: 6.1 Resposta da IA salva');
    } catch (saveError: unknown) {
      const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      console.error('❌ DEBUG: Erro ao salvar resposta da IA:', saveError);
      return NextResponse.json({
        error: 'Erro ao salvar resposta da IA',
        details: errorMessage,
        step: 'save_ai_response'
      }, { status: 500 });
    }

    console.log('🎉 DEBUG: Teste completo finalizado com sucesso!');

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      nextStage: aiResponse.nextStage,
      shouldGenerateImages: aiResponse.shouldGenerateImages,
      extractedData: aiResponse.extractedData,
      conversationId,
      debug_info: {
        conversation_exists: !!conversation,
        history_length: conversationHistory?.length || 0,
        project_data_exists: !!projectData,
        ai_response_length: aiResponse.response.length
      }
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ DEBUG: Erro geral capturado:', errorObj);
    return NextResponse.json({
      error: 'Erro interno do servidor (debug)',
      message: errorObj.message,
      stack: errorObj.stack,
      step: 'general_error'
    }, { status: 500 });
  }
}
