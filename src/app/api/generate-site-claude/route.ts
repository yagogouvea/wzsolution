import { NextResponse } from "next/server";
import { generateSiteWithClaude } from "@/lib/claude";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Prompt não informado." }, { status: 400 });
    }

    const code = await generateSiteWithClaude(prompt);

    return NextResponse.json({ ok: true, code });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ [Claude API] Erro:', errorObj);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: errorObj.message || "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

