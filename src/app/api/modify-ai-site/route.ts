import { NextResponse } from "next/server";
import { modifySiteWithClaude } from "@/lib/claude";
import { DatabaseService } from "@/lib/supabase";
import { moderateMessage } from "@/lib/message-moderation";

// ✅ Configurar timeout maior para modificações (streaming pode demorar)
export const maxDuration = 60; // 60 segundos (Vercel permite até 60s em Pro)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('📥 [modify-ai-site] Requisição recebida');
    
    const body = await req.json();
    const { conversationId, modification, currentVersionId, imageData } = body;

    console.log('📋 [modify-ai-site] Dados recebidos:', {
      hasConversationId: !!conversationId,
      hasModification: !!modification,
      modificationLength: modification?.length || 0,
      hasCurrentVersionId: !!currentVersionId,
      hasImageData: !!imageData
    });

    if (!conversationId || !modification) {
      console.error('❌ [modify-ai-site] Dados obrigatórios faltando');
      return NextResponse.json(
        { ok: false, error: "conversationId e modification são obrigatórios" },
        { status: 400 }
      );
    }

    // 🔒 VALIDAÇÃO E MODERAÇÃO NO BACKEND
    try {
      const moderation = moderateMessage(modification);
      if (!moderation.allowed) {
        console.log('🚫 [modify-ai-site] Mensagem bloqueada por moderação');
        return NextResponse.json(
          { 
            ok: false, 
            error: moderation.reason || "Mensagem não permitida",
            moderated: true
          },
          { status: 403 }
        );
      }
    } catch (modError) {
      console.error('❌ [modify-ai-site] Erro na moderação:', modError);
      // Continuar mesmo se moderação falhar (não bloquear por isso)
    }

    console.log('🖼️ [modify-ai-site] Image data recebido:', imageData ? 'Sim' : 'Não');

    // Buscar código atual usando getLatestSiteVersion
    let currentCode = "";
    
    try {
      // ✅ currentVersionId pode ser um UUID de versão OU um conversationId (previewId fixo)
      // Verificar se é UUID válido primeiro
      const isUUID = currentVersionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentVersionId);
      
      if (currentVersionId && isUUID) {
        // Tentar buscar como ID de versão específica
        console.log('🔍 [modify-ai-site] Tentando buscar versão pelo UUID:', currentVersionId);
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: versionData, error: versionError } = await supabase
          .from("site_versions")
          .select("site_code")
          .eq("id", currentVersionId)
          .maybeSingle(); // ✅ Usar maybeSingle() em vez de single() para não dar erro se não encontrar

        if (versionError) {
          console.error('❌ [modify-ai-site] Erro ao buscar versão específica:', versionError);
        }

        if (versionData?.site_code) {
          currentCode = versionData.site_code;
          console.log('✅ [modify-ai-site] Código encontrado via versão específica:', currentCode.length, 'chars');
        } else {
          console.log('⚠️ [modify-ai-site] Versão UUID não encontrada, buscando última versão...');
        }
      }

      // ✅ Sempre buscar última versão pela conversationId (mesmo que tenha tentado UUID antes)
      // Isso garante que funciona tanto com UUID quanto com conversationId (previewId fixo)
      if (!currentCode) {
        console.log('🔍 [modify-ai-site] Buscando última versão para conversationId:', conversationId);
        const latestVersion = await DatabaseService.getLatestSiteVersion(conversationId);
        if (latestVersion?.site_code) {
          currentCode = latestVersion.site_code;
          console.log('✅ [modify-ai-site] Código encontrado via última versão:', currentCode.length, 'chars');
        } else {
          console.warn('⚠️ [modify-ai-site] Nenhuma versão encontrada para conversationId:', conversationId);
        }
      }
    } catch (dbError) {
      console.error('❌ [modify-ai-site] Erro ao buscar código do banco:', dbError);
      return NextResponse.json(
        { ok: false, error: `Erro ao buscar código: ${dbError instanceof Error ? dbError.message : 'Erro desconhecido'}` },
        { status: 500 }
      );
    }

    if (!currentCode || currentCode.length < 100) {
      console.error('❌ [modify-ai-site] Código não encontrado ou muito curto:', currentCode?.length || 0);
      return NextResponse.json(
        { ok: false, error: "Código do site não encontrado. Gere o site primeiro." },
        { status: 404 }
      );
    }
    
    console.log('✅ [modify-ai-site] Código atual carregado:', currentCode.length, 'chars');

    // ✅ Buscar contexto completo: dados do projeto + histórico de conversa + prompt inicial
    let config = undefined;
    let conversationContext = '';
    
    try {
      console.log('🔍 [modify-ai-site] Buscando contexto completo...');
      
      // 1. Buscar dados do projeto
      const projectData = await DatabaseService.getProjectData(conversationId);
      
      // 2. Buscar conversa para pegar prompt inicial
      const conversation = await DatabaseService.getConversation(conversationId);
      
      // 3. Buscar histórico de mensagens (últimas 10 para contexto)
      const allMessages = await DatabaseService.getMessages(conversationId);
      const recentMessages = allMessages.slice(-10); // Últimas 10 mensagens
      
      // 4. Buscar histórico de modificações das versões anteriores
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: previousVersions } = await supabase
        .from("site_versions")
        .select("version_number, modification_description, created_at")
        .eq("conversation_id", conversationId)
        .order("version_number", { ascending: false })
        .limit(5); // Últimas 5 modificações
      
      // Construir contexto completo
      const contextParts: string[] = [];
      
      // Prompt inicial
      if (conversation?.initial_prompt) {
        contextParts.push(`📋 PROMPT INICIAL DO SITE:\n"${conversation.initial_prompt}"`);
      }
      
      // Dados do projeto
      if (projectData) {
        config = {
          companyName: projectData.company_name || "",
          businessSector: projectData.business_type || "",
          businessObjective: projectData.business_objective || "",
          designStyle: projectData.design_style || "",
          designColors: projectData.design_colors || [],
          pagesNeeded: projectData.pages_needed || [],
          functionalities: projectData.functionalities || [],
          tone: "profissional",
        };
        
        if (projectData.company_name) contextParts.push(`🏢 Empresa: ${projectData.company_name}`);
        if (projectData.business_type) contextParts.push(`📊 Setor: ${projectData.business_type}`);
        if (projectData.design_style) contextParts.push(`🎨 Estilo: ${projectData.design_style}`);
        if (projectData.design_colors && projectData.design_colors.length > 0) {
          contextParts.push(`🎨 Cores: ${Array.isArray(projectData.design_colors) ? projectData.design_colors.join(', ') : projectData.design_colors}`);
        }
      }
      
      // Histórico de modificações anteriores
      if (previousVersions && previousVersions.length > 0) {
        contextParts.push(`\n📝 MODIFICAÇÕES ANTERIORES:`);
        previousVersions.reverse().forEach((v, idx) => {
          if (v.modification_description) {
            contextParts.push(`${idx + 1}. ${v.modification_description}`);
          }
        });
      }
      
      // Histórico recente de conversa (últimas mensagens relevantes)
      if (recentMessages.length > 0) {
        const relevantMessages = recentMessages
          .filter(m => m.sender_type === 'user' && m.content.length > 20)
          .slice(-3); // Últimas 3 mensagens do usuário
        
        if (relevantMessages.length > 0) {
          contextParts.push(`\n💬 CONTEXTO DA CONVERSA:`);
          relevantMessages.forEach((m, idx) => {
            contextParts.push(`- Usuário: "${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}"`);
          });
        }
      }
      
      conversationContext = contextParts.join('\n');
      console.log('✅ [modify-ai-site] Contexto completo carregado:', {
        hasProjectData: !!projectData,
        hasConversation: !!conversation,
        messagesCount: recentMessages.length,
        versionsCount: previousVersions?.length || 0
      });
    } catch (configError) {
      console.error('❌ [modify-ai-site] Erro ao buscar contexto:', configError);
      // Continuar sem contexto se falhar
    }

    // Modificar layout com Claude
    console.log('🤖 [modify-ai-site] Chamando Claude para modificar...');
    let modifiedCode: string;
    try {
      modifiedCode = await modifySiteWithClaude(
        currentCode,
        modification,
        config ? {
          companyName: config.companyName,
          businessSector: config.businessSector,
          designStyle: config.designStyle
        } : undefined,
        imageData, // Passar dados da imagem
        conversationContext // ✅ Passar contexto completo da conversa
      );
      console.log('✅ [modify-ai-site] Código modificado recebido:', modifiedCode?.length || 0, 'chars');
    } catch (claudeError) {
      console.error('❌ [modify-ai-site] Erro ao chamar Claude:', claudeError);
      return NextResponse.json(
        { 
          ok: false, 
          error: `Erro ao modificar com Claude: ${claudeError instanceof Error ? claudeError.message : 'Erro desconhecido'}` 
        },
        { status: 500 }
      );
    }

    if (!modifiedCode || modifiedCode.length < 100) {
      console.error('❌ [modify-ai-site] Código modificado inválido ou muito curto:', modifiedCode?.length || 0);
      return NextResponse.json(
        { ok: false, error: "Falha ao modificar o site. O código retornado está vazio ou inválido." },
        { status: 500 }
      );
    }

    if (modifiedCode === currentCode) {
      console.warn('⚠️ [modify-ai-site] Código não foi modificado (igual ao anterior)');
      return NextResponse.json(
        { ok: false, error: "Falha ao modificar o site. Tente uma descrição mais específica." },
        { status: 500 }
      );
    }

    // Salvar nova versão no Supabase
    console.log('💾 [modify-ai-site] Salvando nova versão no banco...');
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: lastVersion, error: lastVersionError } = await supabase
        .from("site_versions")
        .select("version_number")
        .eq("conversation_id", conversationId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastVersionError) {
        console.error('❌ [modify-ai-site] Erro ao buscar última versão:', lastVersionError);
      }

      const versionNumber = lastVersion ? lastVersion.version_number + 1 : 1;
      console.log('📝 [modify-ai-site] Nova versão será:', versionNumber);

      const { data: versionData, error: saveError } = await supabase
        .from("site_versions")
        .insert({
          conversation_id: conversationId,
          version_number: versionNumber,
          site_code: modifiedCode,
          modification_description: modification
        })
        .select("id")
        .single();

      if (saveError) {
        console.error("❌ [modify-ai-site] Erro ao salvar versão:", saveError);
        return NextResponse.json(
          { ok: false, error: `Erro ao salvar versão: ${saveError.message}` },
          { status: 500 }
        );
      }

      console.log('✅ [modify-ai-site] Versão salva com sucesso:', versionData?.id);

      // ✅ RETORNAR O MESMO PREVIEW ID (conversationId) PARA MANTER O MESMO LINK
      // A API /preview-html/[siteId] já busca automaticamente a última versão quando não encontra pelo ID exato
      // Isso permite que o preview seja atualizado sem mudar o link
      const previewId = conversationId; // Sempre usar conversationId como preview ID fixo
      
      // ✅ Adicionar timestamp para forçar atualização do preview
      const previewTimestamp = Date.now();

      return NextResponse.json({
        ok: true,
        message: "✅ Site modificado com sucesso via Claude!",
        siteCode: modifiedCode,
        code: modifiedCode,
        versionId: versionData?.id || null, // Manter para histórico
        previewId: previewId, // ✅ ID fixo do preview (sempre o mesmo)
        previewTimestamp: previewTimestamp, // ✅ Timestamp para forçar atualização
        previewUrl: `/preview/${previewId}`, // ✅ SEMPRE o mesmo link
        versionNumber: versionNumber, // ✅ Número da versão para referência
      });
    } catch (saveError) {
      console.error("❌ [modify-ai-site] Erro ao salvar no banco:", saveError);
      return NextResponse.json(
        { ok: false, error: `Erro ao salvar: ${saveError instanceof Error ? saveError.message : 'Erro desconhecido'}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("❌ [modify-ai-site] Erro geral:", error);
    console.error("❌ [modify-ai-site] Stack:", error instanceof Error ? error.stack : 'N/A');
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

