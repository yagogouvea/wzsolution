/**
 * Builder.io Integration Module
 * 
 * Integra o sistema com Builder.io para geração de sites baseados em templates profissionais.
 * A IA personaliza apenas conteúdo, cores e textos, mantendo a estrutura visual consistente.
 */

import OpenAI from 'openai';
import type { GenerationProfile } from './ai-decision-engine';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface para o conteúdo do Builder.io
 */
export interface BuilderContent {
  id?: string;
  data: Record<string, unknown>;
  model: string;
  name?: string;
  published?: string;
}

/**
 * Interface para o resultado da geração
 */
export interface BuilderPreview {
  templateId: string;
  content: BuilderContent;
  previewUrl: string;
}

/**
 * 🔍 Função 1: Buscar Template do Builder.io via API
 * 
 * Busca um modelo/template específico do Builder.io usando a API deles.
 */
export async function fetchBuilderTemplate(model: string): Promise<BuilderContent> {
  const apiKey = process.env.BUILDER_API_KEY || process.env.NEXT_PUBLIC_BUILDER_KEY;
  
  if (!apiKey) {
    throw new Error('BUILDER_API_KEY não configurada nas variáveis de ambiente');
  }

  const url = `https://cdn.builder.io/api/v3/content/page?apiKey=${apiKey}&model=${model}&limit=1`;
  
  console.log(`🔍 [Builder.io] Buscando template: ${model}`);
  
  try {
    const res = await fetch(url, {
      cache: 'no-store', // Sempre buscar versão mais recente
    });

    if (!res.ok) {
      throw new Error(`Builder.io API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data?.results?.length) {
      console.warn(`⚠️ [Builder.io] Template '${model}' não encontrado, usando fallback básico`);
      // Fallback: retornar template básico estruturado ao invés de buscar novamente (evitar loop infinito)
      if (model === 'landing-page') {
        // Se já estava tentando landing-page, retornar template básico
        return {
          data: getFallbackTemplate(model),
          model: model,
          name: 'Fallback Template'
        };
      }
      // Se não era landing-page, tentar landing-page uma vez só
      console.log(`🔄 [Builder.io] Tentando fallback para 'landing-page'...`);
      const fallbackResult = await fetch(`https://cdn.builder.io/api/v3/content/page?apiKey=${apiKey}&model=landing-page&limit=1`, {
        cache: 'no-store',
      });
      
      if (fallbackResult.ok) {
        const fallbackData = await fallbackResult.json();
        if (fallbackData?.results?.length) {
          const fallbackTemplate = fallbackData.results[0];
          return {
            id: fallbackTemplate.id,
            data: fallbackTemplate.data || fallbackTemplate,
            model: fallbackTemplate.model || 'landing-page',
            name: fallbackTemplate.name,
            published: fallbackTemplate.published || fallbackTemplate.lastUpdated
          };
        }
      }
      
      // Se fallback também falhou, retornar template básico estruturado
      return {
        data: getFallbackTemplate(model),
        model: model,
        name: 'Fallback Template'
      };
    }

    const template = data.results[0];
    console.log(`✅ [Builder.io] Template '${model}' encontrado: ${template.name || 'Unnamed'}`);

    return {
      id: template.id,
      data: template.data || template,
      model: template.model || model,
      name: template.name,
      published: template.published || template.lastUpdated
    };
  } catch (error) {
    console.error(`❌ [Builder.io] Erro ao buscar template '${model}':`, error);
    
    // Fallback: retornar template básico estruturado
    return {
      data: getFallbackTemplate(model),
      model: model,
      name: 'Fallback Template'
    };
  }
}

/**
 * 🎨 Função 2: Personalizar Template com IA
 * 
 * Usa OpenAI GPT-4o para personalizar o JSON do Builder.io baseado no GenerationProfile.
 */
export async function personalizeBuilderTemplate(
  template: BuilderContent,
  profile: GenerationProfile
): Promise<BuilderContent> {
  console.log('🎨 [Builder.io] Personalizando template com IA...');

  const systemPrompt = `Você é um designer e desenvolvedor especialista da WZ Solution.
Sua tarefa é personalizar o layout JSON do Builder.io de forma que ele represente visualmente a empresa do cliente.

⚙️ **CONTEXTO DO PROJETO:**
- Stack Técnica: ${profile.stack}
- Esquema de Cores: ${profile.colorStyle}
- Layout/Seções: ${profile.layout.join(', ')}
- Tom de Voz: ${profile.tone}
- Componentes Necessários: ${profile.components.join(', ') || 'Nenhum específico'}
- Logo: ${profile.logoInfo?.url || 'Não fornecido'}

🎨 **CORES DO LOGO (se disponível):**
${profile.logoInfo ? `
- Cor Dominante: ${profile.logoInfo.dominant}
- Cor de Destaque: ${profile.logoInfo.accent}
` : ''}

⚠️ **REGRAS CRÍTICAS:**
1. Mantenha a estrutura JSON EXATA do Builder.io
2. Apenas altere textos, cores (hex codes), URLs de imagens e conteúdo
3. Mantenha todos os blocos, componentes e layers estruturais
4. Use as cores do logo (${profile.logoInfo?.dominant || 'cor principal'}) em botões, títulos e elementos de destaque
5. Aplique o tom de voz "${profile.tone}" nos textos
6. Certifique-se de que todas as seções em ${profile.layout.join(', ')} estejam presentes

📋 **FORMATO DE RESPOSTA:**
Retorne APENAS o JSON válido modificado, sem explicações ou markdown.
O JSON deve ser válido e seguir exatamente a estrutura do Builder.io.
`;

  const userPrompt = `Aqui está o JSON do template Builder.io atual:
${JSON.stringify(template.data, null, 2)}

Personalize este template conforme o contexto fornecido acima.
Retorne APENAS o JSON modificado, sem código markdown, sem explicações, pronto para uso.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3, // Baixa temperatura para manter estrutura
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 8000, // Templates do Builder podem ser grandes
    });

    const result = completion.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('IA não retornou conteúdo');
    }

    // Tentar parsear JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (parseError) {
      // Se falhar, tentar extrair JSON de markdown ou texto
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair JSON válido da resposta da IA');
      }
    }

    console.log('✅ [Builder.io] Template personalizado com sucesso pela IA');

    return {
      ...template,
      data: parsedResult
    };

  } catch (error) {
    console.error('❌ [Builder.io] Erro ao personalizar template:', error);
    
    // Fallback: retornar template original
    return template;
  }
}

/**
 * 🚀 Função 3: Gerar Preview Completo
 * 
 * Orquestra o processo completo: seleciona modelo → busca → personaliza
 */
export async function generateBuilderPreview(
  profile: GenerationProfile
): Promise<BuilderPreview> {
  console.log('🚀 [Builder.io] Iniciando geração de preview...');

  // 1. Selecionar modelo base com base no perfil
  const model = selectBuilderModel(profile);
  console.log(`📋 [Builder.io] Modelo selecionado: ${model}`);

  // 2. Buscar modelo no Builder.io
  const template = await fetchBuilderTemplate(model);

  // 3. Personalizar com IA
  const personalized = await personalizeBuilderTemplate(template, profile);

  // 4. Gerar URL de preview
  const previewUrl = `/builder-preview/${model}?data=${encodeURIComponent(JSON.stringify(personalized.data))}`;

  console.log('✅ [Builder.io] Preview gerado com sucesso');

  return {
    templateId: model,
    content: personalized,
    previewUrl
  };
}

/**
 * 🔧 Função auxiliar: Selecionar Modelo Builder.io
 * 
 * Mapeia o perfil de geração para o modelo correto do Builder.io
 */
function selectBuilderModel(profile: GenerationProfile): string {
  const stack = profile.stack.toLowerCase();
  const colorStyle = profile.colorStyle.toLowerCase();
  const layout = profile.layout.map(l => l.toLowerCase());

  // Mapeamento baseado em prioridade

  // 1. E-commerce / Vendas
  if (
    stack.includes('ecommerce') ||
    stack.includes('shop') ||
    stack.includes('shadcn') ||
    profile.components.some(c => c.includes('Product') || c.includes('Cart'))
  ) {
    return 'shop-template';
  }

  // 2. Dark / Luxury
  if (
    colorStyle.includes('dark') ||
    colorStyle.includes('luxury') ||
    colorStyle.includes('gold')
  ) {
    return 'dark-luxury';
  }

  // 3. Criativo / Artístico
  if (
    colorStyle.includes('colorful') ||
    colorStyle.includes('asymmetric') ||
    stack.includes('react') && colorStyle.includes('creative')
  ) {
    return 'creative-showcase';
  }

  // 4. Corporativo / Profissional
  if (
    stack.includes('html5') ||
    stack.includes('css3') ||
    colorStyle.includes('neutral') ||
    colorStyle.includes('professional') ||
    profile.tone.includes('profissional')
  ) {
    return 'corporate-classic';
  }

  // 5. Tecnológico / Moderno
  if (
    colorStyle.includes('cyan') ||
    colorStyle.includes('blue gradient') ||
    stack.includes('next.js')
  ) {
    return 'tech-landing';
  }

  // 6. Padrão (Landing Page)
  return 'landing-page';
}

/**
 * 🛠️ Função auxiliar: Template Fallback
 * 
 * Retorna um template básico estruturado quando o Builder.io não responde
 */
function getFallbackTemplate(model: string): Record<string, unknown> {
  return {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-main',
        component: {
          name: 'Core:Section',
          options: {
            maxWidth: 1200
          }
        },
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-hero',
            tagName: 'section',
            properties: {
              className: 'min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600'
            },
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                id: 'builder-title',
                tagName: 'h1',
                properties: {
                  className: 'text-4xl md:text-6xl font-bold text-white text-center',
                  text: 'Template Builder.io - ' + model
                }
              }
            ]
          }
        ]
      }
    ],
    state: {
      deviceSize: 'large'
    },
    url: '/'
  };
}

/**
 * 🔍 Função auxiliar: Validar API Key
 */
export function validateBuilderConfig(): boolean {
  const apiKey = process.env.BUILDER_API_KEY || process.env.NEXT_PUBLIC_BUILDER_KEY;
  return !!apiKey;
}

/**
 * 📊 Função auxiliar: Estatísticas de Uso
 */
export async function getBuilderStats(): Promise<{
  templatesAvailable: number;
  lastSync: Date | null;
}> {
  // Implementar se necessário buscar estatísticas do Builder.io
  return {
    templatesAvailable: 0,
    lastSync: null
  };
}

