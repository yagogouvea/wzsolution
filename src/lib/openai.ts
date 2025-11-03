// src/lib/openai.ts

/**
 * Determina a fase do diálogo baseado nos dados do projeto
 * ✅ MELHORADO: Considera dados completos do formulário para evitar perguntas redundantes
 */
export function determineDialogPhase(
  projectData: Record<string, unknown>,
  history: Array<{ sender_type: string; content: string }>
): 'technical' | 'visual' | 'content' | 'ready' {
  // ✅ LÓGICA MELHORADA: Considera formulário completo e só questiona o que falta
  
  // Campos essenciais básicos
  const hasBasicInfo = projectData.company_name && projectData.business_type;
  const hasStructure = projectData.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0;
  const hasFunctionalities = projectData.functionalities && Array.isArray(projectData.functionalities) && projectData.functionalities.length > 0;
  const hasStyle = projectData.design_style;
  const hasColors = projectData.design_colors && Array.isArray(projectData.design_colors) && projectData.design_colors.length > 0;
  const hasLogo = Boolean(projectData.has_logo);
  const hasTarget = projectData.target_audience;
  const hasObjective = projectData.business_objective;
  
  // ✅ Se formulário tem TODAS as informações essenciais, está PRONTO
  // Só vai questionar melhorias/refinamentos, não informações básicas
  if (hasBasicInfo && hasStructure && hasFunctionalities && hasStyle && (hasColors || hasLogo) && hasTarget && hasObjective) {
    return 'ready';
  }
  
  // ✅ Verificar o que falta e questionar APENAS o necessário
  // Estrutura técnica (páginas e funcionalidades)
  if (!hasStructure || !hasFunctionalities) {
    return 'technical';
  }
  
  // Identidade visual (tema e cores/logo)
  if (!hasStyle || (!hasColors && !hasLogo)) {
    return 'visual';
  }
  
  // Conteúdo (só se realmente necessário)
  if (projectData.has_content === false && !projectData.has_ai_generated_text) {
    return 'content';
  }
  
  // Se chegou aqui, está pronto (tem o mínimo necessário)
  return 'ready';
}

export async function generateAIResponse(
  conversationId: string,
  userMessage: string,
  stage: number,
  conversationHistory: Array<{ sender_type: string; content: string }>,
  projectData: Record<string, unknown> = {}
): Promise<{
  response: string;
  nextStage: number;
  shouldGenerateImages: boolean;
  shouldGeneratePreview: boolean;
  suggestedOptions?: string[];
  allowFreeText?: boolean;
  previewStage?: string[];
  userConfirmed?: boolean;
  extractedData: Record<string, unknown>;
}> {
  try {
    console.log('🤖 [generateAIResponse] Iniciando com:', { stage, hasProjectData: !!projectData, conversationId });
    
    const company = (projectData.company_name as string) || (projectData.companyName as string) || (projectData.business_type as string) || 'sua empresa';

    const hasLogo = Boolean(projectData.has_logo) || Boolean(projectData.logo_url);
    const useBrand = hasLogo && (projectData.use_logo_colors === true || /usar(\s+)?(logo|cores)/i.test(userMessage));

    // Parse logo_analysis se for string
    let logoAnalysis: { style?: string; colors?: { dominant?: string[] } } | null = null;
    if (projectData.logo_analysis) {
      try {
        logoAnalysis = typeof projectData.logo_analysis === 'string' 
          ? JSON.parse(projectData.logo_analysis) 
          : projectData.logo_analysis as typeof logoAnalysis;
      } catch {
        logoAnalysis = null;
      }
    }

    let response = '';
    let suggestedOptions: string[] = [];
    let nextStage = stage;
    let shouldGenerateImages = false;
    let shouldGeneratePreview = false;
    let userConfirmed = false;

    // ✅ 1. CONFIRMAÇÃO INICIAL COMPLETA DO FORMULÁRIO (Stage 1)
    if (stage === 1) {
      // ✅ Extrair dados de content_needs (JSONB)
      let contentNeeds: Record<string, unknown> = {};
      if (projectData.content_needs) {
        try {
          contentNeeds = typeof projectData.content_needs === 'string' 
            ? JSON.parse(projectData.content_needs) 
            : projectData.content_needs as Record<string, unknown>;
        } catch {
          contentNeeds = {};
        }
      }
      
      // Construir resumo COMPLETO de TODAS as informações do formulário
      const sections: string[] = [];
      
      // 🏢 SEÇÃO: DADOS DA EMPRESA
      sections.push('🏢 **DADOS DA EMPRESA:**');
      // ✅ company_name é o nome da empresa (prioridade)
      const companyName = projectData.company_name || projectData.business_type;
      if (companyName && companyName !== 'sua empresa') {
        sections.push(`   Nome: ${companyName}`);
      }
      if (projectData.slogan) sections.push(`   Slogan: "${projectData.slogan}"`);
      // ✅ business_type é o setor (separado do nome)
      if (projectData.business_type && projectData.business_type !== companyName) {
        sections.push(`   Setor: ${projectData.business_type}`);
      } else if (contentNeeds.business_sector) {
        sections.push(`   Setor: ${contentNeeds.business_sector}`);
      }
      if (projectData.business_objective) sections.push(`   Objetivo: ${projectData.business_objective}`);
      if (projectData.target_audience) sections.push(`   Público-alvo: ${projectData.target_audience}`);
      if (projectData.short_description) sections.push(`   Descrição: ${projectData.short_description}`);
      
      // 🎨 SEÇÃO: IDENTIDADE VISUAL
      sections.push('\n🎨 **IDENTIDADE VISUAL:**');
      if (hasLogo) {
        sections.push(`   ✅ Logo anexado${projectData.use_logo_colors ? ' (usando cores do logo)' : ''}`);
      } else {
        sections.push(`   ❌ Sem logo`);
      }
      if (projectData.design_style) sections.push(`   Tema: ${projectData.design_style}`);
      if (projectData.design_colors && Array.isArray(projectData.design_colors) && projectData.design_colors.length > 0) {
        sections.push(`   Cores: ${projectData.design_colors.join(', ')}`);
      }
      if (projectData.font_style) sections.push(`   Fonte: ${projectData.font_style}`);
      
      // 🧱 SEÇÃO: ESTRUTURA E PÁGINAS
      sections.push('\n🧱 **ESTRUTURA DO SITE:**');
      if (projectData.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0) {
        sections.push(`   Páginas: ${projectData.pages_needed.join(', ')}`);
      }
      // ✅ custom_page_titles está em content_needs
      const customPages = contentNeeds.custom_page_titles as string[];
      if (customPages && Array.isArray(customPages) && customPages.length > 0) {
        sections.push(`   Páginas personalizadas: ${customPages.join(', ')}`);
      }
      if (projectData.site_structure) sections.push(`   Estrutura: ${projectData.site_structure}`);
      
      // ⚙️ SEÇÃO: FUNCIONALIDADES
      if (projectData.functionalities && Array.isArray(projectData.functionalities) && projectData.functionalities.length > 0) {
        sections.push('\n⚙️ **FUNCIONALIDADES:**');
        sections.push(`   ${projectData.functionalities.slice(0, 5).join(', ')}${projectData.functionalities.length > 5 ? ` + ${projectData.functionalities.length - 5} mais` : ''}`);
      }
      
      // ✍️ SEÇÃO: CONTEÚDO E TEXTO
      sections.push('\n✍️ **CONTEÚDO:**');
      // ✅ tone está em content_needs
      const tone = (contentNeeds.tone as string) || projectData.tone;
      if (tone) sections.push(`   Tom de voz: ${tone}`);
      if (projectData.cta_text) sections.push(`   CTA: "${projectData.cta_text}"`);
      if (projectData.has_ai_generated_text !== undefined) {
        sections.push(`   Gerar textos com IA: ${projectData.has_ai_generated_text ? 'Sim' : 'Não'}`);
      }
      
      // 🌟 SEÇÃO: PREFERÊNCIAS EXTRAS
      // ✅ inspiration_sites e additional_prompt estão em content_needs
      const inspirationSites = (contentNeeds.inspiration_sites as string) || projectData.inspiration_sites;
      const additionalPrompt = (contentNeeds.additional_prompt as string) || projectData.additional_prompt;
      if (inspirationSites || additionalPrompt || projectData.animation_level) {
        sections.push('\n🌟 **PREFERÊNCIAS ADICIONAIS:**');
        if (inspirationSites) sections.push(`   Sites de inspiração: ${inspirationSites}`);
        if (additionalPrompt) sections.push(`   Observações: ${additionalPrompt}`);
        if (projectData.animation_level) sections.push(`   Nível de animação: ${projectData.animation_level}`);
      }
      
      const fullSummary = sections.join('\n');
      
      response = `📋 **CONFIRMAÇÃO DO FORMULÁRIO COMPLETO**

Revisei TODAS as informações que você preencheu:

${fullSummary}

---
✅ **Está tudo correto?** Se sim, vou usar essas informações para criar seu site e fazer apenas questionamentos sobre detalhes adicionais que podem melhorar o resultado final.`;
      
      suggestedOptions = ['✅ Sim, está tudo certo', '📝 Quero ajustar algo'];
      nextStage = 2;
    } 
    // ✅ 2. NOVO FLUXO DE DIÁLOGO POR FASES (Stage 2+)
    else if (stage >= 2) {
      const phase = determineDialogPhase(projectData, conversationHistory);
      
      // Log para debug
      console.log('🧩 Fase do diálogo determinada:', phase, {
        hasPages: !!projectData.pages_needed,
        hasFunctionalities: !!projectData.functionalities,
        hasStyle: !!projectData.design_style,
        hasColors: !!projectData.design_colors,
        hasLogo: hasLogo,
        hasTarget: !!projectData.target_audience,
        hasObjective: !!projectData.business_objective
      });

      switch (phase) {
      case 'technical': {
        // ✅ Se chegou aqui, falta informação técnica que não está no formulário
        // Mas verificar se pelo menos algo foi definido
        const hasPages = projectData.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0;
        const hasFeatures = projectData.functionalities && Array.isArray(projectData.functionalities) && projectData.functionalities.length > 0;
        
        if (hasPages && hasFeatures) {
          // ✅ Isso não deveria acontecer se determineDialogPhase estiver correto
          // Mas por segurança, avançar se tiver dados
          response = `✅ Vejo que você já definiu estrutura no formulário. Vamos continuar?`;
          suggestedOptions = ['Sim, continuar', 'Quero revisar'];
          nextStage = stage + 1;
        } else {
          // Falta informação técnica - perguntar apenas o que falta
          const missing = [];
          if (!hasPages) missing.push('quais páginas você precisa');
          if (!hasFeatures) missing.push('quais funcionalidades deseja');
          response = `Para criar o site, preciso saber ${missing.join(' e ')}. Pode me informar?`;
          suggestedOptions = missing.length === 1 
            ? ['Vou informar agora', 'Prefiro pular']
            : ['Vou informar', 'Prefiro escolher depois'];
          nextStage = 3;
        }
        break;
      }
      case 'visual': {
        // ✅ Se chegou aqui, falta algo visual que não está no formulário
        const hasStyle = projectData.design_style;
        const hasColors = projectData.design_colors && Array.isArray(projectData.design_colors) && projectData.design_colors.length > 0;
        
        if (hasStyle && (hasColors || hasLogo)) {
          // ✅ Dados visuais já existem - avançar
          const logoStyle = logoAnalysis?.style || projectData.design_style || 'moderno';
          response = `✅ Identidade visual já está definida${hasLogo ? ` com seu logo (estilo ${logoStyle})` : ''}. Vamos para o próximo passo?`;
          suggestedOptions = ['Sim, continuar', 'Quero ajustar'];
          nextStage = stage + 1;
        } else {
          // Falta informação visual
          const missing = [];
          if (!hasStyle) missing.push('tema visual');
          if (!hasColors && !hasLogo) missing.push('cores ou logo');
          response = `Para aplicar a identidade visual, preciso saber sobre ${missing.join(' e ')}. Como prefere proceder?`;
          suggestedOptions = ['Vou informar', 'Deixe a IA sugerir'];
          nextStage = 4;
        }
        break;
      }
      case 'content': {
        // ✅ Perguntar sobre geração de conteúdo apenas se necessário
        response = 'Quer que eu gere automaticamente os textos do site com base nas informações do formulário?';
        suggestedOptions = ['Sim, gere os textos', 'Prefiro escrever depois', 'Gerar e eu reviso'];
        nextStage = 5;
        break;
      }
      case 'ready': {
        // ✅ Formulário completo! Usar TODAS as informações e fazer questionamentos apenas sobre melhorias
        const pagesSummary = Array.isArray(projectData.pages_needed) 
          ? projectData.pages_needed.join(', ') 
          : 'páginas definidas no formulário';
        const featuresSummary = Array.isArray(projectData.functionalities)
          ? projectData.functionalities.slice(0, 4).join(', ') + (projectData.functionalities.length > 4 ? ` + ${projectData.functionalities.length - 4} mais` : '')
          : 'funcionalidades selecionadas';
        
        response = `✅ **Perfeito! Tenho TODAS as informações do formulário:**
        
📋 **Estrutura:** ${pagesSummary}
⚙️ **Funcionalidades:** ${featuresSummary}
🎨 **Estilo:** ${projectData.design_style || 'Moderno'}
${hasLogo ? '📸 **Logo:** Será aplicado com identidade visual' : ''}
${projectData.slogan ? `💬 **Slogan:** "${projectData.slogan}"` : ''}

Vou usar todas essas informações para criar seu site.

**Antes de gerar o preview, quer que eu sugira algumas melhorias ou ajustes?** (Como menu fixo, animações, seções extras, etc.)`;
        suggestedOptions = ['Gerar direto', 'Quero sugerir melhorias', 'Revisar informações'];
        nextStage = 6;
        // Não gerar automaticamente - esperar confirmação do usuário
        shouldGeneratePreview = false;
        userConfirmed = /gerar direto|pode gerar|ok|sim, gerar/i.test(userMessage);
        if (userConfirmed) {
          shouldGeneratePreview = true;
        }
        break;
      }
      default: {
        // Fallback seguro
        response = `✅ Vamos continuar com a criação do site de ${company}. Como posso ajudar?`;
        suggestedOptions = ['Sim, pode seguir', 'Quero ajustar'];
        nextStage = stage + 1;
        break;
      }
      }
    }

    // ✅ GARANTIR que sempre há uma resposta (fallback seguro)
    if (!response || response.trim() === '') {
      switch (true) {
        case stage === 2: {
          response = `📐 Estruturando páginas e seções. Posso sugerir estrutura baseada no seu negócio ou prefere escolher manualmente?`;
          suggestedOptions = ['Sugira estrutura ideal', 'Quero escolher páginas', 'Adicionar páginas personalizadas'];
          nextStage = 3;
          break;
        }
        case stage === 3: {
          response = `${useBrand ? '🎨 Detectei logo/análise de cores. Vou aplicar identidade visual.' : '🎨 Definindo paleta e estilo visual.'}\nDeseja que eu também gere 1 banner de fundo para o Hero?`;
          suggestedOptions = ['Sim, gere 1 banner', 'Não, use cores sólidas', 'Quero enviar minhas imagens'];
          nextStage = 4;
          // sinaliza geração de imagens se o usuário pedir
          shouldGenerateImages = /gere\s*1\s*banner|gere imagem|gerar imagem/i.test(userMessage);
          break;
        }
        case stage === 4: {
          response = `⚙️ Vamos confirmar funcionalidades (WhatsApp, formulário, depoimentos, galeria, mapa). Quer que eu ative todas as que citou?`;
          suggestedOptions = ['Ative todas', 'Escolher manualmente', 'Só WhatsApp e Formulário'];
          nextStage = 5;
          break;
        }
        case stage === 5: {
          response = `✍️ Posso criar textos iniciais (Hero, Sobre, Serviços, Contato) com base no que você informou. Deseja que eu gere automaticamente e você revisa depois?`;
          suggestedOptions = ['Gerar textos agora', 'Prefiro escrever', 'Gerar e eu reviso'];
          nextStage = 6;
          break;
        }
        default: {
          response = `✅ Chegamos à revisão final. Está tudo certo para eu gerar um preview navegável do site de ${company}?`;
          suggestedOptions = ['Sim, gerar preview', 'Quero revisar algo', 'Adicionar observação final'];
          nextStage = 7;
          userConfirmed = /sim|pode gerar|ok|pode mandar/i.test(userMessage);
          if (userConfirmed) {
            shouldGeneratePreview = true;
          }
          break;
        }
      }
    }

    // ✅ GARANTIR resposta válida antes de retornar
    if (!response || response.trim() === '') {
      console.error('⚠️ Resposta vazia detectada, usando fallback seguro');
      response = `Vamos continuar com a criação do site de ${company}. Como posso ajudar?`;
      suggestedOptions = ['Continuar', 'Preciso de ajuda'];
      nextStage = Math.max(stage, 2);
    }

    // Prompt unificado (retornado embutido na resposta para debug/telemetria se necessário)
    const extractedData: Record<string, unknown> = {
      // Somente campos compatíveis com project_data
      company_name: company,
      has_logo: hasLogo,
      use_logo_colors: useBrand,
    };

    // ✅ Retorno garantido com todos os campos obrigatórios
    const result = {
      response: response.trim(),
      nextStage: nextStage || stage + 1,
      shouldGenerateImages: shouldGenerateImages || false,
      shouldGeneratePreview: shouldGeneratePreview || false,
      suggestedOptions: suggestedOptions.length > 0 ? suggestedOptions : ['Continuar'],
      allowFreeText: true,
      previewStage: undefined,
      userConfirmed: userConfirmed || false,
      extractedData,
    };

    // Log final para debug
    const currentPhase = determineDialogPhase(projectData, conversationHistory);
    console.log('✅ Resposta da IA gerada:', {
      responseLength: result.response.length,
      nextStage: result.nextStage,
      phase: currentPhase,
      hasAllData: !!(projectData.company_name && projectData.business_type && projectData.pages_needed && projectData.design_style)
    });

    return result;
  } catch (error) {
    // ✅ Capturar QUALQUER erro e retornar resposta segura
    console.error('❌ [generateAIResponse] Erro interno:', error);
    const company = (projectData?.company_name as string) || (projectData?.business_type as string) || 'sua empresa';
    
    return {
      response: `Olá! Vamos criar o site da ${company}. Pode me contar mais sobre o que você precisa?`,
      nextStage: stage || 1,
      shouldGenerateImages: false,
      shouldGeneratePreview: false,
      suggestedOptions: ['Continuar', 'Preciso de ajuda'],
      allowFreeText: true,
      previewStage: undefined,
      userConfirmed: false,
      extractedData: {
        company_name: company,
        has_logo: Boolean(projectData?.has_logo),
        use_logo_colors: false,
      },
    };
  }
}
