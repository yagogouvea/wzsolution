/**
 * Biblioteca de Templates e Componentes Reutilizáveis
 * 
 * Esta biblioteca fornece templates pré-definidos e componentes que a IA pode usar
 * ao gerar layouts de sites. Os templates são organizados por setor e funcionalidade.
 * 
 * ⚠️ IMPORTANTE: Use sempre react-icons ao invés de emojis nos templates.
 * Exemplo: import { FaCut, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
 */

export interface Template {
  name: string;
  description: string;
  category: string;
  code: string;
  tags: string[];
}

export interface Component {
  name: string;
  description: string;
  code: string;
  props?: Record<string, string>;
}

/**
 * TEMPLATES POR SETOR
 */
export const sectorTemplates: Record<string, Template[]> = {
  barbearia: [
    {
      name: "Hero Section Retro",
      description: "Seção hero para barbearia com estilo retrô",
      category: "hero",
      code: `
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              {companyName}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Tradição e estilo masculino desde {new Date().getFullYear()}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Agendar Corte
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-black text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Ver Serviços
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "retro", "dark", "cta"]
    },
    {
      name: "Services Grid",
      description: "Grid de serviços para barbearia",
      category: "services",
      code: `
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Nossos Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mb-4">
                    {/* Use react-icons: import { FaCut } from 'react-icons/fa' */}
                    <span className="text-3xl">✂️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="text-2xl font-bold text-yellow-600">R$ {service.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      `,
      tags: ["services", "grid", "pricing"]
    }
  ],
  
  restaurante: [
    {
      name: "Hero Section Gourmet",
      description: "Hero elegante para restaurante",
      category: "hero",
      code: `
        <section className="relative bg-gradient-to-r from-red-700 to-red-900 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-serif mb-4">{companyName}</h1>
            <p className="text-xl text-red-100 mb-8">Culinária autêntica e sofisticada</p>
            <button className="bg-white text-red-700 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Ver Cardápio
            </button>
          </div>
        </section>
      `,
      tags: ["hero", "gourmet", "elegant"]
    },
    {
      name: "Menu Card",
      description: "Card de item do menu",
      category: "menu",
      code: `
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Nome do Prato</h3>
            <p className="text-gray-600 mb-4">Descrição do prato...</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-red-600">R$ 45,00</span>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Pedir
              </button>
            </div>
          </div>
        </div>
      `,
      tags: ["menu", "card", "food"]
    }
  ],
  
  clinica: [
    {
      name: "Hero Section Médica",
      description: "Hero profissional para clínica",
      category: "hero",
      code: `
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
                <p className="text-xl text-blue-100 mb-8">Cuidando da sua saúde com excelência</p>
                <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                  Agendar Consulta
                </button>
              </div>
              <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4">Horários de Atendimento</h3>
                <p className="text-lg mb-2">Segunda a Sexta: 8h - 18h</p>
                <p className="text-lg">Sábado: 8h - 12h</p>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "medical", "professional"]
    }
  ],
  
  imobiliaria: [
    {
      name: "Hero Section Imobiliária",
      description: "Hero para imobiliária com busca de imóveis",
      category: "hero",
      code: `
        <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">{companyName}</h1>
            <p className="text-xl text-center text-blue-100 mb-12">Encontre o imóvel dos seus sonhos</p>
            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-4">
                <select className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900">
                  <option>Tipo</option>
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Terreno</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900">
                  <option>Cidade</option>
                </select>
                <input type="text" placeholder="Bairro" className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900" />
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "real-estate", "search"]
    }
  ],
  
  academia: [
    {
      name: "Hero Section Academia",
      description: "Hero energético para academia",
      category: "hero",
      code: `
        <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6">{companyName}</h1>
            <p className="text-2xl mb-8">Transforme seu corpo. Transforme sua vida.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-red-600 hover:bg-gray-100 font-bold px-10 py-5 rounded-lg text-lg transition-colors">
                Faça sua Matrícula
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-red-600 font-bold px-10 py-5 rounded-lg text-lg transition-colors">
                Conheça Nossos Planos
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "fitness", "energetic"]
    }
  ],
  
  advogacia: [
    {
      name: "Hero Section Advocacia",
      description: "Hero sóbrio e profissional para escritório de advocacia",
      category: "hero",
      code: `
        <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
                <p className="text-xl text-gray-300 mb-8">Defendendo seus direitos com excelência e comprometimento</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                  Agende uma Consulta
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">+15 anos</h3>
                  <p className="text-gray-300">de experiência</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">+500 casos</h3>
                  <p className="text-gray-300">resolvidos com sucesso</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "legal", "professional", "sober"]
    }
  ],
  
  ecommerce: [
    {
      name: "Hero Section E-commerce",
      description: "Hero para loja online",
      category: "hero",
      code: `
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
            <p className="text-xl mb-8">As melhores ofertas estão aqui!</p>
            <button className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-lg text-lg transition-colors">
              Ver Produtos
            </button>
          </div>
        </section>
      `,
      tags: ["hero", "ecommerce", "vibrant"]
    },
    {
      name: "Product Card",
      description: "Card de produto para e-commerce",
      category: "product",
      code: `
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
          <div className="relative h-64 bg-gray-200">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.discount && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                -{product.discount}%
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2 text-gray-900">{product.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-purple-600">R$ {product.price}</span>
              {product.oldPrice && (
                <span className="text-gray-400 line-through">R$ {product.oldPrice}</span>
              )}
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors">
              Comprar
            </button>
          </div>
        </div>
      `,
      tags: ["product", "card", "ecommerce"]
    }
  ],
  
  petshop: [
    {
      name: "Hero Section Pet Shop",
      description: "Hero alegre e colorido para pet shop",
      category: "hero",
      code: `
        <section className="bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
            <p className="text-xl mb-8">Cuidando do seu melhor amigo com carinho e dedicação</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-green-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Ver Produtos
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-green-600 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Agendar Banho
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "pet", "colorful", "friendly"]
    },
    {
      name: "Service Card Pet",
      description: "Card de serviço para pet shop",
      category: "services",
      code: `
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Banho e Tosa</h3>
          <p className="text-gray-600 mb-4">Serviço completo de higiene para seu pet</p>
          <div className="text-2xl font-bold text-green-600 mb-4">A partir de R$ 45</div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors">
            Agendar
          </button>
        </div>
      `,
      tags: ["service", "pet", "card"]
    }
  ],
  
  veterinaria: [
    {
      name: "Hero Section Veterinária",
      description: "Hero profissional para clínica veterinária",
      category: "hero",
      code: `
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
                <p className="text-xl text-green-100 mb-8">Cuidado veterinário completo para seu pet</p>
                <div className="space-y-4">
                  <button className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                    Agendar Consulta
                  </button>
                  <button className="block border-2 border-white hover:bg-white hover:text-green-600 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                    Emergência 24h
                  </button>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4">Serviços Disponíveis</h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center">
                    <span className="mr-3">✓</span>
                    Consultas Clínicas
                  </li>
                  <li className="flex items-center">
                    <span className="mr-3">✓</span>
                    Vacinação
                  </li>
                  <li className="flex items-center">
                    <span className="mr-3">✓</span>
                    Cirurgias
                  </li>
                  <li className="flex items-center">
                    <span className="mr-3">✓</span>
                    Exames Laboratoriais
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "veterinary", "medical", "professional"]
    }
  ],
  
  escola: [
    {
      name: "Hero Section Escola",
      description: "Hero educacional e acolhedor",
      category: "hero",
      code: `
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
            <p className="text-xl mb-8 text-blue-100">Educando para o futuro com excelência e dedicação</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Matrículas Abertas
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-blue-600 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Conheça Nossa Escola
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "education", "welcoming"]
    },
    {
      name: "Course Card",
      description: "Card de curso/disciplina",
      category: "courses",
      code: `
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
          <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-400"></div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Matemática Avançada</h3>
            <p className="text-gray-600 mb-4">Desenvolva habilidades matemáticas fundamentais</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">15-17 anos</span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      `,
      tags: ["course", "education", "card"]
    }
  ],
  
  eventos: [
    {
      name: "Hero Section Eventos",
      description: "Hero vibrante para eventos e festas",
      category: "hero",
      code: `
        <section className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6">{companyName}</h1>
            <p className="text-2xl mb-8 text-pink-100">Transformamos seus momentos em memórias inesquecíveis</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-10 py-5 rounded-lg text-lg transition-colors">
                Solicitar Orçamento
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-purple-600 font-bold px-10 py-5 rounded-lg text-lg transition-colors">
                Ver Portfólio
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "events", "vibrant", "celebratory"]
    },
    {
      name: "Event Package Card",
      description: "Card de pacote de evento",
      category: "packages",
      code: `
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Pacote Completo</h3>
            <div className="text-4xl font-bold text-purple-600 mb-4">R$ 2.500</div>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-3">✓</span>
              Decoração completa
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-3">✓</span>
              Som e iluminação
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-3">✓</span>
              Buffet incluso
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-3">✓</span>
              Fotografia profissional
            </li>
          </ul>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
            Contratar Pacote
          </button>
        </div>
      `,
      tags: ["package", "events", "pricing"]
    }
  ],
  
  fotografia: [
    {
      name: "Hero Section Fotografia",
      description: "Hero elegante para estúdio de fotografia",
      category: "hero",
      code: `
        <section className="relative bg-black text-white py-24 px-4">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black"></div>
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-light mb-6 tracking-tight">{companyName}</h1>
            <p className="text-xl mb-8 text-gray-300 italic">Capturando momentos únicos com arte e técnica</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Ver Portfólio
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-black font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                Agendar Sessão
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "photography", "elegant", "minimalist"]
    },
    {
      name: "Portfolio Grid",
      description: "Grid de portfólio para fotografia",
      category: "portfolio",
      code: `
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Nossos Trabalhos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item, index) => (
                <div key={index} className="group relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-200">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      `,
      tags: ["portfolio", "gallery", "photography"]
    }
  ],
  
  construtora: [
    {
      name: "Hero Section Construtora",
      description: "Hero sólido e confiável para construtora",
      category: "hero",
      code: `
        <section className="bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-700 text-white py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
                <p className="text-xl text-orange-100 mb-8">Construindo sonhos com qualidade e comprometimento</p>
                <button className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
                  Solicitar Orçamento
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-4xl font-bold mb-2">+{years}</div>
                  <div className="text-orange-100">Anos no mercado</div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-4xl font-bold mb-2">+{projects}</div>
                  <div className="text-orange-100">Projetos entregues</div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-4xl font-bold mb-2">{satisfaction}%</div>
                  <div className="text-orange-100">Satisfação</div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-orange-100">Suporte</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "construction", "solid", "reliable"]
    },
    {
      name: "Project Showcase",
      description: "Showcase de projetos de construção",
      category: "projects",
      code: `
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Nossos Projetos</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{project.name}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{project.location}</span>
                      <span className="text-sm font-semibold text-orange-600">{project.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      `,
      tags: ["projects", "construction", "showcase"]
    }
  ],
  
  consultoria: [
    {
      name: "Hero Section Consultoria",
      description: "Hero profissional e moderno para consultoria",
      category: "hero",
      code: `
        <section className="bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
            <p className="text-xl mb-8 text-gray-300">Consultoria estratégica para transformar seu negócio</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-lg text-lg transition-colors">
                Agendar Consulta
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-slate-800 font-bold px-10 py-4 rounded-lg text-lg transition-colors">
                Nossos Serviços
              </button>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "consulting", "professional", "modern"]
    },
    {
      name: "Service Card Consultoria",
      description: "Card de serviço de consultoria",
      category: "services",
      code: `
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Consultoria Estratégica</h3>
          <p className="text-gray-700 mb-6">
            Análise profunda do seu negócio e desenvolvimento de estratégias personalizadas.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center text-gray-700">
              <span className="text-blue-600 mr-2">✓</span>
              Análise de mercado
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-blue-600 mr-2">✓</span>
              Planejamento estratégico
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-blue-600 mr-2">✓</span>
              Acompanhamento mensal
            </li>
          </ul>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
            Saiba Mais
          </button>
        </div>
      `,
      tags: ["service", "consulting", "card"]
    }
  ],
  
  ong: [
    {
      name: "Hero Section ONG",
      description: "Hero empático e inspirador para ONG",
      category: "hero",
      code: `
        <section className="bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 text-white py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{companyName}</h1>
            <p className="text-xl mb-8 text-green-50">Transformando vidas através da solidariedade e ação</p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button className="bg-white text-green-600 hover:bg-green-50 font-bold px-10 py-4 rounded-lg text-lg transition-colors">
                Fazer Doação
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-green-600 font-bold px-10 py-4 rounded-lg text-lg transition-colors">
                Seja Voluntário
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">+{people}</div>
                <div className="text-sm text-green-50">Pessoas Ajudadas</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">+{projects}</div>
                <div className="text-sm text-green-50">Projetos Ativos</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">+{volunteers}</div>
                <div className="text-sm text-green-50">Voluntários</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">{years}</div>
                <div className="text-sm text-green-50">Anos de Atuação</div>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ["hero", "ngo", "empathetic", "inspiring"]
    },
    {
      name: "Donation Card",
      description: "Card para doações",
      category: "donation",
      code: `
        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Doe Agora</h3>
          <p className="text-gray-600 mb-6">
            Sua doação faz toda a diferença. Cada contribuição ajuda a transformar vidas.
          </p>
          <div className="space-y-3 mb-6">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
              R$ 25
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
              R$ 50
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
              R$ 100
            </button>
          </div>
          <input type="number" placeholder="Outro valor" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
            Confirmar Doação
          </button>
        </div>
      `,
      tags: ["donation", "ngo", "charity"]
    },
    {
      name: "Impact Stories",
      description: "Seção de histórias de impacto",
      category: "stories",
      code: `
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Histórias de Impacto</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {stories.map((story, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">{story.emoji}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{story.title}</h3>
                  <p className="text-gray-700 mb-4">{story.description}</p>
                  <div className="text-sm text-gray-500">— {story.person}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      `,
      tags: ["stories", "ngo", "impact"]
    }
  ]
};

/**
 * COMPONENTES REUTILIZÁVEIS
 */
export const reusableComponents: Component[] = [
  {
    name: "Navbar",
    description: "Barra de navegação responsiva",
    code: `
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-10" />
              <span className="ml-3 text-xl font-bold text-gray-900">{companyName}</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Início</a>
              <a href="#sobre" className="text-gray-700 hover:text-blue-600 transition-colors">Sobre</a>
              <a href="#servicos" className="text-gray-700 hover:text-blue-600 transition-colors">Serviços</a>
              <a href="#contato" className="text-gray-700 hover:text-blue-600 transition-colors">Contato</a>
            </div>
            <button className="md:hidden text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    `
  },
  
  {
    name: "Footer",
    description: "Rodapé com informações de contato",
    code: `
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{companyName}</h3>
            <p className="text-gray-400">Descrição da empresa...</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contato</h3>
            <p className="text-gray-400 mb-2">📍 Endereço</p>
            <p className="text-gray-400 mb-2">📞 Telefone</p>
            <p className="text-gray-400">✉️ Email</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; ${new Date().getFullYear()} {companyName}. Todos os direitos reservados.</p>
        </div>
      </footer>
    `
  },
  
  {
    name: "Contact Form",
    description: "Formulário de contato responsivo",
    code: `
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">Entre em Contato</h2>
          <form className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Nome</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Mensagem</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>
    `
  },
  
  {
    name: "Testimonials Premium",
    description: "Seção de depoimentos em cards ilustrativos com aspas e estrelas",
    code: `
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">O Que Nossos Clientes Dizem</h2>
            <p className="text-xl text-gray-600">Depoimentos reais de quem confia em nossos serviços</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-xl p-8 relative hover:shadow-2xl hover:scale-[1.02] transition-all border border-gray-100"
              >
                {/* Ícone de Aspas Decorativo */}
                <div className="absolute top-4 right-4 text-blue-400 text-6xl font-serif opacity-20">
                  "
                </div>
                
                {/* Estrelas */}
                <div className="flex mb-4">
                  {/* Use react-icons: import { FaStar } from 'react-icons/fa' */}
                  <span className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</span>
                </div>
                
                {/* Texto do Depoimento */}
                <p className="text-gray-700 mb-6 leading-relaxed text-lg relative z-10">
                  "{testimonial.text}"
                </p>
                
                {/* Informações do Cliente */}
                <div className="flex items-center pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Features Grid",
    description: "Grid de características/diferenciais",
    code: `
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Por que escolher {companyName}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Qualidade</h3>
              <p className="text-gray-600">Serviços de alta qualidade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Rapidez</h3>
              <p className="text-gray-600">Atendimento rápido e eficiente</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💯</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Experiência</h3>
              <p className="text-gray-600">Anos de experiência no mercado</p>
            </div>
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "WhatsApp Button",
    description: "Botão flutuante do WhatsApp",
    code: `
      <a 
        href="https://wa.me/5511999999999?text=Olá!" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg z-50 transition-all hover:scale-110"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    `
  },
  
  {
    name: "Pricing Table",
    description: "Tabela de preços",
    code: `
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Nossos Planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const featuredClasses = plan.featured ? 'ring-2 ring-blue-500 scale-105' : '';
              return (
              <div key={index} className={"bg-white rounded-xl shadow-lg p-8 " + featuredClasses}>
                {plan.featured && (
                  <div className="bg-blue-500 text-white text-center py-2 rounded-t-lg -mt-8 -mx-8 mb-4">
                    <span className="font-bold">Mais Popular</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={"w-full py-3 rounded-lg font-bold transition-colors " + (
                  plan.featured 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                )}>
                  Escolher Plano
                </button>
              </div>
              );
            })}
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Gallery",
    description: "Galeria de imagens responsiva",
    code: `
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Galeria</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "About Section",
    description: "Seção sobre a empresa",
    code: `
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Sobre Nós</h2>
              <p className="text-lg text-gray-700 mb-4">
                A {companyName} é uma empresa dedicada a proporcionar os melhores serviços 
                com qualidade e comprometimento.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Com anos de experiência no mercado, nos destacamos pela excelência 
                e pelo cuidado com cada detalhe.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600">+{years}+</div>
                  <div className="text-gray-600">Anos de Experiência</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">+{clients}+</div>
                  <div className="text-gray-600">Clientes Satisfeitos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">+{projects}+</div>
                  <div className="text-gray-600">Projetos Realizados</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-square"></div>
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Team Section",
    description: "Seção de equipe",
    code: `
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-gray-600 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4">
                  <a href={member.linkedin} className="text-blue-600 hover:text-blue-700">LinkedIn</a>
                  <a href={member.email} className="text-gray-600 hover:text-gray-700">Email</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Stats Counter",
    description: "Contadores de estatísticas",
    code: `
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">+{stat1.value}</div>
              <div className="text-blue-100">{stat1.label}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">+{stat2.value}</div>
              <div className="text-blue-100">{stat2.label}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{stat3.value}%</div>
              <div className="text-blue-100">{stat3.label}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">+{stat4.value}</div>
              <div className="text-blue-100">{stat4.label}</div>
            </div>
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "FAQ Section Premium",
    description: "Seção de perguntas frequentes em cards ilustrativos",
    code: `
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre nossos serviços</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 pr-8">{faq.question}</h3>
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Timeline Section",
    description: "Linha do tempo de processos ou histórico",
    code: `
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Como Funciona</h2>
          <div className="relative">
            {steps.map((step, index) => (
              <div key={index} className="flex mb-8">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "CTA Section",
    description: "Seção de call-to-action",
    code: `
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Entre em contato conosco hoje e descubra como podemos ajudar você.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Entrar em Contato
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-blue-600 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Ver Mais Informações
            </button>
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Map Section Premium",
    description: "Seção com mapa e endereço em cards ilustrativos",
    code: `
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Nossa Localização</h2>
            <p className="text-xl text-gray-600">Venha nos visitar ou entre em contato</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card de Endereço */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  {/* Use react-icons: import { FaMapMarkerAlt } from 'react-icons/fa' */}
                  <span className="text-white text-2xl">📍</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Endereço</h3>
              </div>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 flex items-center">
                  <span className="mr-3">🏢</span>
                  Rua Exemplo, 123 - Sala 45
                </p>
                <p className="text-lg text-gray-700 flex items-center">
                  <span className="mr-3">🏙️</span>
                  Bairro Centro, Cidade - Estado
                </p>
                <p className="text-lg text-gray-700 flex items-center">
                  <span className="mr-3">📮</span>
                  CEP: 12345-678
                </p>
                <div className="pt-4 border-t border-gray-200 mt-6">
                  <p className="text-lg text-gray-700 mb-2 flex items-center">
                    {/* Use react-icons: import { FaPhone } from 'react-icons/fa' */}
                    <span className="mr-3">📞</span>
                    (11) 99999-9999
                  </p>
                  <p className="text-lg text-gray-700 flex items-center">
                    <span className="mr-3">✉️</span>
                    contato@empresa.com
                  </p>
                </div>
                <a 
                  href="https://maps.google.com" 
                  target="_blank"
                  className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  {/* Use react-icons: import { FaMapMarkerAlt } from 'react-icons/fa' */}
                  📍 Como Chegar no Google Maps
                </a>
              </div>
            </div>
            {/* Card do Mapa */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="h-full min-h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1973537323445!2d-46.63330938440628!3d-23.5508667846887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    `
  },
  
  {
    name: "Blog Grid",
    description: "Grid de posts de blog",
    code: `
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Últimas Notícias</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900">{post.title}</h3>
                  <p className="text-gray-700 mb-4">{post.excerpt}</p>
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Ler mais →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    `
  }
];

/**
 * Função auxiliar para obter templates por setor
 */
export function getTemplatesBySector(sector: string): Template[] {
  const normalizedSector = sector.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[áàâã]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úùû]/g, 'u')
    .replace(/ç/g, 'c');
  
  return sectorTemplates[normalizedSector] || [];
}

/**
 * Função auxiliar para obter todos os componentes reutilizáveis
 */
export function getAllReusableComponents(): Component[] {
  return reusableComponents;
}

/**
 * Gera prompt com templates e componentes para a IA
 */
export function generateTemplatesPrompt(
  sector: string,
  functionalities: string[]
): string {
  const sectorTemplatesList = getTemplatesBySector(sector);
  const allComponents = getAllReusableComponents();
  
  let prompt = `\n### 📚 BIBLIOTECA DE TEMPLATES E COMPONENTES DISPONÍVEIS:\n\n`;
  
  if (sectorTemplatesList.length > 0) {
    prompt += `**Templates específicos para ${sector}:**\n`;
    sectorTemplatesList.forEach((template, index) => {
      prompt += `${index + 1}. ${template.name}: ${template.description}\n`;
      prompt += `   Código exemplo:\n${template.code}\n\n`;
    });
  }
  
  prompt += `**Componentes reutilizáveis disponíveis:**\n`;
  allComponents.forEach((component, index) => {
    prompt += `${index + 1}. ${component.name}: ${component.description}\n`;
    if (component.code) {
      // Mostrar apenas parte do código para não sobrecarregar o prompt
      const codePreview = component.code.substring(0, 200) + '...';
      prompt += `   Exemplo:\n${codePreview}\n\n`;
    }
  });
  
  prompt += `\n**INSTRUÇÕES:**\n`;
  prompt += `- Use os templates acima como referência, mas adapte às cores e estilo do projeto\n`;
  prompt += `- Combine múltiplos componentes para criar páginas completas\n`;
  prompt += `- Mantenha consistência visual usando as mesmas classes Tailwind\n`;
  prompt += `- Adapte textos e imagens para o contexto específico do cliente\n`;
  
  return prompt;
}

