import { auth } from "@/auth";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth?: unknown }) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  if (
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/unauthorized")
  ) {
    return;
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return Response.redirect(loginUrl);
  }

  return;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
