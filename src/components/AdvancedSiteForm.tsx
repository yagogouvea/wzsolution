"use client";

import { useMemo, useState } from "react";

interface AdvancedSiteFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

// Setores com presets
const sectorOptions = [
  "Barbearia", "Salão de Beleza", "Restaurante", "Pizzaria", "Cafeteria", "Hamburgueria", "Padaria",
  "Clínica Médica", "Clínica Odontológica", "Psicologia", "Nutrição", "Fisioterapia",
  "Academia", "Personal Trainer", "Yoga/Pilates",
  "Imobiliária", "Construtora", "Arquitetura", "Engenharia",
  "Pet Shop", "Veterinária",
  "E-commerce", "Roupas/Moda", "Eletrônicos", "Móveis",
  "Educação/Curso", "Escola/Colégio", "Curso Online",
  "Tecnologia/SaaS", "Marketing/Agência", "Consultoria",
  "Eventos", "Fotografia/Filmagem",
  "Hotel/Pousada", "Turismo/Viagens",
  "Auto Center", "Oficina Mecânica",
  "Direito/Advocacia",
  "Contabilidade",
  "ONG/Instituição"
];

// Funcionalidades por setor (sugestões)
const featurePresets: Record<string, string[]> = {
  "Barbearia": ["whatsapp", "booking", "testimonials", "gallery", "social-media"],
  "Restaurante": ["menu", "reservation", "map", "whatsapp", "gallery"],
  "Clínica Médica": ["booking", "contact-form", "map", "faq", "team"],
  "E-commerce": ["ecommerce", "search", "categories", "payments", "cart"],
  "Imobiliária": ["property-list", "filters", "map", "contact-form", "whatsapp"],
  "Academia": ["plans", "schedule", "testimonials", "whatsapp", "gallery"],
};

// Catálogo de funcionalidades gerais
const featureCatalog = [
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "contact-form", label: "📝 Formulário de Contato" },
  { value: "booking", label: "📅 Agendamento" },
  { value: "newsletter", label: "📧 Newsletter" },
  { value: "faq", label: "❓ FAQ" },
  { value: "testimonials", label: "⭐ Depoimentos" },
  { value: "gallery", label: "🖼️ Galeria" },
  { value: "map", label: "📍 Mapa" },
  { value: "social-media", label: "📱 Redes Sociais" },
  { value: "blog", label: "📰 Blog" },
  { value: "ecommerce", label: "🛒 Loja Online" },
  { value: "chat", label: "💬 Chat Online" },
  { value: "search", label: "🔎 Busca" },
  { value: "categories", label: "🏷️ Categorias" },
  { value: "payments", label: "💳 Pagamentos" },
  { value: "cart", label: "🛍️ Carrinho" },
  { value: "property-list", label: "🏠 Imóveis" },
  { value: "filters", label: "🎚️ Filtros" },
  { value: "menu", label: "📜 Cardápio" },
  { value: "reservation", label: "📆 Reserva" },
  { value: "plans", label: "📊 Planos" },
  { value: "schedule", label: "🕒 Agenda" },
  { value: "team", label: "👥 Equipe" },
];

const themeOptions = [
  { value: "moderno-clean", label: "✨ Moderno & Clean" },
  { value: "corporativo-elegante", label: "🏢 Corporativo" },
  { value: "criativo-artistico", label: "🎨 Criativo" },
  { value: "retro-vintage", label: "📻 Retrô & Vintage" },
  { value: "dark-misterioso", label: "🌙 Dark" },
  { value: "luxury-premium", label: "💎 Premium" },
  { value: "minimalista-zen", label: "🧘 Minimalista" },
  { value: "industrial-urbano", label: "🏭 Industrial" },
  { value: "gradient-colorful", label: "🌈 Gradiente" },
];


const pagesCatalog = [
  { value: "home", label: "🏠 Home" },
  { value: "sobre", label: "👥 Sobre" },
  { value: "servicos", label: "⚙️ Serviços" },
  { value: "produtos", label: "📦 Produtos" },
  { value: "depoimentos", label: "💬 Depoimentos" },
  { value: "galeria", label: "🖼️ Galeria" },
  { value: "blog", label: "📰 Blog" },
  { value: "faq", label: "❓ FAQ" },
  { value: "contato", label: "📞 Contato" },
  { value: "localizacao", label: "📍 Localização" },
  { value: "precos", label: "💰 Preços" },
  { value: "equipe", label: "👨‍👩‍👧‍👦 Equipe" },
];

export default function AdvancedSiteForm({ onSubmit, onCancel }: AdvancedSiteFormProps) {
  // Empresa
  const [companyName, setCompanyName] = useState("");
  
  const [slogan, setSlogan] = useState("");
  const [sector, setSector] = useState("");

  // Identidade Visual
  const [hasLogo, setHasLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [useLogoColors, setUseLogoColors] = useState(true);
  const [colors, setColors] = useState<string[]>(["#1e3a8a"]);
  const [siteTheme, setSiteTheme] = useState("");
  const [fontStyle] = useState("");

  // Objetivos
  const [mainObjective, setMainObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("moderno e confiante");
  const [ctaText, setCtaText] = useState("");

  // Estrutura
  const [siteStructure, setSiteStructure] = useState<'multiple_pages' | 'single_page'>("multiple_pages");
  const [selectedPages, setSelectedPages] = useState<string[]>(["home", "sobre", "servicos", "contato"]);
  const [customPageTitles, setCustomPageTitles] = useState<string[]>([]);

  // Funcionalidades
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["whatsapp", "contact-form"]);

  // Conteúdo
  const [hasContent, setHasContent] = useState(false);
  const [hasAiGeneratedText, setHasAiGeneratedText] = useState(true);
  const [inspirationSites, setInspirationSites] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");

  // Avançado
  const [animationLevel, setAnimationLevel] = useState("moderado");
  const [avoidStyles, setAvoidStyles] = useState("");

  // Presets por setor
  const sectorFeaturePreset = useMemo(() => featurePresets[sector] || [], [sector]);

  // Removido seletor de fontes (usaremos padrão do tema)

  const toggleFromArray = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleAddCustomPage = (title: string) => {
    const t = title.trim();
    if (!t) return;
    setCustomPageTitles((prev) => [...prev, t]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      companyName,
      slogan,
      businessSector: sector,
      hasLogo,
      logoFile,
      useLogoColors,
      preferredColors: colors,
      siteTheme,
      fontStyle,
      mainObjective,
      targetAudience,
      tone_of_voice: toneOfVoice,
      ctaText,
      siteStructure,
      selectedPages,
      customPageTitles,
      desiredFeatures: Array.from(new Set([...selectedFeatures, ...sectorFeaturePreset])),
      hasContent,
      hasAiGeneratedText,
      inspirationSites,
      additionalPrompt,
      animationLevel,
      avoidStyles,
    };

    onSubmit(data);
  };

  const ColorSwatch = ({ c }: { c: string }) => (
    <button
      type="button"
      onClick={() => toggleFromArray(colors, setColors, c)}
      className={`w-8 h-8 rounded-md border ${colors.includes(c) ? "ring-2 ring-white" : "border-slate-600"}`}
      style={{ backgroundColor: c }}
      title={c}
    />
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-semibold">Formulário Avançado • Briefing Completo</h3>
          <button onClick={onCancel} className="px-3 py-1 bg-slate-700 rounded text-white">Fechar</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Empresa */}
          <section>
            <h4 className="text-white font-semibold mb-3">🏢 Empresa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Nome da empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Slogan (opcional)" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Setor de atuação (digitação livre)" value={sector} onChange={(e) => setSector(e.target.value)} required />
            </div>
          </section>

          {/* Identidade Visual */}
          <section>
            <h4 className="text-white font-semibold mb-3">🎨 Identidade Visual</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-slate-300 flex items-center gap-2">
                <input type="checkbox" checked={hasLogo} onChange={(e) => setHasLogo(e.target.checked)} /> Tenho logo
              </label>
              <label className="text-slate-300 flex items-center gap-2">
                <input type="checkbox" checked={useLogoColors} onChange={(e) => setUseLogoColors(e.target.checked)} /> Usar cores do logo
              </label>
              {/* Upload do logo */}
              {hasLogo && (
                <div className="md:col-span-2">
                  <div className="border border-slate-600 rounded p-3 bg-slate-800/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setLogoFile(f);
                        if (f) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setLogoPreview(String(ev.target?.result || ""));
                          reader.readAsDataURL(f);
                          setUseLogoColors(true);
                        }
                      }}
                      className="block w-full text-slate-300"
                    />
                    {logoPreview && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={logoPreview} alt="Logo preview" className="h-16 object-contain" />
                        <span className="text-slate-400 text-sm">Usando cores do logo automaticamente</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Tema visual como mini-cards */}
              <div>
                <p className="text-slate-300 text-sm mb-2">Tema visual (escolha única)</p>
                <div className="grid grid-cols-2 gap-2">
                  {themeOptions.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setSiteTheme(t.value)}
                      className={`px-3 py-2 rounded border text-left ${siteTheme === t.value ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-600'}`}
                      title={t.label}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {!useLogoColors && (
              <div className="mt-3 flex flex-wrap gap-2">
                {["#1e3a8a", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2", "#be123c", "#4338ca", "#16a34a", "#000000", "#374151", "#f59e0b", "#10b981"].map((c) => (
                  <ColorSwatch key={c} c={c} />
                ))}
              </div>
            )}
          </section>

          {/* Objetivos */}
          <section>
            <h4 className="text-white font-semibold mb-3">🎯 Objetivos e Tom</h4>
            {/* Mini-cards (escolha única) para objetivos */}
            <div className="mb-3">
              <p className="text-slate-300 text-sm mb-2">Objetivo principal (escolha única)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["Apresentação Institucional", "Geração de Leads", "Agendamentos", "Vendas Online", "Portfólio", "Informativo"].map((obj) => (
                  <button key={obj} type="button" onClick={() => setMainObjective(obj)} className={`px-3 py-2 rounded border ${mainObjective === obj ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-300 border-slate-600'}`}>{obj}</button>
                ))}
              </div>
            </div>
            {/* Público-alvo (texto) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Público-alvo (ex: Jovens adultos)" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required />
            </div>
            {/* Mini-cards (escolha única) para impressão desejada */}
            <div className="mb-3">
              <p className="text-slate-300 text-sm mb-2">Impressão que deseja passar (escolha única)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["Moderno e confiante", "Acolhedor e humano", "Técnico e profissional", "Criativo e ousado", "Sério e formal", "Divertido e leve"].map((tone) => (
                  <button key={tone} type="button" onClick={() => setToneOfVoice(tone)} className={`px-3 py-2 rounded border ${toneOfVoice === tone ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-800 text-slate-300 border-slate-600'}`}>{tone}</button>
                ))}
              </div>
            </div>
            {/* CTA texto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Texto do CTA (ex: Agendar agora)" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
            </div>
          </section>

          {/* Estrutura */}
          <section>
            <h4 className="text-white font-semibold mb-3">📄 Estrutura</h4>
            <div className="flex gap-3 mb-3">
              <button type="button" className={`px-4 py-2 rounded ${siteStructure === 'multiple_pages' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`} onClick={() => setSiteStructure('multiple_pages')}>Múltiplas páginas</button>
              <button type="button" className={`px-4 py-2 rounded ${siteStructure === 'single_page' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-200'}`} onClick={() => setSiteStructure('single_page')}>Página única</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {pagesCatalog.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  className={`px-3 py-2 rounded border ${selectedPages.includes(p.value) ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-300 border-slate-600'}`}
                  onClick={() => toggleFromArray(selectedPages, setSelectedPages, p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input id="custom-page" className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder={siteStructure === 'multiple_pages' ? 'Adicionar página personalizada' : 'Adicionar seção personalizada'} />
              <button type="button" className="px-4 py-2 bg-green-600 rounded text-white" onClick={() => {
                const input = document.getElementById('custom-page') as HTMLInputElement | null;
                if (input?.value) { handleAddCustomPage(input.value); input.value = ''; }
              }}>Adicionar</button>
            </div>
            {customPageTitles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customPageTitles.map((t, i) => (
                  <span key={`${t}-${i}`} className="px-2 py-1 rounded bg-green-700 text-white text-sm">{t}</span>
                ))}
              </div>
            )}
          </section>

          {/* Funcionalidades */}
          <section>
            <h4 className="text-white font-semibold mb-3">⚙️ Funcionalidades</h4>
            {sectorFeaturePreset.length > 0 && (
              <p className="text-slate-400 text-sm mb-2">Sugestões para {sector}: {sectorFeaturePreset.join(', ')}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {featureCatalog.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`px-3 py-2 rounded border ${selectedFeatures.includes(f.value) ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-800 text-slate-300 border-slate-600'}`}
                  onClick={() => toggleFromArray(selectedFeatures, setSelectedFeatures, f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          {/* Conteúdo / Inspirações */}
          <section>
            <h4 className="text-white font-semibold mb-3">📝 Conteúdo & Inspirações</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-slate-300 flex items-center gap-2">
                <input type="checkbox" checked={hasContent} onChange={(e) => setHasContent(e.target.checked)} /> Tenho conteúdo pronto
              </label>
              <label className="text-slate-300 flex items-center gap-2">
                <input type="checkbox" checked={hasAiGeneratedText} onChange={(e) => setHasAiGeneratedText(e.target.checked)} /> Permitir IA escrever textos
              </label>
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Sites de inspiração (separe por vírgula)" value={inspirationSites} onChange={(e) => setInspirationSites(e.target.value)} />
              <input className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" placeholder="Evitar estilos (ex: gradientes fortes)" value={avoidStyles} onChange={(e) => setAvoidStyles(e.target.value)} />
            </div>
            <textarea className="mt-3 w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white h-24" placeholder="Prompt livre (instruções específicas)" value={additionalPrompt} onChange={(e) => setAdditionalPrompt(e.target.value)} />
          </section>

          {/* Avançado */}
          <section>
            <h4 className="text-white font-semibold mb-3">🌀 Avançado</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white" value={animationLevel} onChange={(e) => setAnimationLevel(e.target.value)}>
                <option value="nenhum">Sem animações</option>
                <option value="sutil">Sutil</option>
                <option value="moderado">Moderado</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-700 rounded text-white">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
