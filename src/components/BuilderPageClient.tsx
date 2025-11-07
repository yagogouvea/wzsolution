"use client";
import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

interface Props {
	slug: string;
	apiKey: string;
}

export default function BuilderPageClient({ slug, apiKey }: Props) {
	const [content, setContent] = useState<any>(null);
	const urlPath = "/" + (slug || "");

	useEffect(() => {
		if (!apiKey) return;
		builder.init(apiKey);
		builder
			.get("page", {
				apiKey,
				userAttributes: { urlPath },
			})
			.toPromise()
			.then((res) => setContent(res))
			.catch(() => setContent(null));
	}, [apiKey, urlPath]);

	if (content === null) {
		return (
			<div className="flex items-center justify-center py-24 text-gray-500">
				Carregando template do Builder...
			</div>
		);
	}

	if (!content) {
		return (
			<div className="flex items-center justify-center py-24 text-red-500">
				Template não encontrado. Verifique se a página foi publicada e o slug está correto.
			</div>
		);
	}

	return <BuilderComponent model="page" content={content} />;
}







