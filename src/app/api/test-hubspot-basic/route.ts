import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@hubspot/api-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Teste HubSpot básico iniciado...');

    // Verificar variáveis de ambiente
    if (!process.env.HUBSPOT_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'HUBSPOT_API_KEY não configurada no .env.local'
      }, { status: 400 });
    }

    if (!process.env.HUBSPOT_PORTAL_ID) {
      return NextResponse.json({
        success: false,
        error: 'HUBSPOT_PORTAL_ID não configurada no .env.local'
      }, { status: 400 });
    }

    // Configurar cliente HubSpot
    const hubspotClient = new Client({
      accessToken: process.env.HUBSPOT_API_KEY,
    });

    console.log('📝 Criando contato básico no HubSpot...');

    // Criar contato usando APENAS propriedades PADRÃO do HubSpot
    const testLead = {
      email: `teste.wz.basic.${Date.now()}@wzsolutions.com.br`,
      firstname: 'Teste',
      lastname: 'WZ Solution Básico',
      phone: '(11) 99999-9999',
      company: 'Empresa Teste LTDA',
      website: 'https://wzsolutions.com.br',
      // Propriedades PADRÃO do HubSpot (existem por padrão e são write-enabled)
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
    };

    const response = await hubspotClient.crm.contacts.basicApi.create({
      properties: testLead
    });

    console.log('✅ Contato criado no HubSpot:', response.id);

    // Adicionar nota usando API de notes
    const noteContent = `🤖 TESTE DE INTEGRAÇÃO HUBSPOT BÁSICA

📝 DADOS DO TESTE:
• Email: ${testLead.email}
• Empresa: ${testLead.company}
• Telefone: ${testLead.phone}
• Status: Lead qualificado pela IA
• Data: ${new Date().toLocaleString('pt-BR')}

✅ Teste realizado com sucesso!
🔗 Integração IA Generator + HubSpot funcionando!

📊 PRÓXIMOS PASSOS:
1. Cliente será qualificado pela IA
2. Dados serão salvos automaticamente
3. Equipe de vendas será notificada
4. Follow-up automático será iniciado

🎯 SISTEMA DE VENDAS AUTOMATIZADO ATIVO!`;

    await hubspotClient.crm.objects.notes.basicApi.create({
      properties: {
        hs_note_body: noteContent,
        hs_timestamp: new Date().getTime().toString()
      },
      associations: [
        {
          to: { id: response.id },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED' as any,
              associationTypeId: 202 // Note to Contact
            }
          ]
        }
      ]
    });

    const hubspotContactUrl = `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${response.id}`;

    console.log('🎉 Teste HubSpot básico realizado com sucesso!');

    return NextResponse.json({
      success: true,
      message: '🎉 Integração HubSpot básica funcionando perfeitamente!',
      data: {
        contactId: response.id,
        email: testLead.email,
        company: testLead.company,
        status: 'Lead criado com sucesso',
        hubspotUrl: hubspotContactUrl
      },
      instructions: {
        step1: 'Vá para app.hubspot.com',
        step2: 'Clique em Contacts',
        step3: `Procure por "${testLead.firstname} ${testLead.lastname}"`,
        step4: 'Verifique a nota detalhada criada automaticamente'
      },
      nextSteps: {
        message: 'Sistema básico funcionando! Agora podemos:',
        options: [
          '1. Testar IA Generator completo',
          '2. Criar propriedades personalizadas (opcional)',
          '3. Testar fluxo completo cliente → IA → HubSpot'
        ]
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erro no teste HubSpot básico:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao criar contato no HubSpot',
      message: error instanceof Error ? error.message : String(error),
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? {
        name: error.name,
        stack: error.stack,
        hubspotError: (error as { body?: unknown; response?: { data?: unknown } }).body || (error as { response?: { data?: unknown } }).response?.data
      } : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
