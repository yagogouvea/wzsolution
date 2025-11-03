/**
 * Conversor JSX → HTML
 * 
 * Converte código JSX/React para HTML válido que pode ser renderizado
 * em iframe ou HTML estático.
 * 
 * @version 2.0 - Sanitização aprimorada
 */

interface ConversionOptions {
  /** Remover expressões JavaScript complexas (por segurança) */
  removeComplexExpressions?: boolean;
  /** Converter className para class */
  convertClassName?: boolean;
  /** Preservar estilo inline */
  preserveInlineStyles?: boolean;
  /** Adicionar Tailwind CDN */
  addTailwind?: boolean;
}

/**
 * Extrai o conteúdo JSX de um componente React
 * Melhorado para encontrar o JSX mesmo com formatação complexa
 */
export function extractJSXFromComponent(componentCode: string): string {
  console.log('🔍 [extractJSX] Extraindo JSX de componente...');
  
  // Remover imports primeiro
  let code = componentCode.replace(/^import\s+.*?$/gm, '');
  
  // Tentar encontrar o bloco return com parênteses balanceados
  // Padrão: export default function Component() { ... return ( ... ) }
  const functionPattern = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}/;
  const functionMatch = code.match(functionPattern);
  
  if (functionMatch && functionMatch[1]) {
    console.log('✅ [extractJSX] Função encontrada');
    let body = functionMatch[1];
    
    // Procurar pelo ÚLTIMO "return (" no corpo da função (não em useEffect, etc)
    // Encontrar todos os 'return' e usar o último que não seja de useEffect
    const returnMatches = [];
    let searchIndex = 0;
    while ((searchIndex = body.indexOf('return', searchIndex)) !== -1) {
      returnMatches.push(searchIndex);
      searchIndex += 6;
    }
    
    if (returnMatches.length > 0) {
      // Pegar o ÚLTIMO return (o que retorna o JSX)
      const lastReturnIndex = returnMatches[returnMatches.length - 1];
      console.log(`✅ [extractJSX] Último return encontrado na posição ${lastReturnIndex} (total de ${returnMatches.length} returns)`);
      
      // Pegar tudo depois do último "return"
      let afterReturn = body.substring(lastReturnIndex + 6); // +6 para "return"
      
      // Se começa com parêntese, encontrar o parêntese de fechamento balanceado
      if (afterReturn.trim().startsWith('(')) {
        console.log('✅ [extractJSX] Return com parênteses');
        
        // Pular whitespace e o primeiro (
        afterReturn = afterReturn.trim();
        console.log(`📄 [extractJSX] Primeiros 100 chars após return: ${afterReturn.substring(0, 100)}`);
        
        afterReturn = afterReturn.substring(1); // Remover o (
        
        // Encontrar o parêntese de fechamento balanceado
        let depth = 0;
        let jsx = '';
        
        console.log(`🔍 [extractJSX] Processando ${afterReturn.length} chars após (`);
        console.log(`📄 [extractJSX] Primeiros 50 chars: ${afterReturn.substring(0, 50)}`);
        
        for (let i = 0; i < afterReturn.length; i++) {
          const char = afterReturn[i];
          if (char === '(') {
            depth++;
          } else if (char === ')') {
            if (depth === 0) {
              // Fechamento do parêntese principal
              console.log(`✅ [extractJSX] Fechamento encontrado na posição ${i}, depth=${depth}`);
              break;
            }
            depth--;
          }
          jsx += char;
        }
        
        console.log(`📊 [extractJSX] Depth final: ${depth}, JSX length: ${jsx.length}`);
        
        if (jsx.trim().length > 0) {
          console.log(`✅ [extractJSX] JSX extraído: ${jsx.length} chars`);
          console.log(`📄 [extractJSX] Primeiros 200 chars: ${jsx.substring(0, 200)}`);
          return jsx.trim();
        } else {
          console.log(`⚠️ [extractJSX] JSX vazio após extração`);
        }
      } else {
        // Return sem parênteses - pegar até o final ou próximo }
        const simpleMatch = afterReturn.match(/^[\s\S]*?(?=\s*;?\s*$)/);
        if (simpleMatch && simpleMatch[0]) {
          console.log(`✅ [extractJSX] JSX extraído (simple return): ${simpleMatch[0].length} chars`);
          return simpleMatch[0].trim();
        }
      }
    }
  }
  
  // Padrões alternativos mais simples
  const patterns = [
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/,
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?return\s+([\s\S]*?);?\s*\}/,
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/,
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\(\s*([\s\S]*?)\s*\)/,
    /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}/,
  ];
  
  console.log(`🔍 [extractJSX] Tentando padrões alternativos...`);
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = code.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > 10) { // Pelo menos 10 caracteres (não vazio)
        console.log(`✅ [extractJSX] Padrão ${i + 1} funcionou: ${extracted.length} chars`);
        return extracted;
      }
    }
  }
  console.log(`⚠️ [extractJSX] Nenhum padrão funcionou`);
  
  // Último recurso: se o código já parece ser JSX (contém tags HTML), remover import/export
  if (code.includes('<div') || code.includes('<header') || code.includes('<section')) {
    // Remover exports, imports e const/function definitions
    return code
      .replace(/^export\s+.*?$/gm, '')
      .replace(/^const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/m, '')
      .replace(/^function\s+\w+\s*\([^)]*\)\s*\{/m, '')
      .trim();
  }
  
  // Se não encontrou padrão, retornar código original
  return componentCode;
}

/**
 * Remove comentários JSX/JS
 */
function removeComments(code: string): string {
  // Remove comentários de linha //
  code = code.replace(/\/\/.*$/gm, '');
  
  // Remove comentários de bloco /* */
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove comentários JSX {/* */}
  code = code.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  
  return code;
}

/**
 * Processa atributos JSX
 */
function processAttributes(jsx: string): string {
  // Converter className para class (múltiplos padrões)
  // ✅ PRESERVAR URLs ANTES de processar className (para evitar quebra)
  const urlPlaceholders: string[] = [];
  const urlRegex = /https?:\/\/[^\s"'>{}]+/g;
  
  jsx = jsx.replace(urlRegex, (url) => {
    const placeholder = `__URL_${urlPlaceholders.length}__`;
    urlPlaceholders.push(url);
    return placeholder;
  });
  
  jsx = jsx.replace(/className\s*=\s*["']([^"']+)["']/g, 'class="$1"');
  jsx = jsx.replace(/className\s*=\s*\{`([^`]+)`\}/g, 'class="$1"');
  jsx = jsx.replace(/className\s*=\s*\{["']([^"']+)["']\}/g, 'class="$1"');
  jsx = jsx.replace(/className\s*=\s*\{([^}]+)\}/g, 'class="$1"');
  
  // ✅ RESTAURAR URLs após processar className
  urlPlaceholders.forEach((url, index) => {
    jsx = jsx.replace(`__URL_${index}__`, url);
  });
  
  // Processar outras propriedades JSX comuns
  jsx = jsx.replace(/htmlFor\s*=/g, 'for=');
  
  // Converter onClick e outros eventos para atributos HTML válidos (opcional)
  // Por segurança, podemos removê-los ou converter para data-attributes
  jsx = jsx.replace(/\s+on[A-Z]\w+\s*=\s*\{[^}]+\}/g, ''); // Remover event handlers por segurança
  
  // ✅ Processar style={{}} para style=""
  jsx = jsx.replace(/style\s*=\s*\{\{([^}]+)\}\}/g, (match, styleContent) => {
    // Converter style={{border:0}} para style="border:0;"
    // Preservar URLs se houver
    const css = styleContent
      .replace(/(\w+):\s*([^,}]+)/g, '$1: $2;')
      .replace(/'/g, '"')
      .trim();
    return `style="${css}"`;
  });
  
  // ✅ Corrigir atributos de imagem - processar ANTES de outras conversões
  // Processar loading={...} para loading="lazy"
  jsx = jsx.replace(/loading\s*=\s*\{[^}]+\}/gi, 'loading="lazy"');
  
  // ✅ Corrigir URLs de imagem malformadas (preservar URLs longas do Supabase)
  jsx = jsx.replace(/src\s*=\s*["']([^"']*%20[^"']*)["']/gi, (match, url) => {
    if (url.includes('supabase.co')) {
      // URLs do Supabase - não decodificar %20 se for parte da URL válida
      return match;
    }
    try {
      const decoded = decodeURIComponent(url);
      return `src="${decoded}"`;
    } catch {
      return match; // Manter original se falhar
    }
  });
  
  // ✅ Adicionar alt vazio se não tiver (mas não quebrar tags existentes)
  jsx = jsx.replace(/<img([^>]*?)>/gi, (match) => {
    if (!/alt\s*=/i.test(match)) {
      // Adicionar alt antes do fechamento >
      return match.replace(/>/, ' alt="">');
    }
    return match;
  });
  
  // Converter camelCase para kebab-case em alguns atributos conhecidos
  jsx = jsx.replace(/data[A-Z]\w+/g, (match) => {
    return match.replace(/([A-Z])/g, '-$1').toLowerCase();
  });
  
  return jsx;
}

/**
 * Processa template literals e expressões JavaScript
 */
function processExpressions(jsx: string, removeComplex = false): string {
  // ✅ PRESERVAR URLs longas de imagens do Supabase ANTES de processar expressões
  // Substituir temporariamente URLs longas por placeholders
  const urlPlaceholders: string[] = [];
  const urlPattern = /https?:\/\/[^\s"'>{}]+/g;
  
  jsx = jsx.replace(urlPattern, (url) => {
    const placeholder = `__URL_PLACEHOLDER_${urlPlaceholders.length}__`;
    urlPlaceholders.push(url);
    return placeholder;
  });
  
  if (removeComplex) {
    // Processar template literals primeiro (antes de remover {})
    jsx = jsx.replace(/\{`([^`]+)`\}/g, '$1');
    jsx = jsx.replace(/\$\{([^}]+)\}/g, '');
    
    // Remover expressões JavaScript complexas por segurança
    // Mas preservar strings simples
    jsx = jsx.replace(/\{"([^"]+)"\}/g, '$1');
    jsx = jsx.replace(/\{'([^']+)'\}/g, '$1');
    
    // Remover outras expressões {}, mas manter style={{}}
    // Primeiro processar style={{}} para style=""
    jsx = jsx.replace(/style\s*=\s*\{\{([^}]+)\}\}/g, (match, styleContent) => {
      // Converter style={{border:0}} para style="border:0;"
      const css = styleContent.replace(/(\w+):\s*([^,}]+)/g, '$1: $2;').replace(/'/g, '"');
      return `style="${css}"`;
    });
    
    // Remover outras expressões {}
    jsx = jsx.replace(/\{[^}"']+\}/g, '');
  } else {
    // Tentar processar expressões simples
    // Template literals básicos
    jsx = jsx.replace(/\{`([^`]+)`\}/g, '$1');
    
    // Strings simples dentro de {}
    jsx = jsx.replace(/\{"([^"]+)"\}/g, '$1');
    jsx = jsx.replace(/\{'([^']+)'\}/g, '$1');
    
    // Processar style={{}} para style=""
    jsx = jsx.replace(/style\s*=\s*\{\{([^}]+)\}\}/g, (match, styleContent) => {
      // Converter style={{border:0}} para style="border:0;"
      const css = styleContent.replace(/(\w+):\s*([^,}]+)/g, '$1: $2;').replace(/'/g, '"');
      return `style="${css}"`;
    });
    
    // Template literals com interpolação (remover interpolação por segurança)
    jsx = jsx.replace(/\{`([^`]*)\$\{([^}]+)\}([^`]*)`\}/g, '$1$3');
    
    // Para expressões mais complexas, remover por segurança
    jsx = jsx.replace(/\{[^}`'"]+\}/g, '');
  }
  
  // ✅ Restaurar URLs originais
  urlPlaceholders.forEach((url, index) => {
    jsx = jsx.replace(`__URL_PLACEHOLDER_${index}__`, url);
  });
  
  return jsx;
}

/**
 * Processa tags auto-fechadas e normaliza
 */
function processSelfClosingTags(jsx: string): string {
  // Tags conhecidas que devem ser auto-fechadas
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  
  selfClosingTags.forEach(tag => {
    // Converter <tag ...></tag> para <tag ... />
    const regex = new RegExp(`<${tag}([^>]*)>\\s*</${tag}>`, 'gi');
    jsx = jsx.replace(regex, `<${tag}$1 />`);
    
    // Garantir que tags auto-fechadas tenham barra
    // Regex sem lookbehind (mais compatível)
    jsx = jsx.replace(new RegExp(`<${tag}([^/>]*)>`, 'gi'), (match, attrs) => {
      // Se não termina com /, adicionar
      const trimmedAttrs = attrs.trim();
      if (!trimmedAttrs.endsWith('/')) {
        return `<${tag}${trimmedAttrs ? `${attrs} ` : ''}/>`;
      }
      return match;
    });
  });
  
  return jsx;
}

/**
 * Limpa e normaliza o HTML resultante
 */
/**
 * Sanitiza HTML removendo código JavaScript perigoso e APIs sensíveis
 */
function sanitizeHTML(html: string): string {
  const originalLength = html.length;
  console.log('🔒 [sanitizeHTML] Aplicando sanitização de segurança...');
  
  // Remover apenas scripts inline perigosos (manter scripts com src= externos)
  const beforeScriptRemoval = html.length;
  html = html.replace(/<script(?![^>]*src\s*=)[^>]*>[\s\S]*?<\/script>/gi, '');
  if (html.length !== beforeScriptRemoval) {
    console.log(`🔒 [sanitizeHTML] Scripts removidos: ${beforeScriptRemoval - html.length} chars`);
  }
  
  // Remover event handlers inline perigosos (onclick, onerror, onload, etc.)
  html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/\s*on\w+\s*=\s*\{[^}]+\}/gi, '');
  
  // Remover javascript: protocolos em href/src
  html = html.replace(/(href|src|action)\s*=\s*["']javascript:/gi, '$1="#"');
  
  // Remover expressões eval, Function, setTimeout, setInterval
  html = html.replace(/eval\s*\(/gi, '/*REMOVED: eval*/(');
  html = html.replace(/Function\s*\(/gi, '/*REMOVED: Function*/(');
  html = html.replace(/setTimeout\s*\(/gi, '/*REMOVED: setTimeout*/(');
  html = html.replace(/setInterval\s*\(/gi, '/*REMOVED: setInterval*/(');
  
  // Remover chamadas a APIs sensíveis dentro de expressões
  html = html.replace(/fetch\s*\(/gi, '/*REMOVED: fetch*/(');
  html = html.replace(/XMLHttpRequest/gi, '/*REMOVED: XMLHttpRequest*/');
  html = html.replace(/localStorage\./gi, '/*REMOVED: localStorage*/.');
  html = html.replace(/sessionStorage\./gi, '/*REMOVED: sessionStorage*/.');
  
  // Remover console.log e console.error (para evitar vazamento de info)
  html = html.replace(/console\.[a-z]+\s*\(/gi, '/*REMOVED: console*/(');
  
  // Remover acesso a window/document perigoso
  html = html.replace(/window\.(location|cookie|localStorage|sessionStorage)/gi, '/*REMOVED: window access*/');
  html = html.replace(/document\.(cookie|domain|write)/gi, '/*REMOVED: document access*/');
  
  // Remover meta refresh (auto-redirect)
  html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi, '');
  
  // Remover iframes de domínios não confiáveis
  html = html.replace(/<iframe[^>]*src\s*=\s*["'](?!https:\/\/[a-z0-9.-]+\.(google\.com|youtube\.com|maps\.google\.com))/gi, '<iframe src="#"');
  
  if (html.length !== originalLength) {
    console.log(`🔒 [sanitizeHTML] Código perigoso removido: ${originalLength} → ${html.length} chars`);
  }
  
  return html;
}

function cleanHTML(html: string): string {
  // Primeiro sanitizar para remover código perigoso
  html = sanitizeHTML(html);
  
  // Remover espaços extras
  html = html.replace(/\s+/g, ' ');
  
  // Remover espaços entre tags
  html = html.replace(/>\s+</g, '><');
  
  // Restaurar espaços importantes (texto entre tags)
  html = html.replace(/>([^<]+)</g, (match, text) => {
    return `>${text.trim()}<`;
  });
  
  // Remover quebras de linha desnecessárias
  html = html.replace(/\n\s*\n/g, '\n');
  
  return html.trim();
}

/**
 * Converte JSX para HTML renderizável
 */
export function convertJSXToHTML(
  jsxCode: string,
  options: ConversionOptions = {}
): string {
  const {
    removeComplexExpressions = true,
    convertClassName = true,
    preserveInlineStyles = true,
    addTailwind = true
  } = options;
  
  let html = jsxCode;
  
  // ✅ Verificar se já é HTML puro (não precisa conversão)
  const isPureHTML = html.includes('<!DOCTYPE') || (html.includes('<html') && !html.includes('className'));
  
  if (isPureHTML) {
    console.log(`📊 [jsx-to-html] HTML puro detectado: ${html.length} chars`);
    
    // NÃO aplicar sanitização para HTML puro - já é seguro e válido
    // O iframe com sandbox já protege contra código malicioso
    // html = sanitizeHTML(html);
    
    console.log(`📊 [jsx-to-html] Retornando HTML puro: ${html.length} chars`);
    
    return html;
  }
  
  console.log('⚙️ [jsx-to-html] Conversão JSX → HTML necessária');
  
  // 1. Remover comentários
  html = removeComments(html);
  
  // 2. Extrair JSX se for um componente React completo
  if (html.includes('export default') || (html.includes('const') && html.includes('=>'))) {
    html = extractJSXFromComponent(html);
  }
  
  // 3. Remover imports e exports se ainda presentes
  html = html.replace(/^import\s+.*?$/gm, '');
  html = html.replace(/^export\s+.*?$/gm, '');
  
  // 4. Processar atributos JSX
  if (convertClassName) {
    html = processAttributes(html);
  }
  
  // 5. Processar expressões JavaScript
  html = processExpressions(html, removeComplexExpressions);
  
  // 6. Processar tags auto-fechadas
  html = processSelfClosingTags(html);
  
  // 6.5. ✅ Processar imagens e corrigir URLs quebradas
  // Processar src com diferentes formatos (aspas simples, duplas, sem aspas)
  html = html.replace(/<img([^>]*?)src\s*=\s*(["']?)([^"'\s>]+)(["']?)([^>]*?)>/gi, (match, before, quote1, src, quote2, after) => {
    // Remover espaços e quebras de linha do src
    src = src.trim().replace(/\s+/g, '');
    
    // Se src está vazio ou inválido
    if (!src || src === '' || src.includes('%20loading=') || src === 'undefined' || src === 'null' || src.length < 10) {
      // Usar placeholder seguro
      src = `https://via.placeholder.com/800x600/f0f0f0/999999?text=Image`;
      console.log('⚠️ [jsx-to-html] URL de imagem inválida, usando placeholder');
    }
    
    // Decodificar URLs malformadas (mas preservar URLs válidas do Supabase)
    if (src.includes('%20') && !src.includes('supabase.co')) {
      try {
        src = decodeURIComponent(src);
      } catch (e) {
        console.warn('⚠️ [jsx-to-html] Erro ao decodificar URL:', e);
      }
    }
    
    // Garantir que URLs do Supabase estejam completas (não cortadas)
    if (src.includes('supabase.co') && !src.endsWith('"') && !src.endsWith("'")) {
      // Se a URL parece estar cortada, tentar encontrar o fim correto
      // Isso é um fallback - idealmente a URL já vem completa
    }
    
    // Remover atributos problemáticos
    const cleanedAfter = after
      .replace(/\s*loading\s*=\s*\{[^}]+\}/gi, ' loading="lazy"')  // loading={...} para loading="lazy"
      .replace(/\s*loading\s*=\s*["'][^"']*["']/gi, ' loading="lazy"') // Normalizar loading
      .replace(/\s*style\s*=\s*\{\{[^}]+\}\}/gi, '') // Remover style={{}} problemático
      .replace(/\s*allowFullScreen/gi, ' allowFullScreen') // Preservar allowFullScreen
    
    // Adicionar alt se não tiver
    const hasAlt = /alt\s*=/i.test(before + after);
    const altAttr = hasAlt ? '' : ' alt=""';
    
    return `<img${before}src="${src}"${altAttr}${cleanedAfter}>`;
  });
  
  // ✅ Processar também src com template literals ou expressões JSX
  html = html.replace(/<img([^>]*?)src\s*=\s*\{`([^`]+)`\}([^>]*?)>/gi, (match, before, src, after) => {
    const cleanedSrc = src.trim();
    const hasAlt = /alt\s*=/i.test(before + after);
    const altAttr = hasAlt ? '' : ' alt=""';
    return `<img${before}src="${cleanedSrc}"${altAttr}${after}>`;
  });
  
  html = html.replace(/<img([^>]*?)src\s*=\s*\{["']([^"']+)["']\}([^>]*?)>/gi, (match, before, src, after) => {
    const cleanedSrc = src.trim();
    const hasAlt = /alt\s*=/i.test(before + after);
    const altAttr = hasAlt ? '' : ' alt=""';
    return `<img${before}src="${cleanedSrc}"${altAttr}${after}>`;
  });
  
  // 6.5.5. ✅ Processar componentes Shadcn/ui e converter para HTML estático
  try {
    const { replaceShadcnComponents } = require('./shadcn-component-replacer');
    html = replaceShadcnComponents(html);
  } catch (error) {
    console.warn('⚠️ Erro ao substituir componentes Shadcn:', error);
  }
  
  // 6.6. ✅ Processar react-icons e converter para SVGs inline
  // Como react-icons não funcionam em HTML estático, substituímos por SVGs
  try {
    const { replaceReactIconsWithSVG } = require('./icon-replacer');
    html = replaceReactIconsWithSVG(html);
    console.log('✅ [jsx-to-html] React-icons substituídos por SVGs');
  } catch (error) {
    console.warn('⚠️ Erro ao substituir react-icons, removendo componentes:', error);
    // Fallback: remover componentes react-icons se a substituição falhar
    html = html.replace(/<Fa[A-Z]\w+\s*[^>]*?\/?>/gi, '');
    html = html.replace(/<Hi[A-Z]\w+\s*[^>]*?\/?>/gi, '');
    html = html.replace(/<Md[A-Z]\w+\s*[^>]*?\/?>/gi, '');
    html = html.replace(/<Fi[A-Z]\w+\s*[^>]*?\/?>/gi, '');
    html = html.replace(/<Lucide[A-Z]\w+\s*[^>]*?\/?>/gi, '');
  }
  
  // ✅ Processar iframes (mapas) - garantir que funcionem
  html = html.replace(/<iframe([^>]*?)>/gi, (match) => {
    // Garantir que iframe tenha atributos necessários
    if (!/allowFullScreen/i.test(match)) {
      match = match.replace(/>/, ' allowFullScreen>');
    }
    if (!/loading/i.test(match)) {
      match = match.replace(/>/, ' loading="lazy">');
    }
    return match;
  });
  
  // 7. Limpar código resultante
  html = cleanHTML(html);
  
  // 8. Criar HTML completo se necessário
  if (html && !html.includes('<!DOCTYPE')) {
    const tailwindScript = addTailwind 
      ? '<script src="https://cdn.tailwindcss.com"></script>' 
      : '';
    
    const styles = preserveInlineStyles 
      ? `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    </style>` 
      : '';
    
    // ✅ Adicionar estilos para corrigir problemas comuns + Shadcn CSS Variables
    const fixStyles = `
    <style>
      /* CSS Variables do Shadcn/ui */
      :root {
        --background: 0 0% 100%;
        --foreground: 0 0% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 0 0% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 3.9%;
        --primary: 0 0% 9%;
        --primary-foreground: 0 0% 98%;
        --secondary: 0 0% 96.1%;
        --secondary-foreground: 0 0% 9%;
        --muted: 0 0% 96.1%;
        --muted-foreground: 0 0% 45.1%;
        --accent: 0 0% 96.1%;
        --accent-foreground: 0 0% 9%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 89.8%;
        --input: 0 0% 89.8%;
        --ring: 0 0% 3.9%;
        --radius: 0.5rem;
      }
      
      /* Reset e correções */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { 
        height: 100%;
        overflow-y: auto;
      }
      body { 
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
        line-height: 1.6;
        color: hsl(var(--foreground));
        background: hsl(var(--background));
        min-height: 100%;
      }
      
      /* Correções para imagens */
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      
      img[src=""], img[src="undefined"], img[src="null"], img:not([src]) {
        display: none;
      }
      
      /* Garantir que imagens do Supabase carreguem */
      img[src*="supabase.co"] {
        object-fit: cover;
      }
      
      /* Corrigir problemas com iframes */
      iframe {
        display: block !important;
        visibility: visible !important;
        border: 0;
      }
      
      /* Garantir que gradientes funcionem */
      .bg-gradient-to-r, .bg-gradient-to-br, .bg-gradient-to-l {
        background-size: 100% 100%;
      }
      
      /* Garantir que componentes Shadcn apareçam corretamente */
      [class*="bg-card"], [class*="bg-background"] {
        background-color: hsl(var(--background));
      }
      
      /* Transições suaves */
      *, *::before, *::after {
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }
    </style>`;
    
    html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${tailwindScript}${fixStyles}
</head>
<body>
  ${html}
</body>
</html>`;
  }
  
  return html;
}

/**
 * Processa código gerado pela IA para melhor compatibilidade
 */
export function processAIGeneratedCode(code: string): string {
  console.log('🔍 [processAIGeneratedCode] Processando código...');
  
  // Remover markdown code blocks se presentes
  code = code.replace(/```html\s*/g, '');
  code = code.replace(/```tsx\s*/g, '');
  code = code.replace(/```jsx\s*/g, '');
  code = code.replace(/```typescript\s*/g, '');
  code = code.replace(/```javascript\s*/g, '');
  code = code.replace(/```\s*/g, '');
  
  // Remover comentários de instrução
  code = code.replace(/\/\*\s*EXEMPLO[\s\S]*?\*\//g, '');
  
  // Normalizar quebras de linha
  code = code.replace(/\r\n/g, '\n');
  code = code.replace(/\r/g, '\n');
  
  console.log(`✅ [processAIGeneratedCode] Código processado: ${code.length} chars`);
  
  return code.trim();
}

