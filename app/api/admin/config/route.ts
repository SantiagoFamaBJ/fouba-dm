import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    const fila = { titulo: b.titulo, subtitulo: b.subtitulo, fechas: b.fechas, link_sorteo: b.link_sorteo, legal: b.legal };
    const { data, error } = await supabaseAdmin().from("fouba_config").update(fila).eq("id", 1).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
