import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import { generateWhatsAppMessage, generateProjectEstimate, getRepresentativeByProjectValue, type ProjectSummary } from '@/lib/whatsapp-integration';
import { processAILead, HubSpotLead } from '@/lib/hubspot';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, clientData } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados completos da conversa
    const conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar dados do projeto
    const projectData = await DatabaseService.getProjectData(conversationId);
    if (!projectData) {
      return NextResponse.json(
        { error: 'Dados do projeto não encontrados' },
        { status: 404 }
      );
    }

    // Buscar histórico de modificações
    const modifications = projectData.modification_history || [];
    const modificationsList = (Array.isArray(modifications) ? modifications : []).map((mod: { modification?: string }) => mod.modification || '');

    // Calcular duração da conversa
    const startTime = new Date(conversation.created_at);
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    const duration = durationMinutes < 60 
      ? `${durationMinutes} minutos`
      : `${Math.round(durationMinutes / 60)} horas`;

    // Montar resumo do projeto
    const projectSummary: ProjectSummary = {
      conversationId,
      clientInfo: {
        name: clientData?.name || conversation.client_name,
        email: clientData?.email || conversation.client_email,
        company: clientData?.company,
        phone: clientData?.phone
      },
      projectDetails: {
        type: conversation.project_type,
        initialPrompt: conversation.initial_prompt,
        businessType: projectData.business_type,
        hasLogo: projectData.has_logo || false,
        logoAnalysis: projectData.logo_analysis ? JSON.parse(projectData.logo_analysis) : null,
        pages: projectData.pages_needed || ['Home', 'Sobre', 'Contato'],
        siteStructure: projectData.site_structure || 'multiple_pages',
        modifications: modificationsList,
        version: projectData.site_version || 1
      },
      timeline: {
        started: conversation.created_at,
        completed: endTime.toISOString(),
        duration
      }
    };

    // Gerar estimativa de preço
    const estimate = generateProjectEstimate(projectSummary);

    // Determinar representante baseado no valor
    const representative = getRepresentativeByProjectValue(estimate.total);

    // Gerar mensagem para WhatsApp
    const whatsappMessage = generateWhatsAppMessage(projectSummary);

    // Marcar conversa como finalizada
    await DatabaseService.updateConversation(conversationId, {
      status: 'completed',
      client_name: projectSummary.clientInfo.name,
      client_email: projectSummary.clientInfo.email
    });

    // 🏢 INTEGRAÇÃO HUBSPOT - Criar lead se não existir
    let hubspotContactId = '';
    let hubspotDealId = '';
    
    const existingLead = await DatabaseService.supabase
      .from('leads')
      .select('id')
      .eq('conversation_id', conversationId)
      .single();

    if (!existingLead.data) {
      // Integração HubSpot ANTES de salvar localmente
      try {
        console.log('🏢 Enviando lead para HubSpot...');
        
        const conversationSummary = `🤖 LEAD QUALIFICADO PELA IA GENERATOR

📝 PROMPT INICIAL:
${conversation.initial_prompt}

🏗️ PROJETO DESENVOLVIDO:
• Tipo: ${projectData.site_structure === 'multiple_pages' ? 'Site Multi-páginas' : 'Site Institucional'}
• Páginas: ${projectSummary.projectDetails.pages.join(', ')}
• Modificações: ${Array.isArray(projectData.modification_history) ? projectData.modification_history.length : (typeof projectData.modification_history === 'object' && projectData.modification_history ? Object.keys(projectData.modification_history).length : 0)} ajustes realizados
• Versão final: v${projectData.site_version}

💰 ORÇAMENTO APROVADO:
• Valor total: R$ ${estimate.total.toLocaleString('pt-BR')}
• Site: R$ ${estimate.basePrice.toLocaleString('pt-BR')}
• Extras: R$ ${estimate.addons.reduce((sum, addon) => sum + addon.price, 0).toLocaleString('pt-BR')}
• Hospedagem: R$ ${(estimate.hosting.domain + estimate.hosting.hosting).toLocaleString('pt-BR')}

⏱️ PRAZO: ${estimate.timeEstimate}

🎯 STATUS: Cliente aprovou preview e solicitou prosseguimento
🔥 QUALIFICAÇÃO: QUENTE - Pronto para fechamento
📞 CONSULTOR: ${representative.name}

${projectData.preview_url ? `🌐 PREVIEW: ${projectData.preview_url}` : ''}`;

        const clientName = projectSummary.clientInfo.name || 'Cliente';
        const nameParts = clientName.split(' ');
        const leadData: HubSpotLead = {
          email: projectSummary.clientInfo.email || '',
          firstName: nameParts[0] || 'Cliente',
          lastName: nameParts.slice(1).join(' ') || 'IA',
          phone: projectSummary.clientInfo.phone || '',
          company: projectSummary.clientInfo.company || '',
          projectType: projectData.site_structure === 'multiple_pages' ? 'Site Multi-páginas' : 'Site Institucional',
          budgetEstimate: estimate.total,
          qualificationScore: 10, // Score máximo - projeto aprovado
          conversationSummary,
          sitePreviewUrl: projectData.preview_url || '',
          source: 'IA Generator - Projeto Finalizado'
        };

        // Enviar para HubSpot
        const hubspotResult = await processAILead(leadData);
        hubspotContactId = hubspotResult.contactId;
        hubspotDealId = hubspotResult.dealId;

        console.log('✅ Lead enviado para HubSpot:', { contactId: hubspotContactId, dealId: hubspotDealId });

      } catch (hubspotError) {
        console.error('⚠️ Erro ao enviar para HubSpot (continuando processo):', hubspotError);
      }

      // Salvar lead localmente (com IDs do HubSpot se disponíveis)
      await DatabaseService.createLead({
        conversation_id: conversationId,
        name: projectSummary.clientInfo.name,
        email: projectSummary.clientInfo.email,
        phone: projectSummary.clientInfo.phone,
        company: projectSummary.clientInfo.company,
        lead_source: 'ai_chat',
        lead_quality: 'hot', // Projeto aprovado = lead quente
        status: 'new',
        notes: `Projeto aprovado via IA: ${conversation.initial_prompt}. Estimativa: R$ ${estimate.total.toLocaleString('pt-BR')}${hubspotContactId ? ` | HubSpot Contact: ${hubspotContactId}` : ''}${hubspotDealId ? ` | HubSpot Deal: ${hubspotDealId}` : ''}`
      });
    }

    // Salvar resumo do projeto para referência (incluindo dados HubSpot)
    await DatabaseService.updateProjectData(conversationId, {
      final_summary: JSON.stringify({
        projectSummary,
        estimate,
        representative: representative.name,
        hubspot: {
          contactId: hubspotContactId,
          dealId: hubspotDealId,
          processedAt: new Date().toISOString()
        }
      }),
      estimated_cost: `R$ ${estimate.total.toLocaleString('pt-BR')}`,
      estimated_time: estimate.timeEstimate,
      hubspot_contact_id: hubspotContactId || undefined,
      hubspot_deal_id: hubspotDealId || undefined
    });

    // Adicionar mensagem final da IA
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'ai',
      content: `🎉 **Projeto Finalizado com Sucesso!**

Parabéns! Seu site foi completamente planejado e testado.

📊 **Resumo do Projeto:**
• **Páginas**: ${projectSummary.projectDetails.pages.join(', ')}
• **Modificações**: ${modificationsList.length} alterações testadas
• **Versão final**: v${projectData.site_version}

💰 **Investimento Estimado**: R$ ${estimate.total.toLocaleString('pt-BR')}
• Site completo: R$ ${estimate.basePrice.toLocaleString('pt-BR')}
• Funcionalidades extras: R$ ${estimate.addons.reduce((sum, addon) => sum + addon.price, 0).toLocaleString('pt-BR')}
• Domínio + Hospedagem (1 ano): R$ ${(estimate.hosting.domain + estimate.hosting.hosting).toLocaleString('pt-BR')}

⏱️ **Prazo de Entrega**: ${estimate.timeEstimate}

🎯 **Próximo Passo:**
Agora vou te conectar com ${representative.name} para finalizar todos os detalhes:
• Ajustes finais no projeto
• Valores e formas de pagamento  
• Registro de domínio
• Configuração de hospedagem
• Publicação do site

**Clique no botão abaixo para falar com o consultor:**`,
      message_type: 'text',
      metadata: {
        isProjectFinalized: true,
        whatsappRedirect: true,
        representative: representative.name,
        estimatedValue: estimate.total
      }
    });

    return NextResponse.json({
      success: true,
      projectSummary,
      estimate,
      representative,
      whatsappMessage,
      message: 'Projeto finalizado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao finalizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
