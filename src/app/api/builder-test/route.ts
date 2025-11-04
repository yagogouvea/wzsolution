import { NextResponse } from "next/server";

export async function GET() {
	const apiKey = process.env.BUILDER_API_KEY;
	const url = `https://cdn.builder.io/api/v3/content/page?apiKey=${apiKey}&limit=1`;

	try {
		const res = await fetch(url, { cache: "no-store" });
		const json = await res.json();

		if (!json?.results?.length) {
			return NextResponse.json({
				ok: false,
				message: "❌ Nenhum template encontrado no Builder.io. Crie uma página e publique.",
			});
		}

		return NextResponse.json({
			ok: true,
			message: "✅ Conectado ao Builder.io com sucesso!",
			templates: json.results.map((t: any) => t.name),
		});
	} catch (error: any) {
		return NextResponse.json({ ok: false, error: error.message });
	}
}




