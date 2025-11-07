import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { company_name, selected_template } = body;

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		await supabase.from("project_data").insert({
			company_name,
			selected_template,
			created_at: new Date().toISOString(),
		});

		return NextResponse.json({
			ok: true,
			message: "✅ Template registrado no Supabase com sucesso!",
		});
	} catch (error: any) {
		return NextResponse.json({ ok: false, error: error.message });
	}
}








