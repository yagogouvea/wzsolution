/**
 * 🎨 DALL-E 3 Image Generator
 * 
 * Gera mockups profissionais de sites usando DALL-E 3
 * Cria visualizações realistas antes do desenvolvimento
 */

import OpenAI from 'openai';

// ✅ Não inicializar no nível do módulo - apenas quando necessário
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.');
  }
  return new OpenAI({ apiKey });
}

export interface MockupGenerationOptions {
  businessSector: string;
  companyName?: string;
  designStyle?: string;
  colors?: string[];
  features?: string[];
  pages?: string[];
  targetAudience?: string;
  mainObjective?: string;
  numImages?: number;
}

/**
 * Mapeia temas do formulário para estilos de design detalhados
 */
function mapThemeToDesignStyle(theme?: string): string {
  const themeMap: Record<string, string> = {
    'moderno-clean': 'modern minimalistic clean design with lots of white space and elegant typography',
    'corporativo-elegante': 'corporate sophisticated elegant design with premium elements and professional layout',
    'criativo-artistico': 'creative artistic design with unique visual elements, gradients and bold colors',
    'tecnologico-inovador': 'futuristic tech design with modern UI elements, holographic effects and innovative layouts',
    'minimalista-zen': 'ultra minimalistic zen design with elegant typography, soft colors and breathing room',
    'dinamico-jovem': 'vibrant dynamic design with energetic colors, bold patterns and youthful energy',
    'classico-traditional': 'classic timeless traditional design with refined elements, serif typography and heritage feel',
    'bold-impactante': 'bold impactful design with strong contrasts, sharp edges and high impact visuals',
    'suave-organico': 'soft organic design with natural shapes, curved lines and earthy colors',
    'luxury-premium': 'luxury premium design with gold accents, sophisticated typography and exclusive feel',
    'dark-misterioso': 'dark mysterious design with sophisticated dark theme, elegant accents and moody atmosphere',
    'industrial-urbano': 'industrial urban design with raw textures, bold typography and urban grit'
  };
  
  return themeMap[theme || ''] || 'modern professional design with clean interface';
}

/**
 * Mapeia setores para termos de busca mais específicos
 */
function mapSectorToContext(sector: string): string {
  const sectorMap: Record<string, string> = {
    'Barbearia': 'barbershop with masculine elegant styling',
    'Salão de Beleza': 'beauty salon with feminine elegant styling',
    'Restaurante': 'restaurant with food presentation focus',
    'Pizzaria': 'pizzeria with Italian heritage',
    'Cafeteria': 'coffee shop with warm cozy atmosphere',
    'Clínica Médica': 'medical clinic with healthcare professionalism',
    'Clínica Odontológica': 'dental clinic with modern dental care',
    'Academia': 'gym fitness center with motivation and energy',
    'Imobiliária': 'real estate with property showcase focus',
    'Advocacia': 'law firm with trust and professionalism',
    'E-commerce': 'online store with product showcase',
    'Tecnologia/SaaS': 'tech SaaS platform with innovation focus'
  };

  // Buscar match exato ou parcial (mais flexível)
  for (const [key, context] of Object.entries(sectorMap)) {
    // Verificar se o setor contém a chave ou vice-versa (case insensitive)
    if (sector.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(sector.toLowerCase())) {
      return context;
    }
    
    // Verificar variações comuns (ex: "Barbearia retro" → "Barbearia")
    const keyWords = key.toLowerCase().split(' ');
    const hasMatch = keyWords.some(word => 
      sector.toLowerCase().includes(word) || word.includes(sector.toLowerCase())
    );
    if (hasMatch) {
      return context;
    }
  }

  // Se não encontrou, retornar setor com descrição genérica
  return `${sector.toLowerCase()} business`;
}

/**
 * Extrai cores principais do logo ou paleta
 */
function extractColorPalette(colors?: string[]): string {
  if (!colors || colors.length === 0) {
    return 'blue and white professional color scheme';
  }

  // Converter hex para descrição de cores
  const colorDescriptions = colors.slice(0, 3).map(hex => {
    // Simplificar para cores conhecidas
    const hexLower = hex.toLowerCase();
    if (hexLower.includes('#1e3a8a') || hexLower.includes('3a8a')) return 'deep blue';
    if (hexLower.includes('#dc2626') || hexLower.includes('c2626')) return 'red';
    if (hexLower.includes('#059669') || hexLower.includes('96669')) return 'green';
    if (hexLower.includes('#7c3aed') || hexLower.includes('3aed')) return 'purple';
    if (hexLower.includes('#ea580c') || hexLower.includes('580c')) return 'orange';
    if (hexLower.includes('#0891b2') || hexLower.includes('191b2')) return 'cyan';
    return 'professional color';
  });

  return colorDescriptions.join(', ') + ' color scheme';
}

/**
 * Cria prompt otimizado para DALL-E 3 gerar mockup profissional
 */
function buildMockupPrompt(options: MockupGenerationOptions, imageType: 'hero' | 'internal' | 'mobile'): string {
  const {
    businessSector,
    companyName,
    designStyle,
    colors,
    features = [],
    pages = [],
    targetAudience,
    mainObjective
  } = options;

  const designStyleDesc = mapThemeToDesignStyle(designStyle);
  const sectorContext = mapSectorToContext(businessSector);
  const colorPalette = extractColorPalette(colors);
  const businessName = companyName || businessSector;

  // Construir contexto base
  let context = `Professional modern website ${imageType === 'hero' ? 'homepage' : imageType === 'mobile' ? 'mobile responsive' : 'internal page'} design mockup`;
  context += ` for ${businessName}, ${sectorContext}`;

  // CRÍTICO: Especificar que queremos APENAS o site, não pessoas/devices
  context += `, showing ONLY the website browser screen with clean interface`;

  // Adicionar informações de design
  context += `, ${designStyleDesc}`;
  context += `, ${colorPalette}`;

  // Adicionar contexto do público e objetivo
  if (targetAudience) {
    context += `, targeting ${targetAudience}`;
  }
  if (mainObjective) {
    context += `, focused on ${mainObjective.toLowerCase()}`;
  }

  // Adicionar características específicas baseadas no tipo de imagem
  switch (imageType) {
    case 'hero':
      context += `, featuring compelling hero section with large headline, clear call-to-action button`;
      if (features.includes('whatsapp') || features.includes('contato')) {
        context += `, prominent contact section`;
      }
      if (features.includes('booking') || features.includes('agendamento')) {
        context += `, online booking interface`;
      }
      break;
    
    case 'internal':
      if (pages.includes('servicos') || pages.includes('produtos')) {
        context += `, showcasing services/products in elegant grid layout`;
      }
      if (features.includes('galeria')) {
        context += `, image gallery section`;
      }
      if (features.includes('depoimentos')) {
        context += `, testimonials section with client reviews`;
      }
      context += `, detailed content sections with professional typography`;
      break;
    
    case 'mobile':
      context += `, mobile-first responsive design`;
      context += `, touch-friendly interface`;
      context += `, mobile navigation menu`;
      context += `, optimized mobile layout`;
      break;
  }

  // Adicionar especificações técnicas de qualidade
  context += `, realistic browser mockup`;
  context += `, high quality professional design`;
  context += `, photorealistic rendering`;
  context += `, modern web design trends 2024`;
  context += `, detailed interface elements`;
  context += `, 8k quality`;
  
  // CRÍTICO: Não queremos pessoas ou mãos segurando devices
  context += `, NO hands, NO people, NO devices being held, ONLY clean browser interface`;

  return context;
}

/**
 * Gera mockups profissionais de sites usando DALL-E 3
 */
export async function generateSiteMockups(
  projectData: Record<string, unknown>
): Promise<string[]> {
  try {
    console.log('🎨 Iniciando geração de mockups com DALL-E 3...');

    // Preparar opções - suportar ambos os formatos de entrada
    const options: MockupGenerationOptions = {
      businessSector: (projectData.businessSector as string) || (projectData.business_type as string) || 'empresa profissional',
      companyName: (projectData.companyName as string) || (projectData.company_name as string),
      designStyle: (projectData.designStyle as string) || (projectData.design_style as string),
      colors: (projectData.colors as string[]) || (projectData.design_colors as string[]),
      features: (projectData.features as string[]) || (projectData.functionalities as string[]),
      pages: (projectData.pages as string[]) || (projectData.pagesNeeded as string[]) || (projectData.pages_needed as string[]),
      targetAudience: (projectData.targetAudience as string) || (projectData.target_audience as string),
      mainObjective: (projectData.mainObjective as string) || (projectData.business_objective as string),
      numImages: 3
    };

    console.log('📋 Opções de mockup:', {
      sector: options.businessSector,
      style: options.designStyle,
      colors: options.colors?.length || 0,
      features: options.features?.length || 0
    });

    const imageUrls: string[] = [];
    const imageTypes: Array<'hero' | 'internal' | 'mobile'> = ['hero', 'internal', 'mobile'];

    // Gerar cada imagem sequencialmente (DALL-E 3 tem rate limits)
    for (let i = 0; i < 3; i++) {
      const imageType = imageTypes[i];
      const prompt = buildMockupPrompt(options, imageType);

      console.log(`🖼️ Gerando ${imageType} mockup (${i + 1}/3)...`);
      console.log(`📝 Prompt: ${prompt.substring(0, 150)}...`);

      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: "1792x1024",
          quality: "standard",
          n: 1,
          response_format: "url"
        });

        const imageUrl = response.data[0]?.url;
        if (imageUrl) {
          imageUrls.push(imageUrl);
          console.log(`✅ Mockup ${imageType} gerado: ${imageUrl.substring(0, 50)}...`);
        } else {
          console.warn(`⚠️ Resposta vazia para ${imageType}`);
        }

        // Rate limiting: esperar 2 segundos entre requisições
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Erro ao gerar ${imageType}:`, error);
        // Continuar tentando as outras imagens mesmo se uma falhar
      }
    }

    console.log(`✅ Total de mockups gerados: ${imageUrls.length}/3`);

    return imageUrls;
  } catch (error) {
    console.error('❌ Erro crítico na geração de mockups:', error);
    return [];
  }
}

/**
 * Gera apenas 1 mockup rápido (para testes ou preview inicial)
 */
export async function generateSingleMockup(
  projectData: Record<string, unknown>,
  type: 'hero' | 'internal' | 'mobile' = 'hero'
): Promise<string | null> {
  try {
    const options: MockupGenerationOptions = {
      businessSector: (projectData.business_type as string) || 'empresa profissional',
      companyName: projectData.company_name as string,
      designStyle: projectData.design_style as string,
      colors: projectData.design_colors as string[],
      features: projectData.functionalities as string[],
      pages: projectData.pages_needed as string[],
      targetAudience: projectData.target_audience as string,
      mainObjective: projectData.business_objective as string,
      numImages: 1
    };

    const prompt = buildMockupPrompt(options, type);

    console.log(`🎨 Gerando mockup único (${type})...`);
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1792x1024",
      quality: "standard",
      n: 1,
      response_format: "url"
    });

    return response.data[0]?.url || null;
  } catch (error) {
    console.error('❌ Erro ao gerar mockup único:', error);
    return null;
  }
}

