/**
 * 🎨 Lovable Style Refiner
 * 
 * Aplica automaticamente o estilo premium "Lovable Style" ao código JSX gerado,
 * baseado em plataformas premium como Lovable.dev
 * 
 * Features:
 * - Hierarquia de profundidade (sombras, blur, gradiente)
 * - Tipografia contrastante (Playfair Display + Inter)
 * - Micro animações suaves (Framer Motion)
 * - Overlay cinematográfico no hero
 * - Espaçamento e padding balanceado
 */

import * as prettier from 'prettier';

interface RefineOptions {
  addAnimations?: boolean;
  addOverlays?: boolean;
  enhanceTypography?: boolean;
}

/**
 * Aplica o estilo Lovable ao código JSX
 */
export async function applyLovableStyle(
  code: string,
  options: RefineOptions = {}
): Promise<string> {
  const {
    addAnimations = true,
    addOverlays = true,
    enhanceTypography = true,
  } = options;

  try {
    console.log('🎨 [Lovable Refiner] Aplicando estilo premium...');

    let refined = code;

    // ✅ 1. MELHORAR HERO SECTIONS (overlay cinematográfico)
    if (addOverlays) {
      console.log('🎨 [Lovable Refiner] Aplicando overlays no hero...');
      
      // Detectar hero sections e aplicar overlay
      refined = refined.replace(
        /<section([^>]*class="[^"]*hero[^"]*"[^>]*)>/gi,
        (match, attrs) => {
          // Remover estilos de background existentes para evitar conflito
          const cleanAttrs = attrs.replace(/bg-\[[^\]]*\]/g, '').replace(/bg-\w+/g, '');
          return `<section${cleanAttrs} className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent backdrop-blur-sm z-0"></div>
  <div className="relative z-10">`;
        }
      );

      // Fechar div de overlay ao fechar section
      refined = refined.replace(
        /(<\/section>)/g,
        '</div>$1'
      );
    }

    // ✅ 2. APLICAR TIPOGRAFIA PREMIUM
    if (enhanceTypography) {
      console.log('🎨 [Lovable Refiner] Melhorando tipografia...');
      
      // Headers com serif premium
      refined = refined.replace(
        /(<h1)([^>]*>)/g,
        '$1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight text-white"$2'
      );
      
      refined = refined.replace(
        /(<h2)([^>]*>)/g,
        '$1 className="text-4xl md:text-5xl font-serif font-semibold mb-4 text-gray-900 dark:text-gray-100"$2'
      );
      
      refined = refined.replace(
        /(<h3)([^>]*>)/g,
        '$1 className="text-3xl md:text-4xl font-serif font-semibold mb-4"$2'
      );
      
      // Parágrafos com espaçamento generoso
      refined = refined.replace(
        /(<p)([^>]*>)/g,
        '$1 className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"$2'
      );
    }

    // ✅ 3. MELHORAR BOTÕES COM EFEITOS 3D
    console.log('🎨 [Lovable Refiner] Estilizando botões...');
    refined = refined.replace(
      /<button([^>]*class="[^"]*"[^>]*)>(.*?)<\/button>/g,
      (match, attrs, content) => {
        // Manter classes existentes se houver, mas adicionar estilos premium
        const hasClass = attrs.includes('class=');
        if (hasClass) {
          return `<button${attrs} class="$& hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out active:scale-95">
  ${content}
</button>`;
        }
        return `<button className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out">
  ${content}
</button>`;
      }
    );

    // ✅ 4. ADICIONAR ANIMAÇÕES FRAMER MOTION
    if (addAnimations) {
      console.log('🎨 [Lovable Refiner] Adicionando animações...');
      
      // Adicionar animações suaves em seções
      refined = refined.replace(
        /(<section[^>]*class="[^"]*")([^>]*>)/g,
        (match, attrs1, attrs2) => {
          return `${attrs1} data-animate="fade-in-up"${attrs2}`;
        }
      );
      
      // Adicionar animações em cards
      refined = refined.replace(
        /(<div[^>]*class="[^"]*card[^"]*")([^>]*>)/g,
        (match, attrs1, attrs2) => {
          return `${attrs1} data-animate="scale-in"${attrs2}`;
        }
      );
    }

    // ✅ 5. MELHORAR CONTAINERS E ESPAÇAMENTO
    console.log('🎨 [Lovable Refiner] Ajustando espaçamento...');
    
    // Container principal com background premium
    refined = refined.replace(
      /<main([^>]*>)/,
      '<main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"$1'
    );
    
    // Seções com padding generoso
    refined = refined.replace(
      /(<section[^>]*>)/g,
      (match) => {
        if (!match.includes('className=')) {
          return match.replace('>', ' className="py-20 md:py-32">');
        }
        return match.replace(/className="([^"]*)"/, 'className="$1 py-20 md:py-32"');
      }
    );

    // ✅ 6. ADICIONAR ESTILOS DE PROFUNDIDADE
    console.log('🎨 [Lovable Refiner] Aplicando profundidade visual...');
    
    // Cards com sombras elegantes
    refined = refined.replace(
      /(<div[^>]*class="[^"]*card[^"]*")([^>]*>)/g,
      (match, attrs1, attrs2) => {
        const enhanced = match.includes('shadow-') 
          ? match 
          : `${attrs1} className="shadow-2xl hover:shadow-3xl transition-shadow duration-300"${attrs2}`;
        return enhanced;
      }
    );

    // ✅ 7. ADICIONAR METADATA E IMPORTS NECESSÁRIOS
    console.log('🎨 [Lovable Refiner] Adicionando imports e metadata...');
    
    // Adicionar metadata de fonts se não existir
    if (!refined.includes('Playfair Display') && !refined.includes('Inter')) {
      const fontMeta = `
{/* Lovable Style: Premium Typography */}
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style dangerouslySetInnerHTML={{__html: \`
  body { font-family: 'Inter', sans-serif; }
  h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
\`}} />
`;
      refined = fontMeta + refined;
    }

    // Adicionar import Framer Motion se animações ativas
    if (addAnimations && !refined.includes('framer-motion')) {
      if (refined.startsWith('import')) {
        refined = `import { motion } from 'framer-motion';\n${refined}`;
      } else {
        refined = `import { motion } from 'framer-motion';\n\n${refined}`;
      }
    }

    // ✅ 8. FORMATAR CÓDIGO COM PRETTIER
    console.log('🎨 [Lovable Refiner] Formatando código...');
    try {
      const prettierOptions: prettier.Options = {
        parser: 'typescript',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      };
      
      refined = await prettier.format(refined, prettierOptions);
      console.log('✅ [Lovable Refiner] Código formatado com Prettier');
    } catch (prettierError) {
      console.warn('⚠️ [Lovable Refiner] Erro ao formatar com Prettier (continuando sem formatação)');
    }

    console.log('✅ [Lovable Refiner] Estilo premium aplicado com sucesso!');
    return refined;

  } catch (error) {
    console.error('❌ [Lovable Refiner] Erro ao aplicar estilo Lovable:', error);
    // Retornar código original se houver erro
    return code;
  }
}

/**
 * Refinamento específico para barbearias
 */
export async function applyBarberSpecificRefinement(code: string): Promise<string> {
  try {
    console.log('🎨 [Lovable Refiner] Aplicando refinamentos específicos para barbearia...');
    
    let refined = code;

    // Cores específicas para barbearia luxury
    refined = refined.replace(
      /bg-blue-\d+/g,
      'bg-amber-900'
    );
    refined = refined.replace(
      /bg-indigo-\d+/g,
      'bg-gray-900'
    );

    // Adicionar elementos vintage/elegant
    refined = refined.replace(
      /(className="[^"]*hero[^"]*)"/g,
      '$1 bg-gradient-to-br from-gray-900 via-amber-900 to-black"'
    );

    console.log('✅ [Lovable Refiner] Refinamentos de barbearia aplicados');
    return refined;
  } catch (error) {
    console.error('❌ [Lovable Refiner] Erro ao aplicar refinamentos de barbearia:', error);
    return code;
  }
}

