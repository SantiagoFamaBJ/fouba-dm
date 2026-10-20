import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "fouba";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("No llegó la imagen");
    if (file.size > 4 * 1024 * 1024) throw new Error("La imagen pesa más de 4 MB");
    const db = supabaseAdmin();
    // crea el bucket público la primera vez
    const { data: b } = await db.storage.getBucket(BUCKET);
    if (!b) await db.storage.createBucket(BUCKET, { public: true });
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `productos/${Date.now()}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = db.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
