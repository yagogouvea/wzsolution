/**
 * 🎨 AI Image Injector
 * 
 * Injeta imagens geradas pela IA nos locais corretos do código JSX
 * usando âncoras semânticas ou heurísticas de detecção
 */

import type { GeneratedAsset } from "./ai-image-composer";

/**
 * Injeta imagens no código JSX usando âncoras ou heurísticas
 */
export function injectImagesIntoJsx(code: string, assets: GeneratedAsset[]): string {
  console.log('🎨 [Image Injector] Injecting images into JSX...');
  console.log(`📊 [Image Injector] Assets to inject: ${assets.length}`);
  console.log(`📝 [Image Injector] Code type: ${typeof code}, length: ${code?.length || 0}`);
  
  // Garantir que code é string
  if (typeof code !== 'string') {
    console.error('❌ [Image Injector] Code is not a string!', typeof code);
    return '';
  }
  
  let output = code;

  /**
   * Tenta injetar usando âncora semântica
   */
  const injectByAnchor = (anchor: string, html: string): boolean => {
    const tag = `{/* IMAGE_ANCHOR:${anchor} */}`;
    if (output.includes(tag)) {
      output = output.replace(tag, html);
      console.log(`✅ [Image Injector] Injected ${anchor} by anchor`);
      return true;
    }
    return false;
  };

  /**
   * Injecta HTML antes de um elemento que combine o pattern
   */
  const injectByPattern = (pattern: RegExp, html: string, description: string): boolean => {
    if (!output || typeof output !== 'string') {
      console.error('❌ [Image Injector] output is not a string in injectByPattern');
      return false;
    }
    
    const match = output.match(pattern);
    if (match && match.index !== undefined) {
      // Injetar ANTES do match encontrado
      const before = output.substring(0, match.index);
      const matched = match[0];
      const after = output.substring(match.index + matched.length);
      
      output = before + html + '\n' + matched + after;
      console.log(`✅ [Image Injector] Injected by pattern: ${description}`);
      return true;
    }
    return false;
  };

  // Processar cada asset
  for (const asset of assets) {
    console.log(`🖼️ [Image Injector] Processing ${asset.slot}...`);

    switch (asset.slot) {
      case "hero":
        const heroHtml = `<div className="absolute inset-0 -z-10 bg-cover bg-center opacity-90" style={{ backgroundImage: 'url(${asset.publicUrl})' }} />
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent -z-10" />`;
        
        if (!injectByAnchor("hero", heroHtml)) {
          // Heurística: primeira section com "hero"
          injectByPattern(
            /<section([^>]*className="[^"]*hero[^"]*"[^>]*)>/i,
            heroHtml,
            "hero section"
          );
        }
        break;

      case "about":
        const aboutHtml = `<img 
  src="${asset.publicUrl}" 
  alt="Sobre ${asset.publicUrl.split('/').pop()?.replace('.png', '') || 'nossa empresa'}" 
  className="rounded-xl shadow-elegant mb-8 w-full max-w-3xl mx-auto object-cover aspect-video"
  loading="lazy" 
/>`;
        
        if (!injectByAnchor("about", aboutHtml)) {
          // Heurística: section com id="sobre" ou "about"
          if (!injectByPattern(
            /(<section[^>]*id="(?:sobre|about)"[^>]*>)/i,
            aboutHtml,
            "about section"
          )) {
            // Tentar em qualquer div dentro de seção sobre
            injectByPattern(
              /(<div[^>]*className="[^"]*max-w-(?:7xl|6xl|5xl)[^"]*"[^>]*>)/i,
              aboutHtml,
              "content container"
            );
          }
        }
        break;

      case "services_primary":
      case "services_secondary":
        const servicesHtml = `<img 
  src="${asset.publicUrl}" 
  alt="Serviço ${asset.slot === 'services_primary' ? 'principal' : 'secundário'}" 
  className="w-full h-64 object-cover rounded-lg mb-4 shadow-md hover:scale-105 transition-transform"
  loading="lazy" 
/>`;
        
        if (!injectByAnchor(asset.slot, servicesHtml)) {
          // Heurística: card de serviços
          injectByPattern(
            /(<div[^>]*className="[^"]*service-card[^"]*"[^>]*>)/i,
            servicesHtml,
            "service card"
          ) || injectByPattern(
            /(<div[^>]*className="[^"]*card[^"]*"[^>]*>)/i,
            servicesHtml,
            "generic card"
          );
        }
        break;

      case "gallery_1":
      case "gallery_2":
      case "gallery_3":
        const galleryHtml = `<img 
  src="${asset.publicUrl}" 
  alt="Galeria ${asset.slot.replace('gallery_', '')}" 
  className="w-full aspect-[4/3] object-cover rounded-xl shadow-elegant hover:scale-105 transition-transform cursor-pointer"
  loading="lazy" 
/>`;
        
        if (!injectByAnchor(asset.slot, galleryHtml)) {
          // Heurística: grid de galeria
          injectByPattern(
            /(<div[^>]*className="[^"]*grid[^"]*(?:cols-2|cols-3|cols-4)[^"]*"[^>]*>)/i,
            galleryHtml,
            "gallery grid"
          );
        }
        break;

      default:
        console.warn(`⚠️ [Image Injector] Unknown slot: ${asset.slot}`);
    }
  }

  console.log('✅ [Image Injector] Image injection completed');
  return output;
}

