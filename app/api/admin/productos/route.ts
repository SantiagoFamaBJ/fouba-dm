import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CAMPOS = ["seccion", "nombre", "detalle", "precio", "precio_tachado", "desde", "badge", "imagen", "orden", "visible", "c_u", "agotado"];
const limpiar = (b: Record<string, unknown>) => {
  const o: Record<string, unknown> = {};
  for (const k of CAMPOS) if (k in b) o[k] = b[k] === "" && (k === "precio_tachado" || k === "badge") ? null : b[k];
  return o;
};
const noAuth = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });
const fail = (e: unknown) => NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });

export async function GET() {
  if (!(await isAdmin())) return noAuth();
  try {
    const { data, error } = await supabaseAdmin().from("fouba_productos").select("*").order("orden");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return noAuth();
  try {
    const b = await req.json();
    const fila = { ...limpiar(b), slug: (b.slug as string) || `prod-${Date.now()}` };
    const { data, error } = await supabaseAdmin().from("fouba_productos").insert(fila).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) { return fail(e); }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return noAuth();
  try {
    const b = await req.json();
    if (Array.isArray(b)) {
      // reordenar: [{id, orden}]
      const db = supabaseAdmin();
      for (const r of b) {
        const { error } = await db.from("fouba_productos").update({ orden: r.orden }).eq("id", r.id);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }
    const { data, error } = await supabaseAdmin().from("fouba_productos").update(limpiar(b)).eq("id", b.id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) { return fail(e); }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return noAuth();
  try {
    const id = new URL(req.url).searchParams.get("id");
    const { error } = await supabaseAdmin().from("fouba_productos").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}
