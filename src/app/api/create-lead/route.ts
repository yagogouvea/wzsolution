import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      conversationId,
      name,
      email,
      phone,
      company
    } = await request.json();

    if (!conversationId || !name || !email) {
      return NextResponse.json(
        { error: 'Conversa ID, nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a conversa existe
    const conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar dados do projeto para qualificar o lead
    const projectData = await DatabaseService.getProjectData(conversationId);
    
    // Determinar qualidade do lead baseado nos dados coletados
    let leadQuality: 'hot' | 'warm' | 'cold' = 'warm';
    
    if (projectData?.business_type && projectData?.functionalities && projectData?.design_style) {
      leadQuality = 'hot'; // Lead completos são quentes
    } else if (projectData?.business_type) {
      leadQuality = 'warm'; // Parcialmente qualificados
    } else {
      leadQuality = 'cold'; // Pouca informação
    }

    // Criar lead
    const lead = await DatabaseService.createLead({
      conversation_id: conversationId,
      name,
      email,
      phone,
      company,
      lead_source: 'ai_chat',
      lead_quality: leadQuality,
      status: 'new',
      notes: `Lead gerado via chat de IA. Projeto: ${conversation.project_type}. Prompt inicial: ${conversation.initial_prompt}`
    });

    // Atualizar conversa com dados do cliente
    await DatabaseService.updateConversation(conversationId, {
      client_name: name,
      client_email: email,
      status: 'completed'
    });

    // Adicionar mensagem de agradecimento
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'ai',
      content: `🎉 Perfeito, ${name}! 

Suas informações foram registradas com sucesso. Nossa equipe já recebeu todos os detalhes do seu projeto e entrará em contato em breve!

📋 **Resumo do seu projeto:**
• **Tipo**: ${conversation.project_type}
• **Ideia inicial**: ${conversation.initial_prompt}
• **Status**: Aguardando contato comercial

🚀 **Próximos passos:**
1. Nossa equipe analisará os detalhes coletados
2. Entraremos em contato em até 24h
3. Agendaremos uma reunião para apresentar a proposta completa

Obrigado por escolher a WZ Solution! ✨`,
      message_type: 'text',
      metadata: {
        isLeadCreated: true,
        leadQuality
      }
    });

    // TODO: Aqui você pode integrar com:
    // - Webhook para CRM
    // - Email automático para a equipe
    // - Notificação WhatsApp
    // - Integração com Zapier/Make.com

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      leadQuality,
      message: 'Lead criado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET para buscar leads (para dashboard administrativo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    
    if (conversationId) {
      // Buscar lead específico de uma conversa
      const { data: lead } = await DatabaseService.supabase
        .from('leads')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();
      
      return NextResponse.json({
        success: true,
        lead
      });
    }

    // Buscar todos os leads (para dashboard)
    const { data: leads } = await DatabaseService.supabase
      .from('leads')
      .select(`
        *,
        conversations:conversation_id (
          initial_prompt,
          project_type,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      leads: leads || []
    });

  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}





