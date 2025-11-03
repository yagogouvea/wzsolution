/**
 * 🎨 AI Contextual Image Composer
 * 
 * Gera imagens contextuais via DALL-E baseadas no contexto do site
 * e salva no Supabase Storage para uso no código JSX
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

export type ImageSlot =
  | "hero"
  | "about"
  | "services_primary"
  | "services_secondary"
  | "gallery_1"
  | "gallery_2"
  | "gallery_3";

export interface ComposerInput {
  siteId: string; // ID da versão do site
  companyName: string;
  businessSector: string; // ex: "barbearia", "clínica", "loja de roupas"
  designStyle: string;    // ex: "retro-vintage", "moderno-clean"
  targetAudience?: string;
  pagesNeeded: string[];  // ex: ["home","sobre","servicos","contato","galeria"]
  tone?: string;
  preferredColors?: string[];
}

export interface GeneratedAsset {
  slot: ImageSlot;
  supabasePath: string;   // ex: site_assets/<siteId>_hero.png
  publicUrl: string;      // URL pública
}

const BUCKET = "site_assets";

/**
 * Gera prompt inteligente para imagem usando GPT-4o
 */
async function generateImagePromptWithAI(slot: ImageSlot, ctx: ComposerInput): Promise<string> {
  console.log(`🤖 [Image Composer] Gerando prompt inteligente para ${slot}...`);
  
  const slotDescriptions: Record<ImageSlot, string> = {
    hero: "Imagem principal do hero (primeira impressão)",
    about: "Imagem da seção sobre (ambiente ou produto)",
    services_primary: "Imagem do serviço principal",
    services_secondary: "Imagem do serviço secundário",
    gallery_1: "Primeira imagem da galeria",
    gallery_2: "Segunda imagem da galeria",
    gallery_3: "Terceira imagem da galeria"
  };
  
  const prompt = `Você é um especialista em fotografia comercial e design web.

Análise este contexto:
- Empresa: ${ctx.companyName}
- Setor: ${ctx.businessSector}
- Estilo: ${ctx.designStyle}
- Tom: ${ctx.tone || 'profissional'}

Preciso de uma ${slotDescriptions[slot]} para o site desta empresa.

Crie um prompt DESCRITIVO e DETALHADO em inglês para gerar uma imagem profissional via DALL-E 3 que:
1. Seja perfeita para ${slotDescriptions[slot]}
2. Reflita o setor ${ctx.businessSector}
3. Tenha estilo ${ctx.designStyle}
4. Seja adequada para composição web
5. NÃO tenha pessoas nem mãos segurando dispositivos
6. Foque apenas no objeto/ambiente do negócio

IMPORTANTE:
- Retorne APENAS o prompt, sem explicações
- Seja específico sobre estilo, iluminação, enquadramento
- Mencione cores se relevante para ${ctx.businessSector}
- Use termos fotográficos profissionais

PROMPT:`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você cria prompts de imagem para DALL-E 3. Retorne APENAS o prompt, nada mais."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });
    
    const generatedPrompt = completion.choices[0].message.content?.trim() || '';
    console.log(`✅ [Image Composer] Prompt gerado: ${generatedPrompt.substring(0, 100)}...`);
    return generatedPrompt;
  } catch (error) {
    console.warn('⚠️ [Image Composer] Erro ao gerar prompt, usando fallback:', error);
    // Fallback simples
    return `Professional commercial photograph for ${ctx.companyName} ${ctx.businessSector}, ${ctx.designStyle} style, web composition, no people, high quality`;
  }
}

/**
 * Uploads image to Supabase Storage
 */
async function uploadToSupabase(
  arrayBuffer: ArrayBuffer,
  path: string,
  contentType = "image/png"
): Promise<string> {
  console.log(`📤 [Image Composer] Uploading to ${path}...`);
  
  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType,
    upsert: true
  });

  if (error) {
    console.error('❌ [Image Composer] Upload error:', error);
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  console.log(`✅ [Image Composer] Uploaded: ${data.publicUrl}`);
  
  return data.publicUrl;
}

/**
 * Generates one image using DALL-E 3
 */
async function generateOneImage(prompt: string): Promise<ArrayBuffer> {
  console.log(`🎨 [Image Composer] Generating image...`);
  const openai = getOpenAIClient();
  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1792x1024", // Tamanho padrão para sites (wide)
    quality: "standard",
    n: 1
  });

  const imageUrl = res.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Falha ao gerar imagem (sem URL).");
  }

  // Download da imagem da URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("Falha ao baixar imagem gerada.");
  }
  
  const arrayBuffer = await response.arrayBuffer();
  console.log(`✅ [Image Composer] Image generated and downloaded`);
  
  return arrayBuffer;
}

/**
 * Composes context images based on site pages and sector
 */
export async function composeContextImages(ctx: ComposerInput): Promise<GeneratedAsset[]> {
  console.log('🎨 [Image Composer] Starting contextual image generation...');
  console.log('📋 [Image Composer] Context:', {
    company: ctx.companyName,
    sector: ctx.businessSector,
    style: ctx.designStyle,
    pages: ctx.pagesNeeded.length
  });

  const slots: ImageSlot[] = ["hero", "about", "services_primary"];

  // Adicionar slots condicionais
  if (ctx.pagesNeeded.includes("servicos")) {
    slots.push("services_secondary");
  }
  if (ctx.pagesNeeded.includes("galeria")) {
    slots.push("gallery_1", "gallery_2", "gallery_3");
  }

  console.log(`🎯 [Image Composer] Generating ${slots.length} images...`);

  const results: GeneratedAsset[] = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    console.log(`🖼️ [Image Composer] Generating ${slot} (${i + 1}/${slots.length})...`);
    
    try {
      // Gerar prompt inteligente usando GPT-4o
      const prompt = await generateImagePromptWithAI(slot, ctx);
      console.log(`📝 [Image Composer] Prompt gerado: ${prompt.substring(0, 100)}...`);
      
      const imgAB = await generateOneImage(prompt);
      const key = `${ctx.siteId}_${slot}.png`;
      const publicUrl = await uploadToSupabase(imgAB, key, "image/png");

      results.push({ slot, supabasePath: `${BUCKET}/${key}`, publicUrl });
      console.log(`✅ [Image Composer] ${slot} completed: ${publicUrl}`);
      
      // Rate limiting: esperar 3 segundos entre requisições (DALL-E precisa)
      if (i < slots.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (err) {
      console.error(`❌ [Image Composer] Error generating ${slot}:`, err);
      
      // Fallback placeholder
      results.push({
        slot,
        supabasePath: "site_assets/placeholder.svg",
        publicUrl: "https://via.placeholder.com/1024x1024?text=Image+Placeholder"
      });
    }
  }

  console.log(`✅ [Image Composer] Generated ${results.length} images total`);
  return results;
}

