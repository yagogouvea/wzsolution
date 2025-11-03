import { Client } from '@hubspot/api-client';

// Configuração do HubSpot
const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_API_KEY,
});

// Interface básica para dados do lead (SEM propriedades personalizadas)
export interface BasicHubSpotLead {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  website?: string;
  projectDescription: string;
  budgetEstimate: number;
  source: string;
  conversationSummary: string;
}

/**
 * Criar contato no HubSpot usando APENAS propriedades padrão
 */
export async function createBasicHubSpotContact(leadData: BasicHubSpotLead): Promise<string> {
  try {
    console.log('🏢 Criando contato básico no HubSpot:', leadData.email);

    // Usar APENAS propriedades que existem por padrão no HubSpot (SEM read-only)
    const contactProperties = {
      email: leadData.email,
      firstname: leadData.firstName || '',
      lastname: leadData.lastName || '',
      phone: leadData.phone || '',
      company: leadData.company || '',
      website: leadData.website || '',
      // Propriedades PADRÃO do HubSpot (apenas write-enabled)
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead'
    };

    const response = await hubspotClient.crm.contacts.basicApi.create({
      properties: contactProperties
    });

    console.log('✅ Contato básico criado no HubSpot:', response.id);
    return response.id;

  } catch (error: unknown) {
    console.error('❌ Erro ao criar contato básico no HubSpot:', error);
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
 * Adicionar nota detalhada ao contato
 */
export async function addDetailedNote(contactId: string, leadData: BasicHubSpotLead): Promise<void> {
  try {
    console.log('📝 Adicionando nota detalhada ao contato:', contactId);

    const noteContent = `🤖 LEAD QUALIFICADO PELA IA GENERATOR

📊 DADOS DO PROJETO:
• Tipo: ${leadData.projectDescription}
• Orçamento Estimado: R$ ${leadData.budgetEstimate.toLocaleString('pt-BR')}
• Empresa: ${leadData.company || 'Não informado'}
• Telefone: ${leadData.phone || 'Não informado'}
• Website: ${leadData.website || 'Não informado'}

💬 RESUMO DA CONVERSA COM IA:
${leadData.conversationSummary}

📅 DATA: ${new Date().toLocaleString('pt-BR')}
🔗 ORIGEM: ${leadData.source}

🎯 STATUS: Lead qualificado e pronto para abordagem!

⚡ PRÓXIMOS PASSOS:
1. Contato via WhatsApp/telefone em até 2h
2. Apresentar proposta detalhada
3. Agendar reunião se necessário
4. Demonstrar expertise e cases de sucesso

🏆 LEAD SCORE: QUENTE - Cliente já demonstrou interesse real!`;

    await hubspotClient.crm.objects.notes.basicApi.create({
      properties: {
        hs_note_body: noteContent,
        hs_timestamp: new Date().getTime().toString()
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

    console.log('✅ Nota detalhada adicionada ao HubSpot');

  } catch (error) {
    console.error('❌ Erro ao adicionar nota no HubSpot:', error);
    throw error;
  }
}

/**
 * Função principal para processar lead da IA (VERSÃO BÁSICA)
 */
export async function processBasicAILead(leadData: BasicHubSpotLead): Promise<{
  contactId: string;
  hubspotUrl: string;
}> {
  try {
    console.log('🤖 Processando lead básico da IA no HubSpot...');

    // 1. Criar contato
    const contactId = await createBasicHubSpotContact(leadData);

    // 2. Adicionar nota detalhada
    await addDetailedNote(contactId, leadData);

    // 3. URL para acessar no HubSpot
    const hubspotUrl = `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${contactId}`;

    console.log('🎉 Lead básico processado com sucesso no HubSpot!');
    
    return { contactId, hubspotUrl };

  } catch (error) {
    console.error('❌ Erro ao processar lead básico no HubSpot:', error);
    throw error;
  }
}

export default hubspotClient;
