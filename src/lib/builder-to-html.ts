/**
 * 🔄 Conversor de JSON Builder.io para HTML Funcional
 * 
 * Converte a estrutura JSON do Builder.io em HTML completo e renderizável
 * com Tailwind CSS e JavaScript vanilla.
 */

interface BuilderBlock {
  '@type'?: string;
  '@version'?: number;
  id?: string;
  tagName?: string;
  component?: {
    name: string;
    options?: Record<string, unknown>;
  };
  properties?: {
    className?: string;
    style?: string;
    text?: string;
    [key: string]: unknown;
  };
  children?: BuilderBlock[];
}

interface BuilderContent {
  blocks?: BuilderBlock[];
  data?: {
    blocks?: BuilderBlock[];
  };
  state?: Record<string, unknown>;
  url?: string;
}

/**
 * Converte JSON do Builder.io em HTML completo e funcional
 */
export function convertBuilderJsonToHtml(
  builderContent: BuilderContent | string,
  options?: {
    title?: string;
    logoUrl?: string;
    colors?: string[];
    images?: string[]; // ✅ NOVO: Array de URLs de imagens do Supabase
  }
): string {
  // Parse se for string
  let content: BuilderContent;
  if (typeof builderContent === 'string') {
    try {
      content = JSON.parse(builderContent);
    } catch {
      // Se não for JSON válido, pode ser HTML já renderizado
      return builderContent;
    }
  } else {
    content = builderContent;
  }

  // Extrair blocos
  const blocks = content.blocks || content.data?.blocks || [];
  
  if (blocks.length === 0) {
    // Retornar HTML de fallback
    return generateFallbackHtml(options);
  }

  // Converter blocos em HTML
  const bodyContent = blocks.map(block => renderBlock(block, options)).join('\n');

  // HTML completo
  const title = options?.title || 'Site WZ Solution';
  const colors = options?.colors || ['#1C1F26', '#FFFFFF', '#D4AF37'];
  const logoUrl = options?.logoUrl;
  const images = options?.images || [];
  
  // ✅ Substituir placeholders por URLs reais do Supabase
  let finalBodyContent = bodyContent;
  
  if (logoUrl) {
    finalBodyContent = finalBodyContent
      .replace(/{{logo}}/g, logoUrl)
      .replace(/logo\.png/g, logoUrl)
      .replace(/src="[^"]*logo[^"]*"/gi, `src="${logoUrl}" alt="Logo"`);
  }
  
  if (images.length > 0) {
    finalBodyContent = finalBodyContent
      .replace(/{{image_hero}}/g, images[0] || '')
      .replace(/{{image_about}}/g, images[1] || images[0] || '')
      .replace(/{{image_services}}/g, images[2] || images[1] || images[0] || '')
      .replace(/{{image_contact}}/g, images[3] || images[2] || images[0] || '');
  }
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${colors[0]}',
            secondary: '${colors[1]}',
            accent: '${colors[2]}',
          }
        }
      }
    }
  </script>
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  ${options?.logoUrl ? `<link rel="icon" type="image/png" href="${options.logoUrl}" />` : ''}
  
  <style>
    :root {
      --primary-color: ${colors[0]};
      --accent-color: ${colors[2]};
    }
    body { 
      font-family: 'Inter', sans-serif; 
    }
    h1, h2, h3, h4 { 
      font-family: 'Poppins', sans-serif; 
      font-weight: 700; 
    }
    * { 
      transition: all 0.3s ease; 
    }
  </style>
</head>
<body class="bg-white text-gray-900">
  ${bodyContent}
  
  <script>
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    
    // Mobile menu toggle (se existir)
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Renderiza um bloco Builder.io recursivamente
 * ✅ NOVO: Aceita options para substituir placeholders
 */
function renderBlock(
  block: BuilderBlock, 
  options?: { logoUrl?: string; images?: string[] }
): string {
  if (!block) return '';

  // Determinar tag HTML
  const tagName = block.tagName || 
                 (block.component?.name?.includes('Section') ? 'section' : 
                  block.component?.name?.includes('Button') ? 'button' :
                  block.component?.name?.includes('Text') ? 'p' :
                  'div');

  // Classes CSS
  const className = block.properties?.className || '';
  
  // Estilos inline
  const style = typeof block.properties?.style === 'string' 
    ? block.properties.style 
    : '';

  // Texto do elemento
  const text = block.properties?.text || '';

  // Renderizar filhos
  const children = block.children || [];
  const childrenHtml = children.map(child => renderBlock(child, options)).join('\n');

  // Atributos
  const attrs: string[] = [];
  if (className) attrs.push(`class="${className}"`);
  if (style) attrs.push(`style="${style}"`);
  
  // ID
  if (block.id) attrs.push(`id="${block.id}"`);

  const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

  // Componentes especiais
  if (block.component?.name === 'WhatsAppButton') {
    const phone = (block.properties?.phoneNumber as string) || '5511947293221';
    const buttonText = (block.properties?.buttonText as string) || 'Fale Conosco';
    const buttonColor = (block.properties?.buttonColor as string) || '#25D366';
    
    return `
    <a href="https://wa.me/${phone}" 
       target="_blank" 
       class="fixed bottom-6 right-6 bg-[${buttonColor}] hover:bg-opacity-90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all hover:scale-105">
      <i class="fab fa-whatsapp text-xl"></i>
      <span class="font-semibold">${buttonText}</span>
    </a>`;
  }

  if (block.component?.name === 'ScheduleSection') {
    const title = (block.properties?.title as string) || 'Agende uma Consulta';
    const description = (block.properties?.description as string) || '';
    const buttonText = (block.properties?.buttonText as string) || 'Agendar Agora';
    
    return `
    <section class="py-16 bg-gradient-to-r from-primary to-accent text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">${title}</h2>
        ${description ? `<p class="text-lg mb-6 opacity-90">${description}</p>` : ''}
        <button class="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
          ${buttonText}
        </button>
      </div>
    </section>`;
  }

  if (block.component?.name === 'GoogleMap') {
    const location = (block.properties?.location as string) || '';
    const mapHeight = (block.properties?.mapHeight as string) || '400px';
    
    return `
    <section class="py-12 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-6 text-center">Localização</h2>
        <iframe 
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4nX1qN0pI&q=${encodeURIComponent(location)}"
          width="100%" 
          height="${mapHeight}" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy">
        </iframe>
      </div>
    </section>`;
  }

  // Elemento HTML padrão
  if (childrenHtml || text) {
    return `<${tagName}${attrsStr}>${text}${childrenHtml}</${tagName}>`;
  } else {
    return `<${tagName}${attrsStr}></${tagName}>`;
  }
}

/**
 * Gera HTML de fallback caso não haja blocos
 */
function generateFallbackHtml(options?: {
  title?: string;
  logoUrl?: string;
  colors?: string[];
}): string {
  const title = options?.title || 'Site WZ Solution';
  const colors = options?.colors || ['#1C1F26', '#FFFFFF', '#D4AF37'];
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Bem-vindo</h1>
      <p class="text-gray-600">Site em desenvolvimento</p>
    </div>
  </div>
</body>
</html>`;
}



