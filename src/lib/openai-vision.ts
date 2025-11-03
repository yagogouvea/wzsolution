import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Removido organization - usar padrão da API key
});

export interface LogoAnalysis {
  colors: {
    dominant: string[];
    accent: string[];
  };
  style: 'modern' | 'classic' | 'elegant' | 'minimalist' | 'creative' | 'corporate';
  sector: string;
  mood: string[];
  recommendations: {
    siteStyle: string;
    colorScheme: string;
    typography: string;
  };
}

/**
 * Sugere posicionamento inteligente do logo baseado na análise
 */
export function suggestLogoPlacement(analysis: LogoAnalysis | null | undefined): {
  placement: 'header-left' | 'centered';
  bgPreference: 'light' | 'dark';
  size: string;
} {
  if (!analysis) {
    return { placement: 'header-left', bgPreference: 'dark', size: 'h-12' };
  }

  // Verificar preferência de fundo baseado em cores dominantes
  const dominantColors = analysis.colors?.dominant || [];
  const hasDarkBg = dominantColors.some(c => {
    const hex = c.replace('#', '');
    if (hex.length < 6) return false; // Cores inválidas
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; // Escuro se brightness < 128
  });
  const bgPreference = hasDarkBg ? 'light' : 'dark';

  // Verificar estilo para posicionamento
  const style = analysis.style || '';
  const placement = style.includes('corporativo') || style.includes('corporate') 
    ? 'header-left' 
    : 'centered';

  // Verificar tamanho baseado no estilo
  const size = style.includes('minimal') || style.includes('minimalist')
    ? 'h-8'
    : 'h-12';

  return { placement, bgPreference, size };
}

export async function analyzeLogo(imageBase64: string): Promise<LogoAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise este logo profissionalmente e retorne um JSON com:

{
  "colors": {
    "dominant": ["cor1", "cor2"], // códigos hex das cores principais
    "accent": ["cor3", "cor4"] // códigos hex das cores de destaque
  },
  "style": "modern|classic|elegant|minimalist|creative|corporate",
  "sector": "setor/área do negócio identificado",
  "mood": ["profissional", "confiável", "etc"], // sentimentos transmitidos
  "recommendations": {
    "siteStyle": "descrição do estilo de site recomendado",
    "colorScheme": "esquema de cores para o site",
    "typography": "tipo de tipografia recomendada"
  }
}

Seja específico com códigos de cores hex e preciso na análise.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
          max_tokens: 400, // ✅ Reduzido para evitar rate limit
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia da API');
    }

    // Extrair JSON da resposta (mais robusto - tenta encontrar JSON válido)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta');
    }

    // Tentar parsear, se falhar tenta limpar e parsear novamente
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // Tentar extrair apenas o JSON entre ```json``` ou ```code```
      const codeBlockMatch = content.match(/```(?:json|code)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]);
      }
      // Se ainda falhar, tenta encontrar primeiro objeto JSON válido
      const lines = content.split('\n');
      let jsonStr = '';
      let braceCount = 0;
      let startFound = false;
      
      for (const line of lines) {
        if (line.includes('{')) {
          startFound = true;
          jsonStr += line;
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
        } else if (startFound) {
          jsonStr += line;
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
          if (braceCount === 0 && jsonStr.trim()) {
            try {
              return JSON.parse(jsonStr.trim());
            } catch {
              jsonStr = '';
              startFound = false;
            }
          }
        }
      }
      
      throw new Error(`Erro ao parsear JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error('Erro ao analisar logo:', error);
    
    // Retorno padrão em caso de erro
    return {
      colors: {
        dominant: ['#1e3a8a', '#ffffff'],
        accent: ['#fbbf24', '#e5e7eb']
      },
      style: 'corporate',
      sector: 'profissional',
      mood: ['confiável', 'profissional'],
      recommendations: {
        siteStyle: 'Layout clean e profissional com foco em credibilidade',
        colorScheme: 'Cores neutras com toques de azul para transmitir confiança',
        typography: 'Tipografia serif para títulos e sans-serif para textos'
      }
    };
  }
}

export async function generateSiteCode(projectData: Record<string, unknown>, logoAnalysis?: LogoAnalysis): Promise<string> {
  try {
    const colors = logoAnalysis ? logoAnalysis.colors.dominant : ['#1e3a8a', '#ffffff'];
    const accentColors = logoAnalysis ? logoAnalysis.accent : ['#fbbf24', '#e5e7eb'];
    const style = logoAnalysis ? logoAnalysis.style : 'modern';
    const sector = logoAnalysis ? logoAnalysis.sector : projectData.business_type || 'empresa profissional';

    // ✅ Mapear tema do formulário para estilo CSS
    const themeMapping = {
      'moderno-clean': 'moderno minimalista com muito espaço em branco',
      'corporativo-elegante': 'corporativo sofisticado com elementos premium',
      'criativo-artistico': 'criativo com gradientes e elementos visuais únicos',
      'tecnologico-inovador': 'futurista com elementos tech e animações sutis',
      'minimalista-zen': 'ultra minimalista com tipografia elegante',
      'dinamico-jovem': 'vibrante com cores dinâmicas e elementos modernos',
      'classico-traditional': 'clássico atemporal com elementos refinados',
      'bold-impactante': 'impactante com contrastes fortes e elementos chamativos',
      'suave-organico': 'orgânico com formas suaves e cores naturais',
      'industrial-urbano': 'industrial com elementos urbanos e tipografia robusta',
      'luxury-premium': 'luxuoso com elementos dourados e tipografia elegante',
      'dark-misterioso': 'tema escuro sofisticado com acentos luminosos'
    };

    const themeStyle = themeMapping[projectData.design_style] || 'moderno e profissional';
    
    // ✅ Mapear funcionalidades específicas (corrigido para múltiplos formatos)
    const features = projectData.functionalities || projectData.desiredFeatures || [];
    console.log('🔧 Funcionalidades recebidas:', features);
    
    // ✅ Detecção melhorada de funcionalidades
    const hasWhatsApp = features.some((f: string) => 
      f.toLowerCase().includes('whatsapp') || f.toLowerCase().includes('whats')
    );
    const hasContactForm = features.some((f: string) => 
      f.toLowerCase().includes('formulario') || f.toLowerCase().includes('contato') || f.toLowerCase().includes('form')
    );
    const hasGallery = features.some((f: string) => 
      f.toLowerCase().includes('galeria') || f.toLowerCase().includes('fotos') || f.toLowerCase().includes('gallery')
    );
    const hasTestimonials = features.some((f: string) => 
      f.toLowerCase().includes('depoimentos') || f.toLowerCase().includes('testimonials') || f.toLowerCase().includes('avaliacoes')
    );
    const hasBlog = features.some((f: string) => 
      f.toLowerCase().includes('blog') || f.toLowerCase().includes('noticias') || f.toLowerCase().includes('artigos')
    );
    const hasMap = features.some((f: string) => 
      f.toLowerCase().includes('mapa') || f.toLowerCase().includes('localizacao') || f.toLowerCase().includes('endereco')
    );
    const hasChat = features.some((f: string) => 
      f.toLowerCase().includes('chat') || f.toLowerCase().includes('suporte')
    );
    const hasEcommerce = features.some((f: string) => 
      f.toLowerCase().includes('loja') || f.toLowerCase().includes('venda') || f.toLowerCase().includes('ecommerce')
    );
    
    console.log('🎯 Funcionalidades detectadas:', {
      hasWhatsApp, hasContactForm, hasGallery, hasTestimonials, 
      hasBlog, hasMap, hasChat, hasEcommerce
    });

    // ✅ Verificar se há imagens profissionais geradas
    const hasImages = projectData.has_professional_images && projectData.generated_images?.length > 0;
    const images = projectData.generated_images || [];
    
    // ✅ Verificar se há logo para integrar no site
    const hasLogo = logoAnalysis && projectData.logo_url;
    const logoUrl = projectData.logo_url;

    // Proteções para cores/acento do logo
    const dominantColors = Array.isArray(colors) ? colors : [];
    const accentColorsLine = Array.isArray(logoAnalysis?.colors?.accent) && (logoAnalysis!.colors!.accent as string[])?.length
      ? `- Cores de Destaque: ${(logoAnalysis!.colors!.accent as string[]).join(', ')}`
      : '';

    const prompt = `
Você é um desenvolvedor EXPERT em React/Next.js. Crie um site REACT MODERNO de altíssima qualidade para:

🏢 **EMPRESA:** ${projectData.business_type || sector}
🎯 **OBJETIVO:** ${projectData.business_objective || 'atrair e converter clientes'}
👥 **PÚBLICO:** ${projectData.target_audience || 'clientes exigentes'}
🎨 **ESTILO:** ${themeStyle}

🎨 **IDENTIDADE VISUAL:**
- Cores Principais: ${dominantColors.length ? dominantColors.join(', ') : 'definir a partir do tema do cliente'}
${accentColorsLine}
- Estilo Geral: ${style}
${logoAnalysis ? `- Recomendação: ${logoAnalysis.recommendations.siteStyle}` : ''}

${hasLogo ? `🎨 **LOGO DA EMPRESA:**
- URL do Logo: ${logoUrl}
**OBRIGATÓRIO:** Use esta URL EXATA do logo no Header/Navbar do site
- Alt text: "Logo ${projectData.business_type || 'da empresa'}"
- Posição: Header principal, tamanho adequado e responsivo
- ${logoAnalysis ? `Estilo: ${logoAnalysis.style}, Setor: ${logoAnalysis.sector}` : ''}` : ''}

${hasImages ? `🖼️ **IMAGENS PROFISSIONAIS DISPONÍVEIS:**
- Imagem 1: ${images[0]} (use para Hero section)
- Imagem 2: ${images[1] || 'não disponível'} (use para About/Team section)  
- Imagem 3: ${images[2] || 'não disponível'} (use para background/pattern)
**IMPORTANTE:** Use essas URLs EXATAS das imagens geradas no código React` : '📷 **IMAGENS:** Use placeholders com alt text descritivo adequado'}

⚙️ **FUNCIONALIDADES OBRIGATÓRIAS - IMPLEMENTAR TODAS:**
${hasWhatsApp ? `✅ **WHATSAPP BUTTON:** 
- Botão flutuante fixo no canto inferior direito
- Cor verde WhatsApp (#25D366) com hover effects
- Link: https://wa.me/5511947293221?text=Olá! Vim pelo site e gostaria de mais informações
- Ícone WhatsApp e animação de pulse
- z-index alto, responsivo mobile` : ''}

${hasContactForm ? `✅ **FORMULÁRIO DE CONTATO:**
- Seção dedicada com campos: Nome, Email, Telefone, Mensagem
- Validação em tempo real com feedback visual
- Botão enviar com loading states
- Design integrado ao tema do site
- Responsivo e acessível` : ''}

${hasGallery ? `✅ **GALERIA DE IMAGENS:**
- Grid responsivo de imagens 
- Lightbox para visualização ampliada
- Lazy loading para performance
- Hover effects elegantes
- Navegação touch-friendly mobile` : ''}

${hasTestimonials ? `✅ **SEÇÃO DEPOIMENTOS:**
- Carrossel ou grid de depoimentos
- Fotos dos clientes (placeholders elegantes)
- Estrelas de avaliação
- Animações de entrada suaves
- Design profissional e confiável` : ''}

${hasBlog ? `✅ **SEÇÃO BLOG/NOTÍCIAS:**
- Cards de artigos com imagens
- Preview do conteúdo
- Data de publicação
- Link "Leia mais" 
- Layout responsivo em grid` : ''}

${hasMap ? `✅ **MAPA/LOCALIZAÇÃO:**
- Seção com endereço completo
- Iframe do Google Maps (placeholder)
- Informações de contato próximas
- Design integrado e responsivo` : ''}

${hasChat ? `✅ **CHAT DE SUPORTE:**
- Widget de chat no canto inferior
- Estilo moderno com animações
- Indicador de status online
- Cores do tema aplicadas` : ''}

${hasEcommerce ? `✅ **ELEMENTOS E-COMMERCE:**
- Botões "Comprar Agora" destacados
- Seção de produtos em destaque
- Carrinho de compras (visual)
- Design voltado para conversão` : ''}

**IMPORTANTE:** TODAS as funcionalidades selecionadas DEVEM ser implementadas visualmente no código final.

🚀 **STACK TÉCNICO OBRIGATÓRIO:**
- **REACT/JSX** com componentes funcionais e hooks
- **TAILWIND CSS** para styling moderno e responsivo
- **FRAMER MOTION** para animações suaves e profissionais
- **LUCIDE REACT** para ícones SVG modernos
- **React Hooks** (useState, useEffect, useRef) para interatividade
- **Componentes modulares** reutilizáveis e bem estruturados

📋 **ESTRUTURA OBRIGATÓRIA:**
**Tipo:** ${projectData.site_structure === 'single_page' ? 'PÁGINA ÚNICA com seções navegáveis' : 'MÚLTIPLAS PÁGINAS com URLs separadas'}

${projectData.site_structure === 'single_page' ? 
`**SEÇÕES DA PÁGINA ÚNICA:**` : 
`**PÁGINAS DO SITE:**`}
${projectData.selectedPages ? projectData.selectedPages.map((page: string) => {
  const pageInfo = {
    home: 'Home/Início - Apresentação principal',
    sobre: 'Sobre Nós - História e valores', 
    servicos: 'Serviços - Produtos oferecidos',
    produtos: 'Produtos - Catálogo completo',
    portfolio: 'Portfólio - Trabalhos realizados',
    equipe: 'Equipe - Apresentação da equipe',
    depoimentos: 'Depoimentos - Avaliações de clientes',
    blog: 'Blog/Notícias - Conteúdo e artigos',
    galeria: 'Galeria - Fotos da empresa',
    contato: 'Contato - Formulário e informações',
    localizacao: 'Localização - Endereço e mapa',
    faq: 'FAQ - Perguntas frequentes',
    precos: 'Preços - Tabela de valores',
    promocoes: 'Promoções - Ofertas especiais',
    carreira: 'Trabalhe Conosco - Vagas disponíveis',
    parceiros: 'Parceiros - Empresas parceiras',
    privacidade: 'Política de Privacidade - Termos'
  }[page] || page;
  return `• ${pageInfo}`;
}).join('\n') : '• Home, Sobre, Serviços, Contato (padrão)'}

${projectData.customPageTitles && projectData.customPageTitles.length > 0 ? 
`**PÁGINAS/SEÇÕES PERSONALIZADAS:**
${projectData.customPageTitles.map((title: string) => `• ${title} - Seção personalizada`).join('\n')}` : ''}

**NAVEGAÇÃO:**
${projectData.site_structure === 'single_page' ? 
`- Menu com links para âncoras (#home, #sobre, etc.)
- Scroll suave entre seções
- Indicador de seção ativa no menu
- Todas as seções em uma única página` :
`- Menu com links para páginas separadas
- URLs individuais para cada página
- Breadcrumbs se necessário
- Estrutura multi-página completa`}

🎯 **DIRETRIZES TAILWIND CSS:**
- Use **classes utilitárias** para styling responsivo
- **Gradientes modernos**: bg-gradient-to-r, bg-gradient-to-br
- **Shadows avançadas**: shadow-xl, shadow-2xl, shadow-colored
- **Spacing consistente**: espaçamento harmônico (p-8, my-16, etc.)
- **Typography scale**: text-4xl, font-bold, leading-tight
- **Colors personalizadas**: use as cores do projeto como custom classes
- **Responsive design**: sm:, md:, lg:, xl: em todos elementos
- **Dark mode ready**: estrutura preparada para tema escuro

💎 **ANIMAÇÕES FRAMER MOTION:**
- **Entrada de seções**: fadeInUp, slideIn, stagger children
- **Hover effects**: scale, rotate, colorChange em cards e botões
- **Loading states**: skeleton loading, progressive disclosure  
- **Scroll animations**: aparecer elementos conforme scroll
- **Micro-interações**: feedback visual em todos elementos clicáveis
- **Page transitions**: animações de entrada suaves
- **Parallax effects**: movimento sutil em backgrounds

🔧 **COMPONENTES INTERATIVOS:**
- **Menu Mobile**: hamburger animado com overlay
- **Carrosséis**: navegação touch-friendly e keyboard
- **Modais**: lightbox para imagens e conteúdo
- **Forms**: validação em tempo real com feedback visual
- **Tooltips**: informações contextuais em hover
- **Loading states**: feedback durante carregamento
- **Scroll to top**: botão flutuante animado

📱 **RESPONSIVIDADE AVANÇADA:**
- **Mobile-first design** com Tailwind breakpoints
- **Touch gestures**: swipe, tap, long press otimizados
- **Progressive enhancement**: funciona sem JavaScript
- **Adaptive layout**: layout muda conforme tamanho da tela
- **Performance mobile**: lazy loading, code splitting
- **PWA ready**: estrutura preparada para app

🎨 **DESIGN SYSTEM:**
- **Color palette** consistente baseada nas cores do projeto
- **Typography hierarchy** clara e legível
- **Component variants** (primary, secondary, outline, ghost)
- **Spacing system** harmonioso e matemático
- **Shadow system** para depth e hierarquia
- **Border radius** consistente para elementos
- **Animation timing** uniforme e natural

IMPORTANTE - ESTRUTURA DO CÓDIGO:
1. **Imports organizados**: React, Framer Motion, Lucide, etc.
2. **Componentes funcionais** com hooks quando necessário  
3. **Tailwind classes** bem organizadas e responsivas
4. **Animações Framer Motion** integradas naturalmente
5. **Código limpo** e bem comentado
6. **Performance otimizada** com lazy loading
7. **Acessibilidade completa** (ARIA labels, keyboard navigation)

ESTRUTURA DE SAÍDA:
\`\`\`jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown, Star, Phone, Mail, MapPin } from 'lucide-react';

const Website = () => {
  // Hooks e estado aqui
  
  return (
    <div className="min-h-screen bg-white">
      {/* Componentes aqui */}
    </div>
  );
};

export default Website;
\`\`\`

RETORNE APENAS O CÓDIGO REACT/JSX COMPLETO COM TAILWIND CSS E FRAMER MOTION.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um desenvolvedor web expert especializado em criar sites profissionais completos e funcionais."
        },
        {
          role: "user",
          content: prompt
        }
      ],
          max_tokens: 2000, // ✅ Reduzido para evitar rate limit
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Erro ao gerar código do site:', error);
    throw error;
  }
}

export async function modifySiteCode(
  currentCode: string, 
  modification: string, 
  projectData?: Record<string, unknown>
): Promise<string> {
  try {
    const prompt = `
Você é um desenvolvedor React EXPERT fazendo uma modificação PROFISSIONAL no código.

CÓDIGO REACT/JSX ATUAL:
${currentCode}

MODIFICAÇÃO SOLICITADA:
${modification}

🎯 **INSTRUÇÕES PARA MODIFICAÇÃO PROFISSIONAL REACT:**
- Faça APENAS a modificação solicitada mantendo qualidade premium
- Preserve todos os componentes, hooks e estado existentes
- Use **Tailwind CSS** para styling consistente com o design atual
- Mantenha **Framer Motion** animations existentes e adicione novas se necessário
- Garanta **responsividade mobile** perfeita do novo elemento
- Use as mesmas **cores do tema** e **design system** existente
- Preserve **hierarquia visual** e **consistência de componentes**

🚀 **EXEMPLOS DE MODIFICAÇÕES REACT DE ALTA QUALIDADE:**

**BOTÃO WHATSAPP:**
\`\`\`jsx
const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/5511999999999"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 
                 text-white p-4 rounded-full shadow-2xl z-50 
                 transition-all duration-300 hover:scale-110"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <MessageCircle className="w-6 h-6" />
    </motion.a>
  );
};
\`\`\`

**FORMULÁRIO COM VALIDAÇÃO:**
\`\`\`jsx
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  
  return (
    <motion.form 
      className="bg-white p-8 rounded-2xl shadow-xl space-y-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.input
        type="text"
        className="w-full p-4 border border-gray-200 rounded-xl 
                   focus:ring-2 focus:ring-blue-500 transition-all"
        placeholder="Nome"
        whileFocus={{ scale: 1.02 }}
      />
    </motion.form>
  );
};
\`\`\`

**SEÇÃO NOVA COM ANIMAÇÕES:**
\`\`\`jsx
const NewSection = () => {
  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-blue-50 to-purple-50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 text-gray-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Nova Seção
        </motion.h2>
      </div>
    </motion.section>
  );
};
\`\`\`

**CARROSSEL/GALLERY:**
\`\`\`jsx
const ImageGallery = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: \`translateX(-\${currentImage * 100}%)\` }}
      >
        {images.map((img, index) => (
          <motion.img
            key={index}
            src={img}
            className="w-full h-64 object-cover flex-shrink-0"
            whileHover={{ scale: 1.05 }}
          />
        ))}
      </motion.div>
    </div>
  );
};
\`\`\`

🎨 **DIRETRIZES TAILWIND CSS:**
- Use classes **responsivas**: sm:, md:, lg:, xl: em todos elementos
- **Gradientes modernos**: bg-gradient-to-r, from-blue-500, to-purple-600
- **Shadows avançadas**: shadow-xl, shadow-2xl, hover:shadow-3xl
- **Spacing consistente**: p-6, m-4, space-y-8, gap-6
- **Typography**: text-4xl, font-bold, leading-tight, text-gray-800
- **Animations**: transition-all, duration-300, ease-in-out
- **Colors**: use o sistema de cores do Tailwind alinhado ao tema

💎 **FRAMER MOTION INTEGRAÇÃO:**
- **Animações de entrada**: initial, animate, whileInView
- **Hover effects**: whileHover, whileTap com scale e rotate
- **Stagger animations**: staggerChildren para listas
- **Scroll triggers**: viewport={{ once: true }}
- **Loading states**: AnimatePresence para transições
- **Micro-interações**: feedback visual em todos elementos clicáveis

🔧 **HOOKS E ESTADO:**
- **useState** para controle de estado local
- **useEffect** para side effects e lifecycle
- **useRef** para referências DOM quando necessário
- **Custom hooks** para lógica reutilizável
- **Event handlers** otimizados e responsivos

📱 **RESPONSIVIDADE AVANÇADA:**
- **Mobile-first**: classes base para mobile, prefixos para desktop
- **Touch-friendly**: alvos touch de pelo menos 44x44px
- **Adaptive layout**: layout muda conforme breakpoint
- **Performance mobile**: lazy loading quando possível

IMPORTANTE:
- Mantenha todos os **imports existentes**
- Preserve **componentes** e **hooks** já implementados
- Adicione novos **imports** apenas se necessário
- Mantenha **estrutura de estado** existente
- Código deve ser **production-ready**
- **Não quebre** funcionalidades existentes

RETORNE APENAS O CÓDIGO REACT/JSX COMPLETO MODIFICADO COM TAILWIND CSS E FRAMER MOTION.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system", 
          content: "Você é um desenvolvedor web expert. Faça modificações precisas mantendo qualidade e consistência."
        },
        {
          role: "user",
          content: prompt
        }
      ],
          max_tokens: 2000, // ✅ Reduzido para evitar rate limit
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || currentCode;
  } catch (error) {
    console.error('Erro ao modificar código:', error);
    return currentCode; // Retorna código original em caso de erro
  }
}
