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
 * Lista de palavras bloqueadas (conteúdo sensível)
 */
const BLOCKED_WORDS = [
  // Palavrões em português (comuns)
  'puta', 'puto', 'caralho', 'porra', 'foder', 'fodido', 'merda', 'cu',
  'piranha', 'vagabunda', 'vagabundo', 'viado', 'bicha', 'puta',
  // Conteúdo ofensivo
  'idiota', 'imbecil', 'burro', 'retardado', 'deficiente',
  // Apologia a crimes (exemplos)
  'matar', 'assassinar', 'roubar', 'sequestrar', 'bombar', 'explodir',
  'hackear', 'invadir', 'extorquir', 'corromper', 'subornar',
  // Conteúdo ilegal
  'drogas', 'maconha', 'cocaína', 'traficar', 'vender drogas',
  'pirataria', 'piratear', 'baixar ilegal',
];

/**
 * Padrões de contexto fora do escopo (criação de sites)
 */
const OFF_TOPIC_PATTERNS = [
  // Outros tipos de desenvolvimento
  /criar.*app.*mobile/i,
  /desenvolver.*software/i,
  /fazer.*programa/i,
  /criar.*jogo/i,
  /desenvolver.*game/i,
  // Assuntos pessoais
  /me ajude.*pessoal/i,
  /meu problema.*pessoal/i,
  /quero conversar.*sobre/i,
  // Assuntos técnicos não relacionados
  /como.*funciona.*banco.*dados/i,
  /explique.*algoritmo/i,
  /me ensine.*programar/i,
  // Chat genérico
  /como.*você.*está/i,
  /qual.*seu.*nome/i,
  /conte.*sobre.*você/i,
];

/**
 * Padrões de apologia a crimes
 */
const CRIME_PATTERNS = [
  /como.*roubar/i,
  /como.*matar/i,
  /como.*hackear/i,
  /como.*invadir/i,
  /quero.*bombar/i,
  /quero.*explodir/i,
  /quero.*sequestrar/i,
  /como.*traficar/i,
  /vender.*drogas/i,
  /piratear.*software/i,
];

/**
 * Verifica se a mensagem contém palavras bloqueadas
 */
function containsBlockedWords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return BLOCKED_WORDS.some(word => lowerMessage.includes(word));
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
 */
function isSiteCreationContext(message: string): boolean {
  const siteKeywords = [
    'site', 'página', 'web', 'html', 'css', 'design', 'layout',
    'seção', 'banner', 'menu', 'rodapé', 'cabeçalho', 'hero',
    'formulário', 'botão', 'link', 'imagem', 'logo', 'cor',
    'fonte', 'estilo', 'tema', 'modificar', 'alterar', 'adicionar',
    'remover', 'mudar', 'criar site', 'fazer site', 'gerar site'
  ];
  
  const lowerMessage = message.toLowerCase();
  return siteKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Função principal de moderação
 */
export function moderateMessage(message: string): ModerationResult {
  // 1. Verificar conteúdo sensível
  if (containsBlockedWords(message)) {
    return {
      allowed: false,
      reason: 'A mensagem contém palavras inadequadas. Por favor, mantenha o foco na criação do seu site.',
      sanitizedMessage: sanitizeMessage(message)
    };
  }

  // 2. Verificar apologia a crimes
  if (containsCrimeApology(message)) {
    return {
      allowed: false,
      reason: 'Não posso ajudar com solicitações relacionadas a atividades ilegais. Vamos focar na criação do seu site!'
    };
  }

  // 3. Verificar se está fora do contexto (mas permitir se mencionar palavras-chave de site)
  if (isOffTopic(message) && !isSiteCreationContext(message)) {
    return {
      allowed: false,
      reason: 'Por favor, mantenha o foco na criação e modificação do seu site. Estou aqui para ajudar com design, conteúdo e funcionalidades do site.',
    };
  }

  // 4. Mensagem permitida
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

