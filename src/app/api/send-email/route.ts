import { NextRequest, NextResponse } from 'next/server';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient, emailConfig } from '@/lib/aws-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, projectType, description } = body;

    // Debug: Verificar variáveis de ambiente
    console.log('=== DEBUG API SEND-EMAIL ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('TO_EMAIL:', process.env.TO_EMAIL);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('================================');

    // Validação básica
    if (!name || !email || !whatsapp || !projectType || !description) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se as credenciais AWS estão configuradas
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('=== AWS CREDENTIALS MISSING ===');
      console.error('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
      console.error('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
      console.error('NODE_ENV:', process.env.NODE_ENV);
      console.error('All env vars:', Object.keys(process.env).filter(key => key.includes('AWS') || key.includes('EMAIL')));
      console.error('================================');
      
      // Em desenvolvimento, simular envio bem-sucedido
      if (process.env.NODE_ENV === 'development') {
        console.log('Simulando envio de email em desenvolvimento...');
        console.log('Dados do formulário:', { name, email, whatsapp, projectType, description });
        
        return NextResponse.json(
          { message: 'Email simulado enviado com sucesso! (Desenvolvimento)' },
          { status: 200 }
        );
      }
      
      // Em produção, retornar erro mais específico
      return NextResponse.json(
        { 
          error: 'Serviço de email temporariamente indisponível',
          message: 'As credenciais de email não estão configuradas no servidor. Entre em contato conosco diretamente.',
          debug: {
            awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
            awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
            nodeEnv: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
          },
          contact: {
            email: 'contact@wzsolutions.com.br',
            whatsapp: '+55 11 94729-3221'
          }
        },
        { status: 503 }
      );
    }

    // Limpar máscara do WhatsApp (remover caracteres especiais)
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');

    // Mapear tipos de projeto
    const projectTypeMap: { [key: string]: string } = {
      mobile: 'App Mobile',
      web: 'Web App',
      site: 'Site Institucional',
      custom: 'Solução Personalizada'
    };

    const projectTypeLabel = projectTypeMap[projectType] || projectType;

    // Template do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nova Solicitação de Orçamento - WZ Solutions</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">Nova Solicitação de Orçamento</h1>
            <p style="color: white; margin: 10px 0 0 0; text-align: center; opacity: 0.9;">WZ Solutions</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #06b6d4; margin-top: 0;">Informações do Cliente</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nome:</td>
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">E-mail:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #06b6d4;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">WhatsApp:</td>
                <td style="padding: 8px 0;"><a href="https://wa.me/55${cleanWhatsapp}" style="color: #25d366;">${whatsapp}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Tipo de Projeto:</td>
                <td style="padding: 8px 0;">${projectTypeLabel}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px;">
            <h2 style="color: #06b6d4; margin-top: 0;">Descrição do Projeto</h2>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #06b6d4;">
              <p style="margin: 0; white-space: pre-wrap;">${description}</p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0; color: #666;">
              <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}
            </p>
            <p style="margin: 10px 0 0 0; color: #666;">
              Responda diretamente para: <a href="mailto:${email}" style="color: #06b6d4;">${email}</a>
            </p>
          </div>
        </body>
      </html>
    `;

    // Texto simples para clientes que não suportam HTML
    const emailText = `
Nova Solicitação de Orçamento - WZ Solutions

INFORMAÇÕES DO CLIENTE:
Nome: ${name}
E-mail: ${email}
WhatsApp: ${whatsapp} (https://wa.me/55${cleanWhatsapp})
Tipo de Projeto: ${projectTypeLabel}

DESCRIÇÃO DO PROJETO:
${description}

Data: ${new Date().toLocaleString('pt-BR')}
Responda para: ${email}
    `;

    // Comando para enviar email via AWS SES
    const command = new SendEmailCommand({
      Source: emailConfig.from,
      Destination: {
        ToAddresses: [emailConfig.to],
      },
      ReplyToAddresses: [email],
      Message: {
        Subject: {
          Data: `Nova Solicitação de Orçamento - ${name}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: emailHtml,
            Charset: 'UTF-8',
          },
          Text: {
            Data: emailText,
            Charset: 'UTF-8',
          },
        },
      },
    });

    console.log('=== ENVIANDO EMAIL VIA AWS SES ===');
    console.log('From:', emailConfig.from);
    console.log('To:', emailConfig.to);
    console.log('Subject:', `Nova Solicitação de Orçamento - ${name}`);
    console.log('===================================');

    // Enviar email
    await sesClient.send(command);
    
    console.log('=== EMAIL ENVIADO COM SUCESSO ===');

    return NextResponse.json(
      { message: 'Email enviado com sucesso!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    // Log detalhado do erro para debug
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
