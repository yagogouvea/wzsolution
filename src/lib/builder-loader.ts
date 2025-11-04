import { builder } from "@builder.io/react";

builder.init(process.env.BUILDER_API_KEY!);

export async function fetchBuilderPage(model: string, slug: string = "/") {
	try {
		const content = await builder
			.get(model, {
				apiKey: process.env.BUILDER_API_KEY!,
				userAttributes: { urlPath: slug },
			})
			.toPromise();

		return content || null;
	} catch (error) {
		console.error("Erro ao buscar página Builder.io:", error);
		return null;
	}
}




