import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// /admin (minúscula) → /ADMIN
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin" || req.nextUrl.pathname === "/admin/") {
    return NextResponse.redirect(new URL("/ADMIN", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/"] };
