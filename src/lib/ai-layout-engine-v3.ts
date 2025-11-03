/**
 * 🚀 AI Layout Engine V3 - Sistema Livre e Inteligente
 * 
 * Geração de sites totalmente livre - IA decide TUDO baseado apenas no prompt
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// ✅ Não inicializar no nível do módulo - apenas quando necessário
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.');
  }
  return new OpenAI({ apiKey });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LayoutConfig {
  companyName: string;
  businessSector: string;
  businessObjective: string;
  designStyle: string;
  designColors: string[];
  logoUrl?: string;
  logoAnalysis?: any;
  pagesNeeded: string[];
  functionalities: string[];
  tone: string;
  additionalPrompt?: string;
  conversationId?: string;
}

/**
 * Gera site layout - IA decide TUDO
 */
export async function generateSiteLayout(config: LayoutConfig) {
  console.log('🏗️ [AI Engine V3] Starting FREE site generation...');
  
  // PROMPT TOTALMENTE LIVRE - sem nenhuma sugestão
  const prompt = `Você é um ESPECIALISTA PREMIUM em UI/UX e desenvolvimento React.

📋 PROMPT DO CLIENTE:
"${config.additionalPrompt || `Site para ${config.companyName} no setor ${config.businessSector}`}"

🎯 SUA MISSÃO:
Analise este prompt em DETALHES e crie um site COMPLETO, MODERNO e VISUALMENTE IMPRESSIONANTE.

Você é LIVRE para decidir:
- 🎨 Paleta de cores (escolha cores que façam sentido para este negócio)
- 📐 Layout e estrutura (crie algo único e adequado)
- 🖼️ Onde usar imagens (adicione {/* IMAGE_ANCHOR:hero */}, {/* IMAGE_ANCHOR:about */}, etc.)
- ✨ Estilo visual e identidade
- 📱 Responsividade (mobile-first)

📝 REQUISITOS TÉCNICOS:
- React/JSX + Tailwind CSS
- Totalmente responsivo (sm:, md:, lg:, xl: breakpoints)
- Use Framer Motion para animações sutis
- Importe ícones de react-icons quando necessário
- Código limpo, organizado e modular
- Mínimo 600 linhas de código

🎨 ADICIONE ÂNCORAS PARA IMAGENS:
Use estas âncoras onde quer que imagens sejam adicionadas:
- {/* IMAGE_ANCHOR:hero */} - Para imagem principal do hero
- {/* IMAGE_ANCHOR:about */} - Para imagem da seção sobre
- {/* IMAGE_ANCHOR:services_primary */} - Para primeira imagem de serviços
- {/* IMAGE_ANCHOR:gallery_1 */}, {/* IMAGE_ANCHOR:gallery_2 */}, {/* IMAGE_ANCHOR:gallery_3 */} - Para galeria

\`\`\`jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function Site() {
  return (
    <>
      {/* SEU CÓDIGO COMPLETO E RESPONSIVO AQUI */}
    </>
  );
}
\`\`\`

🚨 IMPORTANTE:
- Retorne APENAS código JSX - sem explicações
- Use sua criatividade e inteligência
- Crie algo único e impressionante

GERE O CÓDIGO AGORA!`;

  console.log('📝 [AI Engine V3] Prompt length:', prompt.length);
  
  // Chamar modelo configurado ou usar fallback automático
  let code = "";
  
  // Primeiro: Tentar modelo configurado manualmente (ex: OPENAI_MODEL=gpt-5 se existir)
  const configuredModel = process.env.OPENAI_MODEL;
  const fallbackModels = [
    { name: "gpt-4o", maxTokens: 16384 },
    { name: "gpt-4-turbo", maxTokens: 4096 },
    { name: "gpt-4", maxTokens: 4096 }
  ];
  
  // Se modelo configurado, tentar primeiro; senão começar com fallbacks
  const modelsToTry = configuredModel 
    ? [{ name: configuredModel, maxTokens: 16384 }, ...fallbackModels]
    : fallbackModels;
  
  for (const model of modelsToTry) {
    try {
      console.log(`🚀 [AI Engine V3] Tentando ${model.name} com ${model.maxTokens} tokens...`);
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: model.name as any,
        messages: [
          {
            role: "system",
            content: "Você é um gerador de código JSX/React EXPERTO. Retorne APENAS código funcional, sem explicações."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1.0, // Máxima criatividade
        max_tokens: model.maxTokens,
        top_p: 0.95
      });
      code = completion.choices[0].message.content || "";
      console.log(`✅ [AI Engine V3] Código recebido de ${model.name}: ${code.substring(0, 200)}`);
      break;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ [AI Engine V3] Erro ao usar ${model.name}:`, errorMessage);
      // Tentar próximo modelo
    }
  }
  
  if (!code) {
    throw new Error('Falha ao gerar código - todos os modelos falharam');
  }
  
  console.log('📦 [AI Engine V3] Código final:', code.substring(0, 200));

  // Extrair código do bloco markdown
  const codeBlockMatch = code.match(/```(?:jsx|tsx|typescript)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    code = codeBlockMatch[1].trim();
  } else {
    code = code.replace(/```tsx\s*/g, "").replace(/```jsx\s*/g, "").replace(/```typescript\s*/g, "").replace(/```\s*/g, "");
    const importMatch = code.match(/(?:^|\n)(import\s|export\s|<div|<header|<section)/m);
    if (importMatch && importMatch.index && importMatch.index > 0) {
      code = code.substring(importMatch.index).trim();
    }
  }
  
  code = code.trim();
  
  // Validar código
  if (!code || code.length < 100) {
    console.error('❌ [AI Engine V3] Código inválido:', code.substring(0, 500));
    throw new Error('Código gerado inválido');
  }
  
  // Formatar com prettier
  try {
    const prettier = require("prettier");
    const formatted = prettier.format(code, { parser: "typescript" });
    if (typeof formatted === 'string') {
      code = formatted;
      console.log('✅ [AI Engine V3] Código formatado');
    }
  } catch (e) {
    console.warn('⚠️ Prettier não disponível');
  }
  
  if (typeof code !== 'string') {
    console.error('❌ [AI Engine V3] Código não é string após formatação!');
    code = String(code || '');
  }
  
  // Salvar no Supabase
  let savedVersionId: string | null = null;
  if (config.conversationId) {
    // Verificar/criar conversa
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", config.conversationId)
      .single();

    if (!existingConv) {
      await supabase.from("conversations").insert({
        id: config.conversationId,
        initial_prompt: config.additionalPrompt || `Site para ${config.companyName}`,
        project_type: 'site',
        status: 'active'
      });
    }

    // Buscar última versão
    const { data: lastVersion } = await supabase
      .from("site_versions")
      .select("version_number")
      .eq("conversation_id", config.conversationId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const versionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

    // Salvar código
    const { data, error } = await supabase
      .from("site_versions")
      .insert({
        conversation_id: config.conversationId,
        version_number: versionNumber,
        site_code: code,
        modification_description: "Site gerado via IA livre"
      })
      .select("id")
      .single();

    if (error) {
      console.error('❌ [AI Engine V3] Erro ao salvar:', error);
    } else {
      savedVersionId = data?.id || null;
      console.log('✅ [AI Engine V3] Salvo:', savedVersionId);
    }

    // Gerar e injetar imagens APENAS se o código tem âncoras
    try {
      console.log('🎨 [AI Engine V3] Verificando âncoras de imagens...');
      
      if (code.includes('IMAGE_ANCHOR:')) {
        console.log('✅ [AI Engine V3] Âncoras encontradas, gerando imagens...');
        
        const { composeContextImages } = await import('@/lib/ai-image-composer');
        const { injectImagesIntoJsx } = await import('@/lib/ai-image-injector');
        
        const mediaAssets = await composeContextImages({
          siteId: savedVersionId || config.conversationId,
          companyName: config.companyName,
          businessSector: config.businessSector,
          designStyle: config.designStyle,
          targetAudience: config.businessObjective,
          pagesNeeded: config.pagesNeeded,
          tone: config.tone,
          preferredColors: [] // IA decide tudo
        });

        const codeWithImages = injectImagesIntoJsx(code, mediaAssets);
        
        let finalCode = code; // Manter original por padrão
        
        if (typeof codeWithImages === 'string' && codeWithImages.length > 100) {
          finalCode = codeWithImages;
          console.log('✅ [AI Engine V3] Imagens injetadas, tamanho:', finalCode.length);
        } else {
          console.warn('⚠️ [AI Engine V3] Código após injeção inválido, mantendo original');
        }

        const mediaMap = mediaAssets.reduce((acc, asset) => {
          acc[asset.slot] = asset.publicUrl;
          return acc;
        }, {} as Record<string, string>);

        const { error: updateError } = await supabase
          .from("site_versions")
          .update({
            site_code: finalCode,
            media_map: mediaMap
          })
          .eq("id", savedVersionId);
          
        if (updateError) {
          console.error('❌ [AI Engine V3] Erro ao atualizar:', updateError);
        } else {
          console.log('✅ [AI Engine V3] Código atualizado com imagens');
        }
        
        // Atualizar código de retorno também
        code = finalCode;
      } else {
        console.log('ℹ️ [AI Engine V3] Nenhuma âncora encontrada, pulando geração de imagens');
      }
    } catch (imgError) {
      console.warn('⚠️ [AI Engine V3] Erro ao gerar imagens:', imgError);
    }
  }
  
  console.log('✅ [AI Engine V3] Geração completa!');
  return { code, versionId: savedVersionId };
}

// Função de modificação
export async function modifySiteLayout(
  currentCode: string,
  modification: string,
  config?: Partial<LayoutConfig>,
  conversationId?: string
): Promise<{ code: string; versionId: string | null }> {
  const prompt = `Modifique este código:

${currentCode}

MODIFICAÇÃO: ${modification}

Retorne APENAS o código modificado, sem explicações.`;

  let code = "";
  const models = [
    { name: "gpt-4o", maxTokens: 16384 },
    { name: "gpt-4-turbo", maxTokens: 4096 }
  ];
  
  for (const model of models) {
    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: model.name as any,
        messages: [
          { role: "system", content: "Você modifica código JSX. Retorne APENAS código." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: model.maxTokens
      });
      code = completion.choices[0].message.content || "";
      break;
    } catch (error) {
      console.warn(`⚠️ Erro com ${model.name}, tentando próximo...`);
    }
  }
  
  const codeMatch = code.match(/```(?:jsx|tsx|typescript)?\s*([\s\S]*?)```/);
  if (codeMatch) code = codeMatch[1].trim();
  
  let savedVersionId: string | null = null;
  if (conversationId) {
    const { data } = await supabase.from("site_versions").insert({
      conversation_id: conversationId,
      version_number: 1,
      site_code: code,
      modification_description: modification
    }).select("id").single();
    savedVersionId = data?.id || null;
  }

  return { code, versionId: savedVersionId };
}

