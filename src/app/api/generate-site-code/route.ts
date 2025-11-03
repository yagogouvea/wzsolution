import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, ProjectData } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  // ✅ WRAPPER DE SEGURANÇA - Garantir que SEMPRE retorna JSON
  try {
    console.log('🚀 [generate-site-code] Iniciando geração de código...');
    
    return await handleGenerateSiteCode(request);
  } catch (outerError: unknown) {
    // ✅ Capturar QUALQUER erro que possa escapar do try-catch interno
    const errorObj = outerError instanceof Error ? outerError : new Error(String(outerError));
    console.error('❌ [generate-site-code] ERRO CRÍTICO NO WRAPPER:', errorObj);
    console.error('❌ [generate-site-code] Stack:', errorObj.stack);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro crítico no servidor ao processar requisição',
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
  }
}

// Interface para dados do formulário (não corresponde exatamente ao ProjectData)
interface FormDataPayload {
  companyName?: string;
  hasLogo?: boolean;
  logoFile?: File | null;
  preferredColors?: string[];
  businessSector?: string;
  siteTheme?: string;
  additionalPrompt?: string;
  mainObjective?: string;
  targetAudience?: string;
  desiredFeatures?: string[];
  hasContent?: boolean;
  contentType?: string;
  inspirationSites?: string;
  siteStructure?: 'multiple_pages' | 'single_page';
  selectedPages?: string[];
  customPageTitles?: string[];
  projectType?: string;
}

async function handleGenerateSiteCode(request: NextRequest) {
  try {
    // Verificar se o body pode ser parseado como JSON
    let conversationId: string;
    let formData: FormDataPayload | undefined;
    
    try {
      const body = await request.json() as { conversationId?: string; projectData?: FormDataPayload };
      conversationId = body.conversationId || '';
      formData = body.projectData;
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('❌ Erro ao parsear JSON do request:', parseError);
      return NextResponse.json(
        { 
          error: 'Erro ao processar dados da requisição',
          details: errorMessage 
        },
        { status: 400 }
      );
    }
    
    console.log('📋 [generate-site-code] Dados recebidos:', {
      hasConversationId: !!conversationId,
      hasFormData: !!formData,
      conversationId
    });

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID da conversa é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados do projeto do banco OU usar dados do formulário
    let projectData = await DatabaseService.getProjectData(conversationId);
    
    // ✅ Criar objeto completo em MEMÓRIA para geração do código
    // (inclui campos que não existem no banco)
    const projectDataInMemory: Partial<ProjectData> & Record<string, unknown> = projectData ? { ...projectData } : {};
    
    // Se não tem dados no banco ou formulário tem dados extras, enriquecer objeto em memória
    if (formData) {
      // ✅ Adicionar/combinar todos os dados do formulário (para uso na geração)
      Object.assign(projectDataInMemory, {
        // ✅ DADOS BÁSICOS
        business_type: formData.businessSector || projectDataInMemory.business_type,
        business_sector: formData.businessSector, // ✅ Para uso em memória (tech-stack-selector)
        business_objective: formData.mainObjective || projectDataInMemory.business_objective,
        target_audience: formData.targetAudience || projectDataInMemory.target_audience,
        design_style: formData.siteTheme || projectDataInMemory.design_style,
        design_colors: formData.preferredColors || projectDataInMemory.design_colors || ['#1e3a8a'],
        
        // ✅ FUNCIONALIDADES E ESTRUTURA
        functionalities: formData.desiredFeatures || projectDataInMemory.functionalities || [],
        site_structure: formData.siteStructure || projectDataInMemory.site_structure || 'multiple_pages',
        pages_needed: formData.selectedPages || projectDataInMemory.pages_needed || ['home', 'sobre', 'servicos', 'contato'],
        custom_pages: formData.customPageTitles || projectDataInMemory.custom_pages || [],
        
        // ✅ CONTEÚDO E INSPIRAÇÕES (para uso em memória)
        has_content: formData.hasContent || projectDataInMemory.has_content || false,
        content_type: formData.contentType || projectDataInMemory.content_type || '',
        inspiration_sites: formData.inspirationSites || projectDataInMemory.inspiration_sites || '',
        
        // ✅ LOGO E VISUAL (para uso em memória)
        has_logo: formData.hasLogo || projectDataInMemory.has_logo || false,
        logo_file: formData.logoFile || projectDataInMemory.logo_file || null,
        preferred_colors: formData.preferredColors || projectDataInMemory.preferred_colors || ['#1e3a8a'],
        
        // ✅ CONTEXTO ADICIONAL (para uso em memória)
        company_name: formData.companyName || projectDataInMemory.company_name,
        initial_prompt: formData.additionalPrompt || projectDataInMemory.initial_prompt,
        project_type: formData.projectType || projectDataInMemory.project_type || 'site'
      });
    }
    
    // ✅ Salvar no banco APENAS campos que existem na tabela project_data
    // Salvar se não há dados no banco OU se há novos dados no formulário
    const shouldSaveToDatabase = !projectData || (formData && Object.keys(formData).length > 0);
    
    if (shouldSaveToDatabase) {
      const projectDataForDatabase: Partial<ProjectData> = {
        // ✅ Campos básicos (existem no banco)
        business_type: projectDataInMemory.business_type,
        business_objective: projectDataInMemory.business_objective,
        target_audience: projectDataInMemory.target_audience,
        design_style: projectDataInMemory.design_style,
        design_colors: projectDataInMemory.design_colors,
        functionalities: projectDataInMemory.functionalities,
        pages_needed: projectDataInMemory.pages_needed,
        // ✅ Campos adicionais que existem no banco
        site_structure: projectDataInMemory.site_structure,
        has_logo: projectDataInMemory.has_logo,
        logo_url: projectDataInMemory.logo_url
      };
      
      try {
        await DatabaseService.createProjectDataIfNotExists(conversationId, projectDataForDatabase);
        console.log('✅ Dados salvos no banco:', Object.keys(projectDataForDatabase).filter(k => projectDataForDatabase[k as keyof ProjectData]));
      } catch (dbError: unknown) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        console.error('⚠️ Erro ao salvar no banco (não crítico - continuando):', errorMessage);
        // Continuar mesmo se falhar - dados em memória são suficientes para geração
      }
    }
    
    // ✅ Usar objeto enriquecido em memória para o resto do código
    // Cast para ProjectData pois em memória temos campos adicionais que não estão no tipo
    projectData = projectDataInMemory as ProjectData;

    if (!projectData) {
      return NextResponse.json(
        { error: 'Dados do projeto não encontrados' },
        { status: 404 }
      );
    }

    // Buscar análise do logo se existir
    let logoAnalysis = null;
    if (projectData.logo_analysis) {
      try {
        logoAnalysis = JSON.parse(projectData.logo_analysis);
      } catch (e) {
        console.error('Erro ao parsear análise do logo:', e);
      }
    }

    // ✅ Gerar mockups profissionais com DALL-E 3 (opcional)
    let generatedImages: string[] = [];
    try {
      console.log('🎨 Gerando mockups profissionais com DALL-E 3...');
      // Import dinamico para evitar problemas de build
      const { generateSiteMockups } = await import('@/lib/dalle-image-generator');
      generatedImages = await generateSiteMockups(projectData as unknown as Record<string, unknown>);
      console.log(`✅ ${generatedImages.length} mockups gerados com DALL-E 3`);
      
      // Nota: Agora estamos gerando mockups visuais de sites (não fotos genéricas)
      // Estas imagens são para visualização e apresentação ao cliente
    } catch (imageError) {
      console.error('⚠️ Erro ao gerar mockups (não crítico):', imageError);
      // Continuar sem imagens - não é crítico
    }

    // ✅ CONSOLIDAR TODOS OS DADOS: usar HISTÓRICO COMPLETO da conversa
    const allMessages = await DatabaseService.getMessages(conversationId);
    
    console.log(`📚 Histórico completo: ${allMessages.length} mensagens - usando TODAS na geração!`);
    
    // ✅ Extrair TODAS as informações relevantes da conversa
    // GPT-4-turbo tem contexto de 128k tokens - pode processar MUITO mais!
    const userMessages = allMessages
      .filter(msg => msg.sender_type === 'user')
      .map((msg, index) => `[Mensagem ${index + 1}]: ${msg.content}`)
      .join('\n\n');
    
    // ✅ Incluir também respostas da IA que podem ter informações valiosas
    const aiMessages = allMessages
      .filter(msg => msg.sender_type === 'ai' && msg.content.length < 200) // Respostas curtas e diretas
      .slice(0, 5) // Top 5 respostas da IA mais relevantes
      .map((msg, index) => `[IA ${index + 1}]: ${msg.content}`)
      .join('\n\n');
    
    // ✅ Consolidar contexto completo (GPT-4-turbo aguenta!)
    const conversationContext = `=== HISTÓRICO COMPLETO DA CONVERSA ===\n\n${userMessages}\n\n${aiMessages ? `=== RESUMO DAS PRINCIPAIS RESPOSTAS DA IA ===\n\n${aiMessages}` : ''}`;
    
    console.log(`📊 Contexto consolidado: ${conversationContext.length} caracteres de história completa`);
    
    // ✅ Adicionar imagens, logo E contexto consolidado aos dados do projeto
    const projectDataWithImages = {
      ...projectData,
      generated_images: generatedImages,
      has_professional_images: generatedImages.length > 0,
      logo_url: projectData.logo_url || null,
      has_logo_integrated: !!(projectData.logo_url && logoAnalysis),
      conversation_context: conversationContext || '',
      total_messages: allMessages.length
    } as ProjectData & { 
      generated_images?: string[];
      has_professional_images?: boolean;
      has_logo_integrated?: boolean;
      conversation_context?: string;
      total_messages?: number;
    };
    
    console.log('📊 Dados finais consolidados para geração:', {
      business_type: projectDataWithImages.business_type,
      business_sector: (projectDataWithImages as any).business_sector,
      functionalities: projectDataWithImages.functionalities,
      has_logo: (projectDataWithImages as any).has_logo_integrated,
      images_count: generatedImages.length,
      logo_analysis: !!logoAnalysis,
      conversation_messages: allMessages.length,
      context_length: conversationContext.length
    });

    // 🧠 USAR SISTEMA INTELIGENTE DE SELEÇÃO DE STACK
    console.log('🧠 Iniciando geração inteligente com seleção automática de tecnologia...');
    
    let siteCode: string;
    let stackInfo: {
      selectedStack: { displayName: string };
      confidence: number;
      reasoning: string[];
      alternatives: string[];
      technology: string;
    } | null = null;
    
    try {
      // Import dinâmico do novo sistema
      console.log('📦 Importando multi-stack-generator...');
      
      let generateIntelligentSite;
      try {
        const generatorModule = await import('@/lib/multi-stack-generator');
        generateIntelligentSite = generatorModule.generateIntelligentSite;
        
        if (!generateIntelligentSite || typeof generateIntelligentSite !== 'function') {
          throw new Error('generateIntelligentSite não é uma função válida');
        }
        
        console.log('✅ Import bem-sucedido');
      } catch (importError: unknown) {
        const errorMessage = importError instanceof Error ? importError.message : String(importError);
        console.error('❌ Erro ao importar multi-stack-generator:', importError);
        throw new Error(`Falha ao importar gerador inteligente: ${errorMessage || 'Erro desconhecido'}`);
      }
      
      console.log('🧠 Chamando generateIntelligentSite...');
      const intelligentResult = await generateIntelligentSite(projectDataWithImages as Record<string, any>, logoAnalysis);
      
      console.log('🎯 Stack selecionada:', intelligentResult.selectedStack.displayName);
      console.log('📊 Confiança:', Math.round(intelligentResult.confidence * 100) + '%');
      console.log('💡 Razões:', intelligentResult.reasoning);
      
      if (!intelligentResult.code) {
        throw new Error('Código não foi gerado pelo sistema inteligente');
      }

      // ✅ Validar que o código é uma string válida (não undefined, null, etc)
      if (typeof intelligentResult.code !== 'string' || intelligentResult.code.length === 0) {
        throw new Error('Código gerado é inválido ou vazio');
      }

      console.log(`📝 Código gerado: ${intelligentResult.code.length} caracteres`);
      console.log(`📝 Primeiros 100 caracteres: ${intelligentResult.code.substring(0, 100)}...`);

      // Salvar informações da stack selecionada junto com o código
      siteCode = intelligentResult.code;
      stackInfo = {
        selectedStack: intelligentResult.selectedStack,
        confidence: intelligentResult.confidence,
        reasoning: intelligentResult.reasoning,
        alternatives: intelligentResult.alternatives.map(alt => alt.displayName),
        technology: intelligentResult.selectedStack.displayName
      };

      console.log('✅ Código gerado com sistema inteligente!');
      
    } catch (intelligentError: unknown) {
      const errorObj = intelligentError instanceof Error ? intelligentError : new Error(String(intelligentError));
      console.error('⚠️ Erro no sistema inteligente:', errorObj);
      console.error('⚠️ Stack trace:', errorObj.stack);
      console.error('⚠️ Mensagem:', errorObj.message);
      
      try {
        // Fallback para sistema antigo se novo sistema falhar
        console.log('🔄 Tentando fallback para sistema antigo...');
        const { generateSiteCode } = await import('@/lib/openai-vision');
        siteCode = await generateSiteCode(projectDataWithImages as Record<string, any>, logoAnalysis);
        
        if (!siteCode || typeof siteCode !== 'string' || siteCode.length === 0) {
          throw new Error('Fallback também falhou - código não gerado');
        }
        
        console.log(`✅ Fallback gerou código: ${siteCode.length} caracteres`);
        
        // Informação de fallback
        stackInfo = {
          selectedStack: { displayName: 'HTML/CSS (Fallback)' },
          confidence: 0.8,
          reasoning: ['Fallback para sistema confiável'],
          alternatives: [],
          technology: 'HTML + Tailwind CSS'
        };
      } catch (fallbackError: unknown) {
        const fallbackErrorObj = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
        const intelligentErrorObj = intelligentError instanceof Error ? intelligentError : new Error(String(intelligentError));
        console.error('❌ Fallback também falhou:', fallbackErrorObj);
        throw new Error(`Geração de código falhou (inteligente: ${intelligentErrorObj.message}, fallback: ${fallbackErrorObj.message})`);
      }
    }

    // Gerar ID único para proteger o código
    const siteCodeId = `site_${conversationId}_${Date.now()}`;
    
    // Salvar código no banco com versionamento
    const newVersion = (projectData.site_version || 0) + 1;
    
    await DatabaseService.addSiteVersion({
      conversation_id: conversationId,
      version_number: newVersion,
      site_code: siteCode,
      site_code_id: siteCodeId, // ✅ Salvar ID protegido
      modification_description: 'Site inicial gerado com base no formulário'
    });

    // ✅ Atualizar dados do projeto usando função segura
    try {
      await DatabaseService.createProjectDataIfNotExists(conversationId, {
        current_site_code: siteCodeId, // ✅ ID protegido, não o código
        site_version: newVersion
      });
      console.log('✅ Projeto atualizado com nova versão:', newVersion);
    } catch (error) {
      console.error('⚠️ Erro ao atualizar projeto (não crítico):', error);
    }

    return NextResponse.json({
      success: true,
      siteCodeId, // ✅ Retorna apenas ID protegido
      version: newVersion,
      message: 'Site gerado com sucesso!',
      previewUrl: `/api/site-preview/${siteCodeId}`, // URL protegida para preview
      reactPreviewUrl: `/react-preview/${siteCodeId}`,
      isProtected: true,
      
      // ✅ INFORMAÇÕES DA STACK SELECIONADA
      stackInfo: stackInfo && {
        technology: stackInfo.technology,
        confidence: Math.round(stackInfo.confidence * 100),
        reasoning: stackInfo.reasoning,
        alternatives: stackInfo.alternatives
      },
      
      // ✅ INFORMAÇÕES EXTRAS
      generatedImages: generatedImages.length,
      hasLogo: !!logoAnalysis,
      processingTime: Date.now() - Date.now() // Placeholder para timing
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ [generate-site-code] ERRO AO GERAR SITE:', errorObj);
    console.error('❌ [generate-site-code] Stack trace:', errorObj.stack);
    console.error('❌ [generate-site-code] Error message:', errorObj.message);
    console.error('❌ [generate-site-code] Error name:', errorObj.name);
    
    // ✅ GARANTIR QUE SEMPRE RETORNA JSON, NUNCA HTML
    try {
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro interno do servidor ao gerar código do site',
          message: errorObj?.message || 'Erro desconhecido',
          details: process.env.NODE_ENV === 'development' ? {
            name: errorObj?.name,
            stack: errorObj?.stack?.substring(0, 500), // Limitar tamanho do stack
            cause: (errorObj as any)?.cause
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
      // Se até mesmo o retorno JSON falhar, retornar erro simples
      console.error('❌ [generate-site-code] Erro crítico ao retornar JSON:', jsonError);
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