/**
 * 📦 Módulo de Persistência de Mídias no Supabase Storage
 * 
 * Gerencia upload de logos e imagens geradas pela IA,
 * garantindo URLs públicas e permanentes para reuso em previews e versões.
 */

import { createClient } from '@supabase/supabase-js';

// ✅ Criar cliente com Service Role Key (acesso completo ao Storage)
const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 📤 Upload de arquivo para o Supabase Storage
 * 
 * @param fileBuffer - Buffer do arquivo
 * @param fileName - Nome do arquivo
 * @param folder - Pasta dentro do bucket (padrão: 'uploads')
 * @param bucket - Bucket do Supabase (padrão: 'site_assets')
 * @returns URL pública do arquivo
 */
export async function uploadToStorage(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads',
  bucket: string = 'site_assets'
): Promise<string> {
  try {
    console.log(`📤 Uploading ${fileName} to ${bucket}/${folder}...`);

    // ✅ Upload do arquivo
    const filePath = `${folder}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabaseStorage.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: guessMimeType(fileName),
        upsert: true, // ✅ Sobrescrever se já existir
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      throw new Error(`Falha ao fazer upload: ${uploadError.message}`);
    }

    console.log('✅ Arquivo enviado:', uploadData.path);

    // ✅ Obter URL pública
    const { data: urlData } = supabaseStorage.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Não foi possível obter URL pública do arquivo');
    }

    console.log('✅ URL pública gerada:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload para Supabase Storage:', error);
    throw error;
  }
}

/**
 * 🎨 Detectar MIME type pelo nome do arquivo
 */
function guessMimeType(fileName: string): string {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerName.endsWith('.gif')) return 'image/gif';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  if (lowerName.endsWith('.svg')) return 'image/svg+xml';
  
  return 'application/octet-stream';
}

/**
 * 🖼️ Upload de logo para bucket específico
 * 
 * @param fileBuffer - Buffer do logo
 * @param conversationId - ID da conversa
 * @returns URL pública do logo
 */
export async function uploadLogo(
  fileBuffer: Buffer,
  conversationId: string
): Promise<string> {
  const fileName = `${conversationId}_logo_${Date.now()}.png`;
  return uploadToStorage(fileBuffer, fileName, 'logos', 'site_assets');
}

/**
 * 🎨 Upload de imagens geradas pela IA
 * 
 * @param fileBuffer - Buffer da imagem
 * @param conversationId - ID da conversa
 * @param imageIndex - Índice da imagem (1, 2, 3, 4)
 * @returns URL pública da imagem
 */
export async function uploadAIImage(
  fileBuffer: Buffer,
  conversationId: string,
  imageIndex: number
): Promise<string> {
  const fileName = `${conversationId}_image_${imageIndex}.png`;
  return uploadToStorage(fileBuffer, fileName, 'ai-images', 'site_assets');
}

/**
 * 📥 Baixar arquivo de URL externa e fazer upload
 * 
 * @param imageUrl - URL externa (ex: DALL-E)
 * @param conversationId - ID da conversa
 * @param imageIndex - Índice da imagem
 * @returns URL pública no Supabase
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  conversationId: string,
  imageIndex: number
): Promise<string> {
  try {
    console.log(`📥 Baixando imagem de ${imageUrl}...`);
    
    // ✅ Baixar imagem
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Erro ao baixar imagem: ${response.statusText}`);
    }

    // ✅ Converter para buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`✅ Imagem baixada (${buffer.length} bytes)`);

    // ✅ Upload para Supabase
    return await uploadAIImage(buffer, conversationId, imageIndex);
  } catch (error) {
    console.error('❌ Erro ao baixar e fazer upload:', error);
    throw error;
  }
}

/**
 * 🗑️ Deletar arquivo do Storage
 */
export async function deleteFromStorage(
  filePath: string,
  bucket: string = 'site_assets'
): Promise<void> {
  try {
    const { error } = await supabaseStorage.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      throw error;
    }

    console.log(`✅ Arquivo deletado: ${filePath}`);
  } catch (error) {
    console.error('❌ Erro ao deletar do Storage:', error);
    throw error;
  }
}

/**
 * ✅ Verificar se bucket existe e está público
 */
export async function validateStorageSetup(): Promise<boolean> {
  try {
    // Tentar listar buckets
    const { data: buckets, error } = await supabaseStorage.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erro ao listar buckets:', error);
      return false;
    }

    const siteAssetsBucket = buckets?.find(b => b.name === 'site_assets');
    
    if (!siteAssetsBucket) {
      console.warn('⚠️ Bucket "site_assets" não encontrado. Crie-o no Supabase Dashboard.');
      return false;
    }

    console.log('✅ Bucket "site_assets" encontrado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao validar setup do Storage:', error);
    return false;
  }
}

export default supabaseStorage;

