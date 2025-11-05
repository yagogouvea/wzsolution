/**
 * 🔍 Prompt Extractor
 * Extrai informações estruturadas de prompts completos antes da geração
 */

interface ExtractedPromptData {
  company_name?: string;
  business_type?: string;
  business_sector?: string;
  target_audience?: string;
  business_objective?: string;
  short_description?: string;
  pages_needed?: string[];
  design_style?: string;
  design_colors?: string[];
  functionalities?: string[];
  site_structure?: string;
  slogan?: string;
  cta_text?: string;
  tone?: string;
  has_complete_info?: boolean;
}

/**
 * Analisa um prompt completo e extrai informações estruturadas usando Claude
 */
export async function extractDataFromPrompt(
  prompt: string,
  conversationId: string
): Promise<ExtractedPromptData> {
  try {
    console.log('🔍 [PromptExtractor] Analisando prompt completo:', prompt.substring(0, 100) + '...');

    // Se o prompt for muito simples (menos de 50 caracteres), não precisa extrair
    if (prompt.length < 50) {
      console.log('📝 [PromptExtractor] Prompt muito simples, pulando extração');
      return { has_complete_info: false };
    }

    // Usar Claude para extrair informações estruturadas
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const extractionPrompt = `Analise o seguinte prompt de criação de site e extraia TODAS as informações mencionadas. Retorne APENAS um JSON válido, sem explicações adicionais.

PROMPT DO USUÁRIO:
"${prompt}"

IMPORTANTE:
- Se o prompt mencionar nome da empresa, extraia em "company_name"
- Se mencionar tipo de negócio/setor (ex: "marketing", "restaurante", "clínica"), extraia em "business_type" e "business_sector"
- Se mencionar cores específicas, extraia em "design_colors" como array (ex: ["#ff0000", "#0000ff"])
- Se mencionar páginas/seções (ex: "sobre", "contato", "serviços"), extraia em "pages_needed" como array
- Se mencionar funcionalidades (ex: "formulário", "whatsapp", "galeria"), extraia em "functionalities" como array
- Se mencionar estilo/tema (ex: "moderno", "minimalista", "corporate"), extraia em "design_style"
- Se mencionar público-alvo, extraia em "target_audience"
- Se mencionar objetivo, extraia em "business_objective"
- Se mencionar slogan, extraia em "slogan"
- Se mencionar descrição curta, extraia em "short_description"
- Se mencionar estrutura (ex: "single page", "múltiplas páginas"), extraia em "site_structure"
- Se mencionar tom de voz, extraia em "tone"
- Se mencionar CTA ou call-to-action, extraia em "cta_text"

Retorne um JSON com estas chaves (apenas as que foram mencionadas):
{
  "company_name": "string ou null",
  "business_type": "string ou null",
  "business_sector": "string ou null",
  "target_audience": "string ou null",
  "business_objective": "string ou null",
  "short_description": "string ou null",
  "pages_needed": ["array", "de", "strings"] ou null,
  "design_style": "string ou null",
  "design_colors": ["#cor1", "#cor2"] ou null,
  "functionalities": ["array", "de", "strings"] ou null,
  "site_structure": "string ou null",
  "slogan": "string ou null",
  "cta_text": "string ou null",
  "tone": "string ou null",
  "has_complete_info": true ou false
}

Se o prompt tiver pelo menos 3 dessas informações, marque "has_complete_info": true.`;

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      temperature: 0.3, // Temperatura baixa para extração precisa
      messages: [
        {
          role: "user",
          content: extractionPrompt
        }
      ],
    });

    let extractedText = '';
    if (response.content[0].type === 'text') {
      extractedText = response.content[0].text;
    }

    // Limpar o texto (remover markdown code blocks se houver)
    let cleanedText = extractedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse do JSON
    let extractedData: ExtractedPromptData = {};
    try {
      extractedData = JSON.parse(cleanedText);
      console.log('✅ [PromptExtractor] Dados extraídos:', Object.keys(extractedData));
    } catch (parseError) {
      console.error('❌ [PromptExtractor] Erro ao parsear JSON:', parseError);
      console.error('📄 [PromptExtractor] Texto recebido:', cleanedText.substring(0, 500));
      
      // Tentar extração básica usando regex como fallback
      extractedData = extractBasicInfo(prompt);
    }

    // Normalizar dados extraídos
    const normalized: ExtractedPromptData = {
      ...extractedData,
      // Garantir que arrays sejam arrays válidos
      pages_needed: Array.isArray(extractedData.pages_needed) ? extractedData.pages_needed : undefined,
      design_colors: Array.isArray(extractedData.design_colors) ? extractedData.design_colors : undefined,
      functionalities: Array.isArray(extractedData.functionalities) ? extractedData.functionalities : undefined,
    };

    // Verificar se tem informações suficientes
    const infoCount = [
      normalized.company_name,
      normalized.business_type,
      normalized.business_sector,
      normalized.pages_needed,
      normalized.design_style,
      normalized.design_colors,
      normalized.functionalities
    ].filter(Boolean).length;

    normalized.has_complete_info = infoCount >= 3;

    console.log('📊 [PromptExtractor] Informações extraídas:', {
      company_name: normalized.company_name,
      business_type: normalized.business_type,
      pages_count: normalized.pages_needed?.length || 0,
      has_style: !!normalized.design_style,
      has_colors: !!normalized.design_colors,
      functionalities_count: normalized.functionalities?.length || 0,
      has_complete_info: normalized.has_complete_info
    });

    return normalized;

  } catch (error) {
    console.error('❌ [PromptExtractor] Erro ao extrair dados:', error);
    // Fallback: extração básica usando regex
    return extractBasicInfo(prompt);
  }
}

/**
 * Extração básica usando regex (fallback quando Claude falha)
 */
function extractBasicInfo(prompt: string): ExtractedPromptData {
  const lowerPrompt = prompt.toLowerCase();
  const extracted: ExtractedPromptData = {};

  // Extrair nome da empresa (primeira parte após "para" ou "da")
  const companyMatch = prompt.match(/(?:para|da|do|de)\s+([^,\.]+?)(?:\s+(?:empresa|negócio|marca))?/i);
  if (companyMatch) {
    extracted.company_name = companyMatch[1].trim();
  }

  // Extrair setor/tipo de negócio
  const sectorKeywords: Record<string, string> = {
    'marketing': 'Marketing',
    'mkt': 'Marketing',
    'restaurante': 'Restaurante',
    'comida': 'Restaurante',
    'clínica': 'Clínica Médica',
    'médico': 'Clínica Médica',
    'salão': 'Salão de Beleza',
    'beleza': 'Salão de Beleza',
    'barbearia': 'Barbearia',
    'loja': 'Loja/E-commerce',
    'ecommerce': 'E-commerce',
    'site institucional': 'Site Institucional'
  };

  for (const [keyword, sector] of Object.entries(sectorKeywords)) {
    if (lowerPrompt.includes(keyword)) {
      extracted.business_type = sector;
      extracted.business_sector = sector;
      break;
    }
  }

  // Extrair cores mencionadas
  const colorMatches = prompt.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|(?:cor|cores?)\s+(?:[a-záàâãéêíóôõúç]+)/gi);
  if (colorMatches) {
    extracted.design_colors = colorMatches.slice(0, 5); // Máximo 5 cores
  }

  // Extrair páginas mencionadas
  const pageKeywords = ['sobre', 'contato', 'serviços', 'portfólio', 'galeria', 'blog', 'home'];
  const pages: string[] = [];
  for (const page of pageKeywords) {
    if (lowerPrompt.includes(page)) {
      pages.push(page);
    }
  }
  if (pages.length > 0) {
    extracted.pages_needed = pages;
  }

  // Extrair funcionalidades
  const featureKeywords = ['formulário', 'whatsapp', 'galeria', 'blog', 'chat', 'mapa', 'agendamento'];
  const features: string[] = [];
  for (const feature of featureKeywords) {
    if (lowerPrompt.includes(feature)) {
      features.push(feature);
    }
  }
  if (features.length > 0) {
    extracted.functionalities = features;
  }

  // Extrair estilo/tema
  const styleKeywords: Record<string, string> = {
    'moderno': 'moderno-clean',
    'minimalista': 'minimalista-zen',
    'corporate': 'corporativo-elegante',
    'criativo': 'criativo-artistico',
    'tech': 'tecnologico-inovador',
    'escuro': 'dark-misterioso'
  };

  for (const [keyword, style] of Object.entries(styleKeywords)) {
    if (lowerPrompt.includes(keyword)) {
      extracted.design_style = style;
      break;
    }
  }

  extracted.has_complete_info = [
    extracted.company_name,
    extracted.business_type,
    extracted.pages_needed,
    extracted.design_style
  ].filter(Boolean).length >= 3;

  return extracted;
}

