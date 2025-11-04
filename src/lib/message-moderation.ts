/**
 * 🔒 Sistema de Moderação de Mensagens
 * Valida e filtra mensagens antes de enviar para a IA
 */

interface ModerationResult {
  allowed: boolean;
  reason?: string;
  sanitizedMessage?: string;
}

/**
 * Lista de palavras bloqueadas (apenas conteúdo muito sensível)
 * Reduzida para evitar bloqueios indevidos
 */
const BLOCKED_WORDS = [
  // Apenas palavrões muito explícitos (reduzido)
  'caralho', 'porra', 'foder', 'fodido', 'cu',
  // Removidas palavras que podem aparecer em contextos legítimos
  // 'puta', 'puto' - removido (pode aparecer em "computador", "reputação")
  // 'merda' - removido (pode aparecer em contextos informais legítimos)
  // 'idiota', 'imbecil', 'burro' - removido (muito comum em conversas)
];

/**
 * Padrões de contexto fora do escopo (criação de sites)
 * Reduzido para ser menos restritivo - apenas casos muito claros
 */
const OFF_TOPIC_PATTERNS = [
  // Apenas casos muito específicos e claramente fora do contexto
  /quero conversar.*sobre.*(você|sua vida|pessoal)/i,
  /conte.*sobre.*você.*mesmo/i,
  // Removidos padrões que podem aparecer em contextos legítimos de sites
  // Permite desenvolvimento de apps/web que podem estar relacionados a sites
];

/**
 * Padrões de apologia a crimes
 * Apenas padrões muito específicos que claramente indicam intenção criminosa
 */
const CRIME_PATTERNS = [
  /como.*roubar.*(banco|carro|dinheiro)/i,
  /como.*matar.*(pessoa|alguém)/i,
  /quero.*sequestrar/i,
  /como.*traficar.*(drogas|armas)/i,
  /vender.*(drogas|armas).*ilegal/i,
  // Removidos padrões ambíguos que podem aparecer em contextos legítimos
  // "hackear" pode ser sobre segurança ética
  // "invadir" pode ser sobre design/temas
];

/**
 * Verifica se a mensagem contém palavras bloqueadas
 * Usa word boundaries para verificar apenas palavras completas
 */
function containsBlockedWords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Verificar cada palavra bloqueada como palavra completa (usando word boundaries)
  return BLOCKED_WORDS.some(word => {
    // Criar regex com word boundaries para garantir que é a palavra completa
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerMessage);
  });
}

/**
 * Verifica se a mensagem está fora do contexto (criação de sites)
 */
function isOffTopic(message: string): boolean {
  return OFF_TOPIC_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Verifica se há apologia a crimes
 */
function containsCrimeApology(message: string): boolean {
  return CRIME_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Sanitiza mensagem removendo palavras bloqueadas
 */
function sanitizeMessage(message: string): string {
  let sanitized = message;
  BLOCKED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    sanitized = sanitized.replace(regex, '***');
  });
  return sanitized;
}

/**
 * Valida se a mensagem está no contexto de criação de sites
 * Expandida para incluir mais palavras-chave relacionadas
 */
function isSiteCreationContext(message: string): boolean {
  const siteKeywords = [
    'site', 'página', 'web', 'html', 'css', 'design', 'layout',
    'seção', 'banner', 'menu', 'rodapé', 'cabeçalho', 'hero',
    'formulário', 'botão', 'link', 'imagem', 'logo', 'cor',
    'fonte', 'estilo', 'tema', 'modificar', 'alterar', 'adicionar',
    'remover', 'mudar', 'criar site', 'fazer site', 'gerar site',
    'texto', 'conteúdo', 'sessão', 'aba', 'modal', 'popup',
    'responsivo', 'mobile', 'desktop', 'tablet', 'nav', 'header',
    'footer', 'sidebar', 'widget', 'componente', 'elemento',
    'melhorar', 'ajustar', 'editar', 'trocar', 'incluir',
    'empresa', 'negócio', 'serviço', 'produto', 'contato',
    'whatsapp', 'email', 'telefone', 'endereço', 'mapa',
    'galeria', 'slider', 'carrossel', 'vídeo', 'áudio',
    'animação', 'efeito', 'hover', 'scroll', 'clique'
  ];
  
  const lowerMessage = message.toLowerCase();
  return siteKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Função principal de moderação
 * Tornada menos restritiva para evitar bloqueios indevidos
 */
export function moderateMessage(message: string): ModerationResult {
  // Se a mensagem menciona palavras-chave de criação de sites, ser mais permissivo
  const hasSiteContext = isSiteCreationContext(message);
  
  // 1. Verificar conteúdo sensível (apenas palavras muito explícitas)
  // Se tiver contexto de site, ser mais permissivo
  if (containsBlockedWords(message) && !hasSiteContext) {
    return {
      allowed: false,
      reason: 'A mensagem contém palavras inadequadas. Por favor, mantenha o foco na criação do seu site.',
      sanitizedMessage: sanitizeMessage(message)
    };
  }

  // 2. Verificar apologia a crimes (apenas padrões muito específicos)
  if (containsCrimeApology(message)) {
    return {
      allowed: false,
      reason: 'Não posso ajudar com solicitações relacionadas a atividades ilegais. Vamos focar na criação do seu site!'
    };
  }

  // 3. Verificar se está fora do contexto (mas ser muito mais permissivo)
  // Apenas bloquear se for claramente fora do contexto E não mencionar nada relacionado a sites
  if (isOffTopic(message) && !hasSiteContext && message.length > 50) {
    // Só bloquear se a mensagem for longa e claramente fora do contexto
    // Mensagens curtas podem ser apenas perguntas rápidas
    return {
      allowed: false,
      reason: 'Por favor, mantenha o foco na criação e modificação do seu site. Estou aqui para ajudar com design, conteúdo e funcionalidades do site.',
    };
  }

  // 4. Mensagem permitida (padrão é permitir)
  return {
    allowed: true
  };
}

/**
 * Validação rápida para uso em tempo real
 */
export function quickValidate(message: string): boolean {
  const result = moderateMessage(message);
  return result.allowed;
}

/**
 * Mensagem de redirecionamento amigável
 */
export function getRedirectMessage(originalMessage: string): string {
  if (containsCrimeApology(originalMessage)) {
    return '🚫 Não posso ajudar com esse tipo de solicitação. Vamos focar na criação do seu site profissional!';
  }
  
  if (containsBlockedWords(originalMessage)) {
    return '💬 Por favor, mantenha uma linguagem profissional. Estou aqui para ajudar a criar seu site incrível!';
  }
  
  if (isOffTopic(originalMessage)) {
    return '🎯 Vamos manter o foco na criação do seu site! Você pode pedir para:\n\n• Adicionar/modificar seções\n• Alterar cores e estilos\n• Incluir imagens\n• Criar formulários\n• Adicionar funcionalidades\n\nO que você gostaria de fazer no seu site?';
  }
  
  return 'Por favor, mantenha o foco na criação do seu site.';
}

