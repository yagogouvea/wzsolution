/**
 * 🤖 Claude Sonnet 4.5 Integration
 * Integração com Anthropic API para geração de sites
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// 💰 Preços Claude (por milhão de tokens)
const PRICING = {
  sonnet: {
    input: 3.0,   // $3.00
    output: 15.0, // $15.00
  },
  haiku: {
    input: 0.25,   // $0.25 (12x mais barato!)
    output: 1.25,  // $1.25 (12x mais barato!)
  }
};

/**
 * Calcula custo estimado em USD
 */
function calculateCost(inputTokens: number, outputTokens: number, model: 'sonnet' | 'haiku' = 'sonnet'): number {
  const pricing = PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Estima tokens a partir de chars (aproximação)
 */
function estimateTokens(text: string): number {
  // ~1 token = 3 chars (aproximação)
  return Math.ceil(text.length / 3);
}

/**
 * Gera o código completo de um site com base no prompt do usuário
 */
export async function generateSiteWithClaude(prompt: string): Promise<string> {
  console.log('🤖 [Claude] Gerando site com prompt:', prompt.substring(0, 100));
  
  // Calcular custo estimado do input (Sonnet para geração)
  const systemPrompt = `Você é um desenvolvedor web sênior da WZ Solution...`;
  const fullPrompt = systemPrompt + `\n\n💡 PEDIDO DO CLIENTE:\n${prompt}`;
  const estimatedInputTokens = estimateTokens(fullPrompt);
  const estimatedMaxOutputTokens = 15000; // ✅ Configurado para 15k tokens
  const estimatedCost = calculateCost(estimatedInputTokens, estimatedMaxOutputTokens, 'sonnet');
  
  console.log(`💰 [Claude-Generate] Custo estimado (Sonnet): $${estimatedCost.toFixed(4)}`);
  console.log(`   📥 Input: ~${estimatedInputTokens} tokens ($${(estimatedInputTokens / 1_000_000 * PRICING.sonnet.input).toFixed(4)})`);
  console.log(`   📤 Output: ~${estimatedMaxOutputTokens} tokens ($${(estimatedMaxOutputTokens / 1_000_000 * PRICING.sonnet.output).toFixed(4)})`);
  
  // ✅ Retry automático otimizado (2 tentativas em vez de 3 - mais rápido)
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
        max_tokens: 15000, // ✅ Configurado para 15k tokens
        temperature: 0.6,
        stream: true, // ✅ Streaming habilitado (melhor performance)
        messages: [
          {
            role: "user",
            content: `Você é um desenvolvedor web sênior da WZ Solution, especializado em criar sites modernos, responsivos e premium.

🔒 REGRAS FUNDAMENTAIS:
- Você DEVE focar EXCLUSIVAMENTE em criação de sites/web
- NÃO responda a assuntos fora do escopo (apps mobile, software desktop, jogos, etc.)
- NÃO crie conteúdo ilegal, ofensivo, ou com apologia a crimes
- Mantenha linguagem profissional e adequada
- Se receber solicitação inadequada, redirecione educadamente para criação de sites

🎯 SUA MISSÃO:
Criar um site COMPLETO, FUNCIONAL e VISUALMENTE IMPRESSIONANTE baseado no pedido do cliente.

⚠️ **PRIORIDADE DE INFORMAÇÕES:**
- Se o prompt contém seção "**HISTÓRICO DA CONVERSA E ALTERAÇÕES SOLICITADAS:**", essas alterações são PRIORITÁRIAS
- Alterações mencionadas no histórico devem SUBSTITUIR ou COMPLEMENTAR a solicitação original
- Use TODAS as informações do histórico, especialmente mensagens do usuário com alterações
- Se houver conflito entre solicitação original e alterações, SEMPRE priorize as alterações mais recentes

📋 REQUISITOS TÉCNICOS OBRIGATÓRIOS:
✓ HTML5 puro + Tailwind CSS v3 (via CDN)
✓ ZERO JavaScript complexo, ZERO React, ZERO Framer Motion
✓ Mobile-first design (teste sm:, md:, lg:, xl: breakpoints)
✓ HTML semântico (<header>, <main>, <section>, <footer>, <article>)
✓ Performance otimizada (lazy loading, imagens otimizadas)
✓ SEO-friendly (meta tags quando aplicável)
✓ Acessibilidade (aria-labels, alt texts, contraste WCAG AA)
✓ Navegação sticky funcional (CSS puro)

🎨 QUALIDADE VISUAL PREMIUM:
✓ Tipografia hierarquizada (h1 > h2 > h3, títulos impactantes)
✓ Espaçamento generoso e equilibrado (py-12, px-6, gap-8)
✓ Cores harmoniosas (gradientes sutis, paleta coesa)
✓ Sombras realistas (shadow-lg, shadow-xl)
✓ Animações suaves com CSS (transition, transform)
✓ Ícones SVG inline (Font Awesome style)
✓ Layout limpo e profissional

✍️ CONTEÚDO REAL:
✓ NÃO use lorem ipsum nem placeholders genéricos
✓ Crie textos únicos, curtos e persuasivos
✓ Use nomes, endereços e informações realistas
✓ Personifique cada seção com conteúdo relevante ao negócio
✓ CTAs claros e com copy forte ("Fale Conosco", "Agende Agora", etc.)

🖼️ IMAGENS PROFISSIONAIS (PADRÃO OBRIGATÓRIO):
⚠️ REGRA ABSOLUTA: SEMPRE que o usuário solicitar imagens (com ou sem especificação), use APENAS Unsplash
✓ BANCO DE IMAGENS: https://images.unsplash.com (EXCLUSIVO - não use outros serviços)
✓ Formato da URL: https://images.unsplash.com/photo-[ID]?w=[largura]&q=80
✓ Escolha imagens automaticamente baseado no contexto do negócio
✓ NÃO faça perguntas sobre origem das imagens - use Unsplash SEMPRE
✓ NÃO questione se pode usar placeholders - use imagens reais do Unsplash
✓ Larguras padrão: 1200px (hero/banner), 800px (cards/produtos), 400px (thumbnails)
✓ Adicione alt text descritivo em TODAS as imagens
✓ Use lazy loading: loading="lazy" em TODAS as tags <img>
✓ Classes responsivas: w-full max-w-[tamanho] object-cover rounded-lg
✓ Quando solicitar "adicionar imagens", "incluir fotos", "usar imagens reais": execute IMEDIATAMENTE com Unsplash
✓ Exemplos de URLs válidas:
  - Hero: https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80
  - Produtos: https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80
  - Galeria: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80

🏗️ ESTRUTURA OBRIGATÓRIA:
\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nome da Empresa</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Header com navegação sticky -->
  <header class="fixed top-0 w-full bg-white shadow-md z-50">
    <!-- Logo + Menu -->
  </header>

  <main>
    <!-- Hero Section (primeira impressão impactante) -->
    <section class="pt-24 pb-16 px-6">
      <!-- Título principal + Subtitle + CTA -->
    </section>

    <!-- Features/Services (3-4 cards em grid) -->
    <section class="py-16 px-6 bg-gray-50">
      <!-- Cards responsivos -->
    </section>

    <!-- About/Why Choose Us (opcional) -->
    <!-- Gallery (opcional) -->
    <!-- Testimonials (opcional) -->
    
    <!-- CTA Final -->
    <section class="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <!-- Call to action destacado -->
    </section>
  </main>

  <!-- Footer completo -->
  <footer class="bg-gray-900 text-white py-12 px-6">
    <!-- Colunas: About, Links, Social, Contact -->
  </footer>
</body>
</html>
\`\`\`

💡 PEDIDO DO CLIENTE:
${prompt}

⚠️ **LEMBRE-SE:**
- Se o prompt acima contém "**HISTÓRICO DA CONVERSA E ALTERAÇÕES SOLICITADAS:**", essas informações são PRIORITÁRIAS
- Use TODAS as alterações e informações adicionais mencionadas no histórico
- As alterações devem ser aplicadas ao site, não apenas mencionadas

⚠️ CRÍTICO: 
- Retorne APENAS HTML COMPLETO (não JSX, não React)
- Use class="" ao invés de className=""
- Use ícones SVG inline ao invés de react-icons
- Use CSS para animações, não JavaScript
- SEM markdown, SEM explicações, SEM perguntas
- NÃO adicione textos explicativos antes ou depois do código
- Comece diretamente com <!DOCTYPE html> ou <html>
- NÃO faça perguntas como "Posso prosseguir?" ou "Aguardo sua confirmação"
- O HTML deve ser executável imediatamente em navegador

🔒 SEGURANÇA OBRIGATÓRIA:
- PROIBIDO: <script>, onclick, onerror, javascript:, eval(), fetch(), XMLHttpRequest
- PROIBIDO: localStorage, sessionStorage, window.location, document.cookie
- PROIBIDO: setTimeout, setInterval, Function()
- PROIBIDO: console.log, console.error
- Use APENAS CSS para interatividade e animações`
          }
        ]
      });

      // ✅ Processar streaming response
      let result = '';
      let chunkCount = 0;
      let stopReason = null;
      
      for await (const chunk of response) {
        chunkCount++;
        
        // Capturar stop_reason quando aparecer
        if (chunk.type === 'message_stop') {
          stopReason = (chunk as any).stop_reason;
          console.log('🛑 [Claude] Stop reason:', stopReason);
        }
        
        // Capturar conteúdo de texto
        if (chunk.type === 'content_block_delta') {
          const delta = (chunk as any).delta;
          if (delta && delta.text) {
            result += delta.text;
          }
        }
      }
      
      console.log('📄 [Claude] Total chars recebidos via streaming:', result.length);
      console.log('📄 [Claude] Primeiros 300 chars:', result.substring(0, 300));
      
      // Avisar se foi truncado
      if (stopReason === 'max_tokens') {
        console.error('⚠️ [Claude] RESPOSTA TRUNCADA por max_tokens!');
      }
      
      // ✅ DETECTAR SE É TEXTO EXPLICATIVO OU CÓDIGO HTML
      const isExplanatoryText = 
        result.includes('Antes de enviar') ||
        result.includes('gostaria de esclarecer') ||
        result.includes('Aguardo sua confirmação') ||
        result.includes('Posso prosseguir') ||
        result.includes('Para manter a integridade') ||
        (!result.includes('<!DOCTYPE') && !result.includes('<html') && !result.includes('import') && !result.includes('export'));
      
      if (isExplanatoryText && !result.includes('```')) {
        console.error('❌ [Claude-Generate] Resposta parece ser texto explicativo, não código!');
        console.error('❌ [Claude-Generate] Primeiros 500 chars:', result.substring(0, 500));
        throw new Error('A IA retornou texto explicativo em vez de código. Por favor, reformule sua solicitação de forma mais específica e direta.');
      }
      
      // Limpar markdown blocks (incluindo ```html)
      let clean = result
        .replace(/```html\s*/g, "")
        .replace(/```jsx\s*/g, "")
        .replace(/```tsx\s*/g, "")
        .replace(/```javascript\s*/g, "")
        .replace(/```typescript\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      // ✅ REMOVER TEXTO EXPLICATIVO ANTES DO CÓDIGO
      // Se ainda tiver texto explicativo no início, remover até encontrar código
      if (!clean.includes('<!DOCTYPE') && !clean.includes('<html') && !clean.includes('import')) {
        // Procurar por código (import, export, ou tags HTML)
        const codeMatch = clean.match(/(import|export|<!DOCTYPE|<html|<div|<section)[\s\S]*/i);
        if (codeMatch) {
          clean = codeMatch[1] + clean.substring(codeMatch.index! + codeMatch[1].length);
          console.log('🔧 [Claude-Generate] Texto explicativo removido, código extraído');
        } else {
          // Se não tem código claro, procurar por markdown blocks restantes
          const codeBlockMatch = clean.match(/```[\s\S]*?```/);
          if (codeBlockMatch) {
            clean = codeBlockMatch[0].replace(/```\w*\s*/g, '').replace(/```/g, '').trim();
            console.log('🔧 [Claude-Generate] Código extraído de bloco markdown');
          }
        }
      }
      
      // ✅ REMOVER TEXTO ANTES DO PRIMEIRO import, export, <!DOCTYPE ou <html
      if (clean.includes('<!DOCTYPE')) {
        const doctypeIndex = clean.indexOf('<!DOCTYPE');
        clean = clean.substring(doctypeIndex);
      } else if (clean.includes('<html')) {
        const htmlIndex = clean.indexOf('<html');
        clean = clean.substring(htmlIndex);
      } else if (clean.includes('import')) {
        const importIndex = clean.indexOf('import');
        clean = clean.substring(importIndex);
      } else if (clean.includes('export')) {
        const exportIndex = clean.indexOf('export');
        clean = clean.substring(exportIndex);
      }
      
      // ✅ REMOVER TEXTO EXPLICATIVO NO FINAL (após último </html> ou fechamento de componente)
      if (clean.includes('</html>')) {
        const htmlEndIndex = clean.lastIndexOf('</html>') + 7;
        clean = clean.substring(0, htmlEndIndex);
      } else if (clean.includes('</body>')) {
        const bodyEndIndex = clean.lastIndexOf('</body>') + 7;
        clean = clean.substring(0, bodyEndIndex);
      }
      
      console.log('📄 [Claude] Após limpeza markdown (primeiros 200 chars):', clean.substring(0, 200));
      console.log('📄 [Claude] Últimos 200 chars:', clean.substring(Math.max(0, clean.length - 200)));
      
      // Se o código não começa com import, procurar por ele (para React)
      if (!clean.includes('import') && result.includes('import')) {
        const importMatch = result.match(/(import[\s\S]*?export default)/);
        if (importMatch) {
          clean = importMatch[1];
        }
      }
      
      console.log('✅ [Claude] Site gerado com sucesso! Tamanho:', clean.length);
      
      // Calcular custo REAL do output (Sonnet para geração)
      const actualOutputTokens = estimateTokens(clean);
      const actualCost = calculateCost(estimatedInputTokens, actualOutputTokens, 'sonnet');
      
      console.log(`💰 [Claude-Generate] Custo REAL (Sonnet): $${actualCost.toFixed(4)}`);
      console.log(`   📤 Output real: ~${actualOutputTokens} tokens ($${(actualOutputTokens / 1_000_000 * PRICING.sonnet.output).toFixed(4)})`);
      
      // Verificar se HTML está completo
      if (clean.includes('<!DOCTYPE')) {
        const hasClosingHtml = clean.includes('</html>');
        const hasClosingBody = clean.includes('</body>');
        if (!hasClosingHtml || !hasClosingBody) {
          console.warn('⚠️ [Claude] HTML pode estar incompleto!', { hasClosingHtml, hasClosingBody });
        }
      }
      
      return clean;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      
      console.error(`❌ [Claude] Tentativa ${attempt}/${maxRetries} falhou:`, errorMessage);
      
      // ✅ Tratamento de Rate Limit (429) - NÃO fazer retry, retornar erro imediatamente
      const errorStatus = error?.status || error?.response?.status;
      if (errorStatus === 429 || errorMessage.includes('rate_limit') || errorMessage.includes('Rate limit')) {
        // Tentar extrair retry-after
        let retryAfter: string | number | undefined;
        if (error?.response?.headers) {
          const headers = error.response.headers;
          retryAfter = headers.get?.('retry-after') || headers['retry-after'];
        } else if (error?.headers) {
          retryAfter = error.headers.get?.('retry-after') || error.headers['retry-after'];
        }
        
        if (!retryAfter && errorMessage.includes('retry-after')) {
          const match = errorMessage.match(/retry-after[:\s]+(\d+)/i);
          if (match) retryAfter = match[1];
        }
        
        const waitMinutes = retryAfter ? Math.ceil(parseInt(String(retryAfter), 10) / 60) : 10;
        
        console.error(`⏸️ [Claude] Rate limit atingido! Aguarde ${waitMinutes} minutos antes de tentar novamente.`);
        
        // ✅ NÃO fazer retry quando rate limit - retornar erro imediatamente
        throw new Error(`❌ Rate limit do Claude AI atingido. Por favor, aguarde ${waitMinutes} minutos antes de tentar novamente.`);
      }
      
      // Se for erro de overload ou timeout, tentar novamente
      if (errorMessage.includes('Overloaded') || errorMessage.includes('timeout') || errorStatus === 500) {
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 500; // ✅ Otimizado: 500ms, 1s (vs 2s, 4s antes)
          console.log(`⏳ [Claude] Aguardando ${waitTime}ms antes de retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // Para outros erros, lançar imediatamente
      throw error;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw lastError || new Error('Falha ao gerar site após múltiplas tentativas');
}

/**
 * Detecta se a modificação é pequena/incremental (pode retornar apenas a parte modificada)
 */
function isIncrementalModification(modification: string): boolean {
  const lowerMod = modification.toLowerCase();
  
  // Modificações pequenas que podem ser incrementais
  const incrementalPatterns = [
    'whatsapp',
    'formulário',
    'formulario',
    'botão flutuante',
    'botao flutuante',
    'adicionar botão',
    'adicionar botao',
    'botão de cadastro',
    'botao de cadastro',
    'ícone',
    'icone',
    'link',
    'telefone',
    'email',
    'endereço',
    'endereco',
    'adicionar uma seção',
    'adicionar seção',
    'nova seção',
    'seção de',
  ];
  
  // Modificações grandes que precisam código completo
  const fullCodePatterns = [
    'mudar cor',
    'alterar cor',
    'cores',
    'reestruturar',
    'mudar layout',
    'alterar layout',
    'redesenhar',
    'refazer',
    'todos os',
    'todo o',
    'global',
    'modificar todo',
    'modificar tudo',
  ];
  
  // Se tem padrão de modificação grande, retornar código completo
  if (fullCodePatterns.some(pattern => lowerMod.includes(pattern))) {
    return false;
  }
  
  // Se tem padrão incremental, retornar apenas parte modificada
  return incrementalPatterns.some(pattern => lowerMod.includes(pattern));
}

/**
 * Mescla código incremental no código original
 */
function mergeIncrementalCode(originalCode: string, incrementalCode: string, modification: string): string {
  const lowerMod = modification.toLowerCase();
  
  // Se é botão WhatsApp, adicionar antes de </body>
  if (lowerMod.includes('whatsapp')) {
    if (originalCode.includes('</body>')) {
      return originalCode.replace('</body>', `${incrementalCode}\n</body>`);
    }
  }
  
  // Se é formulário, adicionar antes de </main> ou antes de </body>
  if (lowerMod.includes('formulário') || lowerMod.includes('formulario')) {
    if (originalCode.includes('</main>')) {
      return originalCode.replace('</main>', `${incrementalCode}\n</main>`);
    } else if (originalCode.includes('</body>')) {
      return originalCode.replace('</body>', `${incrementalCode}\n</body>`);
    }
  }
  
  // Se é seção nova, adicionar antes de </main> ou antes de </body>
  if (lowerMod.includes('seção') || lowerMod.includes('secao')) {
    if (originalCode.includes('</main>')) {
      return originalCode.replace('</main>', `${incrementalCode}\n</main>`);
    } else if (originalCode.includes('</body>')) {
      return originalCode.replace('</body>', `${incrementalCode}\n</body>`);
    }
  }
  
  // Fallback: adicionar antes de </body>
  if (originalCode.includes('</body>')) {
    return originalCode.replace('</body>', `${incrementalCode}\n</body>`);
  }
  
  // Se não encontrar lugar apropriado, retornar original + incremental
  return originalCode + '\n' + incrementalCode;
}

/**
 * Modifica código existente com base em uma solicitação do usuário
 */
export async function modifySiteWithClaude(
  currentCode: string,
  modification: string,
  context?: {
    companyName?: string;
    businessSector?: string;
    designStyle?: string;
  },
  imageData?: { imageUrl?: string; fileName?: string } | null,
  conversationContext?: string // ✅ NOVO: Contexto completo da conversa
): Promise<string> {
  console.log('🔄 [Claude] Modificando código...');
  if (imageData) {
    console.log('🖼️ [Claude] Imagem incluída:', imageData.fileName || 'Imagem');
  }
  
  // ✅ DESABILITAR estratégia incremental - sempre retornar código completo
  // Problema: estratégia incremental estava retornando apenas fragmentos e mesclagem não funcionava corretamente
  // Solução: sempre usar estratégia completa para garantir código completo modificado
  const isIncremental = false; // ✅ FORÇAR estratégia completa sempre
  const originalLength = currentCode?.length || 0;
  
  // ✅ Código comentado - estratégia incremental desabilitada temporariamente
  // if (isIncremental && originalLength > 15000) {
  //   console.log('💰 [Claude] Modificação incremental detectada! Usando estratégia econômica...');
  //   try {
  //     // Usar estratégia incremental para economizar tokens
  //     return await modifySiteIncremental(currentCode, modification, context, imageData, conversationContext);
  //   } catch (incrementalError) {
  //     console.warn('⚠️ [Claude] Estratégia incremental falhou, usando estratégia completa como fallback...');
  //     // Continuar para estratégia completa abaixo
  //   }
  // }
  
  console.log('📄 [Claude] Usando estratégia completa (incremental desabilitada) - sempre retornar código completo');
  
  // Para modificações grandes ou códigos pequenos, usar estratégia completa
  console.log('📄 [Claude] Usando estratégia completa (modificação grande ou código pequeno)');
  
  // ✅ Retry automático otimizado (2 tentativas em vez de 3 - mais rápido)
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // ✅ Se tentativa anterior falhou por resposta explicativa, reforçar prompt
      const isRetryAfterExplanatory = lastError?.message === 'RESPONSE_IS_EXPLANATORY_ONLY';
      let currentModification = modification;
      if (isRetryAfterExplanatory) {
        console.log('🔄 [Claude-Modify] Retry após resposta explicativa. Reforçando prompt...');
        currentModification = `🚨 CRÍTICO: Retorne DIRETAMENTE o código HTML completo modificado começando com <!DOCTYPE html>. NÃO faça perguntas, NÃO liste modificações ("Substituir X por Y"), NÃO explique. APLIQUE as modificações DIRETAMENTE e retorne o código COMPLETO.\n\n${modification}`;
      }
      
      // ✅ Construir contexto completo incluindo histórico da conversa
      let contextInfo = '';
      
      if (conversationContext) {
        contextInfo += `\n📚 CONTEXTO COMPLETO DO PROJETO:\n${conversationContext}\n`;
      }
      
      if (context) {
        contextInfo += `\nContexto do projeto:\n- Empresa: ${context.companyName || 'N/A'}\n- Setor: ${context.businessSector || 'N/A'}\n- Estilo: ${context.designStyle || 'N/A'}`;
      }
      
      // ✅ Adicionar instrução para manter consistência com o contexto
      if (conversationContext) {
        contextInfo += `\n\n⚠️ IMPORTANTE: Esta é uma MODIFICAÇÃO em um site já existente. Mantenha a consistência com o prompt inicial e as modificações anteriores. Aplique apenas a modificação solicitada, preservando o resto do site.`;
      }
      
      // Calcular max_tokens baseado no tamanho do código atual
      // ✅ Haiku tem limite de 8192 tokens de output
      const estimatedTokens = Math.ceil(currentCode.length / 3); // ~1 token = 3 chars
      const haikuMaxOutput = 8192; // ✅ Limite REAL do Haiku
      
      // ⚠️ PROBLEMA: Se o código original é muito grande, não cabe em 8192 tokens de output
      // Para códigos grandes, precisamos garantir que a IA retorne o código completo
      // Solução: Usar sempre o máximo possível e reforçar no prompt que DEVE retornar tudo
      const adaptiveMaxTokens = haikuMaxOutput; // ✅ SEMPRE usar máximo para dar espaço completo
      
      // ✅ DECISÃO DE STREAMING: Usar sempre para códigos grandes para evitar timeout
      // Streaming é necessário para códigos grandes mesmo com o risco de desconexão
      const shouldUseStreaming = true; // ✅ SEMPRE usar streaming para modificações (código pode ser grande)
      
      console.log(`📊 [Claude] Código atual: ${currentCode.length} chars (~${estimatedTokens} tokens)`);
      console.log(`📊 [Claude] Using max_tokens: ${adaptiveMaxTokens} (Haiku max: ${haikuMaxOutput})`);
      console.log(`📊 [Claude] Usar streaming: ${shouldUseStreaming}`);
      
      // Calcular custo estimado do input
      const systemPrompt = `Você é um desenvolvedor web sênior...`;
      const fullPrompt = systemPrompt + `\n\n📄 CÓDIGO ATUAL:\n\`\`\`html\n${currentCode}\n\`\`\`\n\n${contextInfo}\n\n🎯 SOLICITAÇÃO DE MODIFICAÇÃO:\n${modification}`;
      const estimatedInputTokens = estimateTokens(fullPrompt);
      
      // ✅ Calcular tamanho do código original para decidir modelo
      const originalLength = currentCode?.length || 0;
      
      // ✅ Decidir qual modelo usar baseado no tamanho do código e tentativa anterior
      // Se tentativa anterior foi truncada, usar Sonnet nesta tentativa
      let useModel: 'haiku' | 'sonnet' = 'haiku';
      let modelName = "claude-3-5-haiku-20241022";
      let adaptiveMaxTokensForModel = adaptiveMaxTokens; // 8192 para Haiku
      
      // ✅ Se for tentativa após truncamento OU código original muito grande, usar Sonnet
      if (attempt > 1 && lastError?.message === 'TRUNCATED_BY_TOKENS_LIMIT') {
        useModel = 'sonnet';
        modelName = process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";
        adaptiveMaxTokensForModel = 32768; // Sonnet tem limite muito maior
        console.log('🔄 [Claude-Modify] Usando Sonnet devido a truncamento anterior');
      } else if (originalLength > 25000) {
        // Para códigos muito grandes (>25k chars), usar Sonnet direto
        useModel = 'sonnet';
        modelName = process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";
        adaptiveMaxTokensForModel = 32768;
        console.log('🔄 [Claude-Modify] Usando Sonnet devido ao tamanho do código (>25k chars)');
      }
      
      // ✅ Ajustar estimativa de output tokens baseado no modelo escolhido
      const estimatedMaxOutputTokens = Math.ceil(adaptiveMaxTokensForModel * 0.9); // 90% do max como estimativa
      
      // Calcular custo com modelo escolhido
      const estimatedCostModel = calculateCost(estimatedInputTokens, estimatedMaxOutputTokens, useModel);
      const estimatedCostOther = calculateCost(estimatedInputTokens, estimatedMaxOutputTokens, useModel === 'haiku' ? 'sonnet' : 'haiku');
      
      console.log(`💰 [Claude-Modify] Custo estimado (${useModel === 'haiku' ? 'Haiku' : 'Sonnet'}): $${estimatedCostModel.toFixed(4)}`);
      if (useModel === 'haiku') {
        console.log(`💰 [Claude-Modify] Custo se Sonnet: $${estimatedCostOther.toFixed(4)} (economia: ${((1 - estimatedCostModel/estimatedCostOther) * 100).toFixed(0)}%)`);
      }
      console.log(`   📥 Input: ~${estimatedInputTokens} tokens ($${(estimatedInputTokens / 1_000_000 * PRICING[useModel].input).toFixed(4)})`);
      console.log(`   📤 Output: ~${estimatedMaxOutputTokens} tokens ($${(estimatedMaxOutputTokens / 1_000_000 * PRICING[useModel].output).toFixed(4)})`);
      
      // Preparar conteúdo com imagem se houver
      let messageContent: any;
      
      if (imageData && imageData.imageUrl) {
        // Extrair base64 e mime type
        const base64Match = imageData.imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        
        if (base64Match) {
          const [, mimeType, base64Data] = base64Match;
          messageContent = [
            {
              type: "text",
              text: `Você é um desenvolvedor web sênior da WZ Solution. Modifique o código HTML abaixo conforme solicitado.

🔒 REGRAS DE CONTEXTO:
- Você DEVE focar APENAS em criação e modificação de sites
- Se a solicitação não for relacionada a sites/web, redirecione educadamente
- NÃO responda a assuntos pessoais, outros tipos de software, ou tópicos fora do escopo
- Mantenha linguagem profissional e adequada
- NÃO crie conteúdo ilegal, ofensivo ou inadequado

${contextInfo}

📄 CÓDIGO ATUAL DO SITE (MODIFICAR ESTE CÓDIGO):
\`\`\`html
${currentCode}
\`\`\`

🎯 SOLICITAÇÃO DE MODIFICAÇÃO:
${currentModification}

⚠️ IMPORTANTE: Se a solicitação não for sobre modificação do site (design, conteúdo, funcionalidades web), responda educadamente redirecionando para o foco em criação de sites.

📸 IMAGEM ANEXADA:
Analise a imagem anexada e execute a solicitação conforme descrito abaixo. A imagem pode ser usada de 3 formas:

1️⃣ **ADICIONAR IMAGEM AO SITE:**
   - Se o usuário pedir para "adicionar", "incluir", "colocar" a imagem em algum lugar específico:
     • Identifique o local mencionado (cabeçalho, rodapé, hero/banner, seção específica, etc.)
     • Adicione a imagem usando tag <img> com src em base64 (data:image/...)
     • Posicione conforme solicitado com classes Tailwind apropriadas
     • Mantenha responsividade (img com classes w-full, max-w-*, object-cover, etc.)
     • Se mencionar "logo", use na tag <img> dentro do header/nav com tamanho apropriado

2️⃣ **ANALISAR CORES E APLICAR NO DESIGN:**
   - Se o usuário pedir para "analisar cores", "usar cores como referência", "aplicar paleta":
     • Identifique as cores dominantes da imagem (hex codes)
     • Identifique cores de destaque/accent
     • Aplique essas cores no site como:
       - Backgrounds (bg-[#hex])
       - Textos (text-[#hex])
       - Botões (bg-[#hex] hover:bg-[#hex-escuro])
       - Bordas (border-[#hex])
     • Mantenha contraste adequado para legibilidade
     • Use gradientes se as cores sugerirem
     • Exemplo: Se imagem tem azul #1e40af e dourado #fbbf24, use essas cores nos elementos principais

3️⃣ **TRANSCREVER CONTEÚDO (OCR):**
   - Se o usuário pedir para "transcrever", "extrair texto", "copiar texto da imagem":
     • Leia TODO o texto visível na imagem
     • Extraia o conteúdo textual completo
     • Adicione o texto extraído ao site em formato HTML apropriado
     • Mantenha formatação quando possível (títulos, parágrafos, listas)
     • Use elementos semânticos (<h1>, <h2>, <p>, <ul>, etc.)
     • Se for um card/banner, crie uma seção estilizada com o conteúdo

🔍 **DETECÇÃO AUTOMÁTICA:**
Analise o prompt do usuário para identificar qual tipo de uso é solicitado:
- Palavras-chave para ADICIONAR: "adicionar", "incluir", "colocar", "usar como logo", "banner", "imagem"
- Palavras-chave para CORES: "analisar cores", "usar cores", "paleta", "aplicar cores", "referência de cores"
- Palavras-chave para OCR: "transcrever", "extrair texto", "copiar texto", "ler conteúdo", "texto da imagem"

💡 **EXECUÇÃO:**
- Se o prompt mencionar múltiplos tipos, execute TODOS conforme apropriado
- Se não especificar, priorize ADICIONAR + ANALISAR CORES automaticamente
- Sempre mantenha a imagem visível no site quando adicionada (usando base64 ou referência)

🖼️ **SOLICITAÇÕES DE IMAGENS SEM ANEXO:**
Se o usuário solicitar "adicionar imagens", "incluir fotos", "usar imagens reais", "adicionar imagens de [assunto]" MAS NÃO anexar nenhuma imagem:
- ✅ Use SEMPRE imagens do Unsplash (https://images.unsplash.com)
- ✅ NÃO faça perguntas como "de onde virão as imagens?" ou "posso usar placeholders?"
- ✅ Escolha imagens apropriadas ao contexto automaticamente
- ✅ Formato: https://images.unsplash.com/photo-[ID]?w=[largura]&q=80
- ✅ Larguras: 1200px (hero), 800px (cards), 400px (thumbnails)
- ✅ Adicione alt text descritivo e loading="lazy"
- ✅ Execute a solicitação IMEDIATAMENTE sem questionar

🖼️ IMAGENS PROFISSIONAIS (QUANDO SOLICITADO):
✓ Use imagens REAIS do Unsplash: https://images.unsplash.com/photo-[ID]?w=[largura]&q=80
✓ Escolha imagens apropriadas ao contexto do negócio
✓ Use larguras adequadas: 800-1200px para hero, 400-600px para cards
✓ Adicione alt text descritivo: alt="Descrição da imagem"
✓ Use lazy loading: loading="lazy"
✓ Classes responsivas: class="w-full max-w-[tamanho] object-cover rounded-lg"
✓ Se pedir "imagens reais", use Unsplash com URLs válidas
✓ Se pedir "imagens de [assunto]", busque no Unsplash imagens relacionadas

📱 SE A MODIFICAÇÃO INCLUIR WHATSAPP:
Adicione um botão flutuante fixo no canto inferior direito com:
- Posição: \`fixed bottom-6 right-6 z-50\`
- Cor: \`bg-green-500 hover:bg-green-600\`
- Ícone SVG do WhatsApp
- Link: \`https://wa.me/5511999999999\` (ajuste o número)
- Animações CSS: \`transition-transform duration-300 hover:scale-110\`

✅ REQUISITOS OBRIGATÓRIOS:
✓ Mantenha HTML5 puro + Tailwind CSS (via CDN)
✓ ZERO JavaScript complexo, ZERO React, ZERO Framer Motion
✓ Use \`class=""\` no lugar de \`className=""\`
✓ Use ícones SVG inline
✓ Use CSS para animações
✓ Preserve a estrutura responsiva (mobile-first)
✓ Retorne o código COMPLETO modificado (não apenas a parte alterada)
✓ Mantenha consistência visual com o resto do site
✓ Não adicione explicações ou markdown

⚠️ CRÍTICO: Retorne APENAS o código HTML COMPLETO, sem explicações, sem markdown.

🔒 SEGURANÇA OBRIGATÓRIA:
- PROIBIDO: <script>, onclick, onerror, javascript:, eval(), fetch(), XMLHttpRequest
- PROIBIDO: localStorage, sessionStorage, window.location, document.cookie
- PROIBIDO: setTimeout, setInterval, Function()
- PROIBIDO: console.log, console.error
- Use APENAS CSS para interatividade e animações`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: `image/${mimeType}`,
                data: base64Data
              }
            }
          ];
        } else {
          // Se não puder extrair base64, só usar texto
          messageContent = `⚠️ Imagem fornecida mas formato não reconhecido. Ignore a imagem e proceda com a modificação:\n\n${modification}`;
        }
      } else {
        // Sem imagem, usar apenas texto
        messageContent = `Você é um desenvolvedor web sênior da WZ Solution. Modifique o código HTML abaixo conforme solicitado.

🔒 REGRAS DE CONTEXTO:
- Você DEVE focar APENAS em criação e modificação de sites
- Se a solicitação não for relacionada a sites/web, redirecione educadamente
- NÃO responda a assuntos pessoais, outros tipos de software, ou tópicos fora do escopo
- Mantenha linguagem profissional e adequada
- NÃO crie conteúdo ilegal, ofensivo ou inadequado

${contextInfo}

📄 CÓDIGO ATUAL DO SITE (MODIFICAR ESTE CÓDIGO):
\`\`\`html
${currentCode}
\`\`\`

🎯 SOLICITAÇÃO DE MODIFICAÇÃO:
${currentModification}

⚠️ IMPORTANTE: Se a solicitação não for sobre modificação do site (design, conteúdo, funcionalidades web), responda educadamente redirecionando para o foco em criação de sites.

🖼️ IMAGENS PROFISSIONAIS (QUANDO SOLICITADO):
✓ Use imagens REAIS do Unsplash: https://images.unsplash.com/photo-[ID]?w=[largura]&q=80
✓ Escolha imagens apropriadas ao contexto do negócio
✓ Use larguras adequadas: 800-1200px para hero, 400-600px para cards
✓ Adicione alt text descritivo: alt="Descrição da imagem"
✓ Use lazy loading: loading="lazy"
✓ Classes responsivas: class="w-full max-w-[tamanho] object-cover rounded-lg"
✓ Se pedir "imagens reais", use Unsplash com URLs válidas
✓ Se pedir "imagens de [assunto]", busque no Unsplash imagens relacionadas

📱 SE A MODIFICAÇÃO INCLUIR WHATSAPP:
Adicione um botão flutuante fixo no canto inferior direito com:
- Posição: \`fixed bottom-6 right-6 z-50\`
- Cor: \`bg-green-500 hover:bg-green-600\`
- Ícone SVG do WhatsApp
- Link: \`https://wa.me/5511999999999\` (ajuste o número)
- Animações CSS: \`transition-transform duration-300 hover:scale-110\`

✅ REQUISITOS OBRIGATÓRIOS:
✓ Mantenha HTML5 puro + Tailwind CSS (via CDN)
✓ ZERO JavaScript complexo, ZERO React, ZERO Framer Motion
✓ Use \`class=""\` no lugar de \`className=""\`
✓ Use ícones SVG inline
✓ Use CSS para animações
✓ Preserve a estrutura responsiva (mobile-first)
✓ Retorne o código COMPLETO modificado (não apenas a parte alterada)
✓ Mantenha consistência visual com o resto do site
✓ NÃO adicione explicações, comentários ou markdown ANTES ou DEPOIS do código
✓ NÃO faça perguntas como "Deseja que eu prossiga?" ou "Posso prosseguir?"
✓ NÃO liste as modificações que fará - APLIQUE DIRETAMENTE e retorne o código

⚠️⚠️⚠️ CRÍTICO ABSOLUTO: Retorne SEMPRE e DIRETAMENTE o código HTML COMPLETO e INTEGRAL, do INÍCIO ao FIM!
🚨 INÍCIE DIRETAMENTE COM <!DOCTYPE html> OU <html> - SEM TEXTO ANTES!
🚨 TERMINE COM </html> - SEM TEXTO DEPOIS!

🚨 LIMITE DE TOKENS: Você tem até 8192 tokens de output. Use TODOS se necessário para retornar o código COMPLETO!

🚫 PROIBIDO ABSOLUTAMENTE RETORNAR:
- Código truncado ou incompleto (apenas header, apenas footer, apenas uma seção)
- Textos como "seria muito extenso para ser reproduzido aqui"
- Instruções como "recomendo usar classes Tailwind" sem mostrar o código
- Listas de substituições sem o código modificado (ex: "Substituir purple-600 por blue-600")
- Código que termina abruptamente antes de </body></html>
- Textos explicativos ANTES do código (ex: "Modificarei o código substituindo...")
- Textos explicativos DEPOIS do código
- Perguntas como "Posso prosseguir?", "Aguardo sua confirmação", "Deseja que eu prossiga?"
- Textos como "Antes de enviar" ou "gostaria de esclarecer"
- Perguntas sobre origem das imagens ("de onde virão as imagens?", "posso usar placeholders?")
- Frases como "Principais modificações:" seguida de lista sem código
- Qualquer texto que não seja código HTML COMPLETO DIRETO

✅ OBRIGATÓRIO ABSOLUTAMENTE:
- SEMPRE retornar o código HTML COMPLETO do início (<!DOCTYPE html>) ao fim (</html>)
- SEMPRE incluir TODAS as seções: <head>, <body>, header, main, footer, scripts, styles
- SEMPRE terminar com </body></html> - nunca deixar código incompleto
- Se o código original tem 35938 chars, retorne pelo menos 35000+ chars modificado
- INICIAR DIRETAMENTE com <!DOCTYPE html> ou <html> - SEM NENHUM TEXTO ANTES
- Retornar código HTML completo e funcional (não resumos ou instruções)
- NÃO adicionar explicações ou comentários textuais ANTES do código
- NÃO adicionar explicações ou comentários textuais DEPOIS do código
- NÃO fazer perguntas ao usuário (ex: "Deseja que eu prossiga?")
- NÃO listar modificações sem aplicar (ex: "Substituir X por Y" - deve aplicar diretamente)
- NÃO dizer que o código é "muito extenso" - SEMPRE retornar tudo
- Quando solicitado cores: aplicar em TODAS as ocorrências DIRETAMENTE e retornar código completo
- Quando solicitado imagens: usar SEMPRE Unsplash (sem perguntar ou questionar)
- EXECUTAR a modificação IMEDIATAMENTE - não explicar o que vai fazer, FAZER diretamente

🔴 SE O CÓDIGO FOR MUITO LONGO, RETORNE MESMO ASSIM! Use TODOS os tokens disponíveis (8192) se necessário!

⚠️ VALIDAÇÃO FINAL: O código retornado DEVE ter pelo menos 80% do tamanho do código original. Se o original tem ${Math.floor(currentCode.length / 1000)}k chars, retorne pelo menos ${Math.floor(currentCode.length * 0.8 / 1000)}k chars modificado!

🔒 SEGURANÇA OBRIGATÓRIA:
- PROIBIDO: <script>, onclick, onerror, javascript:, eval(), fetch(), XMLHttpRequest
- PROIBIDO: localStorage, sessionStorage, window.location, document.cookie
- PROIBIDO: setTimeout, setInterval, Function()
- PROIBIDO: console.log, console.error
- Use APENAS CSS para interatividade e animações`;
      }
      
      const response = await anthropic.messages.create({
        model: modelName, // ✅ Haiku ou Sonnet dependendo do caso
        max_tokens: adaptiveMaxTokensForModel, // ✅ 8192 para Haiku, 32768 para Sonnet
        temperature: 0.7,
        stream: shouldUseStreaming, // ✅ Usar streaming apenas quando realmente necessário
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ]
      });

      // ✅ Processar streaming ou non-streaming response
      let result = '';
      let stopReason: string | null = null; // ✅ Definir stopReason fora do bloco para usar na validação
      
      if (shouldUseStreaming) {
        // Streaming mode - usar mesma abordagem que funciona em generateSiteWithClaude
        console.log('📡 [Claude-Modify] Processando resposta streaming...');
        let chunkCount = 0;
        
        try {
          for await (const chunk of response) {
            chunkCount++;
            
            // Capturar stop_reason quando aparecer
            if (chunk.type === 'message_stop') {
              stopReason = (chunk as any).stop_reason;
              console.log('🛑 [Claude-Modify] Stop reason:', stopReason);
            }
            
            // Capturar conteúdo de texto (PRINCIPAL)
            if (chunk.type === 'content_block_delta') {
              const delta = (chunk as any).delta;
              if (delta && delta.text) {
                result += delta.text;
              }
            }
          }
          
          console.log(`📄 [Claude-Modify] Total chunks recebidos: ${chunkCount}`);
          console.log(`📄 [Claude-Modify] Result length após streaming: ${result.length}`);
          
          if (stopReason === 'max_tokens') {
            console.warn('⚠️ [Claude-Modify] RESPOSTA PODE ESTAR TRUNCADA por max_tokens!');
          }
          
          if (result.length === 0) {
            if (chunkCount > 0) {
              console.error('❌ [Claude-Modify] Streaming recebeu chunks mas resultado está vazio!');
              console.error('❌ [Claude-Modify] Chunks recebidos:', chunkCount);
              throw new Error('Streaming retornou chunks mas conteúdo está vazio. Verifique processamento.');
            } else {
              console.error('❌ [Claude-Modify] Nenhum chunk recebido do streaming!');
              throw new Error('Nenhum chunk recebido do streaming. Verifique conexão com Claude.');
            }
          }
        } catch (streamError) {
          console.error('❌ [Claude-Modify] Erro ao processar streaming:', streamError);
          console.error('❌ [Claude-Modify] Stack:', streamError instanceof Error ? streamError.stack : 'N/A');
          throw streamError;
        }
      } else {
        // Non-streaming mode
        console.log('📡 [Claude-Modify] Processando resposta não-streaming...');
        const message = response as any;
        
        // ✅ Capturar stop_reason no modo não-streaming
        if (message.stop_reason) {
          stopReason = message.stop_reason;
          console.log('🛑 [Claude-Modify] Stop reason:', stopReason);
        }
        
        if (message.content && Array.isArray(message.content) && message.content.length > 0) {
          const firstContent = message.content[0];
          if (firstContent.type === 'text' && firstContent.text) {
            result = firstContent.text;
          } else if (typeof firstContent === 'string') {
            result = firstContent;
          } else if (firstContent.text) {
            result = firstContent.text;
          }
        } else if (message.text) {
          result = message.text;
        } else if (typeof message === 'string') {
          result = message;
        }
        
        console.log(`📄 [Claude-Modify] Result length após non-streaming: ${result.length}`);
        
        if (result.length === 0) {
          console.error('❌ [Claude-Modify] Resposta não-streaming está vazia!');
          console.error('❌ [Claude-Modify] Response structure:', JSON.stringify(message).substring(0, 500));
          throw new Error('Resposta não-streaming está vazia. Verifique resposta da API Claude.');
        }
      }
      
      console.log('📄 [Claude] Total chars recebidos:', result.length);
      console.log('📄 [Claude] Primeiros 300 chars:', result.substring(0, 300));
      
      // ✅ DETECTAR SE É TEXTO EXPLICATIVO OU CÓDIGO HTML
      const explanatoryPatterns = [
        'Antes de enviar',
        'gostaria de esclarecer',
        'Aguardo sua confirmação',
        'Posso prosseguir',
        'Deseja que eu prossiga',
        'Para manter a integridade',
        'Vou adicionar',
        'Converti',
        'Substitui',
        'Mantive',
        'Seguem as instruções',
        'instruções de implementação',
        'Pelo novo logo',
        'Substituirei',
        'Modificarei o código',
        'No cabeçalho',
        'Código omitido',
        'para manter o foco',
        'Todas as cores foram',
        'Modificações globais',
        'Principais modificações'
      ];
      
      // Verificar se começa com texto explicativo (primeiros 500 chars)
      const first500Chars = result.substring(0, 500).toLowerCase();
      const hasExplanatoryText = explanatoryPatterns.some(pattern => 
        first500Chars.includes(pattern.toLowerCase())
      );
      
      // Verificar se tem código HTML (não apenas no início)
      const hasCode = result.includes('<!DOCTYPE') || result.includes('<html') || 
                      result.includes('<div') || result.includes('<section') || 
                      result.includes('<svg') || result.includes('<img') ||
                      result.includes('data:image') ||
                      result.includes('<head') || result.includes('<body') ||
                      result.includes('<header') || result.includes('<footer');
      
      // ✅ Se começa com texto explicativo mas tem código depois, tentar extrair o código
      if (hasExplanatoryText && hasCode) {
        console.log('⚠️ [Claude-Modify] Resposta tem texto explicativo + código. Tentando extrair código...');
        // Tentar encontrar início do código HTML
        const htmlStart = result.search(/<!DOCTYPE|<html/i);
        if (htmlStart > 0) {
          console.log(`✅ [Claude-Modify] Código encontrado na posição ${htmlStart}. Extraindo...`);
          result = result.substring(htmlStart);
        }
      }
      
      // Se só tem texto explicativo sem código, lançar erro
      if (hasExplanatoryText && !hasCode && !result.includes('```')) {
        console.error('❌ [Claude-Modify] Resposta parece ser APENAS texto explicativo, sem código HTML!');
        console.error('❌ [Claude-Modify] Primeiros 500 chars:', result.substring(0, 500));
        console.error('❌ [Claude-Modify] Tamanho total:', result.length);
        
        // ✅ Tentar retry com prompt mais direto
        if (attempt < maxRetries) {
          console.log(`🔄 [Claude-Modify] Tentativa ${attempt} falhou. Tentando novamente com prompt reforçado...`);
          lastError = new Error('RESPONSE_IS_EXPLANATORY_ONLY');
          continue; // Tentar novamente
        }
        
        throw new Error('A IA retornou apenas texto explicativo sem código HTML. Por favor, reformule sua solicitação de forma mais específica e direta.');
      }
      
      // Limpar markdown blocks
      let clean = result
        .replace(/```html\s*/g, "")
        .replace(/```jsx\s*/g, "")
        .replace(/```tsx\s*/g, "")
        .replace(/```javascript\s*/g, "")
        .replace(/```typescript\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      // ✅ REMOVER TEXTO EXPLICATIVO ANTES DO CÓDIGO (mais agressivo)
      // Remover frases explicativas comuns antes do código
      const textBeforeCodePatterns = [
        /^[^<]*?(Entendi[^<]*?)/i,
        /^[^<]*?(Vou adicionar[^<]*?)/i,
        /^[^<]*?(Converti[^<]*?)/i,
        /^[^<]*?(Substitui[^<]*?)/i,
        /^[^<]*?(Mantive[^<]*?)/i,
        /^[^<]*?(Seguem as instruções[^<]*?)/i,
        /^[^<]*?(instruções de implementação[^<]*?)/i,
        /^[^<]*?(Pelo novo logo[^<]*?)/i,
        /^[^<]*?(Substituirei[^<]*?)/i,
        /^[^<]*?(No cabeçalho[^<]*?)/i,
        /^[^<]*?(\d+\.\s+[^<]+)/g, // Listas numeradas (1. texto, 2. texto)
      ];
      
      // Tentar encontrar início do código HTML
      let codeStartIndex = -1;
      
      // Procurar por tags HTML válidas
      const htmlTagPatterns = [
        /<!DOCTYPE\s+html/i,
        /<html[>\s]/i,
        /<head[>\s]/i,
        /<body[>\s]/i,
        /<header[>\s]/i,
        /<div[>\s]/i,
        /<section[>\s]/i,
        /<svg[>\s]/i,
        /<img[>\s]/i,
      ];
      
      for (const pattern of htmlTagPatterns) {
        const match = clean.match(pattern);
        if (match && match.index !== undefined) {
          codeStartIndex = match.index;
          break;
        }
      }
      
      // Se encontrou início do código, remover tudo antes
      if (codeStartIndex > 0) {
        console.log(`🔧 [Claude-Modify] Removendo ${codeStartIndex} chars de texto explicativo antes do código`);
        clean = clean.substring(codeStartIndex);
      } else if (!clean.includes('<!DOCTYPE') && !clean.includes('<html')) {
        // Procurar por primeira tag HTML
        const htmlMatch = clean.match(/(<[a-z][\s\S]*)/i);
        if (htmlMatch && htmlMatch.index !== undefined) {
          clean = clean.substring(htmlMatch.index);
          console.log('🔧 [Claude-Modify] Texto explicativo removido, código HTML extraído');
        } else {
          // Se não tem HTML, procurar por markdown blocks restantes
          const codeBlockMatch = clean.match(/```[\s\S]*?```/);
          if (codeBlockMatch) {
            clean = codeBlockMatch[0].replace(/```\w*\s*/g, '').replace(/```/g, '').trim();
            console.log('🔧 [Claude-Modify] Código extraído de bloco markdown');
          }
        }
      }
      
      // ✅ REMOVER TEXTO ANTES DO PRIMEIRO <html ou <!DOCTYPE (verificação adicional)
      if (clean.includes('<!DOCTYPE')) {
        const doctypeIndex = clean.indexOf('<!DOCTYPE');
        if (doctypeIndex > 0) {
          clean = clean.substring(doctypeIndex);
        }
      } else if (clean.includes('<html')) {
        const htmlIndex = clean.indexOf('<html');
        if (htmlIndex > 0) {
          clean = clean.substring(htmlIndex);
        }
      }
      
      // ✅ REMOVER TEXTO EXPLICATIVO NO FINAL (após último </html> ou </body>)
      if (clean.includes('</html>')) {
        const htmlEndIndex = clean.lastIndexOf('</html>') + 7;
        clean = clean.substring(0, htmlEndIndex);
      } else if (clean.includes('</body>')) {
        const bodyEndIndex = clean.lastIndexOf('</body>') + 7;
        clean = clean.substring(0, bodyEndIndex);
      }
      
      // ✅ REMOVER TEXTOS EXPLICATIVOS SOLTOS NO MEIO DO CÓDIGO
      // CUIDADO: Não remover texto que faz parte do HTML válido!
      // Apenas remover linhas que são APENAS texto explicativo (sem tags HTML)
      const lines = clean.split('\n');
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        
        // SEMPRE manter linhas vazias
        if (!trimmed) return true;
        
        // SEMPRE manter linhas que começam com tags HTML
        if (trimmed.startsWith('<') || trimmed.startsWith('</')) return true;
        
        // SEMPRE manter linhas que contém tags HTML (ex: texto entre tags)
        if (trimmed.includes('<') && trimmed.includes('>')) return true;
        
        // SEMPRE manter linhas que são atributos HTML (contém = e aspas ou valores)
        if (trimmed.includes('="') || trimmed.includes("='") || 
            (trimmed.includes('=') && (trimmed.includes('{') || trimmed.includes('data:')))) return true;
        
        // SEMPRE manter linhas que parecem ser conteúdo textual HTML
        // (texto curto entre tags, não é explicativo se for muito curto)
        if (trimmed.length < 50 && !trimmed.match(/^\d+\./)) return true;
        
        // REMOVER apenas se for texto explicativo LONGO e começar com padrão conhecido
        const isOnlyExplanatory = explanatoryPatterns.some(pattern => {
          const lowerTrimmed = trimmed.toLowerCase();
          const lowerPattern = pattern.toLowerCase();
          // Só remover se a linha COMEÇA com o padrão e é longa (> 20 chars)
          return lowerTrimmed.startsWith(lowerPattern) && trimmed.length > 20;
        });
        
        return !isOnlyExplanatory;
      });
      clean = filteredLines.join('\n');
      
      // ✅ REMOVER QUALQUER TEXTO RESTANTE QUE NÃO SEJA HTML
      // Garantir que começa com tag HTML válida
      const firstTagMatch = clean.match(/^[^<]*(<[a-z])/i);
      if (firstTagMatch && firstTagMatch.index !== undefined && firstTagMatch.index > 0) {
        clean = clean.substring(firstTagMatch.index);
      }
      
      // ✅ REMOVER TEXTOS EXPLICATIVOS ESPECÍFICOS QUE PODEM APARECER NO MEIO DO CÓDIGO
      // Remover frases como "Pelo novo logo em base64:" antes de tags <img>
      clean = clean.replace(/Pelo novo logo em base64:\s*/gi, '');
      clean = clean.replace(/Converti a imagem para base64\s*/gi, '');
      clean = clean.replace(/Substitui o SVG atual\s*/gi, '');
      clean = clean.replace(/Mantive o estilo\s*/gi, '');
      clean = clean.replace(/No cabeçalho[^<]*/gi, '');
      clean = clean.replace(/Seguem as instruções[^<]*/gi, '');
      clean = clean.replace(/instruções de implementação[^<]*/gi, '');
      
      // ✅ REMOVER COMENTÁRIOS HTML EXPLICATIVOS
      clean = clean.replace(/<!--\s*Código omitido[^>]*-->/gi, '');
      clean = clean.replace(/<!--\s*para manter o foco[^>]*-->/gi, '');
      clean = clean.replace(/<!--\s*Todas as cores foram[^>]*-->/gi, '');
      clean = clean.replace(/<!--\s*Modificações globais[^>]*-->/gi, '');
      
      // ✅ VALIDAR E CORRIGIR ESTRUTURA HTML
      // Se não começa com <!DOCTYPE ou <html, verificar se é fragmento válido
      if (!clean.includes('<!DOCTYPE') && !clean.includes('<html')) {
        // Verificar se é um fragmento HTML válido (aceitável para modificações)
        const hasValidFragment = clean.includes('<div') || clean.includes('<section') || 
                                  clean.includes('<header') || clean.includes('<svg') ||
                                  clean.includes('<img') || clean.includes('<body');
        if (!hasValidFragment) {
          console.error('❌ [Claude-Modify] Código não contém estrutura HTML válida!');
          console.error('❌ [Claude-Modify] Primeiros 500 chars:', clean.substring(0, 500));
          throw new Error('A resposta da IA não contém código HTML válido. Por favor, reformule sua solicitação.');
        }
      }
      
      // ✅ VALIDAR QUE O CÓDIGO ESTÁ COMPLETO (não truncado)
      // Se contém base64 de imagem, garantir que está completo
      if (clean.includes('data:image') && !clean.includes('base64,')) {
        console.warn('⚠️ [Claude-Modify] Detectado data:image mas base64 parece incompleto');
      }
      
      // Se tem <img com src base64, garantir que está fechado corretamente
      const imgWithBase64 = clean.match(/<img[^>]*src\s*=\s*["']data:image[^"']*["']/gi);
      if (imgWithBase64) {
        imgWithBase64.forEach(imgTag => {
          if (!imgTag.includes('>') && !imgTag.includes('/>')) {
            console.warn('⚠️ [Claude-Modify] Tag <img> com base64 parece estar incompleta');
          }
        });
      }
      
      console.log('✅ [Claude] Código modificado após limpeza! Tamanho:', clean.length);
      console.log('📄 [Claude] Primeiros 200 chars após limpeza:', clean.substring(0, 200));
      
      // ✅ VALIDAR SE AINDA TEM CÓDIGO HTML VÁLIDO E COMPLETO
      // Verificar se o código está muito pequeno comparado ao original (pode ter sido truncado)
      // Nota: originalLength já foi definido acima
      const minExpectedLength = Math.max(1000, originalLength * 0.7); // Pelo menos 70% do original ou 1000 chars
      const isTooShort = clean.length < minExpectedLength;
      
      // Verificar se tem estrutura completa (head, body, fechamento)
      const hasCompleteStructure = clean.includes('</head>') && clean.includes('</body>') && clean.includes('</html>');
      const endsProperly = clean.trim().endsWith('</html>') || clean.trim().endsWith('</body>');
      const hasMainContent = clean.includes('<main') || clean.includes('<section') || clean.includes('<div class="container') || clean.includes('</header>') && clean.length > 5000;
      
      // ✅ DETECTAR TRUNCAMENTO: verificar se stopReason foi max_tokens OU se código está muito menor
      const isTruncated = stopReason === 'max_tokens' || 
                         (isTooShort && originalLength > 10000) ||
                         (clean.length < originalLength * 0.3 && originalLength > 5000);
      
      console.log('📊 [Claude-Modify] Validação de código:');
      console.log('📊 [Claude-Modify] - Tamanho original:', originalLength);
      console.log('📊 [Claude-Modify] - Tamanho retornado:', clean.length);
      console.log('📊 [Claude-Modify] - Tamanho mínimo esperado:', minExpectedLength);
      console.log('📊 [Claude-Modify] - Stop reason:', stopReason);
      console.log('📊 [Claude-Modify] - Detectado truncamento?', isTruncated);
      console.log('📊 [Claude-Modify] - Estrutura completa?', hasCompleteStructure);
      console.log('📊 [Claude-Modify] - Termina corretamente?', endsProperly);
      console.log('📊 [Claude-Modify] - Tem conteúdo principal?', hasMainContent);
      
      // ✅ SE DETECTOU TRUNCAMENTO E ESTÁ USANDO HAIKU, FAZER RETRY COM SONNET
      if (isTruncated && useModel === 'haiku' && attempt < maxRetries && originalLength > 10000) {
        console.warn('⚠️ [Claude-Modify] Código truncado detectado! Fazendo retry com Sonnet (limite maior)...');
        // Lançar erro especial para forçar retry com Sonnet na próxima tentativa
        throw new Error('TRUNCATED_BY_TOKENS_LIMIT');
      }
      
      // ✅ Se detectou truncamento mas já está usando Sonnet, é um problema maior
      if (isTruncated && useModel === 'sonnet') {
        console.error('❌ [Claude-Modify] Código truncado mesmo usando Sonnet! Código pode ser muito grande.');
        throw new Error(`❌ Código muito grande (${originalLength} chars). Mesmo com Sonnet (32768 tokens), não foi possível retornar código completo. Considere modificar apenas partes específicas do site.`);
      }
      
      if (!clean.includes('<') || clean.length < 100 || (isTooShort && !isTruncated)) {
        console.error('❌ [Claude-Modify] Código limpo está inválido ou muito curto!');
        console.error('❌ [Claude-Modify] Tamanho:', clean.length);
        console.error('❌ [Claude-Modify] Tamanho original:', originalLength);
        console.error('❌ [Claude-Modify] Contém tags HTML:', clean.includes('<'));
        console.error('❌ [Claude-Modify] Muito curto?', isTooShort);
        
        if (isTooShort && originalLength > 10000 && !isTruncated) {
          throw new Error(`❌ Código retornado está muito curto (${clean.length} chars vs ${originalLength} chars original - mínimo esperado: ${minExpectedLength} chars). A IA deve retornar o código HTML COMPLETO do início ao fim, não apenas uma parte.`);
        }
        
        throw new Error('A resposta da IA não contém código HTML válido. Por favor, reformule sua solicitação.');
      }
      
      // ✅ Verificação adicional: se o código está muito menor que o original, AVISAR mas não bloquear se tiver estrutura
      if (clean.length < originalLength * 0.5 && originalLength > 5000 && !isTruncated) {
        if (!hasCompleteStructure || !endsProperly) {
          throw new Error(`❌ Código retornado está incompleto (${clean.length} chars, ${Math.round(clean.length/originalLength*100)}% do original de ${originalLength} chars). Falta estrutura completa ou não termina corretamente. O código deve incluir <head>, <body> e terminar com </body></html>.`);
        }
        console.warn(`⚠️ [Claude-Modify] ATENÇÃO: Código retornado tem apenas ${clean.length} chars (${Math.round(clean.length/originalLength*100)}% do original de ${originalLength} chars). Pode estar incompleto!`);
      }
      
      // ✅ VALIDAR QUE NÃO TEM TEXTOS EXPLICATIVOS RESTANTES (verificação final)
      const stillHasExplanatory = explanatoryPatterns.some(pattern => {
        // Buscar padrão como palavra completa (não parte de outra palavra)
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        return regex.test(clean);
      });
      
      if (stillHasExplanatory) {
        console.warn('⚠️ [Claude-Modify] Ainda detectado texto explicativo no código após limpeza');
        console.warn('⚠️ [Claude-Modify] Tentando remover novamente...');
        // Remover linhas que começam com texto explicativo
        const finalLines = clean.split('\n');
        clean = finalLines.filter(line => {
          const trimmed = line.trim();
          // Manter linhas vazias, linhas com tags HTML, ou linhas com atributos
          if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('</') || trimmed.includes('=')) {
            return true;
          }
          // Remover se é apenas texto explicativo
          return !explanatoryPatterns.some(p => {
            const lowerTrimmed = trimmed.toLowerCase();
            const lowerPattern = p.toLowerCase();
            return lowerTrimmed.includes(lowerPattern) && trimmed.length < 150;
          });
        }).join('\n');
      }
      
      // Calcular custo REAL do output (com modelo usado)
      const actualOutputTokens = estimateTokens(clean);
      const actualCost = calculateCost(estimatedInputTokens, actualOutputTokens, useModel);
      
      console.log(`💰 [Claude-Modify] Custo REAL (${useModel === 'haiku' ? 'Haiku' : 'Sonnet'}): $${actualCost.toFixed(4)}`);
      console.log(`   📤 Output real: ~${actualOutputTokens} tokens ($${(actualOutputTokens / 1_000_000 * PRICING[useModel].output).toFixed(4)})`);
      
      return clean;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      
      console.error(`❌ [Claude] Tentativa ${attempt}/${maxRetries} falhou:`, errorMessage);
      
      // ✅ Se for erro de truncamento, continuar para próxima tentativa (vai usar Sonnet)
      if (errorMessage === 'TRUNCATED_BY_TOKENS_LIMIT') {
        if (attempt < maxRetries) {
          console.log(`⏳ [Claude] Código truncado detectado, tentando novamente com Sonnet na próxima tentativa...`);
          continue; // Continuar para próxima tentativa (que usará Sonnet)
        } else {
          throw new Error('Código truncado após todas as tentativas. O código pode ser muito grande.');
        }
      }
      
      // Se for erro de overload ou timeout, tentar novamente
      if (errorMessage.includes('Overloaded') || errorMessage.includes('timeout') || error.status === 500) {
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 500; // ✅ Otimizado: 500ms, 1s (vs 2s, 4s antes)
          console.log(`⏳ [Claude] Aguardando ${waitTime}ms antes de retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // Para outros erros, lançar imediatamente
      throw error;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw lastError || new Error('Falha ao modificar site após múltiplas tentativas');
}

/**
 * Modificação incremental - retorna apenas a parte modificada (muito mais econômica!)
 */
async function modifySiteIncremental(
  currentCode: string,
  modification: string,
  context?: {
    companyName?: string;
    businessSector?: string;
    designStyle?: string;
  },
  imageData?: { imageUrl?: string; fileName?: string } | null,
  conversationContext?: string
): Promise<string> {
  console.log('💰 [Claude-Incremental] Modificação incremental - retornando apenas parte modificada');
  
  // Construir contexto mínimo (não precisa do código completo!)
  let contextInfo = '';
  if (conversationContext) {
    contextInfo += `\n📚 CONTEXTO DO PROJETO:\n${conversationContext}\n`;
  }
  if (context) {
    contextInfo += `\n- Empresa: ${context.companyName || 'N/A'}\n- Setor: ${context.businessSector || 'N/A'}\n- Estilo: ${context.designStyle || 'N/A'}`;
  }
  
  // ✅ APENAS estrutura do código (não o código completo!)
  // Extrair apenas estrutura relevante (header, footer, cores principais)
  const structureHint = extractStructureHint(currentCode);
  
  // Prompt muito mais curto - pedindo apenas a parte modificada
  const incrementalPrompt = `Você é um desenvolvedor web sênior da WZ Solution.

${contextInfo}

📄 ESTRUTURA DO SITE ATUAL (apenas referência):
${structureHint}

🎯 SOLICITAÇÃO DE MODIFICAÇÃO:
${modification}

✅ REQUISITOS:
✓ Retorne APENAS o código HTML da parte modificada/adicionada
✓ NÃO retorne o código completo do site
✓ Use HTML5 puro + Tailwind CSS (via CDN)
✓ Use \`class=""\` no lugar de \`className=""\`
✓ Use ícones SVG inline
✓ Mantenha consistência visual com o site existente

⚠️ CRÍTICO: Retorne APENAS o código da nova parte (ex: apenas o botão WhatsApp, apenas o formulário, apenas a nova seção).
NÃO retorne <!DOCTYPE>, <html>, <head>, ou estrutura completa - apenas o fragmento HTML a ser inserido.

Exemplos:
- Para WhatsApp: apenas o botão flutuante (<a> com classes Tailwind)
- Para formulário: apenas a seção do formulário (<section> ou <form>)
- Para nova seção: apenas a seção (<section> com conteúdo)

🔒 SEGURANÇA: NÃO use <script>, onclick, eval(), fetch(), etc.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // ✅ Sempre Haiku para incrementais (muito menor)
      max_tokens: 4096, // ✅ Muito menor - só precisa da parte modificada
      temperature: 0.7,
      stream: true,
      messages: [
        {
          role: "user",
          content: incrementalPrompt
        }
      ]
    });
    
    // Processar streaming
    let incrementalCode = '';
    for await (const chunk of response) {
      if (chunk.type === 'content_block_delta') {
        const delta = (chunk as any).delta;
        if (delta && delta.text) {
          incrementalCode += delta.text;
        }
      }
    }
    
    // Limpar markdown
    incrementalCode = incrementalCode
      .replace(/```html\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    
    // Remover texto explicativo antes do código
    const codeStart = incrementalCode.match(/(<[a-z])/i);
    if (codeStart && codeStart.index) {
      incrementalCode = incrementalCode.substring(codeStart.index);
    }
    
    console.log(`✅ [Claude-Incremental] Código incremental recebido: ${incrementalCode.length} chars`);
    
    // Mesclar com código original
    const mergedCode = mergeIncrementalCode(currentCode, incrementalCode, modification);
    
    console.log(`✅ [Claude-Incremental] Código mesclado: ${mergedCode.length} chars (original: ${currentCode.length} chars)`);
    
    return mergedCode;
  } catch (error) {
    console.error('❌ [Claude-Incremental] Erro:', error);
    // Fallback: usar estratégia completa se incremental falhar
    console.log('⚠️ [Claude-Incremental] Fallback para estratégia completa...');
    throw error; // Será capturado e tentará estratégia completa
  }
}

/**
 * Extrai apenas estrutura relevante do código (para contexto sem enviar tudo)
 */
function extractStructureHint(code: string): string {
  const hints: string[] = [];
  
  // Extrair título
  const titleMatch = code.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) hints.push(`Título: ${titleMatch[1]}`);
  
  // Extrair algumas classes principais (cores, estilos)
  const classMatches = code.match(/class="([^"]*bg-[^"]*|text-[^"]*|from-[^"]*|to-[^"]*)[^"]*"/gi);
  if (classMatches) {
    const uniqueClasses = [...new Set(classMatches.slice(0, 10))];
    hints.push(`Classes principais: ${uniqueClasses.join(', ')}`);
  }
  
  // Verificar estrutura (tem header, footer, etc)
  if (code.includes('<header')) hints.push('Tem header');
  if (code.includes('<footer')) hints.push('Tem footer');
  if (code.includes('<main')) hints.push('Tem main');
  if (code.includes('tailwind')) hints.push('Usa Tailwind CSS');
  
  return hints.length > 0 ? hints.join('\n') : 'Estrutura HTML padrão com Tailwind CSS';
}

