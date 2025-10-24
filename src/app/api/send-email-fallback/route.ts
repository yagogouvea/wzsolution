import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, projectType, description } = body;

    // Validação básica
    if (!name || !email || !whatsapp || !projectType || !description) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Limpar máscara do WhatsApp (remover caracteres especiais)
    // const cleanWhatsapp = whatsapp.replace(/\D/g, '');

    // Mapear tipos de projeto
    const projectTypeMap: { [key: string]: string } = {
      mobile: 'App Mobile',
      web: 'Web App',
      site: 'Site Institucional',
      custom: 'Solução Personalizada',
      ai: 'Projetos IA',
    };

    const projectTypeLabel = projectTypeMap[projectType] || projectType;

    // Criar link do WhatsApp
    const whatsappMessage = `Olá! Recebi uma nova solicitação de orçamento:

📋 *Dados do Cliente:*
• Nome: ${name}
• Email: ${email}
• WhatsApp: ${whatsapp}
• Tipo de Projeto: ${projectTypeLabel}

📝 *Descrição do Projeto:*
${description}

📅 *Data:* ${new Date().toLocaleString('pt-BR')}

Por favor, entre em contato com o cliente para dar continuidade ao orçamento.`;

    const whatsappUrl = `https://wa.me/5511947293221?text=${encodeURIComponent(whatsappMessage)}`;

    // Simular envio bem-sucedido
    console.log('=== FALLBACK EMAIL SEND ===');
    console.log('Cliente:', name);
    console.log('Email:', email);
    console.log('WhatsApp:', whatsapp);
    console.log('Projeto:', projectTypeLabel);
    console.log('WhatsApp URL:', whatsappUrl);
    console.log('===========================');

    return NextResponse.json(
      { 
        message: 'Solicitação registrada com sucesso!',
        whatsappUrl: whatsappUrl,
        note: 'Nossa equipe entrará em contato em breve via WhatsApp.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro no fallback de email:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Entre em contato conosco diretamente:',
        contact: {
          email: 'contact@wzsolutions.com.br',
          whatsapp: '+55 11 94729-3221'
        }
      },
      { status: 500 }
    );
  }
}
