import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/features/ai-generator/lib/openai-config';
import type { ProjectAnalysis, TechStack } from '@/features/ai-generator/types/ai-generator.types';

// Multiplicadores baseados em complexidade
const COMPLEXITY_MULTIPLIERS = {
  low: 0.7,
  medium: 1.0,
  high: 1.5
};

// Estimativas base por tipo de projeto (em horas)
const BASE_ESTIMATES = {
  'mobile-app': {
    baseHours: 400,
    costPerHour: 80,
    teamSize: 2,
    phases: ['Planejamento', 'UI/UX Design', 'Desenvolvimento', 'Testes', 'Deploy', 'Lançamento']
  },
  'website': {
    baseHours: 120,
    costPerHour: 75,
    teamSize: 1,
    phases: ['Planejamento', 'Design', 'Desenvolvimento', 'SEO', 'Deploy']
  },
  'web-app': {
    baseHours: 300,
    costPerHour: 85,
    teamSize: 2,
    phases: ['Planejamento', 'Arquitetura', 'Backend', 'Frontend', 'Integração', 'Testes']
  },
  'saas': {
    baseHours: 600,
    costPerHour: 90,
    teamSize: 3,
    phases: ['MVP', 'Funcionalidades Core', 'Billing', 'Dashboard', 'Escalabilidade', 'Deploy']
  },
  'system': {
    baseHours: 500,
    costPerHour: 95,
    teamSize: 3,
    phases: ['Análise', 'Arquitetura', 'Backend', 'Frontend', 'Integrações', 'Testes', 'Treinamento']
  }
};

// Multiplicadores por funcionalidades especiais
const FEATURE_MULTIPLIERS: Record<string, number> = {
  'pagamento': 1.3,
  'payment': 1.3,
  'chat': 1.2,
  'tempo real': 1.4,
  'real-time': 1.4,
  'inteligência artificial': 1.8,
  'ai': 1.8,
  'machine learning': 1.8,
  'blockchain': 2.0,
  'integração': 1.2,
  'integration': 1.2,
  'auth': 1.1,
  'autenticação': 1.1,
  'dashboard': 1.2,
  'admin': 1.3,
  'mobile': 1.2,
  'api': 1.1,
  'cms': 1.2
};

function determineProjectType(analysis: ProjectAnalysis): keyof typeof BASE_ESTIMATES {
  const desc = analysis.description.toLowerCase();
  const category = analysis.category?.toLowerCase() || '';
  
  if (desc.includes('app') && (desc.includes('mobile') || desc.includes('android') || desc.includes('ios'))) {
    return 'mobile-app';
  }
  if (category.includes('saas') || desc.includes('saas') || desc.includes('subscription')) {
    return 'saas';
  }
  if (desc.includes('sistema') || desc.includes('system') || category.includes('system')) {
    return 'system';
  }
  if (desc.includes('web app') || desc.includes('aplicação') || desc.includes('dashboard')) {
    return 'web-app';
  }
  
  return 'website'; // Default
}

function calculateFeatureMultiplier(features: string[]): number {
  let multiplier = 1.0;
  
  features.forEach(feature => {
    const featureLower = feature.toLowerCase();
    Object.keys(FEATURE_MULTIPLIERS).forEach(keyword => {
      if (featureLower.includes(keyword)) {
        multiplier *= FEATURE_MULTIPLIERS[keyword];
      }
    });
  });

  // Limitar multiplicador para não ficar muito alto
  return Math.min(multiplier, 2.5);
}

function calculateEstimate(analysis: ProjectAnalysis, techStack: TechStack) {
  const projectType = determineProjectType(analysis);
  const baseEstimate = BASE_ESTIMATES[projectType];
  
  // Aplicar multiplicadores
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[analysis.complexity];
  const featureMultiplier = calculateFeatureMultiplier(analysis.features);
  
  // Calcular horas totais
  const totalHours = baseEstimate.baseHours * complexityMultiplier * featureMultiplier;
  
  // Calcular custo (com margem de 20-30%)
  const baseCost = totalHours * baseEstimate.costPerHour;
  const minCost = Math.round(baseCost * 0.8);
  const maxCost = Math.round(baseCost * 1.3);
  
  // Calcular tempo (assumindo 8h/dia útil)
  const workingHours = 8;
  const teamSize = baseEstimate.teamSize;
  const totalDays = Math.ceil(totalHours / (workingHours * teamSize));
  const totalWeeks = Math.ceil(totalDays / 5);
  
  // Definir equipe baseada no projeto
  const team = generateTeam(projectType, analysis.complexity);
  
  return {
    timeWeeks: totalWeeks,
    timeDays: totalDays,
    cost: {
      min: minCost,
      max: maxCost,
      currency: 'BRL'
    },
    team,
    phases: baseEstimate.phases,
    metadata: {
      totalHours: Math.round(totalHours),
      complexityMultiplier,
      featureMultiplier,
      projectType
    }
  };
}

function generateTeam(projectType: keyof typeof BASE_ESTIMATES, complexity: string): string[] {
  const baseTeams = {
    'mobile-app': ['Desenvolvedor Mobile Senior', 'UI/UX Designer'],
    'website': ['Desenvolvedor Full-stack'],
    'web-app': ['Desenvolvedor Frontend', 'Desenvolvedor Backend'],
    'saas': ['Desenvolvedor Full-stack Senior', 'DevOps Engineer', 'UI/UX Designer'],
    'system': ['Arquiteto de Software', 'Desenvolvedor Backend', 'Desenvolvedor Frontend']
  };

  const team = [...baseTeams[projectType]];

  // Adicionar especialistas para projetos complexos
  if (complexity === 'high') {
    team.push('Tech Lead', 'QA Engineer');
  }

  return team;
}

export async function POST(request: NextRequest) {
  try {
    const { analysis, techStack } = await request.json();

    if (!analysis?.title || !analysis?.features) {
      return NextResponse.json(
        { error: 'Dados de análise inválidos' },
        { status: 400 }
      );
    }

    // Calcular estimativa base
    const baseEstimate = calculateEstimate(analysis, techStack);

    // Refinar com IA para estimativas mais precisas
    const estimatePrompt = `
    Projeto: ${analysis.title}
    Funcionalidades: ${analysis.features.join(', ')}
    Complexidade: ${analysis.complexity}
    Stack: Frontend: ${techStack.frontend}, Backend: ${techStack.backend}, Database: ${techStack.database}
    
    Estimativa inicial: ${baseEstimate.timeWeeks} semanas, R$ ${baseEstimate.cost.min}-${baseEstimate.cost.max}
    
    Revise e ajuste esta estimativa considerando a stack tecnológica e funcionalidades específicas.
    `;

    const aiEstimate = await callOpenAI(estimatePrompt, PROMPTS.ESTIMATOR);

    // Combinar estimativas (priorizar IA se disponível)
    const finalEstimate = {
      ...baseEstimate,
      ...(aiEstimate.timeWeeks && {
        timeWeeks: aiEstimate.timeWeeks,
        timeDays: aiEstimate.timeDays || Math.ceil(aiEstimate.timeWeeks * 5)
      }),
      ...(aiEstimate.cost && {
        cost: aiEstimate.cost
      }),
      ...(aiEstimate.team && {
        team: aiEstimate.team
      }),
      ...(aiEstimate.phases && {
        phases: aiEstimate.phases
      })
    };

    return NextResponse.json({
      success: true,
      estimate: finalEstimate
    });

  } catch (error) {
    console.error('Erro no cálculo de estimativas:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno no cálculo de estimativas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de estimativas ativa',
    version: '1.0.0',
    status: 'development',
    supportedTypes: Object.keys(BASE_ESTIMATES)
  });
}
