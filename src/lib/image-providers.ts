/**
 * 🖼️ Image Providers - Sistema unificado para buscar imagens
 * 
 * Tenta múltiplas fontes em ordem de prioridade:
 * 1. Unsplash (se configurado)
 * 2. Pexels (se configurado)
 * 3. Placeholder personalizado (fallback)
 */

import { getUnsplashImage, getPlaceholderImage } from './unsplash-api';

export interface ImageProviderConfig {
  query: string;
  width?: number;
  height?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  placeholderText?: string;
  placeholderBgColor?: string;
}

/**
 * Busca imagem de qualquer provider disponível
 */
export async function getImage(config: ImageProviderConfig): Promise<string> {
  const {
    query,
    width = 800,
    height = 600,
    orientation = 'landscape',
    placeholderText = 'Image',
    placeholderBgColor = '1e3a8a'
  } = config;

  // 1. Tentar Unsplash
  if (process.env.UNSPLASH_ACCESS_KEY) {
    const unsplashImage = await getUnsplashImage(query, { width, height, orientation });
    if (unsplashImage) {
      return unsplashImage;
    }
  }

  // 2. Tentar Pexels (futuro)
  // if (process.env.PEXELS_API_KEY) {
  //   const pexelsImage = await getPexelsImage(query, { width, height });
  //   if (pexelsImage) return pexelsImage;
  // }

  // 3. Fallback: Placeholder personalizado
  return getPlaceholderImage(placeholderText, width, height, placeholderBgColor);
}

/**
 * Helper para gerar múltiplas imagens de uma vez
 */
export async function getImages(
  queries: Array<Omit<ImageProviderConfig, 'placeholderText' | 'placeholderBgColor'> & { 
    placeholderText?: string;
  }>
): Promise<string[]> {
  return Promise.all(
    queries.map((config, index) => 
      getImage({
        ...config,
        placeholderText: config.placeholderText || `Image ${index + 1}`
      })
    )
  );
}

