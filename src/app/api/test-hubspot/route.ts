import { NextRequest, NextResponse } from 'next/server';
import { processAILead, HubSpotLead } from '@/lib/hubspot';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Iniciando teste do HubSpot...');

    // Verificar se as variáveis de ambiente estão configuradas
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

    // Dados de teste
    const testLead: HubSpotLead = {
      email: `teste.wz.${Date.now()}@wzsolutions.com.br`,
      firstName: 'Teste',
      lastName: 'WZ Solution',
      phone: '(11) 99999-9999',
      company: 'Empresa Teste LTDA',
      projectType: 'Site Institucional',
      budgetEstimate: 2000,
      qualificationScore: 8,
      conversationSummary: `🤖 TESTE DE INTEGRAÇÃO HUBSPOT

Cliente: Olá, quero um site para minha empresa
IA: Perfeito! Que tipo de empresa você tem?
Cliente: É uma consultoria jurídica
IA: Excelente! Vou criar um site profissional para você...

✅ Teste realizado em ${new Date().toLocaleString('pt-BR')}`,
      sitePreviewUrl: 'https://preview.wzsolutions.com.br/test-123',
      source: 'Teste Integração IA'
    };

    console.log('📊 Enviando lead de teste para HubSpot...');

    // Processar lead de teste
    const result = await processAILead(testLead);

    console.log('✅ Teste HubSpot realizado com sucesso!');

    return NextResponse.json({
      success: true,
      message: '✅ Integração HubSpot funcionando perfeitamente!',
      data: {
        contactId: result.contactId,
        dealId: result.dealId,
        testLead: {
          email: testLead.email,
          projectType: testLead.projectType,
          budgetEstimate: testLead.budgetEstimate,
          qualificationScore: testLead.qualificationScore
        },
        hubspotUrls: {
          contact: `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${result.contactId}`,
          deal: `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/deal/${result.dealId}`
        }
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erro no teste HubSpot:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao testar integração HubSpot',
      message: error instanceof Error ? error.message : String(error),
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? {
        name: error.name,
        stack: error.stack,
        status: (error as { status?: number }).status
      } : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
