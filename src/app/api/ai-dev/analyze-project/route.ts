import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/features/ai-generator/lib/openai-config';
import type { ProjectPrompt } from '@/features/ai-generator/types/ai-generator.types';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Função para determinar stack tecnológica baseada no tipo de projeto
function getSuggestedTechStack(projectType: ProjectPrompt['projectType'], complexity: string) {
  const stacks = {
    'mobile-app': {
      frontend: complexity === 'high' ? 'React Native' : 'Flutter',
      backend: 'Node.js + Express',
      database: complexity === 'high' ? 'PostgreSQL' : 'Firebase',
      additional: ['Push Notifications', 'App Store Connect', 'Google Play Console']
    },
    'website': {
      frontend: 'Next.js + React',
      backend: 'Next.js API Routes',
      database: complexity === 'high' ? 'PostgreSQL' : 'MongoDB',
      additional: ['SEO Optimization', 'CMS Integration', 'Analytics']
    },
    'web-app': {
      frontend: 'React + TypeScript',
      backend: 'Node.js + Express',
      database: 'PostgreSQL',
      additional: ['Redis Cache', 'WebSockets', 'JWT Auth']
    },
    'saas': {
      frontend: 'Next.js + React',
      backend: 'Node.js + NestJS',
      database: 'PostgreSQL + Redis',
      additional: ['Stripe Integration', 'Multi-tenancy', 'Monitoring', 'CI/CD']
    },
    'system': {
      frontend: 'React Admin Dashboard',
      backend: 'Python + FastAPI',
      database: 'PostgreSQL',
      additional: ['Docker', 'Microservices', 'API Gateway', 'Message Queue']
    },
    'other': {
      frontend: 'React',
      backend: 'Node.js',
      database: 'MongoDB',
      additional: ['To be defined']
    }
  };

  return stacks[projectType] || stacks.other;
}

export async function POST(request: NextRequest) {
  try {
    const prompt: ProjectPrompt = await request.json();

    if (!prompt.description?.trim()) {
      return NextResponse.json(
        { error: 'Descrição do projeto é obrigatória' },
        { status: 400 }
      );
    }

    // Análise com GPT-4
    const analysisPrompt = `
    Projeto: ${prompt.description}
    Tipo: ${prompt.projectType}
    
    Analise este projeto e forneça uma estrutura detalhada.
    `;

    const analysisResult = await callOpenAI(analysisPrompt, PROMPTS.PROJECT_ANALYZER);

    // Gerar stack tecnológica sugerida
    const techStack = getSuggestedTechStack(prompt.projectType, analysisResult.complexity);

    // Refinar com IA se necessário
    const techStackPrompt = `
    Projeto: ${analysisResult.title}
    Funcionalidades: ${analysisResult.features.join(', ')}
    Complexidade: ${analysisResult.complexity}
    
    Confirme ou ajuste a stack tecnológica sugerida.
    `;

    const techStackResult = await callOpenAI(techStackPrompt, PROMPTS.TECH_STACK_ADVISOR);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      techStack: {
        ...techStack,
        ...techStackResult
      }
    });

  } catch (error) {
    console.error('Erro na análise do projeto:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno na análise do projeto',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Middleware para desenvolvimento
export async function GET() {
  return NextResponse.json({
    message: 'API de análise de projetos ativa',
    version: '1.0.0',
    status: 'development'
  });
}


