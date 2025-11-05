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

    // ✅ Contar mensagens do usuário (incluindo a atual que está sendo processada)
    const userMessagesCount = conversationHistory.filter(msg => msg.sender_type === 'user').length + 1; // +1 porque ainda não foi adicionada ao histórico
    const isFirstUserResponse = userMessagesCount === 1;
    
    // ✅ Verificar confirmação do usuário - NUNCA considerar primeira mensagem como confirmação
    // A primeira mensagem é sempre o prompt inicial, não uma confirmação
    let userConfirmed = false;
    if (!isFirstUserResponse) {
      // ✅ Apenas após a primeira mensagem, verificar confirmação
      // Tornar mais restritivo - apenas mensagens curtas e diretas de confirmação
      const trimmedMessage = userMessage.trim().toLowerCase();
      const isShortConfirmation = trimmedMessage.length < 50; // Confirmações são curtas
      
      // ✅ Padrão específico para confirmações explícitas (incluindo "ok ok")
      const exactConfirmationPattern = /^(gerar|sim|ok|pode gerar|pronto|está bom|está ok|confirmo|confirmado|pode criar|pode fazer|pode começar|tudo certo|pode ir|vamos lá|ok ok|okay|okay okay)$/i;
      
      // ✅ Detectar confirmações repetidas (ex: "ok ok", "sim sim")
      const repeatedConfirmation = /^(ok|sim|gerar|pronto|pode)\s+(ok|sim|gerar|pronto|pode)$/i.test(trimmedMessage);
      
      userConfirmed = isShortConfirmation && (exactConfirmationPattern.test(trimmedMessage) || repeatedConfirmation);
      
      // ✅ Também verificar se a mensagem contém palavras de confirmação no contexto de uma frase curta
      if (!userConfirmed && isShortConfirmation) {
        const hasConfirmationWords = /(sim|ok|gerar|pronto|pode|confirmo|tudo certo)/i.test(trimmedMessage);
        const hasNegativeWords = /(não|nao|nada|cancelar|desistir|parar)/i.test(trimmedMessage);
        userConfirmed = hasConfirmationWords && !hasNegativeWords;
      }
    }
    
    console.log('🔍 [Claude-Chat] Verificando confirmação:', {
      isFirstUserResponse,
      userMessage: userMessage.substring(0, 50),
      userConfirmed,
      messageLength: userMessage.length,
      trimmedMessage: userMessage.trim().toLowerCase()
    });
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

    // ✅ Nota: isCompletePrompt removido - agora sempre pedimos confirmação antes de gerar
    
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

⚠️ **REGRA CRÍTICA SOBRE ENTREGA:**
- NUNCA mencione "arquivo ZIP", "download", "arquivo completo" ou "entregar arquivo"
- O site é SEMPRE criado e exibido como PREVIEW/VISUALIZAÇÃO na própria plataforma
- Use termos como: "criar o site", "gerar o preview", "mostrar a visualização", "exibir o site"
- Exemplo CORRETO: "Vou gerar seu site agora e você poderá visualizá-lo em instantes!"
- Exemplo ERRADO: "Vou entregar seu site em um arquivo ZIP"

CONTEXTO DO PROJETO:
${projectContext.length > 0 ? projectContext.join('\n') : 'Projeto em estágio inicial'}

FASE ATUAL: ${phase}
ESTÁGIO: ${stage}

DADOS DISPONÍVEIS:
${hasCompleteProjectData ? '✅ TEM TODOS OS DADOS NECESSÁRIOS - PODE GERAR O SITE' : `⚠️ FALTAM DADOS: ${missingData.join(', ')}`}

INSTRUÇÕES:
- Seja amigável e profissional
${hasCompleteProjectData && !userConfirmed ? `- ⚠️ **REGRA CRÍTICA:** Você TEM todos os dados necessários, mas o usuário AINDA NÃO CONFIRMOU.
  
  Você DEVE:
  1. COMPILAR um resumo detalhado e organizado de TODAS as informações do projeto
  2. Apresentar esse resumo de forma clara e visual
  3. PERGUNTAR EXPLICITAMENTE se está tudo correto ANTES de gerar
  4. NUNCA dizer que está gerando ou criando o site - apenas que está COMPILANDO o projeto
  5. Aguardar confirmação explícita do usuário antes de gerar
  
  Use este formato:
  
  "📋 **COMPILAÇÃO DO PROJETO**
  
  Analisei todas as informações e compilei seu projeto com os seguintes detalhes:
  
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
  
  ---
  
  ✅ **Confirme se está tudo correto ou se quer ajustar algo:**
  - Se estiver tudo OK, diga "gerar", "ok" ou "pode gerar" para eu criar seu site
  - Se quiser alterar algo, me diga o que deseja ajustar"
  
  ⚠️ NUNCA diga "Vou gerar" ou "Gerando agora" - você está apenas COMPILANDO e aguardando confirmação!` : ''}
${hasCompleteProjectData && userConfirmed ? '- ✅ **IMPORTANTE:** O usuário CONFIRMOU explicitamente após você ter compilado o projeto. Agora SIM você DEVE gerar o site. Informe que está iniciando a geração e será exibido como PREVIEW na plataforma. Exemplo: "Perfeito! Recebi sua confirmação. Vou iniciar a geração do seu site agora... Isso pode levar alguns minutos. Você poderá visualizar o preview completo em instantes!" NUNCA mencione ZIP ou arquivo para download.' : ''}
${isFirstUserResponse && !hasCompleteProjectData ? '- Esta é a primeira mensagem do usuário. Confirme o recebimento e faça 2-3 perguntas básicas essenciais (nome da empresa, tipo de negócio, principais funcionalidades desejadas)' : ''}
${isSecondUserResponse && !hasMinimumData ? `- O usuário respondeu, mas ainda faltam informações. Liste claramente o que falta: ${missingData.join(', ')}. Seja específico e peça essas informações.` : ''}
${isSecondUserResponse && hasMinimumData && !hasCompleteProjectData ? '- O usuário respondeu suas perguntas e você TEM DADOS MÍNIMOS, mas ainda pode faltar algo. COMPILE um resumo do que tem até agora e pergunte se falta mais alguma coisa antes de poder gerar.' : ''}
${isSecondUserResponse && hasCompleteProjectData && !userConfirmed ? '- O usuário respondeu suas perguntas e você TEM TODOS OS DADOS. COMPILE um resumo completo e organizado e PERGUNTE EXPLICITAMENTE se está tudo correto antes de gerar. NÃO diga que está gerando - apenas compile e peça confirmação.' : ''}
${isSecondUserResponse && hasCompleteProjectData && userConfirmed ? '- O usuário respondeu suas perguntas, você compilou o projeto e ele CONFIRMOU. Agora SIM você DEVE iniciar a geração do site.' : ''}
${userConfirmed && !hasMinimumData ? `- O usuário pediu para gerar, mas AINDA FALTAM DADOS: ${missingData.join(', ')}. Explique educadamente que precisa dessas informações antes de gerar e liste o que falta especificamente.` : ''}
- Use markdown para formatação quando apropriado (**negrito**, listas, etc.)
- Seja conciso mas completo
${hasUserResponseAfterQuestions && hasCompleteProjectData && !userConfirmed ? '- IMPORTANTE: O usuário já forneceu informações e você TEM TODOS OS DADOS. COMPILE um resumo completo e PERGUNTE se está tudo correto. NÃO diga que está gerando - apenas compile e peça confirmação.' : ''}
${hasUserResponseAfterQuestions && hasCompleteProjectData && userConfirmed ? '- IMPORTANTE: O usuário já forneceu informações, você compilou o projeto e ele CONFIRMOU. Agora pode gerar o site.' : ''}
${hasUserResponseAfterQuestions && hasMinimumData && !hasCompleteProjectData ? '- O usuário já forneceu algumas informações. COMPILE o que tem até agora e pergunte se falta mais alguma coisa.' : ''}
${hasUserResponseAfterQuestions && !hasMinimumData ? `- O usuário já interagiu, mas AINDA FALTAM: ${missingData.join(', ')}. Liste claramente o que precisa e peça essas informações.` : ''}`;

    // ✅ Construir prompt do usuário baseado no estado atual
    let userPromptText = `Histórico da conversa:
${conversationContext || 'Primeira mensagem'}

Mensagem atual do usuário: ${userMessage}

`;
    
    if (hasCompleteProjectData && !userConfirmed) {
      userPromptText += `⚠️ ATENÇÃO: Você TEM todos os dados necessários, mas o usuário NÃO confirmou ainda. 
      
      Você DEVE:
      1. COMPILAR um resumo detalhado e organizado de TODAS as informações
      2. Apresentar de forma clara e visual
      3. PERGUNTAR EXPLICITAMENTE: "Está tudo correto? Se sim, diga 'gerar' ou 'ok' para eu criar seu site"
      4. NÃO diga que está gerando - apenas que compilou e está aguardando confirmação
      
      Formato: Apresente o resumo de forma organizada e peça confirmação clara.`;
    } else if (hasCompleteProjectData && userConfirmed) {
      userPromptText += `✅ O usuário CONFIRMOU após você ter compilado o projeto. Agora você DEVE iniciar a geração do site. Informe que está começando a criar o site agora.`;
    } else if (missingData.length > 0) {
      userPromptText += `⚠️ Ainda faltam informações: ${missingData.join(', ')}. Liste claramente o que falta e peça essas informações de forma amigável.`;
    } else if (isUserAddingInfo) {
      userPromptText += `📝 O usuário está adicionando ou modificando informações. COMPILE novamente o projeto completo com todas as informações atualizadas e peça confirmação novamente.`;
    } else {
      userPromptText += `Responda de forma natural e ajudando o usuário a avançar na criação do site.`;
    }
    
    const userPrompt = userPromptText;

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
    
    // ✅ FLUXO CORRETO: Sempre pedir confirmação antes de gerar
    // 1. Se tem dados completos E usuário confirmou → GERAR
    // 2. Se tem dados completos MAS usuário NÃO confirmou → PEDIR CONFIRMAÇÃO
    // 3. Se faltam dados → PERGUNTAR O QUE FALTA
    // 4. Se usuário enviou alterações → RECOMPILAR E PEDIR CONFIRMAÇÃO NOVAMENTE
    
    // ✅ Verificar se usuário está enviando alterações/adicionais (não é confirmação)
    // IMPORTANTE: Se userConfirmed é true, NÃO é adição de informações
    const isUserAddingInfo = !userConfirmed && !isFirstUserResponse && userMessage.length > 20;
    
    // ✅ Verificar se a IA já compilou anteriormente (procurar por "COMPILAÇÃO" no histórico)
    const hasPreviousCompilation = conversationHistory.some(msg => 
      msg.sender_type === 'ai' && 
      (msg.content.includes('COMPILAÇÃO') || 
       msg.content.includes('compilação') ||
       msg.content.includes('Confirme se está tudo correto'))
    );
    
    console.log('🔍 [Claude-Chat] Estado da conversa:', {
      hasCompleteProjectData,
      userConfirmed,
      isUserAddingInfo,
      hasPreviousCompilation,
      conversationLength: conversationHistory.length
    });
    
    if (hasCompleteProjectData && userConfirmed) {
      // ✅ CASO 1: Tem tudo E usuário confirmou → GERAR AGORA
      nextStage = 2;
      shouldGeneratePreview = true;
      console.log('✅ [Claude-Chat] Dados completos + confirmação explícita - GERANDO AGORA!', {
        company_name: projectData.company_name,
        business_type: projectData.business_type,
        pages_count: Array.isArray(projectData.pages_needed) ? projectData.pages_needed.length : 0,
        has_style: !!projectData.design_style,
        hasPreviousCompilation
      });
    } else if (hasCompleteProjectData && !userConfirmed && hasPreviousCompilation) {
      // ✅ CASO ESPECIAL: Tem tudo, já compilou antes, mas usuário ainda não confirmou → PEDIR CONFIRMAÇÃO (NÃO GERAR)
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('📋 [Claude-Chat] Dados completos + já compilou antes - aguardando confirmação (NÃO gerar ainda)', {
        company_name: projectData.company_name,
        business_type: projectData.business_type,
        pages_count: Array.isArray(projectData.pages_needed) ? projectData.pages_needed.length : 0,
        has_style: !!projectData.design_style
      });
    } else if (hasCompleteProjectData && !userConfirmed) {
      // ✅ CASO 2: Tem tudo MAS não confirmou → PEDIR CONFIRMAÇÃO (NÃO GERAR)
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('📋 [Claude-Chat] Dados completos - COMPILANDO e pedindo confirmação (NÃO gerar ainda)', {
        company_name: projectData.company_name,
        business_type: projectData.business_type,
        pages_count: Array.isArray(projectData.pages_needed) ? projectData.pages_needed.length : 0,
        has_style: !!projectData.design_style,
        isUserAddingInfo
      });
    } else if (isUserAddingInfo && hasMinimumData) {
      // ✅ CASO 3: Usuário está adicionando informações e já tem dados mínimos → RECOMPILAR E PEDIR CONFIRMAÇÃO
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('🔄 [Claude-Chat] Usuário adicionou informações - RECOMPILANDO e pedindo confirmação', {
        hasMinimumData,
        missingData
      });
    } else if (isFirstUserResponse && !hasCompleteProjectData) {
      // ✅ CASO 4: Primeira mensagem sem dados completos → PERGUNTAR O QUE FALTA
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('📝 [Claude-Chat] Primeira mensagem - perguntando informações faltantes:', missingData);
    } else if (missingData.length > 0) {
      // ✅ CASO 5: Ainda faltam dados → LISTAR O QUE FALTA
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('⚠️ [Claude-Chat] Ainda faltam dados - listando:', missingData);
    } else {
      // Fallback: coletando informações
      nextStage = stage;
      shouldGeneratePreview = false;
      console.log('⚠️ [Claude-Chat] Coletando informações');
    }

    // Extrair sugestões da resposta do Claude ou usar padrões
    let suggestedOptions: string[] = [];
    
    // ✅ Se tem dados completos mas usuário não confirmou, sugerir opções de confirmação
    if (hasCompleteProjectData && !userConfirmed) {
      suggestedOptions = ['✅ Sim, pode gerar', '📝 Quero ajustar algo'];
    } else if (hasCompleteProjectData && userConfirmed) {
      // Usuário confirmou - não precisa de opções, vai gerar
      suggestedOptions = [];
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
      shouldGeneratePreview: result.shouldGeneratePreview, // ✅ Log explícito
      phase,
      hasAllData: !!(projectData.company_name && projectData.business_type && projectData.pages_needed && projectData.design_style),
      userConfirmed: result.userConfirmed
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

