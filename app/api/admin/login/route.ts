import { NextResponse } from "next/server";
import { COOKIE, passwordOk, token } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!passwordOk(String(password || "").trim())) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function GET() {
  const { isAdmin } = await import("@/lib/auth");
  return NextResponse.json({ ok: await isAdmin() });
}
