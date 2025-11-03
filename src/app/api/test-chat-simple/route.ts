import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Teste de chat simples sem OpenAI...');
    
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Conversa ID e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar/criar conversa
    let conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      console.log('🆕 Criando conversa para teste:', conversationId);
      conversation = await DatabaseService.createConversation({
        id: conversationId,
        project_type: 'site',
        initial_prompt: message,
        status: 'active'
      });
    }

    // Salvar mensagem do usuário
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'user',
      content: message,
      message_type: 'text',
    });

    // Resposta simulada inteligente
    const response = `Olá! Entendi que você quer ${message}. 

🎯 **Vamos começar seu projeto:**

Para criar um site incrível para sua padaria, preciso saber:

📋 **1. Você já tem logo?**
• Sim, tenho logo
• Não, preciso criar

🎨 **2. Que estilo prefere?**
• Moderno e clean
• Rústico e aconchegante  
• Elegante e sofisticado

📱 **3. Páginas necessárias:**
• Home + Produtos + Contato (básico)
• Completo com cardápio online
• Com sistema de pedidos

**Progresso: 20% ✨**

Qual opção escolhe?`;

    // Salvar resposta simulada
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'ai',
      content: response,
      message_type: 'text',
    });

    console.log('✅ Teste de chat simples: Sucesso!');

    return NextResponse.json({
      response,
      nextStage: 2,
      shouldGenerateImages: false,
      extractedData: { business_type: 'padaria' },
      conversationId,
      status: 'success',
      note: '🧪 MODO TESTE - SEM OPENAI'
    });

  } catch (error: unknown) {
    console.error('❌ Erro no teste de chat simples:', error);
    return NextResponse.json(
      { error: 'Erro no teste de chat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
