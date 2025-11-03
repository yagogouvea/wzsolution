/**
 * 🤖 AI Agent Planner
 * 
 * Inspirado em sistemas como Lovable.dev e GPT-Engineer
 * Cria planos detalhados antes de gerar código
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AppPlan {
  architecture: {
    techStack: string[];
    database: string;
    authentication: string;
    deployment: string;
  };
  features: {
    pages: Array<{
      name: string;
      purpose: string;
      components: string[];
    }>;
    functionality: Array<{
      name: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  designSystem: {
    theme: string;
    colors: string[];
    typography: string;
    spacing: string;
  };
  implementation: {
    phases: Array<{
      phase: number;
      tasks: string[];
      estimatedTime: string;
    }>;
  };
}

/**
 * Cria um plano detalhado de desenvolvimento baseado em requisitos
 */
export async function createAppPlan(
  userRequest: string,
  projectData?: Record<string, unknown>
): Promise<AppPlan> {
  const contextPrompt = projectData 
    ? buildContextFromProjectData(projectData)
    : '';

  const prompt = `
Você é um arquiteto sênior de software especializado em React/Next.js.

Analise os requisitos abaixo e crie um PLANO DETALHADO de implementação.

${contextPrompt}

REQUISITOS DO PROJETO:
${userRequest}

INSTRUÇÕES:
1. Analise cuidadosamente os requisitos
2. Crie uma arquitetura técnica sólida
3. Liste todas as features necessárias
4. Defina sistema de design consistente
5. Crie fases de implementação

Retorne APENAS JSON válido no seguinte formato:
{
  "architecture": {
    "techStack": ["array", "de", "tecnologias"],
    "database": "descrição",
    "authentication": "método",
    "deployment": "plataforma"
  },
  "features": {
    "pages": [
      {
        "name": "nome da página",
        "purpose": "objetivo",
        "components": ["lista", "de", "componentes"]
      }
    ],
    "functionality": [
      {
        "name": "nome da funcionalidade",
        "description": "descrição detalhada",
        "priority": "high|medium|low"
      }
    ]
  },
  "designSystem": {
    "theme": "tema visual",
    "colors": ["cor1", "cor2"],
    "typography": "sistema de tipografia",
    "spacing": "sistema de espaçamento"
  },
  "implementation": {
    "phases": [
      {
        "phase": 1,
        "tasks": ["tarefa 1", "tarefa 2"],
        "estimatedTime": "tempo estimado"
      }
    ]
  }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um arquiteto sênior especializado em React/Next.js. Retorne APENAS JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia do planner');
    }

    const plan = JSON.parse(content) as AppPlan;
    
    console.log('✅ Plano criado com sucesso:', {
      pages: plan.features.pages.length,
      functionalities: plan.features.functionality.length,
      phases: plan.implementation.phases.length
    });

    return plan;
  } catch (error) {
    console.error('❌ Erro ao criar plano:', error);
    throw error;
  }
}

/**
 * Constrói contexto a partir dos dados do formulário
 */
function buildContextFromProjectData(projectData: Record<string, unknown>): string {
  const sections: string[] = [];
  
  sections.push('CONTEXTO ADICIONAL DO PROJETO:');
  
  if (projectData.company_name) {
    sections.push(`- Empresa: ${projectData.company_name}`);
  }
  
  if (projectData.business_type) {
    sections.push(`- Setor: ${projectData.business_type}`);
  }
  
  if (projectData.target_audience) {
    sections.push(`- Público: ${projectData.target_audience}`);
  }
  
  if (projectData.business_objective) {
    sections.push(`- Objetivo: ${projectData.business_objective}`);
  }
  
  if (projectData.design_style) {
    sections.push(`- Estilo Visual: ${projectData.design_style}`);
  }
  
  if (projectData.design_colors && Array.isArray(projectData.design_colors)) {
    sections.push(`- Cores: ${projectData.design_colors.join(', ')}`);
  }
  
  if (projectData.functionalities && Array.isArray(projectData.functionalities)) {
    sections.push(`- Funcionalidades: ${projectData.functionalities.join(', ')}`);
  }
  
  if (projectData.pages_needed && Array.isArray(projectData.pages_needed)) {
    sections.push(`- Páginas: ${projectData.pages_needed.join(', ')}`);
  }
  
  return sections.join('\n');
}

/**
 * Gera código baseado em um plano pré-criado
 */
export async function generateCodeFromPlan(
  plan: AppPlan,
  additionalContext?: string
): Promise<string> {
  const prompt = `
Você é um desenvolvedor sênior de React/Next.js.

Implemente o seguinte plano técnico criando código PRODUCTION-READY:

${JSON.stringify(plan, null, 2)}

${additionalContext || ''}

INSTRUÇÕES:
1. Implemente TODAS as features do plano
2. Use Tailwind CSS para styling
3. Use Framer Motion para animações
4. Componentes modulares e reutilizáveis
5. Código limpo e bem comentado
6. Responsivo mobile-first

Retorne APENAS o código React/JSX completo sem markdown formatting.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um desenvolvedor sênior React/Next.js. Implemente o plano fornecido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.2
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('❌ Erro ao gerar código do plano:', error);
    throw error;
  }
}

/**
 * Refina código baseado em feedback
 */
export async function refineCode(
  currentCode: string,
  feedback: string
): Promise<string> {
  const prompt = `
Você é um desenvolvedor sênior fazendo uma refinação de código.

CÓDIGO ATUAL:
${currentCode.substring(0, 5000)}...

FEEDBACK/REQUISITOS DE REFINAÇÃO:
${feedback}

Implemente as melhorias solicitadas mantendo a qualidade do código existente.

Retorne APENAS o código refinado.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um desenvolvedor sênior refinando código."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.2
    });

    return response.choices[0]?.message?.content || currentCode;
  } catch (error) {
    console.error('❌ Erro ao refinar código:', error);
    return currentCode;
  }
}

