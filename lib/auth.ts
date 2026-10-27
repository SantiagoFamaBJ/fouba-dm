import "server-only";
import { cookies } from "next/headers";
import { createHash } from "crypto";

export const COOKIE = "fouba_admin";
const pass = () => (process.env.DM_ADMIN_PASSWORD || "").trim(); // contraseña compartida DM, sin valor por defecto
export const token = () => createHash("sha256").update("fouba:" + pass()).digest("hex");
export const passwordOk = (p: string) => !!pass() && typeof p === "string" && p.trim() === pass();

export async function isAdmin() {
  const c = await cookies();
  return !!pass() && c.get(COOKIE)?.value === token();
}
