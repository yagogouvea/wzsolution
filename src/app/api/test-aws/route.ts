import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== TESTE AWS SES ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('AWS_REGION:', process.env.AWS_REGION);
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  console.log('TO_EMAIL:', process.env.TO_EMAIL);
  
  try {
    // Teste básico sem criar cliente SES
    console.log('Testando configuração básica...');
    
    const config = {
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      fromEmail: process.env.FROM_EMAIL,
      toEmail: process.env.TO_EMAIL,
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('Configuração:', config);
    
    return NextResponse.json({
      success: true,
      message: 'Configuração AWS verificada',
      config: config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao testar configuração:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      config: {
        region: process.env.AWS_REGION,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        fromEmail: process.env.FROM_EMAIL,
        toEmail: process.env.TO_EMAIL
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
