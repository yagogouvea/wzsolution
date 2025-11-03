import { NextRequest, NextResponse } from 'next/server';
import { modifySiteCode } from '@/lib/openai-vision';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, modification, specificFields } = await request.json();

    if (!conversationId || !modification) {
      return NextResponse.json(
        { error: 'ID da conversa e modificação são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar dados do projeto
    const projectData = await DatabaseService.getProjectData(conversationId);
    if (!projectData || !projectData.current_site_code) {
      return NextResponse.json(
        { error: 'Código do site não encontrado' },
        { status: 404 }
      );
    }

    // Processar modificação específica
    let fullModification = modification;
    
    // Se for formulário, incluir campos específicos
    if (modification.toLowerCase().includes('formulário') && specificFields) {
      fullModification = `Adicionar formulário de contato com os seguintes campos: ${specificFields.join(', ')}. 
      O formulário deve ser responsivo e ter validação básica.`;
    }

    // Se for WhatsApp, ser específico
    if (modification.toLowerCase().includes('whatsapp')) {
      fullModification = `Adicionar botão flutuante do WhatsApp no canto inferior direito da tela.
      O botão deve ser fixo, responsivo, com ícone do WhatsApp e ao clicar deve abrir o WhatsApp.`;
    }

    // Modificar código do site
    const modifiedCode = await modifySiteCode(
      projectData.current_site_code,
      fullModification,
      projectData as Record<string, any>
    );

    if (!modifiedCode || modifiedCode === projectData.current_site_code) {
      return NextResponse.json(
        { error: 'Falha ao modificar o site' },
        { status: 500 }
      );
    }

    // Atualizar histórico de modificações
    const hist = projectData.modification_history;
    const currentHistory = Array.isArray(hist) ? hist : [];
    const newHistory = [
      ...currentHistory,
      {
        version: (projectData.site_version || 1) + 1,
        modification: modification,
        timestamp: new Date().toISOString()
      }
    ];

    // Salvar código modificado (PROTEGIDO)
    await DatabaseService.updateProjectData(conversationId, {
      current_site_code: modifiedCode,
      modification_history: newHistory
    });

    // Gerar mensagem de resposta baseada no tipo de modificação
    let responseMessage = '';
    
    if (modification.toLowerCase().includes('whatsapp')) {
      responseMessage = `✅ **Botão do WhatsApp adicionado!**

Criei um botão flutuante no canto inferior direito que direciona para seu WhatsApp.

⚠️ **Preview protegido com marca d'água**
O site final será entregue sem marca d'água e totalmente funcional.

**Veja a atualização no preview abaixo:**`;
    } else if (modification.toLowerCase().includes('formulário')) {
      responseMessage = `📝 **Formulário adicionado com sucesso!**

Criei um formulário profissional com os campos: ${specificFields ? specificFields.join(', ') : 'solicitados'}.

⚠️ **Preview protegido para demonstração**
No site final o formulário será totalmente funcional e conectado.

**Confira no preview:**`;
    } else if (modification.toLowerCase().includes('cadastro')) {
      responseMessage = `🔐 **Botão de cadastro adicionado!**

Adicionei o botão para cadastro no layout. Lembrando que integrações de sistema terão que ser feitas com um consultor após finalizarmos esta parte visual.

⚠️ **Este é um preview protegido**
O site final incluirá funcionalidade completa de cadastro.

**Veja a modificação:**`;
    } else {
      responseMessage = `✅ **Modificação aplicada!**

${modification}

⚠️ **Preview protegido para demonstração**
O site final será entregue sem limitações.

**Veja o resultado:**`;
    }

    // Adicionar mensagem da IA com preview PROTEGIDO
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'ai',
      content: responseMessage,
      message_type: 'text',
      metadata: {
        sitePreview: true,
        siteCode: modifiedCode,
        version: (projectData.site_version || 1) + 1,
        modification: modification,
        isProtected: true
      }
    });

    return NextResponse.json({
      success: true,
      siteCode: modifiedCode, // Para preview protegido apenas
      version: (projectData.site_version || 1) + 1,
      message: 'Site modificado com sucesso!',
      isProtected: true
    });

  } catch (error) {
    console.error('Erro ao modificar site:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}