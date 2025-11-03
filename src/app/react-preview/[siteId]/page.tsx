// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { DatabaseService } from '@/lib/supabase';

export default async function ReactPreview({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const parts = siteId.split('_');
  const conversationId = parts.length >= 2 ? parts[1] : '';
  if (!conversationId) return <div className="p-6">Conversa não encontrada</div>;

  const project = await DatabaseService.getProjectData(conversationId);
  if (!project) return <div className="p-6">Projeto não encontrado</div>;

  const company = project.company_name || project.business_type || 'Cliente';
  const structure = (project as any).structure_json as { pages?: { name: string; sections: string[] }[]; menu?: string[] } | undefined;
  const content = project.generated_content as any;
  const images = (project.generated_images as string[]) || [];
  const logoUrl = project.logo_url || '';

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{company}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-white text-slate-800">
        <header className="p-4 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {logoUrl ? <img src={logoUrl} alt={`Logo ${company}`} className="h-10" /> : <div className="font-bold">{company}</div>}
            <nav className="space-x-4">
              {structure?.menu?.map((m) => (
                <a key={m} href={`#${m.toLowerCase()}`}>{m}</a>
              ))}
            </nav>
          </div>
        </header>
        <main>
          <section id="home" className="py-12">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold">{company}</h1>
                <p className="mt-3 text-slate-600">Prévia React/Next gerada.</p>
              </div>
              {images[0] ? <img src={images[0]} alt="Hero" className="rounded-lg shadow" /> : null}
            </div>
          </section>
          {structure?.pages?.map((p) => (
            <section id={p.name.toLowerCase()} key={p.name} className="py-10 border-t">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{p.name}</h2>
                <div className="grid gap-6">
                  {p.sections.map((sec, idx) => {
                    const key = sec.split(' ')[0];
                    const secData = content?.pages?.find((pg: any) => pg.page === p.name)?.sections?.[key];
                    return (
                      <div key={idx} className="bg-white rounded-lg p-6 shadow">
                        <h3 className="text-xl font-semibold">{secData?.title || sec}</h3>
                        {secData?.subtitle ? <p className="text-slate-600 mt-1">{secData.subtitle}</p> : null}
                        {secData?.text ? <p className="text-slate-700 mt-3">{secData.text}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </main>
        <footer className="p-6 text-center bg-slate-900 text-white">
          <p>© {new Date().getFullYear()} {company}</p>
        </footer>
      </body>
    </html>
  );
}
