import { NextRequest, NextResponse } from 'next/server';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { getSESClient, emailConfig, validateAWSConfig } from '@/lib/aws-config';
import { DatabaseService } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // FORÇAR LOGS IMEDIATAMENTE - usar tanto logger quanto console.log
  logger.info('🚀 API SEND-EMAIL INICIADA', { requestId, timestamp: new Date().toISOString() });
  console.log('🚀 === API SEND-EMAIL INICIADA ===');
  console.log('📋 Request ID:', requestId);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔗 URL:', request.url);
  console.log('📨 Method:', request.method);
  
  // Forçar flush dos logs
  if (typeof process !== 'undefined' && process.stdout) {
    process.stdout.write(`\n[${new Date().toISOString()}] API SEND-EMAIL STARTED\n`);
  }
  
  try {
    logger.info('📥 Iniciando processamento do body', { requestId });
    console.log('📥 === INICIANDO PROCESSAMENTO ===');
    
    const body = await request.json();
    const { name, email, whatsapp, projectType, description, empresa, orcamento } = body;

    logger.info('✅ Dados recebidos do formulário', { 
      requestId,
      name: name?.substring(0, 20) + '...',
      email,
      whatsapp,
      projectType,
      descriptionLength: description?.length || 0
    });
    
    console.log('✅ === DADOS RECEBIDOS ===');
    console.log('👤 Name:', name);
    console.log('📧 Email:', email);
    console.log('📱 WhatsApp:', whatsapp);
    console.log('💼 Project Type:', projectType);
    console.log('📝 Description length:', description?.length || 0);
    console.log('========================');

    // Validação básica dos dados do formulário
    if (!name || !email || !whatsapp || !projectType || !description) {
      logger.warn('❌ Validação falhou - campos obrigatórios ausentes', { 
        requestId,
        hasName: !!name,
        hasEmail: !!email,
        hasWhatsapp: !!whatsapp,
        hasProjectType: !!projectType,
        hasDescription: !!description
      });
      console.log('❌ VALIDAÇÃO FALHOU - Campos obrigatórios ausentes');
      
      const response = NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
      
      logger.api('/api/send-email', 'POST', 400, Date.now() - startTime, { requestId });
      return response;
    }

    // Validar configuração AWS
    logger.info('🔍 Validando configuração AWS', { requestId });
    console.log('🔍 === VALIDANDO CONFIGURAÇÃO AWS ===');
    
    const configValidation = validateAWSConfig();
    if (!configValidation.valid) {
      logger.error('❌ Configuração AWS inválida', configValidation.errors, { requestId });
      console.error('❌ === CONFIGURAÇÃO AWS INVÁLIDA ===');
      console.error('❌ Erros:', JSON.stringify(configValidation.errors, null, 2));
      console.error('================================');
      
      // Em desenvolvimento, simular envio bem-sucedido e salvar no banco
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Modo desenvolvimento: Simulando envio de email...');
        
        // Salvar no banco de dados mesmo em desenvolvimento
        try {
          const cleanWhatsapp = whatsapp.replace(/\D/g, '');
          const projectTypeMap: { [key: string]: string } = {
            mobile: 'App Mobile',
            web: 'Web App',
            site: 'Site Institucional',
            custom: 'Solução Personalizada'
          };
          const projectTypeLabel = projectTypeMap[projectType] || projectType;
          
          await DatabaseService.supabase
            .from('budget_requests')
            .insert({
              name,
              email,
              whatsapp: cleanWhatsapp,
              project_type: projectTypeLabel,
              description
            });
          
          console.log('✅ Dados salvos no banco (desenvolvimento)');
        } catch (dbError) {
          console.error('Erro ao salvar no banco:', dbError);
        }
        
        return NextResponse.json(
          { 
            message: 'Email simulado enviado com sucesso! (Desenvolvimento - AWS não configurado)',
            warning: 'AWS SES não configurado. Configure as variáveis de ambiente para envio real.'
          },
          { status: 200 }
        );
      }
      
      // Em produção, retornar erro se AWS não estiver configurado
      return NextResponse.json(
        {
          error: 'Serviço de email temporariamente indisponível',
          message: 'Configuração de email não disponível. Entre em contato conosco diretamente.',
          contact: {
            email: 'contact@wzsolutions.com.br',
            whatsapp: '+55 11 94729-3221'
          }
        },
        { status: 503 }
      );
    }

    logger.info('⚙️ Processando dados do formulário', { requestId });
    console.log('⚙️ === PROCESSANDO DADOS ===');
    
    // Limpar máscara do WhatsApp (remover caracteres especiais)
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    logger.info('📱 WhatsApp processado', { requestId, original: whatsapp, cleaned: cleanWhatsapp });
    console.log('📱 WhatsApp limpo:', cleanWhatsapp);

    // Mapear tipos de projeto
    const projectTypeMap: { [key: string]: string } = {
      mobile: 'App Mobile',
      web: 'Web App',
      site: 'Site Institucional',
      custom: 'Solução Personalizada'
    };

    const projectTypeLabel = projectTypeMap[projectType] || projectType;
    console.log('Tipo de projeto mapeado:', projectTypeLabel);

    // Salvar no banco de dados
    try {
      logger.info('💾 Salvando no banco de dados', { requestId, table: 'budget_requests' });
      console.log('💾 === SALVANDO NO BANCO DE DADOS ===');
      
      // Preparar dados para inserção - começar apenas com campos obrigatórios
      const insertData: any = {
        name,
        email,
        whatsapp: cleanWhatsapp,
        project_type: projectTypeLabel,
        description
      };
      
      // Adicionar campos opcionais se existirem
      // Usar nomes de coluna mais comuns primeiro
      if (empresa && empresa.trim()) {
        insertData.company = empresa.trim(); // Nome mais comum em tabelas em inglês
      }
      
      if (orcamento && orcamento.trim()) {
        // Mapear valores de orçamento para texto legível
        const orcamentoMap: { [key: string]: string } = {
          'ate5k': 'Até R$ 5.000',
          '5k-10k': 'R$ 5.000 - R$ 10.000',
          '10k-20k': 'R$ 10.000 - R$ 20.000',
          '20k-50k': 'R$ 20.000 - R$ 50.000',
          'acima50k': 'Acima de R$ 50.000'
        };
        insertData.budget_range = orcamentoMap[orcamento] || orcamento;
      }
      
      console.log('💾 Dados para inserção:', insertData);
      
      let data: any = null;
      let dbError: any = null;
      
      // Tentar inserir com todos os campos primeiro
      const result = await DatabaseService.supabase
        .from('budget_requests')
        .insert(insertData)
        .select();
      
      data = result.data;
      dbError = result.error;
      
      // Se falhar por coluna não encontrada, tentar apenas campos básicos
      if (dbError && (dbError.code === '42703' || dbError.message?.includes('column') || dbError.message?.includes('does not exist'))) {
        console.log('⚠️ Coluna não encontrada, tentando apenas campos básicos...');
        const basicData = {
          name,
          email,
          whatsapp: cleanWhatsapp,
          project_type: projectTypeLabel,
          description
        };
        
        const retryResult = await DatabaseService.supabase
          .from('budget_requests')
          .insert(basicData)
          .select();
          
        data = retryResult.data;
        dbError = retryResult.error;
        
        if (!dbError) {
          console.log('✅ Dados básicos salvos com sucesso (campos opcionais ignorados)');
        }
      }

      if (dbError) {
        logger.error('❌ Erro ao salvar no banco de dados', dbError, { requestId });
        console.error('❌ Erro ao salvar no banco de dados:', JSON.stringify(dbError, null, 2));
        console.error('❌ Código do erro:', dbError.code);
        console.error('❌ Mensagem do erro:', dbError.message);
        console.error('❌ Detalhes:', dbError.details);
        console.error('❌ Hint:', dbError.hint);
        // Continuar mesmo se der erro no banco (não bloquear o envio de email)
      } else {
        logger.info('✅ Dados salvos no banco com sucesso', { requestId, recordId: data?.[0]?.id });
        console.log('✅ Dados salvos no banco de dados com sucesso');
        console.log('📋 Record ID:', data?.[0]?.id);
      }
    } catch (dbError) {
      logger.error('❌ Exceção ao salvar no banco', dbError, { requestId });
      console.error('❌ Exceção ao salvar no banco de dados:', dbError);
      // Continuar mesmo se der erro no banco
    }

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
              ${empresa ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Empresa:</td>
                <td style="padding: 8px 0;">${empresa}</td>
              </tr>
              ` : ''}
              ${orcamento ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Orçamento Estimado:</td>
                <td style="padding: 8px 0;">${orcamento === 'ate5k' ? 'Até R$ 5.000' : 
                  orcamento === '5k-10k' ? 'R$ 5.000 - R$ 10.000' :
                  orcamento === '10k-20k' ? 'R$ 10.000 - R$ 20.000' :
                  orcamento === '20k-50k' ? 'R$ 20.000 - R$ 50.000' :
                  orcamento === 'acima50k' ? 'Acima de R$ 50.000' : orcamento}</td>
              </tr>
              ` : ''}
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
${empresa ? `Empresa: ${empresa}` : ''}
${orcamento ? `Orçamento Estimado: ${orcamento === 'ate5k' ? 'Até R$ 5.000' : 
  orcamento === '5k-10k' ? 'R$ 5.000 - R$ 10.000' :
  orcamento === '10k-20k' ? 'R$ 10.000 - R$ 20.000' :
  orcamento === '20k-50k' ? 'R$ 20.000 - R$ 50.000' :
  orcamento === 'acima50k' ? 'Acima de R$ 50.000' : orcamento}` : ''}

DESCRIÇÃO DO PROJETO:
${description}

Data: ${new Date().toLocaleString('pt-BR')}
Responda para: ${email}
    `;

    logger.info('📧 Criando comando SES', { requestId });
    console.log('📧 === CRIANDO COMANDO SES ===');
    
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

    logger.info('📤 Enviando email via AWS SES', { 
      requestId,
      from: emailConfig.from,
      to: emailConfig.to,
      subject: `Nova Solicitação de Orçamento - ${name}`,
      region: process.env.AWS_REGION
    });
    
    console.log('📤 === ENVIANDO EMAIL VIA AWS SES ===');
    console.log('📮 From:', emailConfig.from);
    console.log('📬 To:', emailConfig.to);
    console.log('📄 Subject:', `Nova Solicitação de Orçamento - ${name}`);
    console.log('🌍 AWS Region:', process.env.AWS_REGION);
    console.log('🔑 SES Client config:', {
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    console.log('===================================');

    // Enviar email via AWS SES
    try {
      logger.info('🚀 Tentando enviar email via AWS SES', { requestId });
      console.log('🚀 === TENTANDO ENVIAR EMAIL VIA AWS SES ===');
      console.log('📮 From:', emailConfig.from);
      console.log('📬 To:', emailConfig.to);
      console.log('↩️ ReplyTo:', email);
      
      const sesClient = getSESClient();
      const sendStartTime = Date.now();
      const result = await sesClient.send(command);
      const sendDuration = Date.now() - sendStartTime;
      
      logger.info('✅ Email enviado com sucesso', { 
        requestId,
        messageId: result.MessageId,
        duration: `${sendDuration}ms`
      });
      
      console.log('✅ === EMAIL ENVIADO COM SUCESSO ===');
      console.log('📧 MessageId:', result.MessageId);
      console.log('⏱️ Duração:', `${sendDuration}ms`);
      console.log('📋 Response:', JSON.stringify(result, null, 2));
      console.log('================================');
      
      const totalDuration = Date.now() - startTime;
      logger.api('/api/send-email', 'POST', 200, totalDuration, { 
        requestId,
        messageId: result.MessageId 
      });
      
      // Retornar sucesso mesmo que o email possa estar em sandbox
      return NextResponse.json(
        { 
          success: true,
          message: 'Email enviado com sucesso!',
          messageId: result.MessageId,
          note: 'Se você não receber o email, verifique a pasta de spam ou se o SES está em modo sandbox.'
        },
        { status: 200 }
      );
    } catch (awsError: any) {
      console.error('=== ERRO AWS SES ===');
      console.error('AWS Error:', awsError);
      console.error('Error name:', awsError?.name || 'Unknown');
      console.error('Error message:', awsError?.message || String(awsError));
      const awsErrorMetadata = awsError?.$metadata;
      console.error('Error code:', awsErrorMetadata?.httpStatusCode);
      console.error('Error requestId:', awsErrorMetadata?.requestId);
      console.error('Full error:', JSON.stringify(awsError, null, 2));
      console.error('===================');
      
      // Verificar erros específicos do SES
      const errorMessage = awsError?.message || String(awsError);
      const errorCode = awsErrorMetadata?.httpStatusCode;
      
      // Erro de email não verificado (sandbox mode)
      if (errorMessage.includes('Email address not verified') || 
          errorMessage.includes('not verified') ||
          errorCode === 400) {
        console.error('=== ERRO: EMAIL NÃO VERIFICADO NO SES ===');
        return NextResponse.json(
          {
            error: 'Email não verificado no AWS SES',
            message: 'O email remetente ou destinatário precisa estar verificado no AWS SES.',
            details: {
              fromEmail: emailConfig.from,
              toEmail: emailConfig.to,
              suggestion: 'Verifique os emails no AWS SES Console ou saia do modo sandbox.'
            },
            contact: {
              email: 'contact@wzsolutions.com.br',
              whatsapp: '+55 11 94729-3221'
            }
          },
          { status: 400 }
        );
      }
      
      // Erro de sandbox mode
      if (errorMessage.includes('Account is in Sandbox') || 
          errorMessage.includes('sandbox')) {
        console.error('=== ERRO: SES EM MODO SANDBOX ===');
        return NextResponse.json(
          {
            error: 'AWS SES em modo Sandbox',
            message: 'O AWS SES está em modo sandbox. Você só pode enviar para emails verificados.',
            details: {
              suggestion: 'Solicite saída do sandbox no AWS SES Console ou adicione o email destinatário à lista de verificados.'
            },
            contact: {
              email: 'contact@wzsolutions.com.br',
              whatsapp: '+55 11 94729-3221'
            }
          },
          { status: 400 }
        );
      }
      
      // Erro de quota/permissão
      if (errorMessage.includes('SendingQuotaExceeded') || 
          errorMessage.includes('Daily message sending quota')) {
        console.error('=== ERRO: QUOTA EXCEDIDA ===');
        return NextResponse.json(
          {
            error: 'Quota de envio excedida',
            message: 'A cota diária de envio de emails foi excedida.',
            contact: {
              email: 'contact@wzsolutions.com.br',
              whatsapp: '+55 11 94729-3221'
            }
          },
          { status: 429 }
        );
      }
      
      // Outros erros AWS
      throw awsError;
    }

    // Este código não deve ser alcançado, mas mantido como fallback
    return NextResponse.json(
      { 
        success: true,
        message: 'Email enviado com sucesso!' 
      },
      { status: 200 }
    );

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    logger.error('❌ Erro capturado na API send-email', error, { 
      requestId,
      duration: `${totalDuration}ms`,
      errorType: typeof error,
      errorName: error instanceof Error ? error.name : 'Unknown'
    });
    
    console.error('❌ === ERRO CAPTURADO ===');
    console.error('🆔 Request ID:', requestId);
    console.error('⏱️ Duração:', `${totalDuration}ms`);
    console.error('🔴 Error type:', typeof error);
    console.error('🔴 Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('🔴 Error message:', error instanceof Error ? error.message : String(error));
    console.error('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('🌍 NODE_ENV:', process.env.NODE_ENV);
    console.error('🌍 AWS_REGION:', process.env.AWS_REGION);
    console.error('🔑 AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');
    console.error('🔑 AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
    console.error('📋 Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('======================');
    
    // Verificar se é erro de credenciais AWS
    if (error instanceof Error && (error.message.includes('credentials') || error.message.includes('Credential'))) {
      console.error('=== ERRO DE CREDENCIAIS AWS ===');
      return NextResponse.json(
        { 
          error: 'Serviço de email temporariamente indisponível',
          message: 'Problema com credenciais de email. Entre em contato conosco diretamente.',
          debug: {
            errorType: 'AWS Credentials Error',
            message: error.message,
            name: error.name,
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
    
    // Verificar se é erro de região AWS
    if (error instanceof Error && (error.message.includes('region') || error.message.includes('Region'))) {
      console.error('=== ERRO DE REGIÃO AWS ===');
      return NextResponse.json(
        { 
          error: 'Serviço de email temporariamente indisponível',
          message: 'Problema com configuração de região. Entre em contato conosco diretamente.',
          debug: {
            errorType: 'AWS Region Error',
            message: error.message,
            name: error.name,
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
    
    // Verificar se é erro de SES (captura erros que não foram tratados acima)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('SES') || 
        errorMessage.includes('Email address not verified') ||
        errorMessage.includes('not verified') ||
        errorMessage.includes('sandbox') ||
        errorMessage.includes('SendingQuotaExceeded')) {
      console.error('=== ERRO AWS SES (catch geral) ===');
      console.error('Detalhes completos do erro:', error);
      
      // Se for erro de email não verificado
      if (errorMessage.includes('Email address not verified') || errorMessage.includes('not verified')) {
        return NextResponse.json(
          { 
            error: 'Email não verificado no AWS SES',
            message: 'O email remetente ou destinatário precisa estar verificado no AWS SES.',
            details: {
              fromEmail: emailConfig.from,
              toEmail: emailConfig.to,
              suggestion: 'Verifique os emails no AWS SES Console (https://console.aws.amazon.com/ses) ou saia do modo sandbox.'
            },
            contact: {
              email: 'contact@wzsolutions.com.br',
              whatsapp: '+55 11 94729-3221'
            }
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao enviar email via AWS SES',
          message: 'Ocorreu um problema ao enviar o email. Entre em contato conosco diretamente.',
          debug: {
            errorType: 'AWS SES Error',
            message: errorMessage,
            name: error instanceof Error ? error.name : 'Unknown',
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
    
    // Outros erros
    logger.error('❌ Erro genérico não tratado', error, { requestId });
    console.error('❌ === ERRO GENÉRICO ===');
    
    logger.api('/api/send-email', 'POST', 500, totalDuration, { requestId, error: 'Generic Error' });
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro inesperado. Entre em contato conosco diretamente.',
        requestId, // Incluir requestId na resposta para rastreamento
        debug: {
          errorType: 'Generic Error',
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown',
          timestamp: new Date().toISOString()
        },
        contact: {
          email: 'contact@wzsolutions.com.br',
          whatsapp: '+55 11 94729-3221'
        }
      },
      { status: 500 }
    );
  } finally {
    // Log final sempre executado
    const finalDuration = Date.now() - startTime;
    console.log(`🏁 === REQUEST FINALIZADA === Request ID: ${requestId} | Duração: ${finalDuration}ms`);
    logger.info('🏁 Request finalizada', { requestId, totalDuration: `${finalDuration}ms` });
  }
}
