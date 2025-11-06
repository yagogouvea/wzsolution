import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/claude-chat'; // ✅ Usando Claude em vez de GPT
import { DatabaseService } from '@/lib/supabase';
import { extractDataFromPrompt } from '@/lib/prompt-extractor';

export async function POST(request: NextRequest) {
  try {
    // ✅ Verificar se o body pode ser parseado como JSON
    let conversationId: string;
    let message: string;
    let stage: number = 1;
    let formData: any | undefined;
    let userId: string | null = null;
    
    try {
      const body = await request.json();
      conversationId = body.conversationId;
      message = body.message;
      stage = body.stage || 1;
      formData = body.formData;
      userId = body.userId || null; // ✅ Obter userId do body
    } catch (parseError: unknown) {
      console.error('❌ Erro ao parsear JSON do request:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao processar dados da requisição',
          details: errorMessage 
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Conversa ID e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a conversa existe ou criar automaticamente
    let conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      console.log('🆕 Conversa não existe, criando automaticamente:', conversationId);
      
      // Criar nova conversa automaticamente
      try {
        conversation = await DatabaseService.createConversation({
          id: conversationId,
          user_id: userId || undefined, // ✅ Associar ao usuário se fornecido
          project_type: 'site',
          initial_prompt: message,
          status: 'active'
        });
        console.log('✅ Conversa criada automaticamente:', conversation.id);
      } catch (createError: unknown) {
        console.error('❌ Erro ao criar conversa:', createError);
        const errorDetails = createError instanceof Error ? {
          message: createError.message,
          code: (createError as { code?: string }).code,
          hint: (createError as { hint?: string }).hint
        } : {};
        console.error('❌ Detalhes:', {
          ...errorDetails,
          conversationId
        });
        return NextResponse.json(
          { 
            error: 'Erro ao iniciar conversa',
            details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
          },
          { status: 500 }
        );
      }
    }

    // Se vier formData junto, salvar/mesclar nos dados do projeto ANTES de gerar resposta
    if (formData && typeof formData === 'object') {
      try {
        // ✅ 4. NORMALIZAÇÃO DE CAMPOS DUPLICADOS
        formData.business_objective = (formData.mainObjective || formData.business_objective) as string;
        formData.business_sector = (formData.businessSector || formData.business_sector) as string;
        formData.tone = (formData.toneOfVoice || formData.tone) as string;
        formData.font_style = (formData.fontStyle || formData.font_style) as string;

        // ✅ MAPEAMENTO COM WHITELIST: Apenas campos que existem no banco
        // Whitelist de campos válidos na tabela project_data
        const validFields = new Set([
          'business_type', 'business_objective', 'target_audience', 'pages_needed',
          'design_style', 'design_colors', 'functionalities', 'logo_url', 'logo_analysis',
          'has_logo', 'site_structure', 'slogan', 'use_logo_colors', 'font_style',
          'cta_text', 'has_ai_generated_text', 'animation_level', 'avoid_styles',
          'short_description', 'content_needs', 'generated_images', 'final_summary',
          'current_site_code', 'site_version', 'preview_url', 'company_name'
        ]);
        
        // Mapear campos do formulário para colunas do banco (apenas os que existem)
        const mapped: Record<string, unknown> = {};
        
        // Dados básicos da empresa
        // ✅ PRIORIDADE: companyName é o NOME DA EMPRESA (separado de business_type/sector)
        if (formData.companyName && validFields.has('company_name')) {
          mapped.company_name = formData.companyName;
        }
        // ✅ business_type agora é o SETOR/NEGÓCIO (Barbearia, Restaurante, etc.)
        if (formData.businessSector) {
          mapped.business_type = formData.businessSector;
        } else if (formData.companyName && !formData.businessSector) {
          // Se não tem sector mas tem nome, usar nome como fallback temporário
          mapped.business_type = formData.companyName;
        }
        if (formData.slogan && validFields.has('slogan')) mapped.slogan = formData.slogan;
        if (formData.mainObjective || formData.business_objective) {
          mapped.business_objective = formData.mainObjective || formData.business_objective;
        }
        if (formData.targetAudience) mapped.target_audience = formData.targetAudience;
        if (formData.shortDescription && validFields.has('short_description')) {
          mapped.short_description = formData.shortDescription;
        }
        
        // Identidade visual
        if (formData.hasLogo !== undefined) mapped.has_logo = formData.hasLogo;
        if (formData.useLogoColors !== undefined && validFields.has('use_logo_colors')) {
          mapped.use_logo_colors = formData.useLogoColors;
        }
        if (formData.siteTheme) mapped.design_style = formData.siteTheme;
        if (formData.preferredColors) mapped.design_colors = formData.preferredColors;
        if (formData.fontStyle && validFields.has('font_style')) {
          mapped.font_style = formData.fontStyle;
        }
        
        // Estrutura e conteúdo
        if (formData.selectedPages) mapped.pages_needed = formData.selectedPages;
        // ✅ custom_page_titles não existe no banco - adicionar em content_needs como JSON
        if (formData.customPageTitles && Array.isArray(formData.customPageTitles) && formData.customPageTitles.length > 0) {
          mapped.content_needs = { 
            ...(typeof mapped.content_needs === 'object' && mapped.content_needs ? mapped.content_needs : {}),
            custom_page_titles: formData.customPageTitles 
          };
        }
        if (formData.siteStructure) mapped.site_structure = formData.siteStructure;
        if (formData.desiredFeatures) mapped.functionalities = formData.desiredFeatures;
        
        // Conteúdo e texto
        // ✅ tone não existe no banco - salvar em content_needs
        if (formData.toneOfVoice || formData.tone || formData.tone_of_voice) {
          const tone = formData.toneOfVoice || formData.tone || formData.tone_of_voice;
          mapped.content_needs = {
            ...(typeof mapped.content_needs === 'object' && mapped.content_needs ? mapped.content_needs : {}),
            tone: tone
          };
        }
        if (formData.ctaText && validFields.has('cta_text')) mapped.cta_text = formData.ctaText;
        // ✅ has_content não existe - usar has_ai_generated_text ou content_needs
        if (formData.hasAiGeneratedText !== undefined && validFields.has('has_ai_generated_text')) {
          mapped.has_ai_generated_text = formData.hasAiGeneratedText;
        }
        
        // Referências e preferências
        // ✅ inspiration_sites, additional_prompt não existem - salvar em content_needs
        if (formData.inspirationSites || formData.additionalPrompt) {
          mapped.content_needs = {
            ...(typeof mapped.content_needs === 'object' && mapped.content_needs ? mapped.content_needs : {}),
            ...(formData.inspirationSites ? { inspiration_sites: formData.inspirationSites } : {}),
            ...(formData.additionalPrompt ? { additional_prompt: formData.additionalPrompt } : {})
          };
        }
        if (formData.animationLevel && validFields.has('animation_level')) {
          mapped.animation_level = formData.animationLevel;
        }
        if (formData.avoidStyles && validFields.has('avoid_styles')) {
          mapped.avoid_styles = formData.avoidStyles;
        }
        
        // ✅ Filtrar apenas campos que existem no banco e não são undefined
        const filtered: Record<string, unknown> = {};
        Object.keys(mapped).forEach((k) => {
          if (mapped[k] !== undefined && (validFields.has(k) || k === 'content_needs')) {
            filtered[k] = mapped[k];
          }
        });
        if (Object.keys(filtered).length > 0) {
          await DatabaseService.createProjectDataIfNotExists(conversationId, filtered);
          console.log('✅ project_data atualizado a partir do formData:', Object.keys(filtered));
          
          // ✅ 5. LOG DE CONSISTÊNCIA DE FORMULÁRIO
          console.log('🧩 Verificação de consistência:');
          console.log(`  ✅ ${Object.keys(filtered).length} campos sincronizados:`, Object.keys(filtered));
          const emptyFields = Object.keys(filtered).filter(k => !filtered[k]);
          if (emptyFields.length > 0) {
            console.log(`  ⚠️ Campos vazios: ${emptyFields.join(', ')}`);
          } else {
            console.log(`  ✅ Todos os campos têm valores definidos.`);
          }
        }
      } catch (formSaveError) {
        console.error('⚠️ Erro ao salvar formData (não crítico):', formSaveError);
      }
    }

    // Salvar mensagem do usuário
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'user',
      content: message,
      message_type: 'text',
    });

        // ✅ Buscar histórico COMPLETO - Claude tem contexto grande também
        let conversationHistory = await DatabaseService.getMessages(conversationId);
        
        console.log(`📚 Histórico completo: ${conversationHistory.length} mensagens`);
        
        // ✅ ESTRATÉGIA OTIMIZADA: Preservar MÁXIMO de contexto possível
        // Claude: usar últimas mensagens para contexto (ideal para conversas)
        
        if (conversationHistory.length > 50) {
          // ✅ Histórico MUITO grande: preservar primeira + últimas 40
          console.log(`📊 Histórico muito grande (${conversationHistory.length} mensagens), preservando primeira + últimas 40`);
          const firstMessage = conversationHistory[0];
          const recentMessages = conversationHistory.slice(-40);
          conversationHistory = [firstMessage, ...recentMessages];
        } else if (conversationHistory.length > 20) {
          // ✅ Histórico grande: preservar primeira + últimas 18
          console.log(`📊 Histórico grande (${conversationHistory.length} mensagens), preservando primeira + últimas 18`);
          const firstMessage = conversationHistory[0];
          const recentMessages = conversationHistory.slice(-18);
          conversationHistory = [firstMessage, ...recentMessages];
        } else {
          // ✅ Histórico pequeno/médio: usar TODAS as mensagens!
          console.log(`✅ Usando TODAS as ${conversationHistory.length} mensagens - Claude aguenta facilmente!`);
        }
    
    // ✅ Buscar dados do projeto NOVAMENTE (caso tenha sido atualizado pelo formData acima)
    let projectData = await DatabaseService.getProjectData(conversationId);
    
    // ✅ NOVO: Se for a primeira mensagem e o prompt for completo, extrair dados antes
    const isFirstMessage = conversationHistory.length === 0;
    const isPromptComplete = message.length > 100 && (
      message.includes('para') || 
      message.includes('empresa') || 
      message.includes('negócio') ||
      message.includes('cores') ||
      message.includes('páginas') ||
      message.includes('funcionalidades')
    );

    // ✅ Extrair dados TANTO da primeira mensagem QUANTO de alterações subsequentes
    const isModificationOrAddition = !isFirstMessage && message.length > 30 && (
      message.toLowerCase().includes('alterar') ||
      message.toLowerCase().includes('adicionar') ||
      message.toLowerCase().includes('incluir') ||
      message.toLowerCase().includes('quero') ||
      message.toLowerCase().includes('preciso') ||
      message.toLowerCase().includes('gostaria') ||
      message.toLowerCase().includes('mudar') ||
      message.toLowerCase().includes('trocar')
    );
    
    const shouldExtract = (isFirstMessage && isPromptComplete && stage === 1) || isModificationOrAddition;
    
    if (shouldExtract) {
      console.log('🔍 [Chat] Extraindo informações da mensagem...', {
        isFirstMessage,
        isModificationOrAddition,
        messageLength: message.length
      });
      
      try {
        const extractedData = await extractDataFromPrompt(message, conversationId);
        
        // ✅ Extrair mesmo se não tiver has_complete_info - pode ter informações parciais valiosas
        if (extractedData && Object.keys(extractedData).length > 1) {
          console.log('✅ [Chat] Dados extraídos da mensagem:', {
            company_name: extractedData.company_name,
            business_type: extractedData.business_type,
            pages_count: extractedData.pages_needed?.length || 0,
            has_style: !!extractedData.design_style,
            has_colors: !!extractedData.design_colors,
            has_complete_info: extractedData.has_complete_info
          });

          // ✅ Mesclar dados extraídos com projectData existente
          // ✅ REMOVER has_complete_info (não existe na tabela project_data)
          const { has_complete_info, ...dataToMerge } = extractedData;
          
          // ✅ Para alterações, mesclar de forma inteligente (preservar dados existentes que não foram mencionados)
          const mergedData: Record<string, unknown> = {
            ...(projectData || {}),
            // ✅ Sobrescrever apenas campos que foram mencionados na mensagem
            ...(dataToMerge.company_name ? { company_name: dataToMerge.company_name } : {}),
            ...(dataToMerge.business_type ? { business_type: dataToMerge.business_type } : {}),
            ...(dataToMerge.business_sector ? { business_sector: dataToMerge.business_sector } : {}),
            ...(dataToMerge.pages_needed && Array.isArray(dataToMerge.pages_needed) && dataToMerge.pages_needed.length > 0 
              ? { pages_needed: dataToMerge.pages_needed } 
              : {}),
            ...(dataToMerge.design_style ? { design_style: dataToMerge.design_style } : {}),
            ...(dataToMerge.design_colors && Array.isArray(dataToMerge.design_colors) && dataToMerge.design_colors.length > 0
              ? { design_colors: dataToMerge.design_colors }
              : {}),
            ...(dataToMerge.functionalities && Array.isArray(dataToMerge.functionalities) && dataToMerge.functionalities.length > 0
              ? { functionalities: dataToMerge.functionalities }
              : {}),
            ...(dataToMerge.target_audience ? { target_audience: dataToMerge.target_audience } : {}),
            ...(dataToMerge.business_objective ? { business_objective: dataToMerge.business_objective } : {}),
            ...(dataToMerge.short_description ? { short_description: dataToMerge.short_description } : {}),
            ...(dataToMerge.slogan ? { slogan: dataToMerge.slogan } : {}),
            ...(dataToMerge.cta_text ? { cta_text: dataToMerge.cta_text } : {}),
            ...(dataToMerge.site_structure ? { site_structure: dataToMerge.site_structure } : {}),
          };

          // ✅ Filtrar apenas campos válidos do project_data
          const validFields = new Set([
            'company_name', 'business_type', 'business_sector', 'business_objective',
            'target_audience', 'short_description', 'slogan', 'cta_text',
            'pages_needed', 'design_style', 'design_colors', 'functionalities',
            'site_structure', 'logo_url', 'has_logo', 'use_logo_colors', 'logo_analysis',
            'content_needs', 'font_style', 'has_ai_generated_text', 'animation_level', 'avoid_styles'
          ]);
          
          const filtered: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(mergedData)) {
            if (validFields.has(k) && v !== null && v !== undefined) {
              filtered[k] = v;
            }
          }

          // Salvar dados extraídos/atualizados no banco ANTES de chamar a IA
          if (Object.keys(filtered).length > 0) {
            await DatabaseService.updateProjectData(conversationId, filtered);
            console.log('✅ [Chat] Dados extraídos/atualizados salvos no banco de dados:', Object.keys(filtered));

            // Atualizar projectData para usar na geração da resposta
            projectData = { ...(projectData || {}), ...filtered } as any;
          }
        } else {
          console.log('ℹ️ [Chat] Mensagem não tem informações estruturadas suficientes para extrair');
        }
      } catch (extractError) {
        console.error('⚠️ [Chat] Erro ao extrair dados da mensagem (não crítico):', extractError);
        // Continuar sem os dados extraídos - a IA vai processar normalmente
      }
    }

    console.log('📊 Dados do projeto carregados para IA:', {
      company_name: projectData?.company_name,
      business_type: projectData?.business_type,
      target_audience: projectData?.target_audience,
      design_style: projectData?.design_style,
      pages_needed: projectData?.pages_needed,
      functionalities: projectData?.functionalities,
      has_logo: projectData?.has_logo,
      design_colors: projectData?.design_colors,
    });

    // Gerar resposta da IA
    let aiResponse;
    try {
      aiResponse = await generateAIResponse(
        conversationId,
        message,
        stage,
        conversationHistory,
        (projectData || {}) as Record<string, unknown>
      );
      
      // ✅ Validar que resposta foi gerada
      if (!aiResponse || !aiResponse.response || aiResponse.response.trim() === '') {
        console.error('❌ IA retornou resposta vazia ou inválida:', aiResponse);
        throw new Error('Resposta da IA está vazia ou inválida');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar resposta da IA:', error);
      // Fallback seguro
      aiResponse = {
        response: `Olá! Parece que houve um problema ao processar sua mensagem. Pode repetir, por favor?`,
        nextStage: stage,
        shouldGenerateImages: false,
        shouldGeneratePreview: false,
        suggestedOptions: ['Tentar novamente'],
        allowFreeText: true,
        extractedData: {}
      };
    }

    // ✅ Garantir que shouldGeneratePreview seja sempre boolean (definir ANTES de usar)
    const shouldGeneratePreview = aiResponse.shouldGeneratePreview === true;
    
    // ✅ Verificar se tem dados completos mas usuário não confirmou (para mostrar botão)
    // Isso será usado no frontend para mostrar o botão "Pode criar"
    // ✅ Usar a mesma lógica do claude-chat.ts para consistência
    const hasCompleteProjectData = !!(
      (projectData?.company_name || projectData?.business_type) && // ✅ Aceita qualquer um dos dois
      projectData?.pages_needed &&
      Array.isArray(projectData.pages_needed) &&
      projectData.pages_needed.length > 0 &&
      projectData?.design_style // ✅ Precisa ter estilo também
    );
    
    console.log('🔍 [chat] Verificando dados completos para botão:', {
      hasCompanyName: !!projectData?.company_name,
      hasBusinessType: !!projectData?.business_type,
      hasPages: !!(projectData?.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0),
      hasStyle: !!projectData?.design_style,
      hasCompleteProjectData,
      userConfirmed: aiResponse.userConfirmed || false,
      shouldGeneratePreview
    });
    
    // Salvar resposta da IA
    await DatabaseService.addMessage({
      conversation_id: conversationId,
      sender_type: 'ai',
      content: aiResponse.response,
      message_type: 'text',
      metadata: {
        stage: aiResponse.nextStage,
        shouldGenerateImages: aiResponse.shouldGenerateImages,
        hasCompleteProjectData: hasCompleteProjectData,
        userConfirmed: aiResponse.userConfirmed || false,
        showCreateButton: hasCompleteProjectData && !aiResponse.userConfirmed && !shouldGeneratePreview
      }
    });

        // ✅ Atualizar dados do projeto se houver dados extraídos válidos
        if (aiResponse.extractedData && Object.keys(aiResponse.extractedData).length > 0) {
          try {
            // Filtrar apenas campos válidos do project_data para evitar PGRST204
            const allowedKeys = new Set([
              'company_name', 'business_type', 'business_objective', 'target_audience',
              'pages_needed', 'design_style', 'design_colors', 'functionalities',
              'site_structure', 'has_logo', 'logo_url', 'logo_analysis', 'use_logo_colors',
              'content_needs', 'estimated_cost', 'estimated_time', 'generated_images',
              'final_summary', 'current_site_code', 'site_version', 'modification_history',
              'preview_url', 'hubspot_contact_id', 'hubspot_deal_id'
            ]);
            const filtered: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(aiResponse.extractedData)) {
              if (allowedKeys.has(k)) filtered[k] = v;
            }
            if (Object.keys(filtered).length > 0) {
              await DatabaseService.updateProjectData(conversationId, filtered);
              console.log('✅ Dados do projeto atualizados:', Object.keys(filtered));
            } else {
              console.log('ℹ️ Nenhum campo permitido para atualizar em project_data');
            }
          } catch (updateError: unknown) {
            console.error('⚠️ Erro ao atualizar projeto (não crítico):', updateError);
            // Continuar sem falhar - dados da IA são salvos mesmo assim
          }
        }

    // Atualizar estágio da conversa
    await DatabaseService.updateConversation(conversationId, {
      status: aiResponse.nextStage >= 6 ? 'completed' : 'active'
    });

    // ✅ Log detalhado antes de retornar
    console.log('📤 [chat] Retornando resposta:', {
      success: true,
      responseLength: aiResponse.response?.length || 0,
      nextStage: aiResponse.nextStage,
      shouldGenerateImages: aiResponse.shouldGenerateImages,
      shouldGeneratePreview: shouldGeneratePreview,
      shouldGeneratePreviewRaw: aiResponse.shouldGeneratePreview,
      conversationComplete: aiResponse.nextStage >= 6
    });

    // ✅ Log dos metadados antes de retornar
    const metadata = {
      hasCompleteProjectData: hasCompleteProjectData,
      userConfirmed: aiResponse.userConfirmed || false,
      showCreateButton: hasCompleteProjectData && !aiResponse.userConfirmed && !shouldGeneratePreview,
      shouldGeneratePreview: shouldGeneratePreview
    };
    
    console.log('📤 [chat] Metadados retornados:', metadata);
    
    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      nextStage: aiResponse.nextStage,
      shouldGenerateImages: aiResponse.shouldGenerateImages,
      shouldGeneratePreview: shouldGeneratePreview, // ✅ Garantir boolean
      conversationComplete: aiResponse.nextStage >= 6,
      // ✅ Metadados para mostrar botão "Pode criar"
      metadata: metadata
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ [chat] Erro na API de chat:', errorObj);
    console.error('❌ [chat] Stack trace:', errorObj.stack);
    console.error('❌ [chat] Error message:', errorObj.message);
    
    // ✅ GARANTIR QUE SEMPRE RETORNA JSON, NUNCA HTML
    try {
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro interno do servidor',
          message: errorObj.message || 'Erro desconhecido',
          details: process.env.NODE_ENV === 'development' ? {
            name: errorObj.name,
            stack: errorObj.stack?.substring(0, 500)
          } : undefined
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (jsonError) {
      console.error('❌ [chat] Erro crítico ao retornar JSON:', jsonError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro crítico no servidor'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
}

// GET para buscar histórico de conversa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar conversa
    const conversation = await DatabaseService.getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar mensagens
    const messages = await DatabaseService.getMessages(conversationId);
    
    // Buscar dados do projeto
    const projectData = await DatabaseService.getProjectData(conversationId);

    return NextResponse.json({
      success: true,
      conversation,
      messages,
      projectData
    });

  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
