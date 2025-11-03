import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Teste HubSpot simples iniciado...');

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

    // Teste simples de conexão com HubSpot API
    const apiKey = process.env.HUBSPOT_API_KEY;
    const portalId = process.env.HUBSPOT_PORTAL_ID;

    console.log('📡 Testando conexão HubSpot...', {
      apiKey: `${apiKey.substring(0, 15)}...`,
      portalId
    });

    // Teste básico: buscar informações da conta
    const response = await fetch(`https://api.hubapi.com/account-info/v3/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro HubSpot API:', response.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: `Erro HubSpot API: ${response.status}`,
        details: errorText,
        apiKey: `${apiKey.substring(0, 15)}...`,
        portalId
      }, { status: 500 });
    }

    const accountInfo = await response.json();
    console.log('✅ Conectado ao HubSpot com sucesso!', accountInfo.companyName);

    return NextResponse.json({
      success: true,
      message: '✅ Integração HubSpot funcionando!',
      data: {
        companyName: accountInfo.companyName || 'Nome não disponível',
        portalId: accountInfo.portalId || portalId,
        timeZone: accountInfo.timeZone || 'Não disponível',
        currency: accountInfo.companyCurrency || 'BRL'
      },
      config: {
        apiKey: `${apiKey.substring(0, 15)}...`,
        portalId
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erro no teste HubSpot:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : String(error),
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
