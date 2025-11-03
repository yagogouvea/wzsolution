/**
 * 🎨 AI Design Feedback & Refinement Engine
 * 
 * Avalia automaticamente sites gerados pela IA e aplica refinamentos visuais
 * baseados em heurísticas de UX/UI modernas e princípios estéticos
 * 
 * Features:
 * - Análise de hierarquia visual e tipográfica
 * - Avaliação de contraste e harmonia cromática
 * - Score estético (0-100)
 * - Refinamento automático quando score < 85
 * - Feedback textual estruturado
 */

import OpenAI from "openai";
import { supabase } from "./supabase";

// ✅ Não inicializar no nível do módulo - apenas quando necessário
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.');
  }
  return new OpenAI({ apiKey });
}

export interface RefinementReport {
  score: number;
  issues: string[];
  suggestions: string[];
  refinedCode: string;
}

export interface RefinementMetadata {
  timestamp: string;
  model: string;
  versionNumber?: number;
}

/**
 * Analisa e refina um site usando IA de design
 */
export async function analyzeAndRefineSite(
  siteCode: string,
  siteId?: string
): Promise<RefinementReport> {
  try {
    console.log('🎨 [AI Refinement Engine] Iniciando análise e refinamento...');

    const prompt = `
Você é um ESPECIALISTA PREMIUM em design frontend, UX/UI e web design moderno com anos de experiência avaliando sites de altíssima qualidade.

Analise o código React + Tailwind a seguir e gere um relatório completo de refinamento estético.

## 📋 TAREFAS OBRIGATÓRIAS:

1. **AVALIAR ESTRUTURA VISUAL:**
   - Hierarquia tipográfica (títulos, subtítulos, corpo de texto)
   - Contraste de cor (background vs texto, legibilidade)
   - Consistência de espaçamento e padding
   - Harmonia cromática (teoria de cores HSL)
   - Uso de gradientes, sombras e profundidade visual

2. **GERAR SCORE ESTÉTICO:**
   - Pontue de 0 a 100 baseado em:
     * Hierarquia visual clara: 20 pontos
     * Contraste adequado: 20 pontos
     * Harmonia de cores: 20 pontos
     * Espaçamento balanceado: 20 pontos
     * Profundidade e dimensão: 20 pontos

3. **LISTAR PROBLEMAS:**
   - Identifique problemas específicos
   - Seja conciso e direto

4. **SUGERIR CORREÇÕES:**
   - Forneça sugestões práticas e implementáveis

5. **APLICAR CORREÇÕES (SE SCORE < 85):**
   - **CRÍTICO:** Se o score for menor que 85, aplique correções DIRETAS no código
   - Mantenha identidade visual (cores, logo, textos)
   - Use estilo moderno, fluido e emocionalmente agradável (estética Lovable.dev)
   - Aplique princípios de:
     * Espaçamento generoso (py-16, py-24, py-32)
     * Tipografia hierárquica (text-5xl, text-3xl, text-lg)
     * Contraste adequado (text-white em bg-escuro, text-escuro em bg-claro)
     * Gradientes suaves e overlays elegantes
     * Sombras profundas (shadow-lg, shadow-2xl)
     * Transições suaves (transition-all duration-300)

## 📝 FORMATO DE RETORNO OBRIGATÓRIO:

\`\`\`plaintext
SCORE: XX

PROBLEMAS:
- Problema 1 específico
- Problema 2 específico
- Problema 3 específico

SUGESTÕES:
- Sugestão 1 prática
- Sugestão 2 prática
- Sugestão 3 prática

CÓDIGO REFINADO:
\`\`\`tsx
[CÓDIGO COMPLETO REFINADO AQUI]
\`\`\`
\`\`\`

## ⚠️ REGRAS CRÍTICAS:

- Se score >= 85: retorne o código ORIGINAL sem modificações
- Se score < 85: retorne o código REFINADO com correções aplicadas
- Sempre use Tailwind CSS de forma consistente
- Preserve a estrutura React existente
- NÃO altere textos ou conteúdo do cliente
- Foco em MELHORIAS ESTÉTICAS, não funcionalidade

---

Código alvo:

\`\`\`tsx
${siteCode}
\`\`\`
`;

    console.log('🤖 [AI Refinement Engine] Chamando GPT-4o para análise...');
    
    // ✅ Inicializar cliente apenas quando necessário
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Você é um avaliador e refinador de design web especializado em UX/UI moderno e estética premium. Você analisa código React+Tailwind e fornece avaliações precisas com scores numéricos e código refinado quando necessário."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 8000,
    });

    const aiOutput = response.choices[0].message?.content ?? "";
    console.log('✅ [AI Refinement Engine] Resposta recebida da IA');
    
    const report = parseAIResponse(aiOutput, siteCode);
    console.log(`✅ [AI Refinement Engine] Score: ${report.score}/100`);

    // 🔄 Salvar relatório no Supabase se siteId fornecido
    if (siteId) {
      try {
        await saveRefinementReport(siteId, report);
        console.log('✅ [AI Refinement Engine] Relatório salvo no Supabase');
      } catch (saveError) {
        console.warn('⚠️ [AI Refinement Engine] Erro ao salvar no Supabase (continuando):', saveError);
      }
    }

    return report;

  } catch (error) {
    console.error('❌ [AI Refinement Engine] Erro no refinamento IA:', error);
    return { 
      score: 0, 
      issues: ['Erro interno no refinamento'], 
      suggestions: ['Verifique logs para detalhes'], 
      refinedCode: siteCode 
    };
  }
}

/**
 * Parse a resposta da IA e extrai o relatório estruturado
 */
function parseAIResponse(aiOutput: string, originalCode: string): RefinementReport {
  try {
    // Extrair score
    const scoreMatch = aiOutput.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 70;

    console.log('📊 [AI Refinement Engine] Score extraído:', score);

    // Extrair problemas
    const problemsMatch = aiOutput.match(/PROBLEMAS:[\s\S]*?(?=SUGESTÕES|CÓDIGO|SCORE|$)/i);
    const issues = problemsMatch 
      ? problemsMatch[0]
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[\s\-\d\.]+/, '').trim())
          .filter(Boolean)
      : [];

    // Extrair sugestões
    const suggestionsMatch = aiOutput.match(/SUGESTÕES:[\s\S]*?(?=CÓDIGO|SCORE|$)/i);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[0]
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[\s\-\d\.]+/, '').trim())
          .filter(Boolean)
      : [];

    // Extrair código refinado
    const codeMatch = aiOutput.match(/```(?:tsx|ts|jsx|js|html)?\s*([\s\S]*?)```/);
    const refinedCode = codeMatch ? codeMatch[1].trim() : originalCode;

    console.log('📋 [AI Refinement Engine] Resumo do relatório:');
    console.log(`   - Issues: ${issues.length}`);
    console.log(`   - Suggestions: ${suggestions.length}`);
    console.log(`   - Code refined: ${refinedCode.length > 0 ? 'Sim' : 'Não'}`);

    return { 
      score, 
      issues, 
      suggestions, 
      refinedCode: refinedCode || originalCode
    };

  } catch (parseError) {
    console.error('❌ [AI Refinement Engine] Erro ao parsear resposta:', parseError);
    return {
      score: 70,
      issues: ['Erro ao processar análise'],
      suggestions: ['Verifique formato da resposta'],
      refinedCode: originalCode
    };
  }
}

/**
 * Salva relatório de refinamento no Supabase
 */
async function saveRefinementReport(siteId: string, report: RefinementReport): Promise<void> {
  try {
    console.log('💾 [AI Refinement Engine] Salvando relatório no Supabase...');

    // Buscar última versão para incrementar
    const { data: lastVersion } = await supabase
      .from("site_versions")
      .select("version_number")
      .eq("conversation_id", (await supabase
        .from("site_versions")
        .select("conversation_id")
        .eq("id", siteId)
        .single()
      ).data?.conversation_id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const versionNumber = lastVersion ? (lastVersion.version_number || 0) + 1 : 1;

    // Inserir nova versão refinada
    const { error } = await supabase
      .from("site_versions")
      .insert({
        conversation_id: (await supabase
          .from("site_versions")
          .select("conversation_id")
          .eq("id", siteId)
          .single()
        ).data?.conversation_id,
        version_number: versionNumber,
        site_code: report.refinedCode,
        modification_description: `Refinamento automático - Score: ${report.score}/100`,
        refinement_score: report.score,
        refinement_feedback: JSON.stringify({
          issues: report.issues,
          suggestions: report.suggestions,
          timestamp: new Date().toISOString()
        }),
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ [AI Refinement Engine] Erro ao salvar:', error);
      throw error;
    }

    console.log('✅ [AI Refinement Engine] Relatório salvo com sucesso');
  } catch (error) {
    console.error('❌ [AI Refinement Engine] Erro ao salvar relatório:', error);
    throw error;
  }
}

/**
 * Busca histórico de refinamentos de um site
 */
export async function getRefinementHistory(siteId: string): Promise<RefinementReport[]> {
  try {
    const { data, error } = await supabase
      .from("site_versions")
      .select("refinement_score, refinement_feedback, version_number, created_at")
      .eq("id", siteId)
      .order("version_number", { ascending: false });

    if (error) throw error;

    return (data || []).map(record => ({
      score: record.refinement_score || 0,
      issues: JSON.parse(record.refinement_feedback || '{}').issues || [],
      suggestions: JSON.parse(record.refinement_feedback || '{}').suggestions || [],
      refinedCode: '', // Não incluir código completo no histórico
    }));

  } catch (error) {
    console.error('❌ [AI Refinement Engine] Erro ao buscar histórico:', error);
    return [];
  }
}

