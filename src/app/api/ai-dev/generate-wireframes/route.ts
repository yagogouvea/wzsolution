import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/features/ai-generator/lib/openai-config';
import type { ProjectAnalysis } from '@/features/ai-generator/types/ai-generator.types';

// Wireframes base por tipo de projeto
const getBaseWireframes = (projectType: string, features: string[]) => {
  const commonScreens = {
    'mobile-app': [
      { screen: 'Splash/Loading', elements: ['Logo', 'Loading indicator', 'Version info'] },
      { screen: 'Login/Cadastro', elements: ['Email field', 'Password field', 'Social login', 'Forgot password'] },
      { screen: 'Home/Dashboard', elements: ['Navigation menu', 'Main content', 'Quick actions', 'Notifications'] },
      { screen: 'Perfil do Usuário', elements: ['Avatar', 'User info', 'Settings', 'Logout button'] }
    ],
    'website': [
      { screen: 'Landing Page', elements: ['Header navigation', 'Hero section', 'Features grid', 'Contact form', 'Footer'] },
      { screen: 'Sobre', elements: ['Company info', 'Team section', 'Mission/vision', 'Contact details'] },
      { screen: 'Serviços', elements: ['Services list', 'Feature cards', 'Pricing table', 'CTA buttons'] },
      { screen: 'Contato', elements: ['Contact form', 'Location map', 'Social links', 'Phone/email'] }
    ],
    'web-app': [
      { screen: 'Login', elements: ['Login form', 'Forgot password', 'Sign up link', 'Social auth'] },
      { screen: 'Dashboard', elements: ['Sidebar menu', 'Main content area', 'Charts/widgets', 'User menu'] },
      { screen: 'Configurações', elements: ['Settings tabs', 'Profile form', 'Preferences', 'Security options'] }
    ],
    'saas': [
      { screen: 'Landing Page', elements: ['Value proposition', 'Pricing tiers', 'Feature comparison', 'Free trial CTA'] },
      { screen: 'Sign Up', elements: ['Registration form', 'Plan selection', 'Payment info', 'Progress indicator'] },
      { screen: 'Dashboard', elements: ['Analytics overview', 'Quick actions', 'Usage metrics', 'Upgrade prompts'] },
      { screen: 'Billing', elements: ['Current plan', 'Usage details', 'Payment methods', 'Invoices'] }
    ]
  };

  return commonScreens[projectType as keyof typeof commonScreens] || commonScreens['website'];
};

export async function POST(request: NextRequest) {
  try {
    const analysis: ProjectAnalysis = await request.json();

    if (!analysis?.title || !analysis?.features) {
      return NextResponse.json(
        { error: 'Análise do projeto inválida' },
        { status: 400 }
      );
    }

    // Determinar tipo de projeto baseado na categoria
    const projectType = analysis.category?.toLowerCase().includes('app') ? 'mobile-app' :
                       analysis.category?.toLowerCase().includes('saas') ? 'saas' :
                       analysis.category?.toLowerCase().includes('system') ? 'web-app' : 'website';

    // Obter wireframes base
    const baseWireframes = getBaseWireframes(projectType, analysis.features);

    // Personalizar com IA
    const wireframePrompt = `
    Projeto: ${analysis.title}
    Funcionalidades: ${analysis.features.join(', ')}
    Usuários: ${analysis.userTypes.join(', ')}
    
    Baseado nestas informações, personalize e adicione telas específicas para este projeto.
    Mantenha apenas telas essenciais e relevantes.
    `;

    const aiWireframes = await callOpenAI(wireframePrompt, PROMPTS.WIREFRAME_GENERATOR);

    // Combinar wireframes base com sugestões da IA
    const wireframes = [
      ...baseWireframes,
      ...(aiWireframes.wireframes || [])
    ].slice(0, 8); // Limitar a 8 telas para não sobrecarregar

    // Adicionar descrições mais detalhadas
    const enhancedWireframes = wireframes.map((wireframe, index) => ({
      ...wireframe,
      description: wireframe.description || `Tela ${index + 1} do projeto ${analysis.title}`,
      elements: Array.isArray(wireframe.elements) ? wireframe.elements : ['Elementos da interface'],
      // TODO: Integrar com DALL-E para gerar imagens reais
      imageUrl: null // Por enquanto sem imagens
    }));

    return NextResponse.json({
      success: true,
      wireframes: enhancedWireframes,
      metadata: {
        totalScreens: enhancedWireframes.length,
        projectType,
        complexity: analysis.complexity
      }
    });

  } catch (error) {
    console.error('Erro na geração de wireframes:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno na geração de wireframes',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de geração de wireframes ativa',
    version: '1.0.0',
    status: 'development',
    supportedTypes: ['mobile-app', 'website', 'web-app', 'saas']
  });
}







