import { NextResponse } from "next/server";
import { generateSiteWithClaude } from "@/lib/claude";
import { DatabaseService } from "@/lib/supabase";
import { moderateMessage } from "@/lib/message-moderation";
import { logger } from "@/lib/logger";
import { generateProjectId } from "@/lib/project-limits";

// ✅ Função auxiliar para construir seção do histórico da conversa
function buildConversationHistorySection(conversationHistory: any[]): string {
  if (!conversationHistory || conversationHistory.length === 0) {
    return '';
  }

  // ✅ Filtrar apenas mensagens relevantes (ignorar confirmações simples)
  const relevantMessages = conversationHistory.filter(msg => {
    const content = msg.content?.trim().toLowerCase() || '';
    const isConfirmation = content.length < 20 && /^(gerar|sim|ok|pode gerar|pronto|pode|vamos|está bom|está ok|vai|confirmo|confirmado|pode criar|pode fazer|pode começar|tudo certo|pode ir|vamos lá)$/i.test(content);
    return !isConfirmation;
  });

  if (relevantMessages.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push(`\n💬 **HISTÓRICO DA CONVERSA E ALTERAÇÕES SOLICITADAS:**`);

  // ✅ Extrair mensagens do usuário com alterações/adicionais
  const userMessages = relevantMessages
    .filter(msg => msg.sender_type === 'user')
    .map((msg, idx) => {
      const content = msg.content || '';
      // Pular a primeira mensagem se for apenas o prompt inicial
      if (idx === 0 && content.toLowerCase().startsWith('quero criar:')) {
        return null;
      }
      return `[Usuário]: ${content}`;
    })
    .filter(Boolean);

  // ✅ Extrair respostas da IA que podem ter informações valiosas
  const aiMessages = relevantMessages
    .filter(msg => msg.sender_type === 'ai')
    .map(msg => {
      const content = msg.content || '';
      // Se a mensagem da IA contém "COMPILAÇÃO" ou menciona alterações, incluir
      if (content.includes('COMPILAÇÃO') ||
          content.includes('compilação') ||
          content.includes('alteração') ||
          content.includes('alterar') ||
          content.includes('ajustar')) {
        return `[IA - Compilação/Confirmação]: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
      }
      return null;
    })
    .filter(Boolean);

  // ✅ Combinar mensagens relevantes
  const allRelevantMessages = [...userMessages, ...aiMessages];

  if (allRelevantMessages.length > 0) {
    sections.push(`\n**Mensagens relevantes da conversa:**`);
    allRelevantMessages.forEach((msg, idx) => {
      if (msg) {
        sections.push(`${idx + 1}. ${msg}`);
      }
    });

    sections.push(`\n⚠️ **IMPORTANTE:** As alterações e informações adicionais mencionadas acima devem ser PRIORITÁRIAS sobre a solicitação original.`);
  }

  return sections.join('\n');
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    logger.info("🏗️ [generate-ai-site] Iniciando com Claude...");
    
    let body;
    try {
      body = await req.json();
      console.log("🏗️ [generate-ai-site] Body parseado:", Object.keys(body));
    } catch (parseError) {
      console.error("❌ [generate-ai-site] Erro ao parsear JSON:", parseError);
      return NextResponse.json(
        { ok: false, error: "JSON inválido no body" },
        { status: 400 }
      );
    }

    // Extrair conversationId e userId
    const conversationId = body.conversationId;
    const userId = body.userId || null; // ✅ Obter userId do body
    
    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversationId é obrigatório" },
        { status: 400 }
      );
    }

    // ✅ Log com IDs do projeto para facilitar busca
    const projectId = generateProjectId(conversationId);
    console.log("🆔 [generate-ai-site] IDs do projeto:", {
      projectId: projectId,
      conversationId: conversationId,
      userId: userId || 'não logado',
      previewUrl: `/preview/${conversationId}`,
      chatUrl: `/chat/${conversationId}`
    });

    // ✅ Buscar dados do projeto do banco para garantir que temos TODOS os dados
    let projectDataFromDB: any = null;
    try {
      projectDataFromDB = await DatabaseService.getProjectData(conversationId);
      console.log('📊 [generate-ai-site] Dados do projeto no banco:', {
        company_name: projectDataFromDB?.company_name,
        business_type: projectDataFromDB?.business_type,
        design_style: projectDataFromDB?.design_style,
        pages_needed: projectDataFromDB?.pages_needed,
        design_colors: projectDataFromDB?.design_colors,
        functionalities: projectDataFromDB?.functionalities
      });
    } catch (dbError) {
      console.warn('⚠️ [generate-ai-site] Erro ao buscar dados do banco:', dbError);
    }

    // ✅ Buscar histórico completo da conversa para incluir alterações
    let conversationHistory: any[] = [];
    try {
      conversationHistory = await DatabaseService.getMessages(conversationId);
      console.log('📚 [generate-ai-site] Histórico completo carregado:', conversationHistory.length, 'mensagens');
    } catch (historyError) {
      console.warn('⚠️ [generate-ai-site] Erro ao buscar histórico (continuando):', historyError);
    }

    // ✅ Construir prompt detalhado com TODOS os dados disponíveis + histórico
    // Prioridade: dados do banco > histórico da conversa > dados do body > prompt simples
    let prompt = '';
    
    // Se tem prompt customizado no body (pode já estar estruturado)
    if (body.prompt && body.prompt.includes('**HISTÓRICO') && body.prompt.includes('**DADOS')) {
      // Prompt já está estruturado e completo COM histórico - usar diretamente
      prompt = body.prompt;
      console.log('✅ [generate-ai-site] Usando prompt estruturado completo do body (com histórico)');
    } else if (body.prompt && body.prompt.includes('**DADOS') && body.prompt.includes('**IDENTIDADE')) {
      // Prompt está estruturado mas SEM histórico - adicionar histórico se houver
      prompt = body.prompt;
      
      // ✅ Adicionar histórico se disponível e não estiver no prompt
      if (conversationHistory && conversationHistory.length > 0 && !body.prompt.includes('**HISTÓRICO')) {
        const historySection = buildConversationHistorySection(conversationHistory);
        if (historySection) {
          // Inserir histórico antes dos dados do projeto
          const insertPosition = prompt.indexOf('**DADOS');
          if (insertPosition > 0) {
            prompt = prompt.substring(0, insertPosition) + historySection + '\n\n' + prompt.substring(insertPosition);
            console.log('✅ [generate-ai-site] Histórico adicionado ao prompt estruturado');
          }
        }
      }
    } else {
      // Construir prompt estruturado com TODAS as informações disponíveis
      const sections = [];
      
      // Prompt original (se houver)
      if (body.prompt || body.additionalPrompt) {
        sections.push(`💡 **SOLICITAÇÃO ORIGINAL:**\n${body.prompt || body.additionalPrompt}`);
      }
      
      sections.push(`\n📋 **DADOS DO PROJETO:**`);
      // Prioridade: banco > body
      const companyName = projectDataFromDB?.company_name || body.companyName;
      const businessSector = projectDataFromDB?.business_type || projectDataFromDB?.business_sector || body.businessSector;
      const businessObjective = projectDataFromDB?.business_objective || body.businessObjective;
      const designStyle = projectDataFromDB?.design_style || body.designStyle;
      const designColors = projectDataFromDB?.design_colors || body.designColors;
      const pagesNeeded = projectDataFromDB?.pages_needed || body.pagesNeeded;
      const functionalities = projectDataFromDB?.functionalities || body.functionalities;
      const targetAudience = projectDataFromDB?.target_audience || body.targetAudience;
      const shortDescription = projectDataFromDB?.short_description || body.shortDescription;
      const slogan = projectDataFromDB?.slogan || body.slogan;
      const ctaText = projectDataFromDB?.cta_text || body.ctaText;
      const siteStructure = projectDataFromDB?.site_structure || body.siteStructure;

      if (companyName) sections.push(`- Empresa: ${companyName}`);
      if (businessSector) sections.push(`- Setor/Ramo: ${businessSector}`);
      if (slogan) sections.push(`- Slogan: "${slogan}"`);
      if (businessObjective) sections.push(`- Objetivo: ${businessObjective}`);
      if (targetAudience) sections.push(`- Público-alvo: ${targetAudience}`);
      if (shortDescription) sections.push(`- Descrição: ${shortDescription}`);
      
      if (designStyle || designColors) {
        sections.push(`\n🎨 **IDENTIDADE VISUAL:**`);
        if (designStyle) sections.push(`- Tema Visual: ${designStyle}`);
        if (designColors && Array.isArray(designColors) && designColors.length > 0) {
          sections.push(`- Cores: ${designColors.join(', ')}`);
        }
      }
      
      if (body.logoUrl || projectDataFromDB?.logo_url) {
        sections.push(`- Logo: Sim (URL disponível)`);
      }
      
      if (pagesNeeded && Array.isArray(pagesNeeded) && pagesNeeded.length > 0) {
        sections.push(`\n🏗️ **ESTRUTURA DO SITE:**`);
        sections.push(`- Páginas/Seções: ${pagesNeeded.join(', ')}`);
        if (siteStructure) sections.push(`- Tipo: ${siteStructure}`);
      }
      
      if (functionalities && Array.isArray(functionalities) && functionalities.length > 0) {
        sections.push(`\n⚙️ **FUNCIONALIDADES:**`);
        functionalities.forEach((func: string) => {
          sections.push(`- ${func}`);
        });
      }
      
      if (body.logoAnalysis || projectDataFromDB?.logo_analysis) {
        sections.push(`\n🎨 **ANÁLISE DO LOGO:**`);
        let logoAnalysis = body.logoAnalysis;
        if (!logoAnalysis && projectDataFromDB?.logo_analysis) {
          try {
            logoAnalysis = typeof projectDataFromDB.logo_analysis === 'string'
              ? JSON.parse(projectDataFromDB.logo_analysis)
              : projectDataFromDB.logo_analysis;
          } catch (e) {
            // Ignorar erro
          }
        }
        if (logoAnalysis) {
          if (logoAnalysis.style) sections.push(`- Estilo: ${logoAnalysis.style}`);
          if (logoAnalysis.colors?.dominant) {
            sections.push(`- Cores dominantes: ${logoAnalysis.colors.dominant.join(', ')}`);
          }
        }
      }
      
      if (ctaText) {
        sections.push(`\n✍️ **CONTEÚDO:**`);
        sections.push(`- CTA: "${ctaText}"`);
      }
      
      // ✅ Adicionar histórico da conversa ANTES dos dados do projeto
      if (conversationHistory && conversationHistory.length > 0) {
        const historySection = buildConversationHistorySection(conversationHistory);
        if (historySection) {
          // Inserir histórico após a solicitação original
          const insertIndex = sections.findIndex(s => s.includes('**SOLICITAÇÃO ORIGINAL'));
          if (insertIndex >= 0) {
            sections.splice(insertIndex + 1, 0, historySection);
          } else {
            sections.unshift(historySection);
          }
        }
      }
      
      prompt = sections.join('\n');
      console.log('📋 [generate-ai-site] Prompt estruturado construído:', prompt.substring(0, 500) + '...');
    }

    // 🔒 VALIDAÇÃO E MODERAÇÃO DO PROMPT INICIAL
    const moderation = moderateMessage(prompt);
    if (!moderation.allowed) {
      return NextResponse.json(
        { 
          ok: false, 
          error: moderation.reason || "Prompt não permitido",
          moderated: true
        },
        { status: 403 }
      );
    }

    console.log("🤖 [generate-ai-site] Chamando Claude AI...");
    console.log("📝 Prompt completo:", prompt.substring(0, 500) + '...');
    const code = await generateSiteWithClaude(prompt);
    console.log("✅ [generate-ai-site] Site gerado com sucesso via Claude!");
    console.log("📏 [generate-ai-site] Tamanho do código:", code.length);
    console.log("📏 [generate-ai-site] Primeiros 200 chars:", code.substring(0, 200));
    
    // Verificar se código está vazio
    if (!code || code.trim().length === 0) {
      throw new Error("Código gerado está vazio!");
    }

    // ✅ Otimizado: Salvar código no Supabase de forma paralela e assíncrona
    let savedVersionId: string | null = null;
    
    // ✅ Retornar resposta IMEDIATAMENTE e salvar em background (não bloquear resposta)
    const saveToDatabase = async () => {
      try {
        console.log("💾 [generate-ai-site] Salvando código no Supabase (background)...");
        
        // ✅ Paralelizar queries quando possível
        const [conversation, projectData] = await Promise.all([
          DatabaseService.getConversation(conversationId).catch(() => null),
          DatabaseService.getProjectData(conversationId).catch(() => null)
        ]);
        
        if (!conversation) {
          await DatabaseService.createConversation({
            id: conversationId,
            user_id: userId || undefined, // ✅ Associar ao usuário se fornecido
            initial_prompt: prompt,
            project_type: body.projectType || 'site',
            status: 'active'
          });
        } else if (userId && !conversation.user_id) {
          // ✅ Se conversa existe mas não tem user_id, atualizar
          await DatabaseService.updateConversation(conversationId, {
            user_id: userId
          });
        }
        
        const currentVersion = projectData?.site_version || 0;
        const newVersion = currentVersion + 1;
        const siteCodeId = `site_${conversationId}_${Date.now()}`;

        // Salvar versão e atualizar project_data em paralelo
        const [siteVersion] = await Promise.all([
          DatabaseService.addSiteVersion({
            conversation_id: conversationId,
            version_number: newVersion,
            site_code: code,
            site_code_id: siteCodeId,
            modification_description: 'Site inicial gerado com Claude'
          }),
          DatabaseService.createProjectDataIfNotExists(conversationId, {
            site_version: newVersion
          })
        ]);

        savedVersionId = siteVersion.id;
        const projectIdForLog = generateProjectId(conversationId);
        console.log(`✅ [generate-ai-site] Versão ${newVersion} salva com sucesso!`, {
          versionId: savedVersionId,
          versionNumber: newVersion,
          projectId: projectIdForLog,
          conversationId: conversationId,
          previewUrl: `/preview/${conversationId}`
        });
      } catch (dbError) {
        console.error("⚠️ [generate-ai-site] Erro ao salvar no Supabase:", dbError);
        // Não bloquear - código já foi gerado
      }
    };
    
    // ✅ Executar em background (não bloquear resposta)
    saveToDatabase().catch(console.error);

    return NextResponse.json({
      ok: true,
      message: "✅ Site gerado com sucesso via Claude IA!",
      siteCode: code,
      code: code, // Compatibilidade
      versionId: savedVersionId, // Manter para histórico
      previewId: conversationId, // ✅ NOVO: ID fixo do preview (sempre o mesmo)
      previewUrl: `/preview/${conversationId}`, // ✅ SEMPRE o mesmo link (usa conversationId)
    });
  } catch (error) {
    console.error("❌ [generate-ai-site] Erro ao gerar site:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        ok: false, 
        error: errorMessage || "Erro desconhecido",
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}

