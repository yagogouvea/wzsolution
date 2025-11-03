import { NextRequest, NextResponse } from 'next/server';
import { processAILead, HubSpotLead } from '@/lib/hubspot';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Recebendo lead para HubSpot...');

    const body = await request.json();
    const { conversationId, contactInfo } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID é obrigatório' },
        { status: 400 }
      );
    }

    // 1. Buscar dados da conversa no Supabase
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('❌ Conversa não encontrada:', convError);
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // 2. Buscar mensagens da conversa
    const { data: messages, error: msgError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('❌ Erro ao buscar mensagens:', msgError);
      return NextResponse.json(
        { error: 'Erro ao buscar mensagens' },
        { status: 500 }
      );
    }

    // 3. Preparar dados para HubSpot
    const conversationSummary = messages
      ?.map(msg => `${msg.sender_type === 'user' ? 'Cliente' : 'IA'}: ${msg.content}`)
      .join('\n\n') || 'Conversa não disponível';

    // 4. Extrair informações do contato
    const email = contactInfo?.email || `lead.${Date.now()}@wzsolutions.temp`;
    const firstName = contactInfo?.name?.split(' ')[0] || 'Lead';
    const lastName = contactInfo?.name?.split(' ').slice(1).join(' ') || 'IA';
    const phone = contactInfo?.phone || '';
    const company = contactInfo?.company || conversation.project_data?.company || '';

    // 5. Calcular score baseado na conversa
    let qualificationScore = 5; // Score base
    
    if (conversation.project_data?.budget) qualificationScore += 2;
    if (conversation.project_data?.timeline) qualificationScore += 1;
    if (phone) qualificationScore += 1;
    if (company) qualificationScore += 1;
    
    qualificationScore = Math.min(qualificationScore, 10);

    // 6. Determinar orçamento estimado
    const projectType = conversation.project_type || 'Site Institucional';
    let budgetEstimate = 1500; // Valor base para sites

    switch (projectType.toLowerCase()) {
      case 'site institucional':
        budgetEstimate = 1500;
        break;
      case 'e-commerce':
        budgetEstimate = 3000;
        break;
      case 'web app':
        budgetEstimate = 5000;
        break;
      case 'sistema empresarial':
        budgetEstimate = 8000;
        break;
      case 'mobile app':
        budgetEstimate = 10000;
        break;
    }

    // 7. URL do preview se disponível
    const sitePreviewUrl = conversation.project_data?.preview_url || '';

    // 8. Preparar dados do lead
    const leadData: HubSpotLead = {
      email,
      firstName,
      lastName,
      phone,
      company,
      projectType,
      budgetEstimate,
      qualificationScore,
      conversationSummary,
      sitePreviewUrl,
      source: 'IA Generator - Website'
    };

    console.log('🤖 Dados do lead preparados:', {
      email,
      projectType,
      budgetEstimate,
      qualificationScore
    });

    // 9. Enviar para HubSpot
    const { contactId, dealId } = await processAILead(leadData);

    // 10. Salvar IDs do HubSpot no Supabase
    const { error: updateError } = await supabase
      .from('ai_conversations')
      .update({
        hubspot_contact_id: contactId,
        hubspot_deal_id: dealId,
        status: 'converted_to_lead'
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar conversa:', updateError);
    }

    console.log('🎉 Lead enviado para HubSpot com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Lead criado no HubSpot com sucesso',
      data: {
        contactId,
        dealId,
        qualificationScore,
        budgetEstimate,
        hubspotUrl: `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${contactId}`
      }
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Erro ao processar lead HubSpot:', errorObj);

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: errorObj.message,
        details: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined
      },
      { status: 500 }
    );
  }
}
