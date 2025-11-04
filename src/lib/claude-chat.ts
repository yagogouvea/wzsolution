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

    // ✅ Verificar confirmação do usuário PRIMEIRO
    const userConfirmed = /gerar|sim|ok|pode gerar|pronto|pode|vamos|está bom|está ok|pode|vai|go/i.test(userMessage);
    
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
    
    // Construir contexto da conversa
    const conversationContext = conversationHistory
      .slice(-10) // Últimas 10 mensagens para contexto
      .map(msg => `${msg.sender_type === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n');

    // Construir contexto do projeto
    const projectContext: string[] = [];
    if (projectData.company_name) projectContext.push(`Empresa: ${projectData.company_name}`);
    if (projectData.business_type) projectContext.push(`Setor: ${projectData.business_type}`);
    if (projectData.pages_needed) projectContext.push(`Páginas: ${Array.isArray(projectData.pages_needed) ? projectData.pages_needed.join(', ') : projectData.pages_needed}`);
    if (projectData.design_style) projectContext.push(`Estilo: ${projectData.design_style}`);
    if (hasLogo) projectContext.push('Logo: Sim');
    
    const systemPrompt = `Você é um assistente especializado em criação de sites da WZ Solution.

Sua função é ajudar o usuário a criar um site profissional através de uma conversa amigável e objetiva.

CONTEXTO DO PROJETO:
${projectContext.length > 0 ? projectContext.join('\n') : 'Projeto em estágio inicial'}

FASE ATUAL: ${phase}
ESTÁGIO: ${stage}

INSTRUÇÕES:
- Seja amigável e profissional
${isFirstUserResponse ? '- Esta é a primeira mensagem do usuário. Confirme o recebimento e faça 2-3 perguntas básicas essenciais (nome da empresa, tipo de negócio, principais funcionalidades desejadas)' : ''}
${isSecondUserResponse ? '- O usuário já respondeu suas perguntas. Agora confirme brevemente as informações e informe que o site será gerado. NÃO faça mais perguntas, apenas confirme e inicie a geração.' : ''}
- Use markdown para formatação quando apropriado (**negrito**, listas, etc.)
- Seja conciso mas completo
${hasUserResponseAfterQuestions || userConfirmed ? '- IMPORTANTE: O usuário já forneceu informações suficientes. Confirme brevemente e informe que o site será gerado agora.' : ''}`;

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
    
    if (isFirstUserResponse && !userConfirmed) {
      // Primeira mensagem sem confirmação - IA vai fazer perguntas básicas
      nextStage = 1;
      shouldGeneratePreview = false;
      console.log('📝 [Claude-Chat] Primeira mensagem - IA vai fazer perguntas');
    } else if (isSecondUserResponse || hasUserResponseAfterQuestions || userConfirmed) {
      // ✅ Segunda mensagem OU usuário confirmou → GERAR SITE
      nextStage = 2;
      shouldGeneratePreview = true;
      console.log('✅ [Claude-Chat] Deve gerar preview agora!', {
        isSecondUserResponse,
        hasUserResponse: hasUserResponseAfterQuestions,
        userConfirmed,
        conversationLength: conversationHistory.length
      });
    } else {
      // Ainda coletando informações (não deveria chegar aqui com a lógica simplificada)
      nextStage = stage;
      shouldGeneratePreview = false;
      console.log('⚠️ [Claude-Chat] Ainda coletando informações');
    }

    // Extrair sugestões da resposta do Claude ou usar padrões
    let suggestedOptions: string[] = [];
    
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

