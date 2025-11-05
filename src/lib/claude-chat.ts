/**
 * 🤖 Claude Chat Integration
 * Versão usando Claude para conversas de geração de sites
 * Substitui o uso do GPT pela Claude
 */

// Re-export da função determineDialogPhase do openai.ts (mesma lógica)
export { determineDialogPhase } from './openai';

/**
 * Gera resposta da IA usando Claude (em vez de GPT)
 * Mantém a mesma interface que generateAIResponse do openai.ts
 */
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
    console.log('🤖 [Claude-Chat] Iniciando com:', { stage, hasProjectData: !!projectData, conversationId });
    
    // Importar Anthropic diretamente aqui para evitar dependências circulares
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

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

    // Importar determineDialogPhase da mesma forma
    const { determineDialogPhase } = await import('./openai');
    const phase = determineDialogPhase(projectData, conversationHistory);

    // ✅ Verificar confirmação do usuário PRIMEIRO (melhorar detecção)
    const userConfirmed = /^(gerar|sim|ok|pode gerar|pronto|pode|vamos|está bom|está ok|vai|confirmo|confirmado|pode criar|pode fazer|pode começar)$/i.test(userMessage.trim()) ||
                          /(gerar|sim|ok|pode gerar|pronto|pode|vamos|está bom|está ok|vai|confirmo|confirmado|pode criar|pode fazer|pode começar)/i.test(userMessage);
    
    // ✅ Contar mensagens do usuário (incluindo a atual que está sendo processada)
    const userMessagesCount = conversationHistory.filter(msg => msg.sender_type === 'user').length + 1; // +1 porque ainda não foi adicionada ao histórico
    const isFirstUserResponse = userMessagesCount === 1;
    const isSecondUserResponse = userMessagesCount === 2;
    
    // ✅ Verificar se já teve resposta do usuário após as perguntas iniciais
    const hasUserResponseAfterQuestions = conversationHistory.length >= 3 && 
      conversationHistory.some((msg, idx) => 
        idx > 0 && 
        msg.sender_type === 'user' && 
        !msg.content.includes('Quero criar:')
      );

    // ✅ NOVO: Verificar se há dados completos extraídos do prompt inicial
    // ✅ Não exige company_name se tiver business_type (empresa pode não ter nome específico)
    const hasCompleteProjectData = !!(
      (projectData.company_name || projectData.business_type) && // ✅ Aceita qualquer um dos dois
      (projectData.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0) &&
      projectData.design_style
    );
    
    console.log('🔍 [Claude-Chat] Verificando dados completos:', {
      hasCompanyName: !!projectData.company_name,
      hasBusinessType: !!projectData.business_type,
      hasPages: !!(projectData.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0),
      hasStyle: !!projectData.design_style,
      hasCompleteProjectData
    });

    // ✅ Se tem dados completos na primeira mensagem, é prompt completo - gerar direto
    const isCompletePrompt = isFirstUserResponse && hasCompleteProjectData;
    
    // Construir contexto da conversa
    const conversationContext = conversationHistory
      .slice(-10) // Últimas 10 mensagens para contexto
      .map(msg => `${msg.sender_type === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n');

    // ✅ Verificar o que falta para gerar o site (ANTES de construir o prompt)
    const missingData: string[] = [];
    if (!projectData.company_name && !projectData.business_type) {
      missingData.push('nome da empresa ou tipo de negócio');
    }
    if (!projectData.pages_needed || !Array.isArray(projectData.pages_needed) || projectData.pages_needed.length === 0) {
      missingData.push('páginas/seções do site');
    }
    if (!projectData.design_style) {
      missingData.push('tema/estilo visual');
    }
    // ✅ hasMinimumData: aceita company_name OU business_type (não precisa dos dois)
    const hasMinimumData = (projectData.company_name || projectData.business_type) && 
      projectData.pages_needed && 
      Array.isArray(projectData.pages_needed) && 
      projectData.pages_needed.length > 0;

    // Construir contexto do projeto
    const projectContext: string[] = [];
    if (projectData.company_name) projectContext.push(`Empresa: ${projectData.company_name}`);
    if (projectData.business_type) projectContext.push(`Setor: ${projectData.business_type}`);
    if (projectData.pages_needed) projectContext.push(`Páginas: ${Array.isArray(projectData.pages_needed) ? projectData.pages_needed.join(', ') : projectData.pages_needed}`);
    if (projectData.design_style) projectContext.push(`Estilo: ${projectData.design_style}`);
    if (hasLogo) projectContext.push('Logo: Sim');
    
    // ✅ Construir mensagem sobre dados faltantes
    const missingDataMessage = missingData.length > 0 
      ? `\n\n⚠️ **DADOS NECESSÁRIOS PARA GERAR:**\nPara gerar seu site, ainda preciso de:\n${missingData.map(item => `- ${item}`).join('\n')}\n\nPode me informar essas informações?`
      : '';

    const systemPrompt = `Você é um assistente especializado em criação de sites da WZ Solution.

Sua função é ajudar o usuário a criar um site profissional através de uma conversa amigável e objetiva.

CONTEXTO DO PROJETO:
${projectContext.length > 0 ? projectContext.join('\n') : 'Projeto em estágio inicial'}

FASE ATUAL: ${phase}
ESTÁGIO: ${stage}

DADOS DISPONÍVEIS:
${hasCompleteProjectData ? '✅ TEM TODOS OS DADOS NECESSÁRIOS - PODE GERAR O SITE' : `⚠️ FALTAM DADOS: ${missingData.join(', ')}`}

INSTRUÇÕES:
- Seja amigável e profissional
${(isCompletePrompt || hasCompleteProjectData) && !userConfirmed ? `- IMPORTANTE: O usuário forneceu um prompt COMPLETO com todas as informações necessárias. Você DEVE mostrar um resumo DETALHADO das informações extraídas e pedir confirmação ANTES de gerar.

Use EXATAMENTE estas informações extraídas:
${projectData.company_name ? `🏢 **Empresa:** ${projectData.company_name}` : ''}
${projectData.business_type ? `🏢 **Tipo de Negócio:** ${projectData.business_type}` : ''}
${projectData.business_sector && projectData.business_sector !== projectData.business_type ? `📂 **Setor:** ${projectData.business_sector}` : ''}
${projectData.pages_needed && Array.isArray(projectData.pages_needed) ? `📄 **Páginas:** ${projectData.pages_needed.join(', ')}` : ''}
${projectData.design_style ? `🎨 **Estilo Visual:** ${projectData.design_style}` : ''}
${projectData.design_colors && Array.isArray(projectData.design_colors) ? `🎨 **Cores:** ${projectData.design_colors.join(', ')}` : ''}
${projectData.functionalities && Array.isArray(projectData.functionalities) ? `⚙️ **Funcionalidades:** ${projectData.functionalities.join(', ')}` : ''}
${projectData.business_objective ? `🎯 **Objetivo:** ${projectData.business_objective}` : ''}
${projectData.target_audience ? `👥 **Público-alvo:** ${projectData.target_audience}` : ''}
${projectData.slogan ? `💬 **Slogan:** "${projectData.slogan}"` : ''}

Formato da resposta:
"📋 **CONFIRMAÇÃO DAS INFORMAÇÕES**

Analisei seu pedido completo e extraí as seguintes informações:

[LISTAR TODAS AS INFORMAÇÕES ACIMA QUE ESTÃO DISPONÍVEIS]

✅ **Está tudo correto?** Se sim, diga "gerar", "ok" ou "pode gerar" para eu criar seu site agora!"

NÃO gere o site ainda - aguarde confirmação explícita do usuário.` : ''}
${(isCompletePrompt || hasCompleteProjectData) && userConfirmed ? '- IMPORTANTE: O usuário CONFIRMOU após fornecer um prompt completo. Agora você DEVE gerar o site. Informe que está gerando agora. Exemplo: "Perfeito! Vou gerar seu site agora com todas as especificações confirmadas. Isso pode levar alguns minutos..."' : ''}
${isFirstUserResponse && !isCompletePrompt && !hasCompleteProjectData ? '- Esta é a primeira mensagem do usuário. Confirme o recebimento e faça 2-3 perguntas básicas essenciais (nome da empresa, tipo de negócio, principais funcionalidades desejadas)' : ''}
${isSecondUserResponse && !hasMinimumData ? `- O usuário respondeu, mas ainda faltam informações. Liste claramente o que falta: ${missingData.join(', ')}. Seja específico e peça essas informações.` : ''}
${isSecondUserResponse && hasMinimumData ? '- O usuário já respondeu suas perguntas e TEM DADOS SUFICIENTES. Agora confirme brevemente as informações e informe que o site será gerado. NÃO faça mais perguntas, apenas confirme e inicie a geração.' : ''}
${userConfirmed && !hasMinimumData ? `- O usuário pediu para gerar, mas AINDA FALTAM DADOS: ${missingData.join(', ')}. Explique educadamente que precisa dessas informações antes de gerar e liste o que falta especificamente.` : ''}
- Use markdown para formatação quando apropriado (**negrito**, listas, etc.)
- Seja conciso mas completo
${hasUserResponseAfterQuestions && hasMinimumData ? '- IMPORTANTE: O usuário já forneceu informações suficientes. Confirme brevemente e informe que o site será gerado agora.' : ''}
${hasUserResponseAfterQuestions && !hasMinimumData ? `- O usuário já interagiu, mas AINDA FALTAM: ${missingData.join(', ')}. Liste claramente o que precisa e peça essas informações.` : ''}`;

    const userPrompt = `Histórico da conversa:
${conversationContext || 'Primeira mensagem'}

Mensagem atual do usuário: ${userMessage}

${isSecondUserResponse || hasUserResponseAfterQuestions ? '✅ O usuário já respondeu suas perguntas. Confirme brevemente as informações coletadas e informe que o site será gerado agora. Exemplo: "Perfeito! Com base nas informações que você forneceu, vou gerar seu site agora. Isso pode levar alguns minutos..."' : 'Responda de forma natural e ajudando o usuário a avançar na criação do site.'}`;

    // Chamar Claude para gerar resposta
    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\n${userPrompt}`
        }
      ],
    });

    let aiResponse = '';
    if (response.content[0].type === 'text') {
      aiResponse = response.content[0].text;
    } else {
      aiResponse = 'Olá! Como posso ajudar você a criar seu site?';
    }

    // Determinar nextStage baseado na fase e resposta
    let nextStage = stage;
    let shouldGeneratePreview = false;
    
    // ✅ FLUXO SIMPLIFICADO PARA EVITAR LOOP:
    // 1. Primeira mensagem do usuário (prompt inicial) → IA pergunta informações básicas
    // 2. Segunda mensagem do usuário (resposta às perguntas) → GERAR SITE automaticamente
    // 3. Se usuário confirmou explicitamente → GERAR SITE (mesmo na primeira mensagem)
    
    console.log('🔍 [Claude-Chat] Verificando condições:', {
      userMessagesCount,
      isFirstUserResponse,
      isSecondUserResponse,
      hasUserResponseAfterQuestions,
      userConfirmed,
      conversationLength: conversationHistory.length
    });
    
    // ✅ NOVO FLUXO: Quando tem dados completos, mostrar confirmação e aguardar OK
    if (isCompletePrompt || (hasMinimumData && hasCompleteProjectData)) {
      // ✅ Tem dados completos → Mostrar confirmação e aguardar OK do usuário
      if (userConfirmed) {
        // ✅ Usuário confirmou → GERAR SITE AGORA
        nextStage = 2;
        shouldGeneratePreview = true;
        console.log('✅ [Claude-Chat] Dados completos + usuário confirmou - gerando site agora!', {
          company_name: projectData.company_name,
          business_type: projectData.business_type,
          pages_count: Array.isArray(projectData.pages_needed) ? projectData.pages_needed.length : 0,
          has_style: !!projectData.design_style
        });
      } else {
        // ✅ Tem dados mas usuário ainda não confirmou → Mostrar confirmação e aguardar OK
        nextStage = 1;
        shouldGeneratePreview = false;
        console.log('📋 [Claude-Chat] Dados completos detectados - mostrando confirmação e aguardando OK do usuário', {
          company_name: projectData.company_name,
          business_type: projectData.business_type,
          pages_count: Array.isArray(projectData.pages_needed) ? projectData.pages_needed.length : 0,
          has_style: !!projectData.design_style
        });
      }
    } else if (isFirstUserResponse && !userConfirmed) {
      // Primeira mensagem sem confirmação e sem dados completos - IA vai fazer perguntas básicas
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('📝 [Claude-Chat] Primeira mensagem simples - IA vai fazer perguntas');
    } else if (isSecondUserResponse || hasUserResponseAfterQuestions || userConfirmed) {
      // ✅ Segunda mensagem OU usuário confirmou → Verificar se tem dados suficientes
      if (hasMinimumData) {
        // Tem dados suficientes → GERAR SITE
        nextStage = 2;
        shouldGeneratePreview = true;
        console.log('✅ [Claude-Chat] Deve gerar preview agora!', {
          isSecondUserResponse,
          hasUserResponse: hasUserResponseAfterQuestions,
          userConfirmed,
          conversationLength: conversationHistory.length
        });
      } else {
        // Não tem dados suficientes → Informar o que falta
        nextStage = 1;
        shouldGeneratePreview = false;
        console.log('⚠️ [Claude-Chat] Dados insuficientes para gerar:', missingData);
      }
    } else {
      // Ainda coletando informações (não deveria chegar aqui com a lógica simplificada)
      nextStage = stage;
      shouldGeneratePreview = false;
      console.log('⚠️ [Claude-Chat] Ainda coletando informações');
    }

    // Extrair sugestões da resposta do Claude ou usar padrões
    let suggestedOptions: string[] = [];
    
    // ✅ Se tem dados completos mas usuário não confirmou, sugerir opções de confirmação
    if ((isCompletePrompt || hasCompleteProjectData) && !userConfirmed) {
      suggestedOptions = ['✅ Sim, pode gerar', '📝 Quero ajustar algo'];
    } else {
      // Tentar extrair opções da resposta (se o Claude sugerir)
      const optionsMatch = aiResponse.match(/[-•]\s*([^\n]+)/g);
      if (optionsMatch && optionsMatch.length <= 4) {
        suggestedOptions = optionsMatch.slice(0, 4).map(opt => opt.replace(/[-•]\s*/, '').trim());
      } else {
        // Opções padrão baseadas no estágio
        switch (phase) {
          case 'technical':
            suggestedOptions = ['Vou informar', 'Escolher depois'];
            break;
          case 'visual':
            suggestedOptions = ['Definir cores', 'Usar logo'];
            break;
          case 'content':
            suggestedOptions = ['Gerar textos', 'Escrever depois'];
            break;
          case 'ready':
            suggestedOptions = ['Gerar site', 'Revisar'];
            break;
          default:
            suggestedOptions = ['Continuar'];
        }
      }
    }

    const extractedData: Record<string, unknown> = {
      company_name: company,
      has_logo: hasLogo,
      use_logo_colors: useBrand,
    };

    const result = {
      response: aiResponse.trim(),
      nextStage,
      shouldGenerateImages: false,
      shouldGeneratePreview,
      suggestedOptions,
      allowFreeText: true,
      previewStage: undefined,
      userConfirmed,
      extractedData,
    };

    console.log('✅ [Claude-Chat] Resposta gerada:', {
      responseLength: result.response.length,
      nextStage: result.nextStage,
      phase,
      hasAllData: !!(projectData.company_name && projectData.business_type && projectData.pages_needed && projectData.design_style)
    });

    return result;
  } catch (error) {
    console.error('❌ [Claude-Chat] Erro interno:', error);
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

