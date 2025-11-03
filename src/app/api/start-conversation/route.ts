import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Importação opcional da IA - se falhar, continuamos sem ela
let generateAIResponse: any = null;
try {
  const openaiModule = require('@/lib/openai');
  generateAIResponse = openaiModule.generateAIResponse;
} catch (importError) {
  console.warn('⚠️ OpenAI module não disponível, continuando sem IA:', importError);
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [start-conversation] Iniciando...');
    
    let body;
    try {
      body = await request.json();
      console.log('📝 [start-conversation] Body parseado:', Object.keys(body));
    } catch (parseError) {
      console.error('❌ [start-conversation] Erro ao parsear JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON inválido no body' },
        { status: 400 }
      );
    }
    
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

    // Criar nova conversa
    const conversation = await DatabaseService.createConversation({
      initial_prompt: initialPrompt,
      project_type: projectType,
      client_email: clientEmail,
      client_name: clientName,
      status: 'active'
    });

    // Salvar prompt inicial do usuário
    await DatabaseService.addMessage({
      conversation_id: conversation.id,
      sender_type: 'user',
      content: `Quero criar: ${initialPrompt}`,
      message_type: 'text',
    });

    // Criar dados iniciais do projeto (opcional, pode falhar se não existir)
    try {
      await DatabaseService.updateProjectData(conversation.id, {
        conversation_id: conversation.id
      });
    } catch (projectDataError) {
      console.warn('⚠️ Erro ao criar project_data (não crítico):', projectDataError);
      // Continuar mesmo se falhar - projeto pode não ter dados ainda
    }

    // Gerar primeira resposta da IA (pode falhar se OpenAI não estiver configurada)
    let aiResponse;
    let initialResponse = 'Olá! Vamos criar seu site. Me conte mais sobre seu projeto.';
    
    try {
      aiResponse = await generateAIResponse(
        conversation.id,
        initialPrompt,
        1, // Primeiro estágio
        [], // Sem histórico ainda
        {} // Sem dados do projeto ainda
      );
      
      if (aiResponse?.response) {
        initialResponse = aiResponse.response;
        
        // Salvar primeira resposta da IA
        await DatabaseService.addMessage({
          conversation_id: conversation.id,
          sender_type: 'ai',
          content: aiResponse.response,
          message_type: 'text',
          metadata: {
            stage: 1,
            isWelcomeMessage: true
          }
        });
      }
    } catch (aiError) {
      console.warn('⚠️ Erro ao gerar resposta da IA (não crítico):', aiError);
      // Continuar sem resposta da IA - conversa foi criada com sucesso
      
      // Salvar mensagem padrão
      await DatabaseService.addMessage({
        conversation_id: conversation.id,
        sender_type: 'ai',
        content: initialResponse,
        message_type: 'text',
        metadata: {
          stage: 1,
          isWelcomeMessage: true,
          aiError: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      initialResponse: initialResponse,
      stage: 1
    });

  } catch (error) {
    console.error('Erro ao iniciar conversa:', error);
    
    // Retornar detalhes do erro em desenvolvimento
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}


