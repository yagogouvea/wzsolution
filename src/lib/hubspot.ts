import { Client } from '@hubspot/api-client';

// Configuração do HubSpot
const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_API_KEY,
});

// Interface para dados do lead
export interface HubSpotLead {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  website?: string;
  projectType: string;
  budgetEstimate: number;
  qualificationScore: number;
  conversationSummary: string;
  sitePreviewUrl?: string;
  source: string;
}

// Interface para dados do deal
export interface HubSpotDeal {
  dealName: string;
  amount: number;
  dealStage: string;
  contactId: string;
  pipelineId: string;
  projectType: string;
  sitePreviewUrl?: string;
}

/**
 * Criar contato no HubSpot
 */
export async function createHubSpotContact(leadData: HubSpotLead): Promise<string> {
  try {
    console.log('🏢 Criando contato no HubSpot:', leadData.email);

    const contactProperties = {
      email: leadData.email,
      firstname: leadData.firstName || '',
      lastname: leadData.lastName || '',
      phone: leadData.phone || '',
      company: leadData.company || '',
      website: leadData.website || '',
      ia_project_type: leadData.projectType,
      ia_budget_estimate: leadData.budgetEstimate.toString(),
      ia_qualification_score: leadData.qualificationScore.toString(),
      ia_conversation_summary: leadData.conversationSummary,
      ia_site_preview_url: leadData.sitePreviewUrl || '',
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
      leadsource: leadData.source
    };

    const response = await hubspotClient.crm.contacts.basicApi.create({
      properties: contactProperties
    });

    console.log('✅ Contato criado no HubSpot:', response.id);
    return response.id;

  } catch (error: unknown) {
    console.error('❌ Erro ao criar contato no HubSpot:', error);
    const statusCode = (error as { status?: number }).status;
    
    // Se contato já existe, buscar ID
    if (statusCode === 409) {
      try {
        const existingContact = await hubspotClient.crm.contacts.basicApi.getPage({
          properties: ['email'],
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: leadData.email
            }]
          }]
        });

        if (existingContact.results.length > 0) {
          console.log('✅ Contato existente encontrado:', existingContact.results[0].id);
          return existingContact.results[0].id;
        }
      } catch (searchError) {
        console.error('❌ Erro ao buscar contato existente:', searchError);
      }
    }
    
    throw error;
  }
}

/**
 * Criar deal no HubSpot
 */
export async function createHubSpotDeal(dealData: HubSpotDeal): Promise<string> {
  try {
    console.log('💼 Criando deal no HubSpot:', dealData.dealName);

    const dealProperties = {
      dealname: dealData.dealName,
      amount: dealData.amount.toString(),
      dealstage: dealData.dealStage,
      pipeline: dealData.pipelineId,
      ia_project_type: dealData.projectType,
      ia_site_preview_url: dealData.sitePreviewUrl || '',
      closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias
    };

    const response = await hubspotClient.crm.deals.basicApi.create({
      properties: dealProperties,
      associations: [
        {
          to: { id: dealData.contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED' as any,
              associationTypeId: 3 // Contact to Deal
            }
          ]
        }
      ]
    });

    console.log('✅ Deal criado no HubSpot:', response.id);
    return response.id;

  } catch (error) {
    console.error('❌ Erro ao criar deal no HubSpot:', error);
    throw error;
  }
}

/**
 * Adicionar nota/atividade ao contato
 */
export async function addHubSpotNote(contactId: string, note: string): Promise<void> {
  try {
    console.log('📝 Adicionando nota ao contato:', contactId);

    await hubspotClient.crm.objects.notes.basicApi.create({
      properties: {
        note_body: note,
        note_date: new Date().toISOString()
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED' as any,
              associationTypeId: 202 // Note to Contact
            }
          ]
        }
      ]
    });

    console.log('✅ Nota adicionada ao HubSpot');

  } catch (error) {
    console.error('❌ Erro ao adicionar nota no HubSpot:', error);
    throw error;
  }
}

/**
 * Função principal para processar lead da IA
 */
export async function processAILead(leadData: HubSpotLead): Promise<{
  contactId: string;
  dealId: string;
}> {
  try {
    console.log('🤖 Processando lead da IA no HubSpot...');

    // 1. Criar contato
    const contactId = await createHubSpotContact(leadData);

    // 2. Criar deal
    const dealData: HubSpotDeal = {
      dealName: `${leadData.projectType} - ${leadData.company || leadData.firstName || 'Lead IA'}`,
      amount: leadData.budgetEstimate,
      dealStage: 'qualificado_ia', // Você precisa criar esse stage
      contactId: contactId,
      pipelineId: 'default', // Use o ID do pipeline que você criar
      projectType: leadData.projectType,
      sitePreviewUrl: leadData.sitePreviewUrl
    };

    const dealId = await createHubSpotDeal(dealData);

    // 3. Adicionar nota com resumo da conversa
    await addHubSpotNote(contactId, `
🤖 LEAD CAPTURADO PELA IA GENERATOR

📊 DADOS DA CONVERSA:
• Tipo: ${leadData.projectType}
• Orçamento: R$ ${leadData.budgetEstimate.toLocaleString('pt-BR')}
• Score: ${leadData.qualificationScore}/10
• Preview: ${leadData.sitePreviewUrl || 'Não gerado'}

💬 RESUMO DA CONVERSA:
${leadData.conversationSummary}

⚡ PRÓXIMOS PASSOS:
1. Contato via WhatsApp em até 2h
2. Apresentar proposta detalhada
3. Agendar reunião se necessário

🎯 LEAD QUALIFICADO E PRONTO PARA ABORDAGEM!
    `);

    console.log('🎉 Lead processado com sucesso no HubSpot!');
    
    return { contactId, dealId };

  } catch (error) {
    console.error('❌ Erro ao processar lead no HubSpot:', error);
    throw error;
  }
}

export default hubspotClient;
