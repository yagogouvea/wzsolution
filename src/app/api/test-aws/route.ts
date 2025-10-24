import { NextRequest, NextResponse } from 'next/server';
import { SESClient } from '@aws-sdk/client-ses';

export async function GET(request: NextRequest) {
  console.log('=== TESTE AWS SES ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('AWS_REGION:', process.env.AWS_REGION);
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  console.log('TO_EMAIL:', process.env.TO_EMAIL);
  
  try {
    // Testar criação do cliente SES
    const sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    
    console.log('SES Client criado com sucesso');
    
    return NextResponse.json({
      success: true,
      message: 'AWS SES configurado corretamente',
      config: {
        region: process.env.AWS_REGION,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        fromEmail: process.env.FROM_EMAIL,
        toEmail: process.env.TO_EMAIL
      }
    });
    
  } catch (error) {
    console.error('Erro ao testar AWS SES:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      config: {
        region: process.env.AWS_REGION,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        fromEmail: process.env.FROM_EMAIL,
        toEmail: process.env.TO_EMAIL
      }
    }, { status: 500 });
  }
}
