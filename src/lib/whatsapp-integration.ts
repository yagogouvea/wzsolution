// Integração WhatsApp para direcionamento de leads qualificados

export interface ProjectSummary {
  conversationId: string;
  clientInfo: {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
  };
  projectDetails: {
    type: string;
    initialPrompt: string;
    businessType?: string;
    hasLogo: boolean;
    logoAnalysis?: Record<string, unknown>;
    pages: string[];
    siteStructure: string;
    modifications: string[];
    version: number;
  };
  timeline: {
    started: string;
    completed: string;
    duration: string;
  };
}

export function generateWhatsAppMessage(projectSummary: ProjectSummary): string {
  const {
    conversationId,
    clientInfo,
    projectDetails,
    timeline
  } = projectSummary;

  const clientName = clientInfo.name || 'Cliente';
  const company = clientInfo.company ? ` (${clientInfo.company})` : '';
  const logoInfo = projectDetails.hasLogo ? '✅ Logo enviado e analisado' : '❌ Não possui logo';
  const modificationsText = projectDetails.modifications.length > 0 
    ? projectDetails.modifications.join(', ') 
    : 'Nenhuma modificação solicitada';

  const message = `🤖 *LEAD QUALIFICADO - IA CRIADOR DE SITES*

👤 *CLIENTE:* ${clientName}${company}
📧 *Email:* ${clientInfo.email || 'Não informado'}
📱 *Telefone:* ${clientInfo.phone || 'Não informado'}

🎯 *PROJETO APROVADO:*
• *Tipo:* ${projectDetails.type.toUpperCase()}
• *Ideia inicial:* ${projectDetails.initialPrompt}
• *Negócio:* ${projectDetails.businessType || 'A definir'}

🎨 *ESPECIFICAÇÕES TÉCNICAS:*
• *Logo:* ${logoInfo}
• *Estrutura:* ${projectDetails.siteStructure === 'multiple_pages' ? 'Múltiplas páginas' : 'Página única'}
• *Páginas:* ${projectDetails.pages.join(', ')}
• *Modificações testadas:* ${modificationsText}
• *Versão final:* v${projectDetails.version}

⏱️ *TIMELINE:*
• *Iniciado:* ${new Date(timeline.started).toLocaleString('pt-BR')}
• *Aprovado:* ${new Date(timeline.completed).toLocaleString('pt-BR')}
• *Duração:* ${timeline.duration}

🔥 *STATUS:* Cliente já VIU e APROVOU o site funcionando!

📋 *PRÓXIMOS PASSOS:*
• Definir modificações adicionais
• Apresentar orçamento completo
• Incluir domínio + hospedagem
• Cronograma de entrega
• Publicação do site

💰 *LEAD SCORE:* 🔥🔥🔥 QUENTE (Projeto aprovado visualmente)

🆔 *ID Conversa:* ${conversationId.slice(-8)}

---
*Este lead foi gerado pelo sistema de IA e já passou por todo processo de criação e aprovação visual.*`;

  return encodeURIComponent(message);
}

export function getWhatsAppURL(phoneNumber: string, message: string): string {
  // Limpar número de telefone (remover caracteres especiais)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Garantir código do país (55 para Brasil)
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  return `https://wa.me/${fullPhone}?text=${message}`;
}

export function generateProjectEstimate(projectSummary: ProjectSummary): {
  basePrice: number;
  addons: { name: string; price: number }[];
  hosting: { domain: number; hosting: number };
  total: number;
  timeEstimate: string;
} {
  const { projectDetails } = projectSummary;
  
  // Preço base por tipo de projeto
  let basePrice = 0;
  switch (projectDetails.type) {
    case 'site':
      basePrice = projectDetails.pages.length <= 4 ? 1200 : 1800;
      break;
    case 'ecommerce':
      basePrice = 3500;
      break;
    case 'webapp':
      basePrice = 5000;
      break;
    default:
      basePrice = 1500;
  }

  // Adicionais baseados nas modificações
  const addons = [];
  let addonTotal = 0;

  if (projectDetails.modifications.some(m => m.toLowerCase().includes('whatsapp'))) {
    addons.push({ name: 'Integração WhatsApp', price: 200 });
    addonTotal += 200;
  }

  if (projectDetails.modifications.some(m => m.toLowerCase().includes('formulário'))) {
    addons.push({ name: 'Formulário Avançado', price: 300 });
    addonTotal += 300;
  }

  if (projectDetails.modifications.some(m => m.toLowerCase().includes('cadastro'))) {
    addons.push({ name: 'Sistema de Cadastro', price: 800 });
    addonTotal += 800;
  }

  if (projectDetails.hasLogo) {
    addons.push({ name: 'Análise e Integração de Logo', price: 0 }); // Incluso
  } else {
    addons.push({ name: 'Criação de Logo', price: 400 });
    addonTotal += 400;
  }

  // Hospedagem e domínio
  const hosting = {
    domain: 60, // .com.br por ano
    hosting: 300 // Hospedagem anual
  };

  const total = basePrice + addonTotal + hosting.domain + hosting.hosting;

  // Estimativa de tempo
  let timeEstimate = '';
  if (projectDetails.pages.length <= 4 && projectDetails.modifications.length <= 2) {
    timeEstimate = '3-5 dias úteis';
  } else if (projectDetails.pages.length <= 6 && projectDetails.modifications.length <= 4) {
    timeEstimate = '1-2 semanas';
  } else {
    timeEstimate = '2-3 semanas';
  }

  return {
    basePrice,
    addons,
    hosting,
    total,
    timeEstimate
  };
}

// Configurações dos representantes (você pode mover para .env)
export const SALES_REPRESENTATIVES = {
  default: {
    name: 'Equipe WZ Solution',
    phone: '5511999999999', // Substitua pelo número real
    schedule: 'Segunda à Sexta: 9h às 18h'
  },
  premium: {
    name: 'Consultor Premium',
    phone: '5511888888888', // Substitua pelo número real
    schedule: 'Segunda à Sexta: 8h às 20h | Sábado: 9h às 14h'
  }
};

export function getRepresentativeByProjectValue(projectValue: number) {
  return projectValue > 3000 ? SALES_REPRESENTATIVES.premium : SALES_REPRESENTATIVES.default;
}
