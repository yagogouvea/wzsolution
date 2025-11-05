import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import { extractDataFromPrompt } from '@/lib/prompt-extractor';

// ✅ Importar Claude Chat (PRINCIPAL) - usar Claude em vez de OpenAI
let generateAIResponse: any = null;
try {
  const claudeModule = require('@/lib/claude-chat');
  generateAIResponse = claudeModule.generateAIResponse;
  console.log('✅ [start-conversation] Claude Chat carregado com sucesso');
} catch (importError) {
  console.warn('⚠️ Claude Chat não disponível, tentando OpenAI como fallback:', importError);
  // Fallback para OpenAI se Claude não estiver disponível
  try {
    const openaiModule = require('@/lib/openai');
    generateAIResponse = openaiModule.generateAIResponse;
    console.warn('⚠️ Usando OpenAI como fallback');
  } catch (openaiError) {
    console.warn('⚠️ Nenhuma IA disponível, continuando sem IA:', openaiError);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [start-conversation] Iniciando...');
    
    let body;
    try {
      body = await request.json();
      console.log('📝 [start-conversation] Body parseado:', Object.keys(body));
    } catch (parseError) {
      console.error('❌ [start-conversation] Erro ao parsear JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON inválido no body' },
        { status: 400 }
      );
    }
    
    const { 
      initialPrompt, 
      projectType = 'site',
      clientEmail,
      clientName,
      userId // ✅ Obter userId do body
    } = body;

    if (!initialPrompt) {
      return NextResponse.json(
        { error: 'Prompt inicial é obrigatório' },
        { status: 400 }
      );
    }

    // Criar nova conversa. Se userId fornecido, bloquear se não for válido
    if (userId && typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId inválido' },
        { status: 400 }
      );
    }

    // Gerar nome padrão do projeto baseado no prompt ou companyName
    const generateDefaultProjectName = () => {
      if (clientName) {
        return `Site ${clientName}`;
      }
      // Tentar extrair nome da empresa do prompt
      const promptLower = initialPrompt.toLowerCase();
      const match = initialPrompt.match(/(?:site|site\s+para|para)\s+([^,\.]+)/i);
      if (match && match[1]) {
        return `Site ${match[1].trim()}`;
      }
      // Fallback: usar parte do prompt
      const words = initialPrompt.split(' ').slice(0, 4).join(' ');
      return `Site ${words.length > 30 ? words.substring(0, 30) + '...' : words}`;
    };

    // Criar nova conversa
    const conversation = await DatabaseService.createConversation({
      initial_prompt: initialPrompt,
      project_type: projectType,
      user_id: userId || undefined, // ✅ Associar ao usuário se fornecido
      client_email: clientEmail,
      client_name: clientName,
      project_name: generateDefaultProjectName(), // ✅ Nome padrão
      status: 'active'
    });

    // Salvar prompt inicial do usuário
    await DatabaseService.addMessage({
      conversation_id: conversation.id,
      sender_type: 'user',
      content: `Quero criar: ${initialPrompt}`,
      message_type: 'text',
    });

    // ✅ NOVO: Extrair dados do prompt se for completo ANTES de gerar resposta da IA
    let extractedData: any = {};
    const isPromptComplete = initialPrompt.length > 100 && (
      initialPrompt.includes('para') || 
      initialPrompt.includes('empresa') || 
      initialPrompt.includes('negócio') ||
      initialPrompt.includes('cores') ||
      initialPrompt.includes('páginas') ||
      initialPrompt.includes('funcionalidades')
    );

    if (isPromptComplete) {
      console.log('🔍 [start-conversation] Prompt completo detectado, extraindo informações...');
      try {
        extractedData = await extractDataFromPrompt(initialPrompt, conversation.id);
        
        if (extractedData.has_complete_info && Object.keys(extractedData).length > 1) {
          console.log('✅ [start-conversation] Dados extraídos do prompt completo:', {
            company_name: extractedData.company_name,
            business_type: extractedData.business_type,
            pages_count: extractedData.pages_needed?.length || 0,
            has_style: !!extractedData.design_style,
            has_colors: !!extractedData.design_colors
          });

          // ✅ Salvar dados extraídos no banco ANTES de chamar a IA
          // ✅ REMOVER has_complete_info (não existe na tabela project_data)
          const { has_complete_info, ...dataToSave } = extractedData;
          
          await DatabaseService.updateProjectData(conversation.id, {
            conversation_id: conversation.id,
            company_name: dataToSave.company_name,
            business_type: dataToSave.business_type || dataToSave.business_sector,
            business_sector: dataToSave.business_sector || dataToSave.business_type,
            pages_needed: dataToSave.pages_needed,
            design_style: dataToSave.design_style,
            design_colors: dataToSave.design_colors,
            functionalities: dataToSave.functionalities,
            target_audience: dataToSave.target_audience,
            business_objective: dataToSave.business_objective,
            short_description: dataToSave.short_description,
            slogan: dataToSave.slogan,
            cta_text: dataToSave.cta_text,
            site_structure: dataToSave.site_structure,
          });
          console.log('✅ [start-conversation] Dados extraídos salvos no banco de dados');
        } else {
          console.log('ℹ️ [start-conversation] Prompt não tem informações completas suficientes');
        }
      } catch (extractError) {
        console.error('⚠️ [start-conversation] Erro ao extrair dados do prompt (não crítico):', extractError);
        // Continuar sem os dados extraídos - a IA vai processar normalmente
      }
    }

    // Criar dados iniciais do projeto (opcional, pode falhar se não existir)
    try {
      await DatabaseService.updateProjectData(conversation.id, {
        conversation_id: conversation.id,
        ...extractedData // Incluir dados extraídos se houver
      });
    } catch (projectDataError) {
      console.warn('⚠️ Erro ao criar project_data (não crítico):', projectDataError);
      // Continuar mesmo se falhar - projeto pode não ter dados ainda
    }

    // ✅ Buscar dados do projeto atualizados (pode ter dados extraídos agora)
    let projectData: any = {};
    try {
      projectData = await DatabaseService.getProjectData(conversation.id) || {};
    } catch (dbError) {
      console.warn('⚠️ Erro ao buscar project_data:', dbError);
    }

    // ✅ Gerar primeira resposta da IA usando Claude (sempre personalizada)
    let aiResponse;
    let initialResponse: string;
    
    if (!generateAIResponse) {
      // ⚠️ Fallback apenas se nenhuma IA estiver disponível (não deveria acontecer)
      console.error('❌ Nenhuma IA disponível - usando mensagem genérica');
      initialResponse = `Olá! Recebi seu pedido para criar um site. Vou analisar seu prompt e responder em breve.

📋 **ID da Solicitação:** \`${conversation.id}\`

💡 **Seu Prompt:** ${initialPrompt.substring(0, 200)}${initialPrompt.length > 200 ? '...' : ''}`;
    } else {
      try {
        aiResponse = await generateAIResponse(
          conversation.id,
          initialPrompt,
          1, // Primeiro estágio
          [], // Sem histórico ainda
          projectData // ✅ Passar dados do projeto (pode ter dados extraídos)
        );
        
        if (aiResponse?.response) {
          initialResponse = aiResponse.response;
          
          // Salvar primeira resposta da IA
          await DatabaseService.addMessage({
            conversation_id: conversation.id,
            sender_type: 'ai',
            content: aiResponse.response,
            message_type: 'text',
            metadata: {
              stage: aiResponse.nextStage || 1,
              isWelcomeMessage: true,
              shouldGeneratePreview: aiResponse.shouldGeneratePreview || false
            }
          });
        } else {
          // Se não houve resposta da IA, usar mensagem genérica
          initialResponse = `Olá! Recebi seu pedido. Vou analisar seu prompt e responder em breve.

📋 **ID da Solicitação:** \`${conversation.id}\`

💡 **Seu Prompt:** ${initialPrompt.substring(0, 200)}${initialPrompt.length > 200 ? '...' : ''}`;
          
          await DatabaseService.addMessage({
            conversation_id: conversation.id,
            sender_type: 'ai',
            content: initialResponse,
            message_type: 'text',
            metadata: {
              stage: 1,
              isWelcomeMessage: true,
              aiError: true
            }
          });
        }
      } catch (aiError) {
        console.warn('⚠️ Erro ao gerar resposta da IA (não crítico):', aiError);
        // Continuar sem resposta da IA - conversa foi criada com sucesso
        
        // Usar mensagem genérica em caso de erro
        initialResponse = `Olá! Recebi seu pedido. Vou analisar seu prompt e responder em breve.

📋 **ID da Solicitação:** \`${conversation.id}\`

💡 **Seu Prompt:** ${initialPrompt.substring(0, 200)}${initialPrompt.length > 200 ? '...' : ''}`;
        
        await DatabaseService.addMessage({
          conversation_id: conversation.id,
          sender_type: 'ai',
          content: initialResponse,
          message_type: 'text',
          metadata: {
            stage: 1,
            isWelcomeMessage: true,
            aiError: true
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      initialResponse: initialResponse,
      stage: aiResponse?.nextStage || 1,
      shouldGeneratePreview: aiResponse?.shouldGeneratePreview || false, // ✅ Retornar flag de geração
      hasCompleteData: extractedData.has_complete_info || false // ✅ Indicar se tem dados completos
    });

  } catch (error) {
    console.error('Erro ao iniciar conversa:', error);
    
    // Retornar detalhes do erro em desenvolvimento
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}


