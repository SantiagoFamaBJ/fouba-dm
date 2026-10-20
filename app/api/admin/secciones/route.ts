import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CAMPOS = ["titulo", "bajada", "color", "orden", "visible"];

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    const db = supabaseAdmin();
    const lista = Array.isArray(b) ? b : [b];
    for (const s of lista) {
      const fila: Record<string, unknown> = {};
      for (const k of CAMPOS) if (k in s) fila[k] = s[k];
      const { error } = await db.from("fouba_secciones").update(fila).eq("id", s.id);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
