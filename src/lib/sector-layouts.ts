/**
 * Layout Patterns por Setor de Negócio
 * 
 * Define estruturas de layout, cores, seções e componentes específicos para cada tipo de negócio.
 * Isso garante que sites sejam ÚNICOS e adaptados ao setor do cliente.
 */

export interface SectorLayoutPattern {
  // Nome do setor (usado para matching)
  sectorName: string;
  
  // Estilo do Hero Section
  heroStyle: 'grid-2-cols-image-text' | 'fullscreen-image-overlay' | 'retro-vintage' | 'futuristic-gradient' | 'split-screen' | 'centered-minimal';
  
  // Seções obrigatórias específicas do setor
  mandatorySections: string[];
  
  // Esquemas de cores recomendados
  colorSchemes: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  }[];
  
  // Estilos de componentes específicos
  componentStyles: {
    card: string;
    button: string;
    heroBackground: string;
    sectionBackground: string;
  };
  
  // Ícones recomendados (react-icons)
  recommendedIcons: string[];
  
  // Descrição do público-alvo e tom
  targetAudience: string;
  tone: string;
  
  // Exemplo de estrutura visual
  visualStructure: string;
}

export const sectorLayouts: Record<string, SectorLayoutPattern> = {
  // ==========================================
  // LOJA DE ROUPAS / MODA
  // ==========================================
  'loja de roupas': {
    sectorName: 'Loja de Roupas',
    heroStyle: 'grid-2-cols-image-text',
    mandatorySections: ['Novidades', 'Coleções', 'Categorias', 'Lookbook', 'Ofertas Especiais'],
    colorSchemes: [
      {
        name: 'Elegante Minimalista',
        primary: '#000000',
        secondary: '#E5E5E5',
        accent: '#FF69B4',
        neutral: '#F5F5F5'
      },
      {
        name: 'Sofisticado Moderno',
        primary: '#2D2D2D',
        secondary: '#C0B283',
        accent: '#D4AF37',
        neutral: '#F8F8F8'
      }
    ],
    componentStyles: {
      card: 'group relative bg-white rounded-none overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 hover:shadow-lg',
      button: 'bg-black text-white px-8 py-4 uppercase tracking-wider hover:bg-gray-800 transition-colors font-semibold',
      heroBackground: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
      sectionBackground: 'bg-white'
    },
    recommendedIcons: ['FaTshirt', 'FaShoppingBag', 'FaHeart', 'FaSearch', 'FaUser'],
    targetAudience: 'Homens e mulheres 18-45 anos, fashion-conscious, millennials',
    tone: 'Elegante, moderno, sofisticado, tendência',
    visualStructure: `
      Hero: Imagem de modelo/produto grande à esquerda + texto minimalista à direita
      Novidades: Grid de produtos em cards limpos, fotos de qualidade, sem fundo decorativo
      Coleções: Grid 3-4 colunas, foto principal + cards menores abaixo
      Categorias: Grid de filtros visuais com ícones
      Lookbook: Galeria estilo lookbook profissional
    `
  },
  
  // ==========================================
  // RESTAURANTE / GASTRONOMIA
  // ==========================================
  'restaurante': {
    sectorName: 'Restaurante',
    heroStyle: 'fullscreen-image-overlay',
    mandatorySections: ['Cardápio', 'Pratos Especiais', 'Sobre o Chef', 'Reservas', 'Ambiente'],
    colorSchemes: [
      {
        name: 'Quente e Acolhedor',
        primary: '#C41E3A',
        secondary: '#D2691E',
        accent: '#FFD700',
        neutral: '#F5F5DC'
      },
      {
        name: 'Gastronomia Moderna',
        primary: '#1A1A1A',
        secondary: '#E8C547',
        accent: '#D3212D',
        neutral: '#FAFAFA'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-l-4 border-orange-400 overflow-hidden',
      button: 'bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all',
      heroBackground: 'bg-gradient-to-b from-orange-50 via-amber-50 to-white',
      sectionBackground: 'bg-gradient-to-b from-white via-orange-50/30 to-white'
    },
    recommendedIcons: ['FaUtensils', 'FaWineGlass', 'FaCalendarCheck', 'FaMapMarkerAlt', 'FaPhone'],
    targetAudience: 'Gourmets, foodies, casais, famílias, executivos',
    tone: 'Acolhedor, sofisticado, convidativo, exótico',
    visualStructure: `
      Hero: Imagem fullscreen de prato gourmet com overlay escuro + call-to-action centralizado
      Cardápio: Cards de pratos com foto, nome, descrição, preço + ícones de categoria
      Pratos Especiais: Carrossel ou grid destacado com badges "DESTAQUE" ou "NOVO"
      Chef: Seção storytelling com foto do chef + filosofia culinária
      Reservas: Formulário proeminente + disponibilidade
      Ambiente: Galeria de fotos do espaço
    `
  },
  
  // ==========================================
  // BARBEARIA / SALÃO MASCULINO
  // ==========================================
  'barbearia': {
    sectorName: 'Barbearia',
    heroStyle: 'retro-vintage',
    mandatorySections: ['Nossos Serviços', 'Agendamento Online', 'Produtos', 'Galeria de Trabalhos', 'Depoimentos'],
    colorSchemes: [
      {
        name: 'Retrô Masculino',
        primary: '#1A1A1A',
        secondary: '#FFFFFF',
        accent: '#D4AF37',
        neutral: '#2D2D2D'
      },
      {
        name: 'Moderno Barbershop',
        primary: '#0F3460',
        secondary: '#E94560',
        accent: '#FC9918',
        neutral: '#F5F5F5'
      }
    ],
    componentStyles: {
      card: 'bg-gray-900 text-white rounded-xl border-2 border-yellow-500/30 hover:border-yellow-500 shadow-2xl hover:shadow-yellow-500/20 transition-all',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-lg shadow-xl hover:scale-105 transition-transform',
      heroBackground: 'bg-gradient-to-b from-gray-900 via-gray-800 to-black',
      sectionBackground: 'bg-gradient-to-b from-black via-gray-900 to-black'
    },
    recommendedIcons: ['FaCut', 'FaRazor', 'FaMale', 'FaClock', 'FaStar'],
    targetAudience: 'Homens 20-50 anos, profissionais, estilo conscious',
    tone: 'Masculino, vintage, confiável, premium',
    visualStructure: `
      Hero: Fundo escuro com elementos vintage (cadeira, barber pole) + texto branco/amarelo
      Serviços: Cards escuros com ícones dourados, preços destacados
      Agendamento: Calendário visual proeminente + horários disponíveis
      Produtos: Grid de produtos de barbearia com imagens
      Galeria: Grid de antes/depois de cortes
      Depoimentos: Cards com foto + avaliação em estrelas
    `
  },
  
  // ==========================================
  // TECNOLOGIA / SOFTWARE
  // ==========================================
  'tecnologia': {
    sectorName: 'Tecnologia',
    heroStyle: 'futuristic-gradient',
    mandatorySections: ['Soluções', 'Produtos/Serviços', 'Cases de Sucesso', 'Equipe', 'Contato'],
    colorSchemes: [
      {
        name: 'Tech Futuristic',
        primary: '#0A192F',
        secondary: '#64FFDA',
        accent: '#FF6B6B',
        neutral: '#172A45'
      },
      {
        name: 'Modern Blue',
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#00D4FF',
        neutral: '#F3F4F6'
      }
    ],
    componentStyles: {
      card: 'border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-transparent rounded-xl hover:border-blue-500 shadow-lg backdrop-blur-sm',
      button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-8 py-4 rounded-lg shadow-xl transition-all',
      heroBackground: 'bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900',
      sectionBackground: 'bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900'
    },
    recommendedIcons: ['FaCode', 'FaServer', 'FaCloud', 'FaRocket', 'FaCog'],
    targetAudience: 'Empresas, startups, desenvolvedores, CTOs',
    tone: 'Inovador, técnico, confiável, futurista',
    visualStructure: `
      Hero: Gradiente escuro com elementos tech (circuitos, partículas) + títulos grandes com efeito neon
      Soluções: Cards com ícones tech, descrições técnicas, CTAs claros
      Produtos: Grid de features/benefícios com ilustrações
      Cases: Carrossel de depoimentos + métricas de sucesso
      Equipe: Grid de perfis técnicos com certificações
      Contato: Formulário B2B + demo request
    `
  },
  
  // ==========================================
  // SAÚDE / CLÍNICA
  // ==========================================
  'clinica': {
    sectorName: 'Clínica Médica',
    heroStyle: 'centered-minimal',
    mandatorySections: ['Especialidades', 'Corpo Clínico', 'Agendamento Online', 'Convênios', 'Instalações'],
    colorSchemes: [
      {
        name: 'Profissional Limpo',
        primary: '#047857',
        secondary: '#10B981',
        accent: '#059669',
        neutral: '#F0FDF4'
      },
      {
        name: 'Médico Confiável',
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#60A5FA',
        neutral: '#EFF6FF'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500',
      button: 'bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-all',
      heroBackground: 'bg-gradient-to-b from-green-50 via-white to-white',
      sectionBackground: 'bg-gradient-to-b from-white via-green-50/30 to-white'
    },
    recommendedIcons: ['FaStethoscope', 'FaHeartbeat', 'FaUserMd', 'FaCalendarCheck', 'FaHospital'],
    targetAudience: 'Pacientes, familiares, pessoas buscando saúde',
    tone: 'Profissional, confiável, acolhedor, seguro',
    visualStructure: `
      Hero: Fundo limpo branco/verde claro + mensagem de confiança + agendamento rápido
      Especialidades: Grid de cards com ícones médicos, descrição clara, taxa de sucesso
      Corpo Clínico: Cards com fotos dos médicos, especialização, credenciais
      Agendamento: Formulário simples + horários disponíveis
      Convênios: Grid de logos de convênios aceitos
      Instalações: Galeria clean do ambiente clínico
    `
  },
  
  // ==========================================
  // VETERINÁRIA / PET SHOP
  // ==========================================
  'veterinaria': {
    sectorName: 'Veterinária',
    heroStyle: 'grid-2-cols-image-text',
    mandatorySections: ['Nossos Serviços', 'Especialidades', 'Agendamento', 'Loja de Produtos', 'Galeria'],
    colorSchemes: [
      {
        name: 'Pet Friendly',
        primary: '#F97316',
        secondary: '#FB923C',
        accent: '#FCD34D',
        neutral: '#FFF7ED'
      },
      {
        name: 'Animal Care',
        primary: '#059669',
        secondary: '#34D399',
        accent: '#10B981',
        neutral: '#ECFDF5'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-orange-200 hover:border-orange-400',
      button: 'bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all',
      heroBackground: 'bg-gradient-to-b from-orange-50 via-amber-50 to-white',
      sectionBackground: 'bg-gradient-to-b from-white via-orange-50/20 to-white'
    },
    recommendedIcons: ['FaPaw', 'FaDog', 'FaHeart', 'FaPills', 'FaShoppingCart'],
    targetAudience: 'Tutores de pets, famílias com animais, pet lovers',
    tone: 'Carinhoso, confiável, acolhedor, amigável',
    visualStructure: `
      Hero: Foto de animal feliz + mensagem de cuidado e amor pelos pets
      Serviços: Cards coloridos com ícones de pets, preços acessíveis
      Especialidades: Grid de tipos de animais atendidos
      Agendamento: Formulário simples + disponibilidade
      Loja: Grid de produtos para pets
      Galeria: Fotos de pets felizes e saudáveis
    `
  },
  
  // ==========================================
  // FOTOGRAFIA / ESTÚDIO
  // ==========================================
  'fotografia': {
    sectorName: 'Fotografia',
    heroStyle: 'fullscreen-image-overlay',
    mandatorySections: ['Portfólio', 'Serviços', 'Sobre', 'Preços', 'Contato'],
    colorSchemes: [
      {
        name: 'Mono Criativo',
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#F5F5F5',
        neutral: '#1A1A1A'
      },
      {
        name: 'Elegante Profissional',
        primary: '#2D2D2D',
        secondary: '#C9A961',
        accent: '#FFFFFF',
        neutral: '#F5F5F5'
      }
    ],
    componentStyles: {
      card: 'bg-black rounded-none overflow-hidden border border-white/10 hover:border-white/30 transition-all',
      button: 'bg-white text-black hover:bg-gray-100 font-bold px-8 py-4 uppercase tracking-wider transition-all',
      heroBackground: 'bg-black',
      sectionBackground: 'bg-black text-white'
    },
    recommendedIcons: ['FaCamera', 'FaImages', 'FaVideo', 'FaEnvelope', 'FaCalendar'],
    targetAudience: 'Casais, noivas, eventos, empresários, famílias',
    tone: 'Artístico, profissional, elegante, emotivo',
    visualStructure: `
      Hero: Foto fullscreen impactante (black & white ou colorida) + texto minimalista sobre fundo escuro
      Portfólio: Masonry layout ou grid com fotos grandes, sem textos, puro visual
      Serviços: Cards escuros com tipo de foto + ícone + exemplo
      Sobre: Foto do fotógrafo + storytelling + equipamentos
      Preços: Tabela clean com pacotes + investimento
      Contato: Formulário simples + redes sociais
    `
  },
  
  // ==========================================
  // ACADEMIA / FITNESS
  // ==========================================
  'academia': {
    sectorName: 'Academia',
    heroStyle: 'fullscreen-image-overlay',
    mandatorySections: ['Modalidades', 'Planos', 'Aulas', 'Instrutores', 'Contato'],
    colorSchemes: [
      {
        name: 'Fitness Strong',
        primary: '#DC2626',
        secondary: '#FBBF24',
        accent: '#000000',
        neutral: '#F3F4F6'
      },
      {
        name: 'Energético',
        primary: '#1E40AF',
        secondary: '#FBBF24',
        accent: '#EF4444',
        neutral: '#FFFFFF'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-red-500',
      button: 'bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg shadow-xl hover:scale-110 transition-all',
      heroBackground: 'bg-gradient-to-b from-red-50 via-orange-50 to-white',
      sectionBackground: 'bg-white'
    },
    recommendedIcons: ['FaDumbbell', 'FaRunning', 'FaFire', 'FaUsers', 'FaTrophy'],
    targetAudience: 'Pessoas fitness, atletas, iniciantes em treino',
    tone: 'Energético, motivador, forte, determinação',
    visualStructure: `
      Hero: Foto fullscreen de treino intenso + overlay escuro + call forte e motivacional
      Modalidades: Grid de atividades (musculação, cardio, yoga, etc.) com fotos
      Planos: Cards comparativos com preços + benefícios
      Aulas: Horários em formato de grade + professores
      Instrutores: Grid de perfis + certificações
      Contato: Formulário + WhatsApp + localização
    `
  },
  
  // ==========================================
  // ESCOLA / EDUCAÇÃO
  // ==========================================
  'escola': {
    sectorName: 'Escola',
    heroStyle: 'grid-2-cols-image-text',
    mandatorySections: ['Metodologia', 'Cursos', 'Professores', 'Depoimentos', 'Matrículas'],
    colorSchemes: [
      {
        name: 'Educacional Confiável',
        primary: '#0369A1',
        secondary: '#38BDF8',
        accent: '#F59E0B',
        neutral: '#F0F9FF'
      },
      {
        name: 'Juvenil Moderno',
        primary: '#7C3AED',
        secondary: '#A78BFA',
        accent: '#FBBF24',
        neutral: '#FAF5FF'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 border-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-all',
      heroBackground: 'bg-gradient-to-b from-blue-50 via-white to-white',
      sectionBackground: 'bg-gradient-to-b from-white via-blue-50/20 to-white'
    },
    recommendedIcons: ['FaBook', 'FaGraduationCap', 'FaChalkboardTeacher', 'FaUserGraduate', 'FaAward'],
    targetAudience: 'Pais, alunos, educadores, responsáveis',
    tone: 'Educativo, confiável, inspirador, progressivo',
    visualStructure: `
      Hero: Crianças/jovens aprendendo + mensagem educacional + início de matrícula
      Metodologia: Grid de métodos de ensino + diferenciais
      Cursos: Grid de grade horária + modalidades
      Professores: Cards com perfis educacionais
      Depoimentos: Avaliações de ex-alunos + pais
      Matrículas: Processo simplificado + contato
    `
  },
  
  // ==========================================
  // CONSTRUTORA / ENGENHARIA
  // ==========================================
  'construtora': {
    sectorName: 'Construtora',
    heroStyle: 'split-screen',
    mandatorySections: ['Projetos', 'Tecnologias', 'Empresa', 'Garantias', 'Orçamento'],
    colorSchemes: [
      {
        name: 'Construtivo',
        primary: '#D97706',
        secondary: '#FBBF24',
        accent: '#DC2626',
        neutral: '#FEF3C7'
      },
      {
        name: 'Profissional',
        primary: '#334155',
        secondary: '#64748B',
        accent: '#F59E0B',
        neutral: '#F8FAFC'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-l-4 border-orange-500',
      button: 'bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-lg shadow-xl transition-all',
      heroBackground: 'bg-gradient-to-b from-orange-50 via-amber-50 to-white',
      sectionBackground: 'bg-white'
    },
    recommendedIcons: ['FaBuilding', 'FaHammer', 'FaTools', 'FaHome', 'FaRuler'],
    targetAudience: 'Possuidores de terreno, investidores, empresários',
    tone: 'Sólido, confiável, profissional, experiência',
    visualStructure: `
      Hero: Obra em construção ou projeto 3D + destaque de experiência
      Projetos: Grid de obras concluídas + fotos antes/depois
      Tecnologias: Grid de materiais, sistemas, certificações
      Empresa: História + números + diferenciais
      Garantias: Certificações + seguros + pós-obra
      Orçamento: Formulário de solicitação + visita técnica
    `
  },
  
  // ==========================================
  // CONSULTORIA / ASSESSORIA
  // ==========================================
  'consultoria': {
    sectorName: 'Consultoria',
    heroStyle: 'centered-minimal',
    mandatorySections: ['Serviços', 'Cases de Sucesso', 'Equipe', 'Metodologia', 'Contato'],
    colorSchemes: [
      {
        name: 'Corporativo Moderno',
        primary: '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#FBBF24',
        neutral: '#EFF6FF'
      },
      {
        name: 'Executivo',
        primary: '#1F2937',
        secondary: '#6B7280',
        accent: '#10B981',
        neutral: '#F9FAFB'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-all',
      heroBackground: 'bg-gradient-to-b from-blue-50 via-white to-white',
      sectionBackground: 'bg-white'
    },
    recommendedIcons: ['FaChartLine', 'FaBriefcase', 'FaUsers', 'FaLightbulb', 'FaHandshake'],
    targetAudience: 'Empresários, CEOs, gestores, startups',
    tone: 'Profissional, estratégico, eficiente, resultados',
    visualStructure: `
      Hero: Fundo clean com gráficos/ícones + proposição de valor clara + call objetiva
      Serviços: Cards de consultoria + benefícios + ROI
      Cases: Grid de resultados + métricas + depoimentos
      Equipe: Perfis de consultores + expertise
      Metodologia: Processo passo a passo + ferramentas
      Contato: Formulário B2B + reunião agendada
    `
  },
  
  // ==========================================
  // ONG / INSTITUIÇÃO
  // ==========================================
  'ong': {
    sectorName: 'ONG',
    heroStyle: 'fullscreen-image-overlay',
    mandatorySections: ['Nossa Causa', 'Projetos', 'Como Ajudar', 'Impacto', 'Doações'],
    colorSchemes: [
      {
        name: 'Humano',
        primary: '#059669',
        secondary: '#34D399',
        accent: '#F59E0B',
        neutral: '#ECFDF5'
      },
      {
        name: 'Esperança',
        primary: '#DC2626',
        secondary: '#FCA5A5',
        accent: '#FBBF24',
        neutral: '#FEF2F2'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-green-500',
      button: 'bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:scale-105 transition-all',
      heroBackground: 'bg-gradient-to-b from-green-50 via-white to-white',
      sectionBackground: 'bg-gradient-to-b from-white via-green-50/20 to-white'
    },
    recommendedIcons: ['FaHeart', 'FaHandsHelping', 'FaUsers', 'FaDollarSign', 'FaGlobe'],
    targetAudience: 'Doadores, voluntários, apoiadores, empresas',
    tone: 'Compassivo, inspirador, transparente, impacto',
    visualStructure: `
      Hero: Foto emotiva da causa + mensagem inspiradora + call forte para doação
      Nossa Causa: História da ONG + problema + solução
      Projetos: Grid de ações + impacto + beneficiados
      Como Ajudar: Cards de doação/voluntariado/apadrinhamento
      Impacto: Números e métricas + transformações reais
      Doações: Processo simples + transparência + divulgação
    `
  },
  
  // ==========================================
  // EVENTOS / FESTAS
  // ==========================================
  'eventos': {
    sectorName: 'Eventos',
    heroStyle: 'fullscreen-image-overlay',
    mandatorySections: ['Tipos de Eventos', 'Galeria', 'Pacotes', 'Sobre', 'Contato'],
    colorSchemes: [
      {
        name: 'Festivo',
        primary: '#DB2777',
        secondary: '#F472B6',
        accent: '#FBBF24',
        neutral: '#FCE7F3'
      },
      {
        name: 'Elegante',
        primary: '#1E293B',
        secondary: '#475569',
        accent: '#D4AF37',
        neutral: '#F1F5F9'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-pink-200 hover:border-pink-500',
      button: 'bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:scale-110 transition-all',
      heroBackground: 'bg-gradient-to-b from-pink-50 via-purple-50 to-white',
      sectionBackground: 'bg-gradient-to-b from-white via-pink-50/20 to-white'
    },
    recommendedIcons: ['FaBirthdayCake', 'FaGlassCheers', 'FaCamera', 'FaMusic', 'FaCalendar'],
    targetAudience: 'Casais, aniversariantes, empresas, famílias',
    tone: 'Celebração, felicidade, sofisticado, memorável',
    visualStructure: `
      Hero: Foto de evento grandioso + overlay gradiente + mensagem celebrativa
      Tipos: Grid de categorias (aniversários, casamentos, corporativos)
      Galeria: Masonry layout ou grid com fotos impactantes
      Pacotes: Cards comparativos + itens incluídos + preços
      Sobre: História + equipe + diferenciais
      Contato: Formulário + WhatsApp + localização
    `
  },
  
  // ==========================================
  // DEFAULT (Quando setor não identificado)
  // ==========================================
  'default': {
    sectorName: 'Empresa',
    heroStyle: 'centered-minimal',
    mandatorySections: ['Sobre', 'Serviços', 'Contato'],
    colorSchemes: [
      {
        name: 'Corporativo Profissional',
        primary: '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#60A5FA',
        neutral: '#F8FAFC'
      }
    ],
    componentStyles: {
      card: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all',
      button: 'bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg transition-all',
      heroBackground: 'bg-gradient-to-b from-blue-50 via-white to-white',
      sectionBackground: 'bg-white'
    },
    recommendedIcons: ['FaBuilding', 'FaPhone', 'FaEnvelope', 'FaMapMarkerAlt'],
    targetAudience: 'Clientes, parceiros, público geral',
    tone: 'Profissional, confiável, moderno',
    visualStructure: `
      Hero: Layout clean centralizado + valor da empresa
      Sobre: História + missão + valores
      Serviços: Grid de serviços/produtos
      Contato: Formulário + informações
    `
  }
};

/**
 * Busca o padrão de layout para um setor específico
 */
export function getSectorLayout(sectorName: string): SectorLayoutPattern {
  // Normalizar nome do setor
  const normalized = sectorName.toLowerCase().trim();
  
  // Buscar correspondência exata
  if (sectorLayouts[normalized]) {
    return sectorLayouts[normalized];
  }
  
  // Buscar correspondência parcial
  for (const [key, layout] of Object.entries(sectorLayouts)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return layout;
    }
  }
  
  // Retornar padrão se não encontrar
  return sectorLayouts.default;
}

/**
 * Gera instruções de layout baseadas no setor para uso no prompt da IA
 */
export function generateSectorInstructions(sectorName: string, companyName: string): string {
  const layout = getSectorLayout(sectorName);
  const colorScheme = layout.colorSchemes[0]; // Usar primeira paleta
  
  return `
### 🎯 LAYOUT ESPECÍFICO PARA "${layout.sectorName}" - OBRIGATÓRIO SEGUIR

**ESTRUTURA VISUAL:**
${layout.visualStructure}

**SEÇÕES OBRIGATÓRIAS (Crie TODAS estas seções em ordem):**
${layout.mandatorySections.map(s => `- ${s}`).join('\n')}

**ESQUEMA DE CORES RECOMENDADO:**
- Primary: ${colorScheme.primary} (botões principais, títulos, elementos de destaque)
- Secondary: ${colorScheme.secondary} (botões secundários, destaques)
- Accent: ${colorScheme.accent} (hover states, badges, elementos especiais)
- Neutral: ${colorScheme.neutral} (backgrounds, textos secundários)

**ESTILOS DE COMPONENTES:**
- Cards: ${layout.componentStyles.card}
- Botões: ${layout.componentStyles.button}
- Hero Background: ${layout.componentStyles.heroBackground}
- Section Background: ${layout.componentStyles.sectionBackground}

**ÍCONES RECOMENDADOS (use react-icons):**
import { ${layout.recommendedIcons.join(', ')} } from 'react-icons/fa'

**PÚBLICO-ALVO:** ${layout.targetAudience}
**TOM DE VOZ:** ${layout.tone}

**CRÍTICO:** Este site é ESPECÍFICO para ${companyName} no setor ${sectorName}. 
Crie um layout ÚNICO que reflita estas características!
`;
}

