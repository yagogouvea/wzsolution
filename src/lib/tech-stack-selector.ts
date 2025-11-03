// 🧠 SISTEMA INTELIGENTE DE SELEÇÃO DE TECNOLOGIA
// Analisa perfil do cliente e escolhe a melhor stack

export interface TechStack {
  id: string;
  name: string;
  displayName: string;
  description: string;
  
  // Características técnicas
  complexity: 'simple' | 'medium' | 'advanced';
  performance: 'high' | 'medium' | 'low';
  interactivity: 'basic' | 'medium' | 'advanced';
  scalability: 'low' | 'medium' | 'high';
  
  // Casos de uso ideais
  idealFor: string[];
  sectors: string[];
  businessTypes: string[];
  
  // Configurações
  frameworks: string[];
  styling: string[];
  features: string[];
  
  // Limitações
  limitations: string[];
  notRecommendedFor: string[];
}

// 🚀 CATÁLOGO DE TECNOLOGIAS DISPONÍVEIS
export const availableStacks: TechStack[] = [
  {
    id: 'html-css-premium',
    name: 'HTML/CSS Premium',
    displayName: 'HTML5 + CSS3 Avançado',
    description: 'Sites ultra-otimizados com HTML5 semântico e CSS3 avançado',
    
    complexity: 'simple',
    performance: 'high',
    interactivity: 'basic',
    scalability: 'low',
    
    idealFor: [
      'Sites institucionais',
      'Landing pages',
      'Portfólios simples',
      'Sites corporativos tradicionais',
      'SEO máximo'
    ],
    
    sectors: [
      'advocacia',
      'medicina',
      'contabilidade', 
      'consultoria',
      'serviços tradicionais'
    ],
    
    businessTypes: [
      'escritório de advocacia',
      'clínica médica',
      'contador',
      'consultor',
      'empresa tradicional'
    ],
    
    frameworks: ['HTML5', 'CSS3', 'Vanilla JavaScript'],
    styling: ['CSS Grid', 'Flexbox', 'Custom CSS', 'Google Fonts'],
    features: ['SEO otimizado', 'Performance máxima', 'Acessibilidade'],
    
    limitations: ['Interatividade limitada', 'Animações básicas'],
    notRecommendedFor: ['E-commerce complexo', 'Apps interativos', 'Dashboards']
  },

  {
    id: 'react-tailwind',
    name: 'React + Tailwind',
    displayName: 'React/Next.js + Tailwind CSS',
    description: 'Sites modernos com componentes React e styling avançado',
    
    complexity: 'medium',
    performance: 'high',
    interactivity: 'advanced',
    scalability: 'high',
    
    idealFor: [
      'Startups tech',
      'Agências digitais', 
      'SaaS companies',
      'E-commerce moderno',
      'Aplicações interativas',
      'Negócios modernos',
      'Serviços criativos',
      'Estabelecimentos lifestyle'
    ],
    
    sectors: [
      'tecnologia',
      'marketing digital',
      'e-commerce',
      'startups',
      'agências',
      'barbearia',
      'salão de beleza',
      'restaurante',
      'bar',
      'entretenimento',
      'lifestyle',
      'moda',
      'design'
    ],
    
    businessTypes: [
      'startup',
      'agência digital',
      'empresa de tecnologia',
      'loja online',
      'consultoria digital',
      'barbearia',
      'barbearia + bar',
      'barberia + bar',
      'babearia e bar',
      'salão de beleza',
      'restaurante',
      'bar',
      'café',
      'loja de moda',
      'academia',
      'estúdio',
      'clínica estética',
      'centro de bem-estar'
    ],
    
    frameworks: ['React', 'Next.js', 'Framer Motion'],
    styling: ['Tailwind CSS', 'Headless UI', 'Radix UI'],
    features: ['Componentes reutilizáveis', 'Animações avançadas', 'Estado reativo'],
    
    limitations: ['Curva de aprendizado', 'Requires JavaScript'],
    notRecommendedFor: ['Clientes muito conservadores', 'Sites super simples']
  },

  {
    id: 'vue-nuxt',
    name: 'Vue + Nuxt',
    displayName: 'Vue.js + Nuxt.js',
    description: 'Framework progressivo ideal para sites híbridos',
    
    complexity: 'medium',
    performance: 'high',
    interactivity: 'advanced',
    scalability: 'high',
    
    idealFor: [
      'Sites híbridos (estático + dinâmico)',
      'E-commerce avançado',
      'Portais de conteúdo',
      'Blogs profissionais',
      'Sites multiidioma'
    ],
    
    sectors: [
      'mídia',
      'editorial',
      'e-commerce',
      'educação',
      'entretenimento'
    ],
    
    businessTypes: [
      'blog profissional',
      'portal de notícias',
      'loja online',
      'escola',
      'revista digital'
    ],
    
    frameworks: ['Vue.js', 'Nuxt.js', 'Pinia'],
    styling: ['CSS Modules', 'SCSS', 'Tailwind CSS'],
    features: ['SSR/SSG', 'SEO otimizado', 'PWA ready'],
    
    limitations: ['Ecossistema menor que React'],
    notRecommendedFor: ['Projetos muito simples', 'Equipes inexperientes']
  },

  {
    id: 'svelte-kit',
    name: 'Svelte + SvelteKit',
    displayName: 'Svelte + SvelteKit',
    description: 'Framework ultra-rápido com bundle mínimo',
    
    complexity: 'medium',
    performance: 'high',
    interactivity: 'advanced',
    scalability: 'medium',
    
    idealFor: [
      'Sites ultra-rápidos',
      'Aplicações leves',
      'Portfólios criativos',
      'Landing pages interativas',
      'Performance crítica'
    ],
    
    sectors: [
      'design',
      'criativo',
      'arquitetura',
      'fotografia',
      'arte'
    ],
    
    businessTypes: [
      'designer',
      'arquiteto',
      'fotógrafo',
      'artista',
      'agência criativa'
    ],
    
    frameworks: ['Svelte', 'SvelteKit'],
    styling: ['CSS-in-JS', 'SCSS', 'Tailwind'],
    features: ['Bundle ultra-pequeno', 'Performance máxima', 'DX excelente'],
    
    limitations: ['Ecossistema menor', 'Menos componentes prontos'],
    notRecommendedFor: ['Projetos enterprise grandes', 'Equipes grandes']
  },

  {
    id: 'wordpress-modern',
    name: 'WordPress Moderno',
    displayName: 'WordPress + Elementor Pro',
    description: 'CMS robusto com design moderno e facilidade de edição',
    
    complexity: 'simple',
    performance: 'medium',
    interactivity: 'medium',
    scalability: 'high',
    
    idealFor: [
      'Sites que precisam de CMS',
      'Blogs profissionais',
      'Sites com múltiplos editores',
      'E-commerce (WooCommerce)',
      'Facilidade de manutenção'
    ],
    
    sectors: [
      'qualquer setor que precise de CMS',
      'notícias',
      'educação',
      'ONGs',
      'associações'
    ],
    
    businessTypes: [
      'qualquer empresa que precisa editar conteúdo',
      'blog',
      'revista',
      'escola',
      'ONG'
    ],
    
    frameworks: ['WordPress', 'Elementor Pro', 'WooCommerce'],
    styling: ['Elementor', 'Custom CSS', 'Theme customization'],
    features: ['CMS completo', 'Plugins abundantes', 'Facilidade de uso'],
    
    limitations: ['Performance pode ser menor', 'Segurança requer manutenção'],
    notRecommendedFor: ['Sites ultra-rápidos', 'Aplicações complexas']
  },

  {
    id: 'threejs-creative',
    name: 'Three.js Creative',
    displayName: 'Three.js + WebGL',
    description: 'Sites 3D interativos e experiências imersivas',
    
    complexity: 'advanced',
    performance: 'medium',
    interactivity: 'advanced',
    scalability: 'low',
    
    idealFor: [
      'Portfólios criativos 3D',
      'Experiências imersivas',
      'Product showcases',
      'Arte digital',
      'Arquitetura/Design'
    ],
    
    sectors: [
      'arquitetura',
      'design',
      'arte',
      'games',
      'publicidade criativa'
    ],
    
    businessTypes: [
      'arquiteto',
      'designer 3D',
      'artista digital',
      'agência criativa premium',
      'estúdio de design'
    ],
    
    frameworks: ['Three.js', 'React Three Fiber', 'GSAP'],
    styling: ['CSS 3D', 'WebGL Shaders', 'Custom animations'],
    features: ['3D interativo', 'WebGL', 'Experiências únicas'],
    
    limitations: ['Performance intensiva', 'Complexidade alta', 'Mobile limitado'],
    notRecommendedFor: ['Sites simples', 'SEO critical', 'Baixo orçamento']
  }
];

// 🧠 ANALISADOR INTELIGENTE DE PERFIL
export class TechStackAnalyzer {
  
  static analyzeClientProfile(projectData: Record<string, unknown>): {
    recommendedStack: TechStack;
    confidence: number;
    reasoning: string[];
    alternatives: TechStack[];
  } {
    
    const businessType = (projectData.business_type || '').toLowerCase();
    const businessSector = (projectData.business_sector || projectData.industry || '').toLowerCase();
    const objective = (projectData.business_objective || '').toLowerCase();
    const targetAudience = (projectData.target_audience || '').toLowerCase();
    const features = projectData.functionalities || [];
    const theme = projectData.design_style || '';
    const budget = projectData.budget_range || 'medium';
    
    console.log('🧠 Analisando perfil do cliente:', {
      businessType, businessSector, objective, targetAudience, features, theme, budget
    });
    
    // Pontuação para cada stack
    const scores = availableStacks.map(stack => ({
      stack,
      score: this.calculateStackScore(stack, {
        businessType, businessSector, objective, targetAudience, features, theme, budget
      }),
      reasons: []
    }));
    
    // Ordenar por pontuação
    scores.sort((a, b) => b.score - a.score);
    
    const recommended = scores[0];
    const alternatives = scores.slice(1, 4).map(s => s.stack);
    
    // Gerar reasoning
    const reasoning = this.generateReasoning(recommended.stack, {
      businessType, businessSector, objective, targetAudience, features, theme, budget
    });
    
    return {
      recommendedStack: recommended.stack,
      confidence: Math.min(recommended.score / 100, 1),
      reasoning,
      alternatives
    };
  }
  
  private static calculateStackScore(
    stack: TechStack, 
    profile: {
      businessType: string;
      businessSector: string;
      objective: string;
      targetAudience: string;
      features: string[];
      theme: string;
      budget: string;
    }
  ): number {
    let score = 0;
    
    // ✅ 1. Verificar business types com PESO AUMENTADO (peso: 50)
    if (stack.businessTypes.some(type => profile.businessType.includes(type))) {
      score += 50;
      
      // ✅ BOOST EXTRA para negócios modernos que precisam de React
      const modernBusinesses = ['barbearia', 'barberia', 'babearia', 'restaurante', 'bar', 'salão'];
      if (modernBusinesses.some(business => profile.businessType.includes(business)) && 
          stack.id === 'react-tailwind') {
        score += 30; // Boost extra para React
      }
    }
    
    // ✅ 2. Verificar setores com PESO AUMENTADO (peso: 40)  
    if (stack.sectors.some(sector => 
      profile.businessSector.includes(sector) || 
      profile.businessType.includes(sector)
    )) {
      score += 40;
    }
    
    // ✅ 3. Analisar funcionalidades OBRIGATÓRIAS para React (peso: 35)
    const needsAdvancedFeatures = profile.features.some(f => 
      ['booking', 'agendamento', 'whatsapp', 'gallery', 'galeria', 'testimonials', 
       'depoimentos', 'animations', 'interactive', 'dynamic', 'social-media'].some(keyword => 
        f.toLowerCase().includes(keyword)
      )
    );
    
    if (needsAdvancedFeatures && stack.interactivity === 'advanced') {
      score += 35;
      
      // ✅ FORÇA React para funcionalidades modernas
      if (stack.id === 'react-tailwind') {
        score += 25; // Boost adicional
      }
    }
    
    // ✅ 4. PENALIZAR HTML para negócios modernos
    const isModernBusiness = ['barbearia', 'barberia', 'babearia', 'restaurante', 'bar', 'salão']
      .some(business => profile.businessType.includes(business));
    
    if (isModernBusiness && stack.id === 'html-css-premium') {
      score -= 30; // Penalidade para HTML em negócios modernos
    }
    
    // 4. Analisar objetivo (peso: 15)
    if (profile.objective.includes('conversão') || profile.objective.includes('venda')) {
      if (stack.id.includes('react') || stack.id.includes('vue')) score += 15;
    } else if (profile.objective.includes('institucional') || profile.objective.includes('credibilidade')) {
      if (stack.id.includes('html')) score += 15;
    }
    
    // 5. Tema/estilo (peso: 10)
    if (profile.theme.includes('criativo') || profile.theme.includes('artistico')) {
      if (stack.id.includes('threejs') || stack.id.includes('svelte')) score += 10;
    } else if (profile.theme.includes('corporativo') || profile.theme.includes('elegante')) {
      if (stack.id.includes('html') || stack.id.includes('react')) score += 10;
    }
    
    return score;
  }
  
  private static generateReasoning(
    stack: TechStack,
    profile: Record<string, unknown>
  ): string[] {
    const reasons = [];
    
    // Razões baseadas no perfil
    if (stack.businessTypes.some(type => profile.businessType.includes(type))) {
      reasons.push(`Ideal para ${profile.businessType} - tecnologia alinhada ao setor`);
    }
    
    if (stack.performance === 'high') {
      reasons.push('Performance otimizada para conversão e SEO');
    }
    
    if (stack.complexity === 'simple') {
      reasons.push('Solução simples e confiável, fácil manutenção');
    } else if (stack.complexity === 'advanced') {
      reasons.push('Tecnologia avançada para experiências diferenciadas');
    }
    
    // Razões específicas por stack
    switch (stack.id) {
      case 'html-css-premium':
        reasons.push('SEO máximo e carregamento ultra-rápido');
        break;
      case 'react-tailwind':
        reasons.push('Componentes modernos e interatividade avançada');
        break;
      case 'vue-nuxt':
        reasons.push('Flexibilidade para crescimento futuro');
        break;
      case 'svelte-kit':
        reasons.push('Performance excepcional e experiência fluida');
        break;
      case 'wordpress-modern':
        reasons.push('Facilidade para editar conteúdo sem programador');
        break;
      case 'threejs-creative':
        reasons.push('Experiência visual única e diferenciada');
        break;
    }
    
    return reasons;
  }
}

// 🚀 FUNÇÃO PRINCIPAL PARA USO NAS APIS
export async function selectOptimalTechStack(projectData: Record<string, unknown>) {
  const analysis = TechStackAnalyzer.analyzeClientProfile(projectData);
  
  console.log('🎯 Stack recomendada:', analysis.recommendedStack.displayName);
  console.log('📊 Confiança:', Math.round(analysis.confidence * 100) + '%');
  console.log('💡 Razões:', analysis.reasoning);
  
  return analysis;
}
