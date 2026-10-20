import "server-only";
import { cookies } from "next/headers";
import { createHash } from "crypto";

export const COOKIE = "fouba_admin";
const pass = () => process.env.ADMIN_PASSWORD || "dm2026";
export const token = () => createHash("sha256").update("fouba:" + pass()).digest("hex");
export const passwordOk = (p: string) => p === pass();

export async function isAdmin() {
  const c = await cookies();
  return c.get(COOKIE)?.value === token();
}
