/**
 * 🚀 Google Cloud Gemini AI Integration
 * 
 * Sistema de geração de sites usando Gemini (Gemini Pro/1.5)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from "@supabase/supabase-js";

// ✅ Não inicializar no nível do módulo - apenas quando necessário
function getGenAIClient() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is required.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are required.');
  }
  return createClient(supabaseUrl, supabaseKey);
}

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
 * Gera site layout usando Gemini Pro
 */
export async function generateSiteLayoutGemini(config: LayoutConfig) {
  console.log('🏗️ [Gemini AI] Starting FREE site generation...');
  
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

  console.log('📝 [Gemini AI] Prompt length:', prompt.length);
  
  // Usar Gemini Pro ou 1.5 Flash
  const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
  const model = genAI.getGenerativeModel({ model: modelName });
  
  let code = "";
  
  try {
    console.log(`🚀 [Gemini AI] Usando ${modelName}...`);
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 1.0, // Máxima criatividade
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Gemini suporta muito mais
        responseMimeType: 'text/plain'
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    });
    
    const response = result.response;
    code = response.text();
    console.log(`✅ [Gemini AI] Código recebido: ${code.substring(0, 200)}`);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [Gemini AI] Erro:', errorMessage);
    throw error;
  }
  
  if (!code) {
    throw new Error('Falha ao gerar código - Gemini retornou vazio');
  }
  
  console.log('📦 [Gemini AI] Código final:', code.substring(0, 200));

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
    console.error('❌ [Gemini AI] Código inválido:', code.substring(0, 500));
    throw new Error('Código gerado inválido');
  }
  
  // Formatar com prettier
  try {
    const prettier = require("prettier");
    const formatted = prettier.format(code, { parser: "typescript" });
    if (typeof formatted === 'string') {
      code = formatted;
      console.log('✅ [Gemini AI] Código formatado');
    }
  } catch (e) {
    console.warn('⚠️ Prettier não disponível');
  }
  
  if (typeof code !== 'string') {
    console.error('❌ [Gemini AI] Código não é string após formatação!');
    code = String(code || '');
  }
  
  // Salvar no Supabase
  let savedVersionId: string | null = null;
  if (config.conversationId) {
    // Verificar/criar conversa
    const supabase = getSupabaseClient();
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
        modification_description: "Site gerado via Gemini AI"
      })
      .select("id")
      .single();

    if (error) {
      console.error('❌ [Gemini AI] Erro ao salvar:', error);
    } else {
      savedVersionId = data?.id || null;
      console.log('✅ [Gemini AI] Salvo:', savedVersionId);
    }

    // Gerar e injetar imagens APENAS se o código tem âncoras
    try {
      console.log('🎨 [Gemini AI] Verificando âncoras de imagens...');
      
      if (code.includes('IMAGE_ANCHOR:')) {
        console.log('✅ [Gemini AI] Âncoras encontradas, gerando imagens...');
        
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
          console.log('✅ [Gemini AI] Imagens injetadas, tamanho:', finalCode.length);
        } else {
          console.warn('⚠️ [Gemini AI] Código após injeção inválido, mantendo original');
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
          console.error('❌ [Gemini AI] Erro ao atualizar:', updateError);
        } else {
          console.log('✅ [Gemini AI] Código atualizado com imagens');
        }
        
        // Atualizar código de retorno também
        code = finalCode;
      } else {
        console.log('ℹ️ [Gemini AI] Nenhuma âncora encontrada, pulando geração de imagens');
      }
    } catch (imgError) {
      console.warn('⚠️ [Gemini AI] Erro ao gerar imagens:', imgError);
    }
  }
  
  console.log('✅ [Gemini AI] Geração completa!');
  return { code, versionId: savedVersionId };
}

// Função de modificação
export async function modifySiteLayoutGemini(
  currentCode: string,
  modification: string,
  config?: Partial<LayoutConfig>,
  conversationId?: string
): Promise<{ code: string; versionId: string | null }> {
  const prompt = `Modifique este código:

${currentCode}

MODIFICAÇÃO: ${modification}

Retorne APENAS o código modificado, sem explicações.`;

  const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
  const model = genAI.getGenerativeModel({ model: modelName });
  
  let code = "";
  
  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain'
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    });
    
    const response = result.response;
    code = response.text();
  } catch (error) {
    console.warn(`⚠️ Erro com Gemini:`, error);
    throw error;
  }
  
  const codeMatch = code.match(/```(?:jsx|tsx|typescript)?\s*([\s\S]*?)```/);
  if (codeMatch) code = codeMatch[1].trim();
  
  let savedVersionId: string | null = null;
  if (conversationId) {
    const supabase = getSupabaseClient();
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

