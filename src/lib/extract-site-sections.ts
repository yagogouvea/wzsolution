/**
 * Utilitário para extrair seções do HTML gerado pela IA
 * e converter em estruturas React utilizáveis
 */

export interface SiteSection {
  id: string;
  tag: string;
  className?: string;
  content: string;
  children?: SiteSection[];
}

export function extractSectionsFromHTML(html: string): {
  head: string;
  body: string;
  styles: string;
  scripts: string;
  sections: SiteSection[];
} {
  // Extrair head
  const headMatch = html.match(/<head[^>]*>([\s\S]*)<\/head>/i);
  const head = headMatch ? headMatch[1] : '';

  // Extrair body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;

  // Extrair estilos
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const styles = styleMatches.map(match => {
    const content = match.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return content ? content[1] : '';
  }).join('\n');

  // Extrair scripts
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const scripts = scriptMatches.map(match => {
    const content = match.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    return content ? content[1] : '';
  }).join('\n');

  // Extrair seções principais (header, main sections, footer)
  const sections: SiteSection[] = [];
  
  // Header
  const headerMatch = body.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
  if (headerMatch) {
    sections.push({
      id: 'header',
      tag: 'header',
      content: headerMatch[1],
    });
  }

  // Main sections (section tags)
  const sectionMatches = body.matchAll(/<section[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/gi);
  for (const match of sectionMatches) {
    sections.push({
      id: match[1],
      tag: 'section',
      content: match[2],
    });
  }

  // Footer
  const footerMatch = body.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  if (footerMatch) {
    sections.push({
      id: 'footer',
      tag: 'footer',
      content: footerMatch[1],
    });
  }

  return {
    head,
    body,
    styles,
    scripts,
    sections,
  };
}

/**
 * Converte HTML puro em JSX compatível com React
 */
export function convertHTMLToJSX(html: string): string {
  // Substituir atributos HTML para JSX
  let jsx = html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/tabindex=/g, 'tabIndex=')
    .replace(/readonly/g, 'readOnly')
    .replace(/maxlength=/g, 'maxLength=')
    .replace(/autofocus/g, 'autoFocus')
    .replace(/autocomplete=/g, 'autoComplete=');

  // Envolver conteúdo de texto em chaves se necessário
  // Por enquanto, retornar como está pois vamos usar dangerouslySetInnerHTML

  return jsx;
}






