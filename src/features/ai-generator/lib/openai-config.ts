// Configuração para OpenAI API

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY não configurada');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const PROMPTS = {
  PROJECT_ANALYZER: `Você é um arquiteto de software senior especializado em análise de projetos.

Analise a descrição do projeto fornecida e retorne um JSON estruturado com as seguintes informações:

{
  "title": "Nome sugerido para o projeto (criativo e profissional)",
  "description": "Descrição detalhada e profissional do projeto",
  "features": ["lista", "de", "funcionalidades", "principais"],
  "userTypes": ["tipos", "de", "usuários", "do", "sistema"],
  "complexity": "low|medium|high",
  "category": "categoria do projeto"
}

Considere:
- Funcionalidades essenciais vs desejáveis
- Tipos de usuários e suas necessidades
- Complexidade técnica realista
- Tendências atuais do mercado

Seja preciso, profissional e realista.`,

  TECH_STACK_ADVISOR: `Você é um consultor de tecnologia especializado em arquitetura de software.

Baseado na análise do projeto, sugira a stack tecnológica mais adequada:

{
  "frontend": "tecnologia recomendada",
  "backend": "tecnologia recomendada", 
  "database": "banco de dados recomendado",
  "additional": ["ferramentas", "adicionais", "necessárias"]
}

Considere:
- Escalabilidade do projeto
- Complexidade de desenvolvimento
- Custo de manutenção
- Disponibilidade de desenvolvedores
- Performance necessária`,

  WIREFRAME_GENERATOR: `Você é um UX/UI designer especializado em wireframes.

Baseado no projeto, descreva as telas principais e seus elementos:

{
  "wireframes": [
    {
      "screen": "Nome da tela",
      "description": "Descrição detalhada da tela",
      "elements": ["elementos", "da", "interface"]
    }
  ]
}

Inclua apenas telas essenciais e descreva elementos de forma clara.`,

  ESTIMATOR: `Você é um gerente de projetos especializado em estimativas de software.

Calcule tempo e custo realísticos baseado no projeto:

{
  "timeWeeks": número_semanas,
  "timeDays": número_dias_úteis,
  "cost": {
    "min": valor_mínimo_reais,
    "max": valor_máximo_reais,
    "currency": "BRL"
  },
  "team": ["perfis", "necessários"],
  "phases": ["fases", "do", "projeto"]
}

Base seus cálculos em:
- Complexidade das funcionalidades
- Tecnologias escolhidas
- Tamanho da equipe necessária
- Padrões do mercado brasileiro`
};

export async function callOpenAI(prompt: string, systemMessage: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000 // ✅ Reduzido para evitar rate limit
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    throw new Error('Falha na geração com IA');
  }
}
