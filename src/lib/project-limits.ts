/**
 * 🔒 Sistema de Limites e ID de Projeto
 * Gerencia limites de modificações e ID único do projeto
 */

import { DatabaseService } from './supabase';

/**
 * Limites configurados
 */
export const PROJECT_LIMITS = {
  INITIAL_PROMPT: 1,        // Prompt inicial (geração)
  MODIFICATIONS: 3,         // Modificações permitidas
  TOTAL_REQUESTS: 4         // Total: 1 inicial + 3 modificações
};

/**
 * Gera ID numérico único a partir do UUID
 * Converte os primeiros caracteres do UUID em número
 */
export function generateProjectId(conversationId: string): number {
  // Usar hash simples do UUID para gerar número único
  // Pegar primeiros 8 caracteres e converter para número base 16
  const hash = conversationId.replace(/-/g, '').substring(0, 8);
  const numId = parseInt(hash, 16);
  
  // Garantir que seja um número de 7 dígitos (fácil de lembrar)
  // Usar módulo para garantir tamanho máximo
  return numId % 9999999; // Máximo 7 dígitos
}

/**
 * Conta modificações realizadas (excluindo geração inicial)
 */
export async function countModifications(conversationId: string): Promise<number> {
  try {
    const projectId = generateProjectId(conversationId);
    console.log('🔍 [countModifications] Contando modificações:', {
      projectId: projectId,
      conversationId: conversationId
    });
    const versions = await DatabaseService.getSiteVersions(conversationId);
    
    console.log('📊 [countModifications] Versões encontradas:', {
      projectId: projectId,
      conversationId: conversationId,
      total: versions?.length || 0,
      versions: versions?.map(v => ({
        version: v.version_number,
        id: v.id?.substring(0, 8),
        created: v.created_at
      }))
    });
    
    // Contar versões após a primeira (que é a geração inicial)
    // Se tem 1 versão = geração inicial (0 modificações)
    // Se tem 2 versões = 1 modificação
    // Se tem 3 versões = 2 modificações
    // Se tem 4 versões = 3 modificações
    // Se tem 5+ versões = excedeu limite
    
    if (!versions || versions.length === 0) {
      console.log('📊 [countModifications] Nenhuma versão encontrada, retornando 0', {
        projectId: projectId,
        conversationId: conversationId
      });
      return 0; // Nenhuma versão ainda
    }
    
    // Versão 1 = geração inicial, versões 2+ = modificações
    const modifications = Math.max(0, versions.length - 1);
    
    console.log('✅ [countModifications] Total de modificações:', {
      projectId: projectId,
      conversationId: conversationId,
      modifications: modifications,
      totalVersions: versions.length,
      previewUrl: `/preview/${conversationId}`,
      chatUrl: `/chat/${conversationId}`
    });
    
    return modifications;
  } catch (error: any) {
    // ✅ Tratar erro de Supabase não configurado no cliente (variáveis de ambiente não disponíveis)
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes('supabaseUrl is required') || errorMessage.includes('supabaseAnonKey is required')) {
      // ✅ Não logar erro quando Supabase não está configurado no cliente (é esperado em produção)
      console.warn('⚠️ [countModifications] Supabase não configurado no cliente - retornando 0 modificações');
      return 0;
    }
    
    // ✅ Para outros erros, logar normalmente
    console.error('❌ Erro ao contar modificações:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
    return 0;
  }
}

/**
 * Verifica se o projeto excedeu o limite de modificações
 */
export async function hasExceededLimit(conversationId: string): Promise<boolean> {
  const modifications = await countModifications(conversationId);
  return modifications >= PROJECT_LIMITS.MODIFICATIONS;
}

/**
 * Verifica se pode fazer modificação
 */
export async function canMakeModification(conversationId: string): Promise<{
  allowed: boolean;
  modificationsUsed: number;
  modificationsRemaining: number;
  projectId: number;
}> {
  const modifications = await countModifications(conversationId);
  const projectId = generateProjectId(conversationId);
  
  return {
    allowed: modifications < PROJECT_LIMITS.MODIFICATIONS,
    modificationsUsed: modifications,
    modificationsRemaining: Math.max(0, PROJECT_LIMITS.MODIFICATIONS - modifications),
    projectId
  };
}

/**
 * Mensagem de WhatsApp pré-formatada
 */
export function getWhatsAppMessage(projectId: number): string {
  return `Olá! Criei meu site na WZ Solution e tenho interesse em adquirir o projeto completo.

🔢 **ID do Projeto:** ${projectId}

Gostaria de:
• Adquirir o código fonte completo
• Solicitar mais modificações
• Implementar ferramentas adicionais
• Colocar o site no ar

Podem me ajudar?`;
}

/**
 * URL do WhatsApp com mensagem pré-formatada
 */
export function getWhatsAppUrl(projectId: number, phoneNumber: string = '5511947293221'): string {
  const message = encodeURIComponent(getWhatsAppMessage(projectId));
  return `https://wa.me/${phoneNumber}?text=${message}`;
}

/**
 * Busca conversationId a partir de um projectId
 * Como projectId é um hash do conversationId, pode haver múltiplos matches
 * Retorna o primeiro encontrado que tenha site gerado
 */
export async function findConversationByProjectId(projectId: number): Promise<string | null> {
  try {
    const { DatabaseService } = await import('./supabase');
    const supabase = DatabaseService.supabase;
    
    // Buscar todas as conversas que têm site_versions (mais eficiente)
    const { data: siteVersions, error } = await supabase
      .from('site_versions')
      .select('conversation_id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar site_versions:', error);
      return null;
    }
    
    // Obter conversationIds únicos
    const uniqueConversationIds = [...new Set(siteVersions.map(sv => sv.conversation_id))];
    
    console.log(`🔍 [findConversationByProjectId] Verificando ${uniqueConversationIds.length} conversas com sites...`);
    
    // Verificar cada conversationId para encontrar o que gera o projectId desejado
    for (const conversationId of uniqueConversationIds) {
      const calculatedProjectId = generateProjectId(conversationId);
      if (calculatedProjectId === projectId) {
        console.log(`✅ [findConversationByProjectId] Encontrado! conversationId: ${conversationId}, projectId: ${projectId}`);
        return conversationId;
      }
    }
    
    console.log(`❌ [findConversationByProjectId] Nenhuma conversa encontrada para projectId: ${projectId}`);
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar conversationId por projectId:', error);
    return null;
  }
}

