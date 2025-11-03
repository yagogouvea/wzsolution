import { NextResponse } from "next/server";
import { generateSiteWithClaude } from "@/lib/claude";
import { DatabaseService } from "@/lib/supabase";
import { moderateMessage } from "@/lib/message-moderation";
import { logger } from "@/lib/logger";

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

    // Extrair conversationId
    const conversationId = body.conversationId;
    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: "conversationId é obrigatório" },
        { status: 400 }
      );
    }

    // Construir prompt detalhado com TODOS os dados do formulário
    let prompt = '';
    
    if (body.additionalPrompt || body.prompt) {
      // Se tem prompt customizado, usa ele
      prompt = body.additionalPrompt || body.prompt;
    } else {
      // Construir prompt estruturado com TODAS as informações
      const sections = [];
      
      sections.push(`📋 **DADOS DO PROJETO:**`);
      if (body.companyName) sections.push(`- Empresa: ${body.companyName}`);
      if (body.businessSector) sections.push(`- Setor/Ramo: ${body.businessSector}`);
      if (body.businessObjective) sections.push(`- Objetivo: ${body.businessObjective}`);
      if (body.designStyle) sections.push(`- Tema Visual: ${body.designStyle}`);
      if (body.designColors && body.designColors.length > 0) {
        sections.push(`- Cores: ${body.designColors.join(', ')}`);
      }
      if (body.logoUrl) sections.push(`- Logo: Sim (URL disponível)`);
      
      if (body.pagesNeeded && body.pagesNeeded.length > 0) {
        sections.push(`\n🏗️ **ESTRUTURA DO SITE:**`);
        sections.push(`- Páginas/Seções: ${body.pagesNeeded.join(', ')}`);
      }
      
      if (body.functionalities && body.functionalities.length > 0) {
        sections.push(`\n⚙️ **FUNCIONALIDADES:**`);
        body.functionalities.forEach((func: string) => {
          sections.push(`- ${func}`);
        });
      }
      
      if (body.logoAnalysis) {
        sections.push(`\n🎨 **ANÁLISE DO LOGO:**`);
        if (body.logoAnalysis.style) sections.push(`- Estilo: ${body.logoAnalysis.style}`);
        if (body.logoAnalysis.colors?.dominant) {
          sections.push(`- Cores dominantes: ${body.logoAnalysis.colors.dominant.join(', ')}`);
        }
      }
      
      if (body.tone) {
        sections.push(`\n✍️ **TOM DE VOZ:** ${body.tone}`);
      }
      
      prompt = sections.join('\n');
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
            initial_prompt: prompt,
            project_type: body.projectType || 'site',
            status: 'active'
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
        console.log(`✅ [generate-ai-site] Versão ${newVersion} salva com ID: ${savedVersionId}`);
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

