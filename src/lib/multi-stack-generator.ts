// 🚀 GERADOR MULTI-STACK INTELIGENTE
// Gera código otimizado para cada tecnologia específica

import OpenAI from 'openai';
import { TechStack, selectOptimalTechStack } from './tech-stack-selector';
import { LogoAnalysis, suggestLogoPlacement } from './openai-vision';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎨 INTERFACE PARA DADOS DO PROJETO
interface ProjectData {
  business_type?: string;
  business_objective?: string;
  target_audience?: string;
  design_style?: string;
  design_colors?: string[];
  functionalities?: string[];
  pages_needed?: string[];
  generated_images?: string[];
  has_professional_images?: boolean;
  [key: string]: unknown;
}

// 🧠 CLASSE PRINCIPAL DO GERADOR MULTI-STACK
export class MultiStackGenerator {

  // 🎯 MÉTODO PRINCIPAL - SELECIONA STACK E GERA CÓDIGO
  static async generateOptimalSite(
    projectData: ProjectData, 
    logoAnalysis?: LogoAnalysis
  ): Promise<{
    code: string;
    selectedStack: TechStack;
    confidence: number;
    reasoning: string[];
    alternatives: TechStack[];
  }> {
    
    console.log('🧠 Iniciando análise inteligente de stack...');
    
    // 1. Analisar e selecionar melhor stack
    const stackAnalysis = await selectOptimalTechStack(projectData);
    
    // 2. Gerar código com a stack selecionada
    const code = await this.generateCodeForStack(
      stackAnalysis.recommendedStack,
      projectData,
      logoAnalysis
    );
    
    return {
      code,
      selectedStack: stackAnalysis.recommendedStack,
      confidence: stackAnalysis.confidence,
      reasoning: stackAnalysis.reasoning,
      alternatives: stackAnalysis.alternatives
    };
  }

  // 🏗️ GERADOR ESPECÍFICO POR STACK
  private static async generateCodeForStack(
    stack: TechStack,
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    console.log(`🚀 Gerando código para stack: ${stack.displayName}`);
    
    switch (stack.id) {
      case 'html-css-premium':
        return this.generateHTMLCSS(projectData, logoAnalysis);
      
      case 'react-tailwind':
        return this.generateReactTailwind(projectData, logoAnalysis);
      
      case 'vue-nuxt':
        return this.generateVueNuxt(projectData, logoAnalysis);
      
      case 'svelte-kit':
        return this.generateSvelteKit(projectData, logoAnalysis);
      
      case 'wordpress-modern':
        return this.generateWordPress(projectData, logoAnalysis);
      
      case 'threejs-creative':
        return this.generateThreeJS(projectData, logoAnalysis);
      
      default:
        console.warn(`Stack ${stack.id} não implementada, usando React como fallback`);
        return this.generateReactTailwind(projectData, logoAnalysis);
    }
  }

  // 🌐 GERADOR HTML/CSS PREMIUM
  private static async generateHTMLCSS(
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    const colors = logoAnalysis?.colors.dominant || ['#1e3a8a', '#ffffff'];
    const images = projectData.generated_images || [];
    const logoUrl = projectData.logo_url || '';
    
    // ✅ 3. POSICIONAMENTO INTELIGENTE DO LOGO
    const logoPlacement = logoAnalysis ? suggestLogoPlacement(logoAnalysis) : null;
    
    // ✅ Extrair TODAS as informações do formulário
    const companyName = projectData.company_name || projectData.business_type || 'Empresa';
    const businessSector = projectData.business_type && projectData.business_type !== companyName 
      ? projectData.business_type 
      : '';
    const slogan = projectData.slogan || '';
    const shortDesc = projectData.short_description || '';
    const ctaText = projectData.cta_text || 'Entre em contato';
    let tone = projectData.tone || 'profissional';
    if (projectData.content_needs && typeof projectData.content_needs === 'object') {
      const contentNeeds = projectData.content_needs as Record<string, unknown>;
      if (contentNeeds.tone) tone = contentNeeds.tone as string;
    }
    const fontStyle = projectData.font_style || 'moderno';
    const pages = Array.isArray(projectData.pages_needed) ? projectData.pages_needed : [];
    let customPages: string[] = [];
    if (projectData.content_needs && typeof projectData.content_needs === 'object') {
      const contentNeeds = projectData.content_needs as Record<string, unknown>;
      if (Array.isArray(contentNeeds.custom_page_titles)) {
        customPages = contentNeeds.custom_page_titles as string[];
      }
    }
    const allPages = [...pages, ...customPages];
    const features = Array.isArray(projectData.functionalities) ? projectData.functionalities : [];
    
    const prompt = `
Você é um web designer EXPERT especializado em HTML5/CSS3 PREMIUM ultra-otimizado.

CRIAR SITE HTML INSTITUCIONAL DE ALTÍSSIMA QUALIDADE:

🏢 **PROJETO:**
- Nome da Empresa: ${companyName}
${businessSector ? `- Setor/Negócio: ${businessSector}` : ''}
${slogan ? `- Slogan: "${slogan}"` : ''}
${shortDesc ? `- Descrição: ${shortDesc}` : ''}
- Objetivo: ${projectData.business_objective || 'atrair e converter clientes'}
- Público-alvo: ${projectData.target_audience || 'clientes'}
- Estilo: ${projectData.design_style || 'moderno'}
${tone ? `- Tom de voz: ${tone}` : ''}
${fontStyle ? `- Estilo de fonte: ${fontStyle}` : ''}

🎨 **IDENTIDADE VISUAL:**
- Cores Principais: ${colors.join(', ')}
${logoUrl ? `
🎭 **LOGO INTELIGENTE:**
- URL do Logo: ${logoUrl}
- Posicionamento: ${logoPlacement?.placement === 'centered' ? 'Centralizado no header' : 'À esquerda com navegação à direita'}
- Tamanho: ${logoPlacement?.size || 'h-12'}
- Background: ${logoPlacement?.bgPreference === 'light' ? 'Fundo claro (usar mix-blend-screen)' : 'Fundo escuro (normal)'}
**⚠️ OBRIGATÓRIO:** Use esta URL EXATA no header com as configurações de posicionamento acima!
` : ''}
${logoAnalysis ? `- Análise Logo: ${logoAnalysis.recommendations.siteStyle}` : ''}
${images.length > 0 ? `- Imagens HD: ${images.slice(0, 3).join(', ')}` : ''}

🚀 **ESPECIFICAÇÕES TÉCNICAS HTML/CSS:**
- HTML5 SEMÂNTICO com Schema.org microdata
- CSS3 AVANÇADO com Grid, Flexbox, Custom Properties
- PERFORMANCE MÁXIMA (90+ PageSpeed Insights)
- SEO OTIMIZADO (meta tags, structured data)
- ACESSIBILIDADE WCAG 2.1 AA compliant
- RESPONSIVO MOBILE-FIRST perfeito
- Animações CSS puras (transform, opacity)
- Typography profissional com Google Fonts
- Gradientes e shadows modernas
- Lazy loading de imagens

📋 **ESTRUTURA OBRIGATÓRIA:**
${allPages.length > 0 ? `- Páginas solicitadas: ${allPages.join(', ')}` : ''}
${pages.includes('home') || pages.includes('Home') || !pages.length ? '1. Header com navegação sticky' : ''}
${pages.includes('home') || pages.includes('Home') || !pages.length ? `2. Hero section com CTA "${ctaText}"${slogan ? ` e slogan "${slogan}"` : ''}` : ''}
${pages.includes('sobre') || pages.includes('Sobre') || !pages.length ? `3. Seção Sobre${shortDesc ? ` (texto: ${shortDesc})` : ''}` : ''}
${pages.includes('servicos') || pages.includes('Serviços') || !pages.length ? '4. Serviços em cards elegantes' : ''}
${features.includes('depoimentos') || features.includes('Depoimentos') || !pages.length ? '5. Depoimentos/credibilidade' : ''}
${pages.includes('contato') || pages.includes('Contato') || features.includes('formulário') || features.includes('Formulário') || !pages.length ? '6. Contato com formulário' : ''}
7. Footer completo
${features.includes('galeria') || features.includes('Galeria') ? '8. Galeria de imagens' : ''}
${features.includes('mapa') || features.includes('Mapa') ? '9. Mapa de localização' : ''}

🎯 **DIRETRIZES DESIGN:**
- Layout clean e profissional
- Hierarquia visual clara
- Espaçamento generoso (breathing room)
- Contraste adequado para acessibilidade
- Imagens otimizadas e responsivas
- Micro-interações sutis
- Loading states visuais

💎 **ELEMENTOS PREMIUM:**
- Gradientes sutis nas cores do tema
- Box-shadows com depth realista
- Border-radius consistente
- Hover effects elegantes
- Smooth scroll behavior
- Custom scrollbar
- CSS animations performáticas

IMPORTANTE:
- Código PRODUCTION-READY
- Performance ultra-otimizada
- SEO máximo (titles, descriptions, alt texts)
- Cross-browser compatibility
- Validação W3C compliant

RETORNE APENAS O CÓDIGO HTML COMPLETO COM CSS INLINE OTIMIZADO.
`;

    return this.callOpenAI(prompt, 'gpt-4-turbo');
  }

  // ⚛️ GERADOR HTML + TAILWIND CDN (RENDERIZÁVEL DIRETO NO IFRAME)
  private static async generateReactTailwind(
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    const colors = logoAnalysis?.colors.dominant || (Array.isArray(projectData.design_colors) ? projectData.design_colors : ['#1C1F26', '#FFFFFF']);
    const images = projectData.generated_images || [];
    const logoUrl = projectData.logo_url || '';
    
    // ✅ 3. POSICIONAMENTO INTELIGENTE DO LOGO
    const logoPlacement = logoAnalysis ? suggestLogoPlacement(logoAnalysis) : null;
    
    // ✅ Extrair TODAS as informações do formulário
    const companyName = projectData.company_name || projectData.business_type || 'Empresa';
    const businessSector = projectData.business_type && projectData.business_type !== companyName
      ? projectData.business_type
      : '';
    const slogan = projectData.slogan || '';
    const shortDesc = projectData.short_description || '';
    const ctaText = projectData.cta_text || 'Entre em contato';
    const tone = projectData.tone || 'profissional';
    const fontStyle = projectData.font_style || 'moderno';
    const pages = Array.isArray(projectData.pages_needed) ? projectData.pages_needed : [];
    const customPages = Array.isArray(projectData.custom_page_titles) ? projectData.custom_page_titles : [];
    const allPages = [...pages, ...customPages];
    const features = Array.isArray(projectData.functionalities) ? projectData.functionalities : [];
    
    const prompt = `
Você é um WEB DESIGNER EXPERT especializado em criar sites INSTITUCIONAIS PROFISSIONAIS de altíssima qualidade seguindo o DESIGN SYSTEM WZ SOLUTION.

🎯 **MISSÃO CRÍTICA:** Criar um HTML COMPLETO E FUNCIONAL que funciona IMEDIATAMENTE no navegador, com Tailwind CSS via CDN e JavaScript vanilla para interatividade.

═══════════════════════════════════════════════════════════════════

🎨 **DESIGN SYSTEM WZ SOLUTION (BASE, ADAPTAR CORES DO CLIENTE):**

O design base segue estes princípios VISUAIS (mas você DEVE adaptar as CORES conforme a identidade visual do cliente):

**1. GLASSMORPHISM (Efeito Vidro):**
- Cards: \`background-color: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);\`
- Classe CSS: \`.glass\` (definir no <style> do documento)

**2. BACKGROUNDS ESCUROS COM GRADIENTES:**
- Base: \`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900\`
- **ADAPTAÇÃO:** Se o cliente tem cores claras, usar cores claras, mas manter o estilo glass e espaçamento

**3. CORES DE ACENTO (ADAPTAR À IDENTIDADE DO CLIENTE):**
- Padrão WZ: cyan-400, blue-400, purple-400, green-400
- **OBRIGATÓRIO:** Use as cores do cliente: ${colors.join(', ')} nos botões, links, ícones e destaques
- Se cliente tem cor primária ${colors[0]}, use ela em: botões, bordas de focus, ícones, gradientes

**4. ESPAÇAMENTO GENEROSO:**
- Seções: \`py-20\` (padding vertical 5rem)
- Gaps em grids: \`gap-6\` ou \`gap-8\`
- Cards: \`p-6\` ou \`p-8\`

**5. TIPOGRAFIA:**
- Títulos: Inter ou Poppins (Google Fonts), \`font-bold\`
- Texto: Inter, \`text-slate-300\` (ou cor adaptada ao contraste)
- Tamanhos: \`text-4xl sm:text-5xl\` para h2, \`text-lg\` para parágrafos

**6. HOVER EFFECTS E ANIMAÇÕES:**
- Cards: \`hover:scale-102 hover:shadow-2xl transition-all duration-300\`
- Botões: \`hover:scale-105 hover:shadow-2xl hover:shadow-[cor]/50 transition-all duration-300\`
- Inputs: \`focus:border-[cor-primária] focus:ring-2 focus:ring-[cor-primária]/50 transition-all\`

**7. BORDAS ARREDONDADAS:**
- Cards: \`rounded-xl\` ou \`rounded-2xl\`
- Botões: \`rounded-lg\`
- Inputs: \`rounded-lg\`

**⚠️ CRÍTICO - ADAPTAÇÃO DE CORES:**
- SEMPRE use as cores do cliente (${colors.join(', ')}) para botões, gradientes, bordas de focus, ícones
- Mantenha o estilo glass e estrutura, mas adapte cores ao tema do cliente
- Se cliente tem fundo claro, use fundo claro, mas mantenha o glass effect nos cards

⚠️ **FORMATO DE SAÍDA OBRIGATÓRIO:**
Você DEVE retornar um HTML COMPLETO E FUNCIONAL com:
1. <!DOCTYPE html>
2. <html>, <head>, <body> completos
3. Tailwind CSS via CDN no <head>: <script src="https://cdn.tailwindcss.com"></script>
4. JavaScript vanilla para interatividade (sem React)
5. CSS customizado inline quando necessário
6. Todas as imagens e logo usando URLs fornecidas

═══════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════

📊 **INFORMAÇÕES COMPLETAS DO PROJETO:**
🏢 Nome da Empresa: ${companyName}
${businessSector ? `📍 Setor/Negócio: ${businessSector}` : ''}
${slogan ? `💬 Slogan: "${slogan}"` : ''}
${shortDesc ? `📝 Descrição: ${shortDesc}` : ''}
🎯 Objetivo: ${projectData.business_objective || 'Atrair e converter clientes'}
👥 Público-Alvo: ${projectData.target_audience || 'Clientes'}
🎨 Tema Visual: ${projectData.design_style || 'Moderno e profissional'}
${tone ? `🗣️ Tom de voz: ${tone}` : ''}
${fontStyle ? `🔤 Estilo de fonte: ${fontStyle}` : ''}
⚙️ Funcionalidades: ${features.length > 0 ? features.join(', ') : 'Site institucional'}
📄 Páginas: ${allPages.length > 0 ? allPages.join(', ') : 'Home, Sobre, Serviços, Contato'}
${ctaText ? `🎯 Texto do CTA: "${ctaText}"` : ''}

${projectData.conversation_context ? `
💬 **CONTEXTO ADICIONAL DA CONVERSA:**
${projectData.conversation_context.substring(0, 500)}
**Importante:** Considere essas informações para personalizar o layout e funcionalidades.
` : ''}

═══════════════════════════════════════════════════════════════════

🎨 **IDENTIDADE VISUAL INTEGRADA:**
${logoUrl ? `
🎭 **LOGO OBRIGATÓRIO:**
- URL DO LOGO: ${logoUrl}
**⚠️ CRÍTICO: Use esta URL EXATA do logo no header: <img src="${logoUrl}" alt="Logo" class="h-12" />**
` : ''}
${logoAnalysis ? `
- Cores Principais: ${logoAnalysis.colors.dominant.join(', ')}
- Cores de Destaque: ${logoAnalysis.colors.accent.join(', ')}
- Estilo: ${logoAnalysis.style}
- Personalidade: ${logoAnalysis.mood.join(', ')}
` : `
🎨 **CORES DO PROJETO:**
- Principal: ${colors[0] || '#1C1F26'}
- Secundária: ${colors[1] || '#FFFFFF'}
- Destaque: ${colors[2] || '#D4AF37'}
`}

${images.length > 0 ? `
🖼️ **IMAGENS PROFISSIONAIS HD GERADAS:**
- Hero Background: ${images[0]} (Use como background da seção hero)
${images[1] ? `- About/Sobre: ${images[1]} (Use na seção sobre)` : ''}
${images[2] ? `- Background Pattern: ${images[2]} (Use como pattern/textura)` : ''}
**⚠️ OBRIGATÓRIO: Use essas URLs EXATAS nas tags <img> ou CSS background-image!**
` : `
📷 **IMAGENS PLACEHOLDER:**
Use imagens placeholder profissionais com Unsplash: https://images.unsplash.com/photo-...
Ou crie divs com gradientes coloridos elegantes baseados nas cores do projeto.
`}

═══════════════════════════════════════════════════════════════════

🚀 **STACK TÉCNICO (HTML PURO + TAILWIND CDN):**
- ✅ HTML5 Semântico
- ✅ Tailwind CSS via CDN (script no head)
- ✅ JavaScript Vanilla para interatividade
- ✅ Google Fonts (Inter, Poppins)
- ✅ Font Awesome CDN para ícones (se necessário)
- ✅ Animations CSS ou JavaScript suave
- 📱 Mobile-first responsive (Tailwind classes)
- ⚡ Performance otimizada
- ♿ Acessibilidade básica

═══════════════════════════════════════════════════════════════════

🏗️ **ESTRUTURA HTML OBRIGATÓRIA:**

1. **🎭 HEADER PREMIUM COM LOGO:**
   - <header class="flex items-center justify-${logoPlacement?.placement === 'centered' ? 'center' : 'between'} bg-[${colors[0]}] text-white sticky top-0 z-50 p-4">
   - Logo: ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="${logoPlacement?.size || 'h-12'} ${logoPlacement?.bgPreference === 'light' ? 'mix-blend-screen' : ''}" />` : `<div class="h-12 w-32 bg-white rounded">${companyName}</div>`}
   - <nav> com links para as páginas: ${allPages.length > 0 ? allPages.join(', ') : 'Home, Sobre, Serviços, Contato'}
   - Menu mobile com hamburger button (JavaScript toggle)
   - CTA button "${ctaText}" com hover effect (bg-[${colors[2] || '#D4AF37'}] hover:bg-opacity-90)

2. **🚀 HERO SECTION CINEMATOGRÁFICA:**
   - <section class="relative min-h-screen flex items-center justify-center">
   - Background: ${images.length > 0 ? `<div style="background-image: url(${images[0]}); background-size: cover; background-position: center;">` : `<div class="bg-gradient-to-br from-[${colors[0]}] to-[${colors[2] || colors[0]}]">`}
   - Overlay escuro: <div class="absolute inset-0 bg-black/40">
   - Headline: <h1 class="text-4xl md:text-6xl font-bold text-white">${companyName}${slogan ? ` - ${slogan}` : ''}</h1>
   - Subheadline: <p class="text-lg md:text-xl text-white/90 mt-4">${shortDesc || projectData.business_objective || 'Transformando sua presença digital'}</p>
   - CTA button principal: <a href="#contato" class="bg-[${colors[2] || '#D4AF37'}] hover:bg-opacity-90 text-white px-8 py-3 rounded-lg">${ctaText}</a>

3. **📖 SOBRE NÓS:**
   - <section class="py-20 bg-white">
   - Grid layout: <div class="grid md:grid-cols-2 gap-8">
   - Imagem OU texto destaque
   - Cards com stats/conquistas

4. **🛠️ SERVIÇOS:**
   - <section class="py-20 bg-gray-50">
   - Grid responsivo: <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
   - Cards: <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 p-6">
   - Ícones Font Awesome ou emojis

5. **💬 DEPOIMENTOS (se solicitado):**
   - <section class="py-20">
   - Cards com bordas arredondadas e sombra
   - Stars visuais (⭐ ou Font Awesome)

6. **📞 CONTATO:**
   - <section class="py-20 bg-[${colors[0]}] text-white">
   - Formulário: <form> com inputs (Nome, Email, Telefone, Mensagem)
   - Validação JavaScript básica
   ${features.includes('formulário') || features.includes('Formulário') || features.includes('contact') ? '- Formulário de contato funcional (apenas front-end, sem backend)' : ''}

7. **🔗 FOOTER:**
   - <footer class="bg-[${colors[0]}] text-white py-12">
   - Grid com links organizados
   - Redes sociais com ícones Font Awesome
   - Copyright

═══════════════════════════════════════════════════════════════════

🎨 **TAILWIND CSS AVANÇADO:**

\`\`\`css
/* Custom Theme Extension */
theme: {
  extend: {
    colors: {
      primary: '${colors[0] || "#1e40af"}',
      secondary: '${colors[1] || "#06b6d4"}',
      accent: '${logoAnalysis?.colors.accent[0] || "#f59e0b"}',
    },
    fontFamily: {
      primary: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
    },
    animation: {
      'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      'slide-in-right': 'slideInRight 0.8s ease-out forwards',
      'scale-in': 'scaleIn 0.5s ease-out forwards',
    }
  }
}
\`\`\`

**Classes Customizadas:**
- \`.glass-effect\`: backdrop-blur-sm bg-white/10
- \`.gradient-text\`: bg-gradient-to-r from-primary to-secondary
- \`.shadow-glow\`: shadow-[0_0_30px_rgba(59,130,246,0.3)]
- \`.card-hover\`: hover:scale-105 hover:shadow-xl transition-all duration-300

═══════════════════════════════════════════════════════════════════

🎬 **ANIMAÇÕES E INTERATIVIDADE CSS/JS:**

Use CSS transitions e JavaScript vanilla para criar interatividade:

\`\`\`css
/* Animações suaves */
* { transition: all 0.3s ease; }
.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
\`\`\`

\`\`\`javascript
// JavaScript vanilla para interatividade
// Menu mobile toggle
document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('.mobile-menu').classList.toggle('hidden');
});
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
\`\`\`

═══════════════════════════════════════════════════════════════════

📱 **RESPONSIVIDADE EXTREMA:**
- Mobile: 320px+ (single column, touch-optimized)
- Tablet: 768px+ (2 columns, hybrid interactions)
- Desktop: 1024px+ (3+ columns, hover effects)
- Large: 1280px+ (max-width constraints)
- 4K: 1920px+ (scaled layouts)

⚡ **PERFORMANCE CRÍTICA:**
- Lazy loading para imagens (loading="lazy")
- CSS inline mínimo
- JavaScript apenas para interatividade essencial
- Preload de fonts críticas (Google Fonts)
- Imagens otimizadas (use URLs fornecidas ou placeholders otimizados)

♿ **ACESSIBILIDADE OBRIGATÓRIA:**
- aria-labels em todos elementos interativos
- Focus management para navegação por teclado
- Alt texts descritivos para imagens
- Contrast ratio 4.5:1 mínimo
- Screen reader compatibility

═══════════════════════════════════════════════════════════════════

${features.includes('whatsapp') || features.includes('WhatsApp') ? `
═══════════════════════════════════════════════════════════════════

📱 **BOTÃO WHATSAPP FLUTUANTE OBRIGATÓRIO:**

Você DEVE implementar um botão WhatsApp FLUTUANTE FIXO no canto inferior direito:

\`\`\`html
<!-- Botão WhatsApp Flutuante -->
<a href="https://wa.me/5511947293221?text=Olá! Vim pelo site e gostaria de mais informações" 
   target="_blank"
   class="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse"
   aria-label="Falar no WhatsApp">
  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.873.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
</a>
\`\`\`

**CARACTERÍSTICAS OBRIGATÓRIAS:**
- ✅ Posição: fixed bottom-6 right-6 (canto inferior direito)
- ✅ Cor: #25D366 (verde WhatsApp oficial)
- ✅ z-index: 50 (sempre visível sobre outros elementos)
- ✅ Animação: pulse ou bounce sutil
- ✅ Hover: escala 1.1 e sombra aumentada
- ✅ Responsivo: tamanho adequado em mobile
- ✅ Link: https://wa.me/5511947293221?text=Olá! Vim pelo site e gostaria de mais informações

` : ''}

${features.includes('testimonials') || features.includes('Depoimentos') || features.includes('depoimentos') ? `
═══════════════════════════════════════════════════════════════════

💬 **SEÇÃO DE DEPOIMENTOS - PADRÃO WZ SOLUTION (ADAPTAR CORES):**

Você DEVE criar uma seção de depoimentos seguindo o PADRÃO VISUAL WZ SOLUTION (mas ADAPTANDO AS CORES conforme identidade visual do cliente):

**ESTRUTURA OBRIGATÓRIA (PADRÃO WZ SOLUTION):**
- Background: \`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900\` OU adapte para cores do cliente (${colors.join(', ')})
- Grid 2x2 (2 colunas desktop, 1 mobile): \`grid grid-cols-1 md:grid-cols-2 gap-8\`
- Cards: **GLASS EFFECT** - \`background-color: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);\`
- Bordas arredondadas: \`rounded-2xl\`
- Espaçamento generoso: \`py-20\`, \`p-8\` no card, \`gap-8\`

**CARD DE DEPOIMENTO (ELEMENTOS OBRIGATÓRIOS - ESTILO WZ):**
1. **Estrelas no topo esquerdo:** 5 estrelas SVG amarelas (preencher) ou texto ★★★★★
2. **Ícone de aspas SVG grande no canto superior direito:** SVG de aspas (ou texto "99"), cor de acento (${colors[0] || 'cyan-400'}), opacity 20-30%, posição \`absolute top-6 right-6\`, tamanho \`w-12 h-12\`
3. **Texto do depoimento:** \`text-slate-300\` (ou cor adaptada), \`text-lg leading-relaxed mb-6 relative z-10\`
4. **Informações do autor embaixo:**
   - Avatar circular: \`w-12 h-12 rounded-full bg-gradient-to-br from-[cor-primária] to-[cor-secundária] flex items-center justify-center text-white font-bold\` (use cores do cliente)
   - Nome: \`text-white font-semibold\`
   - Cargo/empresa: \`text-slate-400 text-sm\`

**ADAPTAÇÃO DE CORES (CRÍTICO):**
- Use as cores da identidade visual do cliente: ${colors.join(', ')}
- Se cliente tem cores escuras: mantenha background escuro, texto claro
- Se cliente tem cores claras: use background claro, texto escuro, mas mantenha glass effect
- Aspas decorativas: usar cor de destaque (${colors[0] || 'cyan-400'})
- Gradientes nos avatares: usar cores do cliente, não cores fixas

\`\`\`html
<!-- Adicione no <style> do documento: -->
<style>
.glass {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>

<section class="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
  <!-- Background decoration opcional -->
  <div class="absolute inset-0">
    <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style="background: ${colors[0] || 'rgba(6, 182, 212, 0.05)'};"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style="background: ${colors.length > 1 ? colors[1] : 'rgba(37, 99, 235, 0.05)'};"></div>
  </div>
  
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl sm:text-5xl font-bold text-center mb-16">O que nossos clientes dizem</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <!-- Card Depoimento - Glass Effect -->
      <div class="glass rounded-2xl p-8 relative group cursor-pointer hover:scale-102 hover:shadow-2xl transition-all duration-300">
        <!-- Ícone de aspas SVG grande decorativo -->
        <div class="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24" style="color: ${colors[0] || '#06b6d4'};">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>
        
        <!-- Estrelas no topo -->
        <div class="flex items-center mb-4">
          <div class="flex text-yellow-400">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.488 6.91l6.572-.955L10 0l2.94 5.955 6.572.955-4.757 4.635 1.123 6.545z"/></svg>
            <!-- Repetir 5x -->
          </div>
        </div>
        
        <!-- Texto do depoimento -->
        <p class="text-slate-300 leading-relaxed mb-6 relative z-10 text-lg">
          "Depoimento personalizado baseado no setor ${businessSector || companyName} e informações do formulário..."
        </p>
        
        <!-- Informações do autor -->
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style="background: linear-gradient(135deg, ${colors[0] || '#06b6d4'}, ${colors.length > 1 ? colors[1] : '#2563eb'});">
            CN
          </div>
          <div>
            <div class="text-white font-semibold">Nome do Cliente</div>
            <div class="text-slate-400 text-sm">Cargo - Empresa</div>
          </div>
        </div>
      </div>
      <!-- Repetir para 4 cards total -->
    </div>
  </div>
</section>
\`\`\`

**IMPORTANTE:**
- Use as cores reais do projeto: ${colors.join(', ')}
- SEMPRE defina a classe \`.glass\` no <style> do documento
- Adapte texto (branco/preto) conforme contraste
- Gere 4 depoimentos realistas baseados no setor: ${businessSector || companyName}
- Mantenha o glass effect mesmo se adaptar cores do background

` : ''}

${features.includes('booking') || features.includes('Agendamento') || features.includes('agendamento') ? `
═══════════════════════════════════════════════════════════════════

📅 **SEÇÃO DE AGENDAMENTO - IMPLEMENTAÇÃO REAL:**

Você DEVE criar uma seção de agendamento VISUAL E FUNCIONAL (front-end completo):

**ADAPTE AS CORES:** Use as cores da identidade visual: ${colors.join(', ')}

\`\`\`html
<section class="py-20" style="background: linear-gradient(135deg, ${colors[0] || '#1e3a8a'}, ${colors[1] || colors[0] || '#2563eb'}); color: white;">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-4">Agende seu horário</h2>
    <p class="text-center opacity-90 mb-12">Preencha os dados abaixo e entraremos em contato</p>
    
    <div class="max-w-2xl mx-auto">
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
        <form class="space-y-6" onsubmit="event.preventDefault(); alert('Formulário enviado! (Demo front-end)');">
          <!-- Data e Hora lado a lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-semibold">Data</label>
              <input type="date" required class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
            </div>
            <div>
              <label class="block mb-2 font-semibold">Horário</label>
              <input type="time" required class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
            </div>
          </div>
          
          <!-- Nome e Telefone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-semibold">Nome completo</label>
              <input type="text" placeholder="Seu nome" required class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
            </div>
            <div>
              <label class="block mb-2 font-semibold">Telefone/WhatsApp</label>
              <input type="tel" placeholder="(00) 00000-0000" required pattern="[0-9]{10,11}" class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
            </div>
          </div>
          
          <!-- Mensagem -->
          <div>
            <label class="block mb-2 font-semibold">Observações (opcional)</label>
            <textarea rows="4" placeholder="Alguma observação especial?" class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none resize-none focus:ring-2 focus:ring-white/50"></textarea>
          </div>
          
          <!-- Botão -->
          <button type="submit" class="w-full bg-white text-[${colors[0] || '#1e3a8a'}] py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Agendar Agora
          </button>
          
          <p class="text-center opacity-80 text-sm mt-4">
            Ou entre em contato pelo <a href="https://wa.me/5511947293221?text=Olá! Gostaria de agendar" target="_blank" class="underline hover:opacity-100">WhatsApp</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</section>
\`\`\`

**CARACTERÍSTICAS:**
- ✅ Formulário funcional com validação HTML5
- ✅ Glass effect (backdrop-blur) no card
- ✅ Cores adaptadas à identidade visual
- ✅ Validação básica (required, pattern)
- ✅ Feedback visual (focus states, hover)
- ✅ Link para WhatsApp funcional

` : ''}

${features.includes('gallery') || features.includes('Galeria') || features.includes('galeria') ? `
═══════════════════════════════════════════════════════════════════

🖼️ **SEÇÃO DE GALERIA - IMPLEMENTAÇÃO REAL:**

Você DEVE criar uma galeria de imagens FUNCIONAL com lightbox modal:

**ADAPTE AS CORES:** Use as cores da identidade visual: ${colors.join(', ')}

\`\`\`html
<section class="py-20" style="background: ${colors.length > 1 ? colors[1] : '#f8f9fa'};">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-16" style="color: ${colors[0] || '#1e3a8a'};">Nossa Galeria</h2>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <!-- Item da galeria -->
      <div class="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300" onclick="openLightbox(this)">
        <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400" 
             alt="Galeria ${companyName}" 
             class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
          </svg>
        </div>
      </div>
      <!-- Repetir 8-12 imagens -->
    </div>
  </div>
</section>

<!-- Lightbox Modal -->
<div id="lightbox" class="fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4">
  <button onclick="closeLightbox()" class="absolute top-4 right-4 text-white text-4xl hover:text-gray-300">&times;</button>
  <img id="lightbox-img" src="" alt="" class="max-w-7xl max-h-[90vh] object-contain">
</div>

<script>
function openLightbox(element) {
  const img = element.querySelector('img');
  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}
</script>
\`\`\`

**CARACTERÍSTICAS:**
- ✅ Grid responsivo (2-4 colunas conforme breakpoint)
- ✅ Hover effect: zoom da imagem + overlay com gradiente
- ✅ Lightbox modal funcional (clique abre imagem ampliada)
- ✅ Fechar com X ou clique fora
- ✅ Background adaptado às cores do projeto

` : ''}

${features.includes('map') || features.includes('Mapa') || features.includes('localização') || features.includes('localizacao') ? `
═══════════════════════════════════════════════════════════════════

📍 **SEÇÃO DE MAPA - IMPLEMENTAÇÃO REAL:**

Você DEVE criar uma seção de localização FUNCIONAL com mapa do Google Maps:

**ADAPTE AS CORES:** Use as cores da identidade visual: ${colors.join(', ')}

\`\`\`html
<section class="py-20" style="background: ${colors.length > 1 ? colors[1] : '#f8f9fa'};">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-16" style="color: ${colors[0] || '#1e3a8a'};">Nossa Localização</h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <!-- Informações -->
      <div class="rounded-2xl p-8 shadow-xl space-y-6" style="background: ${colors[0] || '#1e3a8a'}; color: white;">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold mb-1 text-lg">Endereço</h3>
            <p class="opacity-90">Rua Exemplo, 123 - Centro<br>${companyName} - Cidade/UF</p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold mb-1 text-lg">Telefone</h3>
            <p class="opacity-90">
              <a href="tel:+5511947293221" class="hover:underline">(11) 94729-3221</a><br>
              <a href="https://wa.me/5511947293221" target="_blank" class="hover:underline">WhatsApp</a>
            </p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.2);">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold mb-1 text-lg">Horário de Funcionamento</h3>
            <p class="opacity-90">Segunda a Sexta: 09h às 18h<br>Sábado: 09h às 13h</p>
          </div>
        </div>
      </div>
      
      <!-- Mapa Google Maps FUNCIONAL -->
      <div class="rounded-2xl overflow-hidden shadow-xl">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1974902922!2d-46.633309!3d-23.55052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjkiUyA0NsKwMzcnNTkuOSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890" 
                width="100%" 
                height="400" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  </div>
</section>
\`\`\`

**CARACTERÍSTICAS:**
- ✅ Grid 2 colunas (informações + mapa)
- ✅ Card colorido usando cor principal do projeto
- ✅ Ícones em círculos translúcidos
- ✅ Links clicáveis (telefone, WhatsApp)
- ✅ Mapa Google Maps integrado e funcional
- ✅ Cores adaptadas à identidade visual

` : ''}

${features.includes('faq') || features.includes('FAQ') ? `
═══════════════════════════════════════════════════════════════════

❓ **SEÇÃO FAQ - IMPLEMENTAÇÃO REAL:**

Você DEVE criar uma seção FAQ com accordion FUNCIONAL e interativo:

**ADAPTE AS CORES:** Use as cores da identidade visual: ${colors.join(', ')}

\`\`\`html
<section class="py-20" style="background: ${colors.length > 1 ? colors[1] : '#f8f9fa'};">
  <div class="container mx-auto px-4 max-w-4xl">
    <h2 class="text-4xl font-bold text-center mb-16" style="color: ${colors[0] || '#1e3a8a'};">Perguntas Frequentes</h2>
    
    <div class="space-y-4">
      <!-- Item FAQ -->
      <div class="rounded-xl overflow-hidden shadow-lg" style="background: white; border: 2px solid ${colors[0] || '#1e3a8a'}20;">
        <button onclick="toggleFAQ(this)" class="w-full px-6 py-5 text-left flex items-center justify-between hover:opacity-80 transition-opacity" style="color: ${colors[0] || '#1e3a8a'};">
          <span class="font-semibold text-lg">Qual é o tempo de entrega?</span>
          <svg class="w-5 h-5 transform transition-transform faq-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div class="faq-content hidden px-6 py-4 border-t" style="border-color: ${colors[0] || '#1e3a8a'}20; color: #555;">
          <p>Resposta personalizada gerada com base no setor: ${businessSector || companyName}. Normalmente entregamos em X dias úteis.</p>
        </div>
      </div>
      <!-- Repetir para 5-7 perguntas relevantes -->
    </div>
  </div>
</section>

<script>
function toggleFAQ(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector('.faq-icon');
  const isHidden = content.classList.contains('hidden');
  
  // Fechar outros FAQs
  document.querySelectorAll('.faq-content').forEach(el => {
    if (el !== content) {
      el.classList.add('hidden');
      el.previousElementSibling.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
    }
  });
  
  // Toggle atual
  if (isHidden) {
    content.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
  }
}
</script>
\`\`\`

**CARACTERÍSTICAS:**
- ✅ Accordion funcional com JavaScript vanilla
- ✅ Animação de rotação no ícone
- ✅ Apenas um item aberto por vez
- ✅ Perguntas e respostas geradas baseadas no setor: ${businessSector || companyName}
- ✅ Cores adaptadas à identidade visual

` : ''}

${features.includes('contact-form') || features.includes('formulário') || features.includes('formulario') || features.includes('contact') ? `
═══════════════════════════════════════════════════════════════════

📝 **FORMULÁRIO DE CONTATO - IMPLEMENTAÇÃO REAL:**

Você DEVE criar um formulário FUNCIONAL com validação:

**ADAPTE AS CORES:** Use as cores da identidade visual: ${colors.join(', ')}

\`\`\`html
<section class="py-20" style="background: linear-gradient(135deg, ${colors[0] || '#1e3a8a'}, ${colors[1] || colors[0] || '#2563eb'}); color: white;">
  <div class="container mx-auto px-4">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-4xl font-bold text-center mb-4">Entre em Contato</h2>
      <p class="text-center opacity-90 mb-12">Preencha o formulário e retornaremos em breve</p>
      
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
        <form class="space-y-6" onsubmit="event.preventDefault(); handleContactSubmit(this);">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Nome completo" required 
                   class="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
            <input type="email" name="email" placeholder="Email" required 
                   class="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
          </div>
          <input type="tel" name="phone" placeholder="Telefone/WhatsApp" required pattern="[0-9]{10,11}"
                 class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50">
          <textarea name="message" rows="5" placeholder="Sua mensagem" required
                    class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-white focus:outline-none resize-none focus:ring-2 focus:ring-white/50"></textarea>
          <button type="submit" class="w-full bg-white text-[${colors[0] || '#1e3a8a'}] py-4 rounded-lg font-bold hover:bg-opacity-90 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

<script>
function handleContactSubmit(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Validação
  if (!data.name || !data.email || !data.message) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }
  
  // Exibir mensagem de sucesso
  alert('Mensagem enviada com sucesso! Retornaremos em breve.\n\n(Demo front-end - sem backend)');
  form.reset();
  
  // Opcional: Redirecionar para WhatsApp
  // window.location.href = \`https://wa.me/5511947293221?text=Mensagem: \${encodeURIComponent(data.message)}\`;
}
</script>
\`\`\`

**CARACTERÍSTICAS:**
- ✅ Formulário funcional com validação HTML5
- ✅ Glass effect (backdrop-blur) no card
- ✅ Validação JavaScript adicional
- ✅ Feedback visual (alerta de sucesso)
- ✅ Reset do formulário após envio
- ✅ Cores adaptadas à identidade visual

` : ''}

⚠️ **REQUISITOS CRÍTICOS NÃO NEGOCIÁVEIS:**

1. **🎭 LOGO OBRIGATÓRIO:** ${logoUrl ? `Use <img src="${logoUrl}"> no header` : 'Criar logo placeholder visual'}
2. **🖼️ IMAGENS OBRIGATÓRIAS:** ${images.length > 0 ? `Use URLs fornecidas: ${images[0]}` : 'Criar backgrounds com gradientes coloridos elegantes'}
3. **🎨 CORES EXATAS:** Implemente ${colors[0]} e ${colors[1]} em TODOS os elementos (header, buttons, cards, footer)
4. **📱 MOBILE PERFECT:** Site deve ser perfeito em mobile com classes Tailwind responsivas
5. **🚀 PERFORMANCE:** Imagens com loading="lazy", CSS otimizado
6. **💎 QUALIDADE PREMIUM:** Design profissional com cores aplicadas, não fundo branco vazio
7. **🎬 ANIMAÇÕES SUAVES:** Use CSS transitions e hover effects do Tailwind

═══════════════════════════════════════════════════════════════════

🎯 **FORMATO DE SAÍDA OBRIGATÓRIO - HTML PURO:**

⚠️ **CRÍTICO:** Retorne APENAS HTML COMPLETO E FUNCIONAL que funciona IMEDIATAMENTE no navegador!

Estrutura mínima obrigatória:
\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectData.business_type || 'Site Profissional'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${colors[0] || '#1C1F26'}',
            secondary: '${colors[1] || '#FFFFFF'}',
            accent: '${colors[2] || '#D4AF37'}',
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4 { font-family: 'Poppins', sans-serif; font-weight: 700; }
  </style>
</head>
<body class="min-h-screen">
  <!-- Header, Hero, About, Services, Contact, Footer aqui -->
</body>
</html>
\`\`\`

**⚠️ REGRAS FINAIS CRÍTICAS:**

1. **HTML COMPLETO:** Comece com <!DOCTYPE html> e inclua <head> com Tailwind CDN
2. **CSS GLASS OBRIGATÓRIO:** SEMPRE inclua o CSS \`.glass\` no <style> (veja seção acima)
3. **CORES OBRIGATÓRIAS:** Use bg-[${colors[0]}], text-[${colors[1]}], border-[${colors[0]}] em TODOS os elementos principais
4. **LOGO OBRIGATÓRIO:** ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-12 md:h-16">` : 'Criar logo placeholder'}
5. **IMAGENS OBRIGATÓRIAS:** ${images.length > 0 ? `Use <img src="${images[0]}"> ou style="background-image: url(${images[0]})"` : 'Use gradientes coloridos ou placeholders Unsplash'}
6. **DESIGN PROFISSIONAL:** Use glass effect nos cards, backgrounds com gradientes escuros (ou adapte cores do cliente), espaçamento generoso (py-20)
7. **PADRÃO WZ SOLUTION:** Todos os cards devem usar classe \`.glass\`, hover effects suaves, bordas arredondadas (rounded-2xl)
8. **RESPONSIVO:** Use classes md: e lg: do Tailwind para breakpoints
9. **JAVASCRIPT:** Apenas vanilla JS para interatividade (sem React/Frameworks)
10. **ADAPTAÇÃO DE CORES:** Mantenha o estilo glass e estrutura, mas adapte cores aos dados do cliente (${colors.join(', ')})

**RETORNE APENAS O CÓDIGO HTML COMPLETO - NÃO retorne React/JSX!**

═══════════════════════════════════════════════════════════════════

🎨 **CSS OBRIGATÓRIO NO <style> DO DOCUMENTO:**

Você DEVE incluir este CSS no <style> do documento para garantir o glass effect:

\`\`\`html
<style>
/* Glass Effect - OBRIGATÓRIO */
.glass {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Garantir que o body tenha background escuro como padrão */
body {
  background-color: #0f172a; /* slate-900 */
  color: white;
  font-family: 'Inter', sans-serif;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Transições suaves */
* {
  transition: all 0.3s ease;
}
</style>
\`\`\`

**⚠️ CRÍTICO:** SEMPRE inclua a classe \`.glass\` no CSS e use-a nos cards de todas as funcionalidades (depoimentos, formulários, FAQ, etc.)
`;

    return this.callOpenAI(prompt, 'gpt-4-turbo');
  }

  // 🟢 GERADOR VUE + NUXT
  private static async generateVueNuxt(
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    const prompt = `
Você é um desenvolvedor EXPERT em Vue.js + Nuxt.js.

CRIAR APLICAÇÃO VUE MODERNA E HÍBRIDA:

🏢 **PROJETO:**
- Empresa: ${projectData.business_type}
- Objetivo: ${projectData.business_objective}
- Estilo: ${projectData.design_style}

🚀 **VUE/NUXT FEATURES:**
- Vue 3 Composition API
- Nuxt 3 com SSR/SSG
- Pinia para state management
- CSS Modules ou SCSS
- Auto-imports e file-based routing

📋 **TEMPLATE STRUCTURE:**
\`\`\`vue
<template>
  <div class="min-h-screen">
    <!-- Componentes Vue aqui -->
  </div>
</template>

<script setup>
// Composition API aqui
</script>

<style scoped>
/* Styling aqui */
</style>
\`\`\`

RETORNE CÓDIGO VUE COMPLETO COM STYLING MODERNO.
`;

    return this.callOpenAI(prompt, 'gpt-4-turbo');
  }

  // 🧡 GERADOR SVELTE + SVELTEKIT
  private static async generateSvelteKit(
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    const prompt = `
Você é um desenvolvedor EXPERT em Svelte + SvelteKit.

CRIAR APLICAÇÃO SVELTE ULTRA-PERFORMÁTICA:

🏢 **PROJETO:**
- Empresa: ${projectData.business_type}
- Objetivo: ${projectData.business_objective}

🚀 **SVELTE FEATURES:**
- Svelte 4 com reatividade nativa
- SvelteKit para SSR/routing
- CSS-in-JS ou SCSS
- Stores para state management
- Animations nativas do Svelte

ESTRUTURA:
\`\`\`svelte
<script>
  // Logic aqui
</script>

<main>
  <!-- Markup aqui -->
</main>

<style>
  /* Styling aqui */
</style>
\`\`\`

RETORNE CÓDIGO SVELTE COMPLETO OTIMIZADO.
`;

    return this.callOpenAI(prompt, 'gpt-4-turbo');
  }

  // 📘 GERADOR WORDPRESS MODERNO
  private static async generateWordPress(
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    const prompt = `
Você é um desenvolvedor EXPERT em WordPress + Elementor.

CRIAR ESTRUTURA WORDPRESS PROFISSIONAL:

🏢 **PROJETO:**
- Empresa: ${projectData.business_type}
- Objetivo: ${projectData.business_objective}

Gere instruções detalhadas para:
1. Theme personalizado
2. Elementor Pro templates
3. Custom fields necessários
4. Plugins recomendados
5. Otimizações de performance

RETORNE GUIA COMPLETO WORDPRESS + CÓDIGO DE EXAMPLE.
`;

    return this.callOpenAI(prompt, 'gpt-4-turbo');
  }

  // 🎮 GERADOR THREE.JS CRIATIVO
  private static async generateThreeJS(
    projectData: ProjectData,
    logoAnalysis?: LogoAnalysis
  ): Promise<string> {
    
    const prompt = `
Você é um desenvolvedor EXPERT em Three.js + WebGL.

CRIAR EXPERIÊNCIA 3D INTERATIVA:

🏢 **PROJETO:**
- Empresa: ${projectData.business_type}
- Estilo: ${projectData.design_style}

🚀 **THREE.JS FEATURES:**
- Three.js + React Three Fiber
- WebGL shaders customizados
- GSAP para animations
- Responsive 3D viewport
- Performance optimization

RETORNE CÓDIGO REACT + THREE.JS COMPLETO COM CENA 3D INTERATIVA.
`;

    return this.callOpenAI(prompt, 'gpt-4-turbo');
  }

  // 🤖 HELPER PARA CHAMADAS OPENAI
  private static async callOpenAI(prompt: string, model: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'Você é um desenvolvedor full-stack expert que gera código de altíssima qualidade.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erro na geração de código:', error);
      throw error;
    }
  }
}

// 🎯 FUNÇÃO PRINCIPAL PARA EXPORT
export async function generateIntelligentSite(
  projectData: ProjectData,
  logoAnalysis?: LogoAnalysis
) {
  return MultiStackGenerator.generateOptimalSite(projectData, logoAnalysis);
}
