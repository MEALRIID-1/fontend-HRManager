import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/forgot-password", "/auth/reset-password"];
const AUTH_ROUTES   = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupère le token depuis le cookie
  const token = request.cookies.get("rh_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute   = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // 🚀 Mode démo : si pas de backend, on accepte un token factice
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const isAuthenticated = Boolean(token) || isDemoMode;

  // Si pas authentifié et route protégée → redirection login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si authentifié et route /auth → redirection dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
