/**
 * Testes Unitários para AI Decision Engine
 * 
 * Execute com: npm test -- ai-decision-engine.test.ts
 */

import { 
  buildGenerationProfile, 
  getDecisionSummary, 
  type FormDataType, 
  type GenerationProfile 
} from '../ai-decision-engine';

// Mock do DatabaseService para evitar chamadas reais ao Supabase
jest.mock('../supabase', () => ({
  DatabaseService: {
    getProjectData: jest.fn().mockResolvedValue({
      logo_analysis: JSON.stringify({
        colors: {
          dominant: ['#1C1F26'],
          accent: ['#D4AF37']
        }
      })
    })
  }
}));

describe('AI Decision Engine', () => {
  
  describe('buildGenerationProfile', () => {
    
    it('deve determinar stack Next.js para e-commerce', async () => {
      const formData: FormDataType = {
        companyName: 'Loja Online',
        mainObjective: 'Vendas Online',
        siteTheme: 'Moderno & Clean',
        targetAudience: 'Jovens (18-35)',
        desiredFeatures: ['ecommerce', 'carrinho', 'pagamento'],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.stack).toBe('Next.js + ShadCN UI');
      expect(profile.layout).toContain('contato');
      expect(profile.components).toContain('ProductGrid');
    });

    it('deve determinar stack React para portfólio criativo', async () => {
      const formData: FormDataType = {
        companyName: 'Portfolio Art',
        mainObjective: 'Portfólio/Showcase',
        siteTheme: 'Criativo & Artístico',
        targetAudience: 'Jovens (18-35)',
        desiredFeatures: ['gallery'],
        siteStructure: 'single_page'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.stack).toBe('React + Tailwind');
      expect(profile.colorStyle).toContain('colorful');
      expect(profile.tone).toBe('moderno e confiante');
    });

    it('deve determinar stack SvelteKit para blog', async () => {
      const formData: FormDataType = {
        companyName: 'Blog Tech',
        mainObjective: 'Blog',
        siteTheme: 'Moderno & Clean',
        targetAudience: 'Estudantes',
        desiredFeatures: ['blog', 'newsletter'],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.stack).toBe('SvelteKit');
      expect(profile.layout).toContain('blog');
    });

    it('deve determinar stack React + Next.js para agendamentos', async () => {
      const formData: FormDataType = {
        companyName: 'Clínica',
        mainObjective: 'Agendamentos',
        siteTheme: 'Corporativo & Elegante',
        targetAudience: 'Famílias',
        desiredFeatures: ['booking', 'whatsapp'],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.stack).toBe('React + Next.js (Calendar API ready)');
      expect(profile.layout).toContain('agendamento');
      expect(profile.components).toContain('ScheduleSection');
    });

    it('deve usar HTML5 Premium como padrão para institucional', async () => {
      const formData: FormDataType = {
        companyName: 'Empresa',
        mainObjective: 'Apresentação Institucional',
        siteTheme: 'Corporativo & Elegante',
        targetAudience: 'Empresas (B2B)',
        desiredFeatures: ['contact-form'],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.stack).toBe('HTML5 + CSS3 Premium');
      expect(profile.tone).toBe('profissional e técnico');
    });

    it('deve mapear funcionalidades para componentes corretamente', async () => {
      const formData: FormDataType = {
        companyName: 'Empresa Teste',
        desiredFeatures: ['whatsapp', 'contact-form', 'gallery', 'testimonials', 'map'],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.components).toContain('WhatsAppButton');
      expect(profile.components).toContain('ContactForm');
      expect(profile.components).toContain('Gallery');
      expect(profile.components).toContain('Testimonials');
      expect(profile.components).toContain('GoogleMap');
    });

    it('deve determinar tom de voz baseado no público-alvo', async () => {
      const testCases = [
        { audience: 'Empresas (B2B)', expected: 'profissional e técnico' },
        { audience: 'Jovens (18-35)', expected: 'moderno e confiante' },
        { audience: 'Famílias', expected: 'amigável e acolhedor' },
        { audience: 'Terceira Idade', expected: 'claro e simples' },
        { audience: 'Estudantes', expected: 'leve e educacional' }
      ];

      for (const testCase of testCases) {
        const formData: FormDataType = {
          companyName: 'Test',
          targetAudience: testCase.audience,
          siteStructure: 'multiple_pages'
        };
        
        const profile = await buildGenerationProfile(formData);
        expect(profile.tone).toBe(testCase.expected);
      }
    });

    it('deve determinar estilo visual baseado no tema', async () => {
      const testCases = [
        { theme: 'Luxury & Premium', expected: 'dark with gold accents' },
        { theme: 'Moderno & Clean', expected: 'light minimalist palette' },
        { theme: 'Tecnológico & Inovador', expected: 'dark cyan/blue gradients' },
        { theme: 'Criativo & Artístico', expected: 'colorful, asymmetric blocks' }
      ];

      for (const testCase of testCases) {
        const formData: FormDataType = {
          companyName: 'Test',
          siteTheme: testCase.theme,
          siteStructure: 'multiple_pages'
        };
        
        const profile = await buildGenerationProfile(formData);
        expect(profile.colorStyle).toContain(testCase.expected.split(' ')[0]); // Verifica primeira palavra
      }
    });

    it('deve criar layout single_page corretamente', async () => {
      const formData: FormDataType = {
        companyName: 'Test',
        siteStructure: 'single_page',
        desiredFeatures: ['gallery', 'testimonials']
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.layout).toContain('hero');
      expect(profile.layout).toContain('sobre');
      expect(profile.layout).toContain('serviços');
      expect(profile.layout).toContain('contato');
      expect(profile.layout).toContain('footer');
      expect(profile.layout).toContain('galeria');
      expect(profile.layout).toContain('depoimentos');
    });

    it('deve criar layout multiple_pages corretamente', async () => {
      const formData: FormDataType = {
        companyName: 'Test',
        siteStructure: 'multiple_pages',
        desiredFeatures: ['blog']
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.layout).toContain('home');
      expect(profile.layout).toContain('sobre');
      expect(profile.layout).toContain('serviços');
      expect(profile.layout).toContain('contato');
      expect(profile.layout).toContain('blog');
    });

    it('deve gerar promptContext completo', async () => {
      const formData: FormDataType = {
        companyName: 'Empresa Teste',
        businessSector: 'Tecnologia',
        mainObjective: 'Vendas Online',
        targetAudience: 'Jovens (18-35)',
        siteTheme: 'Moderno & Clean',
        siteStructure: 'multiple_pages',
        desiredFeatures: ['whatsapp', 'contact-form']
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.promptContext).toContain('Empresa Teste');
      expect(profile.promptContext).toContain('Tecnologia');
      expect(profile.promptContext).toContain('Vendas Online');
      expect(profile.promptContext).toContain('Jovens');
      expect(profile.promptContext).toContain(profile.stack);
      expect(profile.promptContext).toContain(profile.tone);
    });

    it('deve lidar com dados faltantes graciosamente', async () => {
      const formData: FormDataType = {};
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile).toBeDefined();
      expect(profile.stack).toBeDefined();
      expect(profile.layout.length).toBeGreaterThan(0);
      expect(profile.tone).toBeDefined();
      expect(profile.colorStyle).toBeDefined();
    });

    it('deve suportar aliases de campos', async () => {
      const formData: FormDataType = {
        companyName: 'Test',
        // Usando aliases
        theme: 'Moderno & Clean', // ao invés de siteTheme
        objective: 'Vendas Online', // ao invés de mainObjective
        functionalities: ['whatsapp'] // ao invés de desiredFeatures
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.colorStyle).toContain('light minimalist');
      expect(profile.stack).toBe('Next.js + ShadCN UI');
      expect(profile.components).toContain('WhatsAppButton');
    });
  });

  describe('getDecisionSummary', () => {
    it('deve gerar resumo formatado do perfil', () => {
      const profile: GenerationProfile = {
        stack: 'React + Tailwind',
        layout: ['hero', 'sobre', 'serviços', 'contato'],
        tone: 'moderno e confiante',
        colorStyle: 'light minimalist palette',
        components: ['WhatsAppButton', 'ContactForm'],
        promptContext: 'Test context',
        logoInfo: {
          url: 'https://example.com/logo.png',
          dominant: '#1C1F26',
          accent: '#D4AF37'
        }
      };
      
      const summary = getDecisionSummary(profile);
      
      expect(summary).toContain('React + Tailwind');
      expect(summary).toContain('hero → sobre → serviços → contato');
      expect(summary).toContain('moderno e confiante');
      expect(summary).toContain('#1C1F26');
    });

    it('deve funcionar sem logoInfo', () => {
      const profile: GenerationProfile = {
        stack: 'HTML5 + CSS3 Premium',
        layout: ['home', 'sobre'],
        tone: 'profissional',
        colorStyle: 'neutral',
        components: [],
        promptContext: 'Test'
      };
      
      const summary = getDecisionSummary(profile);
      
      expect(summary).toContain('Não fornecido');
      expect(summary).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('deve tratar array vazio de funcionalidades', async () => {
      const formData: FormDataType = {
        companyName: 'Test',
        desiredFeatures: [],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      expect(profile.components).toEqual([]);
      expect(profile.layout.length).toBeGreaterThan(0);
    });

    it('deve tratar funcionalidades desconhecidas', async () => {
      const formData: FormDataType = {
        companyName: 'Test',
        desiredFeatures: ['funcionalidade-desconhecida-123'],
        siteStructure: 'multiple_pages'
      };
      
      const profile = await buildGenerationProfile(formData);
      
      // Não deve quebrar, apenas não adicionar componente
      expect(profile.components).not.toContain('funcionalidade-desconhecida-123');
    });
  });
});

