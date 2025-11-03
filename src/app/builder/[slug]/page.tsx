// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import BuilderPageClient from "@/components/BuilderPageClient";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return (
		<main className="min-h-screen bg-gray-50">
			<BuilderPageClient slug={slug} apiKey={process.env.BUILDER_API_KEY!} />
		</main>
	);
}


