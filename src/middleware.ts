import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/forgot-password", "/auth/reset-password"];
const AUTH_ROUTES   = ["/auth"];

// Routes par rôle - chaque rôle n'accède qu'à ses propres routes
const ROLE_ROUTES: Record<string, string[]> = {
  employe: ["/employe"],
  rh: ["/rh"],
  manager: ["/manager"],
  directeur: ["/directeur"],
  admin: ["/directeur", "/rh", "/manager", "/employe"], // Admin peut tout faire
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupère le token depuis le cookie
  const token = request.cookies.get("rh_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute   = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Authentification réelle - token requis
  const isAuthenticated = Boolean(token);

  // Si pas authentifié et route protégée → redirection login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si authentifié et route /auth → redirection selon rôle
  if (isAuthenticated && isAuthRoute) {
    const userRole = getUserRoleFromToken(request);
    const redirectUrl = getRedirectUrlForRole(userRole);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Vérification des routes protégées par rôle
  if (isAuthenticated && !isPublicRoute) {
    const userRole = getUserRoleFromToken(request);
    
    // Vérifier si l'utilisateur a accès à cette route
    if (!canAccessRoute(pathname, userRole)) {
      // Rediriger vers le dashboard approprié pour son rôle
      const redirectUrl = getRedirectUrlForRole(userRole);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Récupère le rôle de l'utilisateur depuis le cookie
 * Le backend Laravel définit ce cookie lors du login
 */
function getUserRoleFromToken(request: NextRequest): string {
  return request.cookies.get("rh_user_role")?.value || "employe";
}

/**
 * Vérifie si l'utilisateur peut accéder à cette route
 */
function canAccessRoute(pathname: string, userRole: string): boolean {
  const role = userRole.toLowerCase();
  
  // Admin peut tout faire
  if (role === "admin") return true;
  
  // Vérifier les routes spécifiques au rôle
  const allowedRoutes = ROLE_ROUTES[role] || ROLE_ROUTES.employe;
  
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Retourne l'URL de redirection par défaut selon le rôle
 */
function getRedirectUrlForRole(role: string): string {
  const map: Record<string, string> = {
    employe: "/employe/dashboard",
    rh: "/rh/dashboard",
    manager: "/manager/dashboard",
    directeur: "/directeur/dashboard",
    admin: "/directeur/dashboard", // Admin redirigé vers directeur par défaut
  };
  
  return map[role.toLowerCase()] || "/employe/dashboard";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
