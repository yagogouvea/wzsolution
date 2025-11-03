/**
 * 🖼️ Unsplash API Integration
 * 
 * Busca imagens profissionais de alta qualidade baseadas em keywords
 * relacionadas ao setor do negócio e necessidades do site.
 */

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  width: number;
  height: number;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Mapeia setor de negócio para termos de busca no Unsplash
 */
function getSearchQueryForSector(businessSector: string): string {
  const sectorMapping: Record<string, string> = {
    'Restaurante': 'restaurant food dining',
    'Pizzaria': 'pizza restaurant italian',
    'Cafeteria': 'coffee shop cafe',
    'Barbearia': 'barbershop barber',
    'Salão de Beleza': 'beauty salon spa',
    'Clínica Médica': 'medical clinic healthcare',
    'Academia': 'gym fitness workout',
    'Tecnologia/SaaS': 'technology office startup',
    'Consultoria': 'business consulting meeting',
    'Imobiliária': 'real estate property house',
    'Fotografia': 'photography camera portrait',
    'Eventos': 'event party celebration',
    'Escola/Educação': 'education school learning',
    'Pet Shop': 'pet shop animals dogs',
    'ONG/Instituição': 'charity nonprofit community',
    'Construtora': 'construction building architecture',
  };

  // Buscar match exato ou parcial
  for (const [key, query] of Object.entries(sectorMapping)) {
    if (businessSector.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(businessSector.toLowerCase())) {
      return query;
    }
  }

  // Fallback: usar o próprio setor
  return businessSector.toLowerCase();
}

/**
 * Busca uma imagem aleatória do Unsplash baseada em uma query
 */
export async function getUnsplashImage(
  query: string,
  options: {
    width?: number;
    height?: number;
    orientation?: 'landscape' | 'portrait' | 'squarish';
  } = {}
): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('⚠️ Unsplash API key não configurada');
    return null;
  }

  try {
    const { width = 1200, height = 800, orientation = 'landscape' } = options;
    
    const searchParams = new URLSearchParams({
      query: query,
      orientation: orientation,
      per_page: '1',
      w: width.toString(),
      h: height.toString(),
    });

    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Unsplash API error: ${response.status}`);
      return null;
    }

    const photo: UnsplashPhoto = await response.json();
    return photo.urls.regular;
  } catch (error) {
    console.error('❌ Erro ao buscar imagem do Unsplash:', error);
    return null;
  }
}

/**
 * Busca múltiplas imagens para diferentes seções do site
 */
export async function getUnsplashImagesForSite(config: {
  businessSector: string;
  companyName: string;
  pagesNeeded: string[];
}): Promise<Record<string, string | null>> {
  const baseQuery = getSearchQueryForSector(config.businessSector);
  const images: Record<string, string | null> = {};

  // Hero image
  images.hero = await getUnsplashImage(baseQuery, { 
    width: 1920, 
    height: 1080,
    orientation: 'landscape'
  });

  // Gallery images
  if (config.pagesNeeded.includes('galeria')) {
    images.gallery1 = await getUnsplashImage(baseQuery, { orientation: 'squarish' });
    images.gallery2 = await getUnsplashImage(baseQuery, { orientation: 'squarish' });
    images.gallery3 = await getUnsplashImage(baseQuery, { orientation: 'squarish' });
  }

  // About/Services images
  if (config.pagesNeeded.includes('sobre') || config.pagesNeeded.includes('servicos')) {
    images.about = await getUnsplashImage(`${baseQuery} team professional`, { 
      orientation: 'landscape' 
    });
  }

  return images;
}

/**
 * Gera URL de placeholder personalizado como fallback
 */
export function getPlaceholderImage(
  text: string,
  width: number = 800,
  height: number = 600,
  bgColor: string = '1e3a8a',
  textColor: string = 'ffffff'
): string {
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

