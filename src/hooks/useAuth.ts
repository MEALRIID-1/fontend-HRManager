import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/lib/services";
import toast from "react-hot-toast";
import type { User, UserRole } from "@/types";

/**
 * Mapper les données du backend vers le format frontend
 * Backend: { user: { id, name, email }, roles: ['admin'], permissions: ['...'], token }
 * Frontend: { id, nom, prenom, email, role, permissions, ... }
 */
function normalizeRole(roleValue: unknown): UserRole {
  const value = String(roleValue ?? "").trim().toUpperCase();

  if (value === "ADMIN") return "ADMIN";
  if (value === "DIRECTEUR" || value === "DIRECTOR") return "DIRECTEUR";
  if (value === "RH" || value === "HR") return "RH";
  if (value === "MANAGER" || value === "MANAGER_RH") return "MANAGER";
  return "EMPLOYE";
}

function mapBackendUserToFrontend(backendData: any): User {
  const backendUser = backendData.user || {};
  const fullName = backendUser.name || [backendUser.prenom, backendUser.nom].filter(Boolean).join(" ");
  const nameParts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  const prenom = backendUser.prenom || nameParts[0] || "";
  const nom = backendUser.nom || nameParts.slice(1).join(" ") || "";
  const role = normalizeRole(backendUser.role || backendData.roles?.[0]);
  const permissions = Array.isArray(backendData.permissions) ? backendData.permissions : [];

  return {
    id: String(backendUser.id ?? ""),
    nom,
    prenom,
    email: backendUser.email || "",
    role,
    permissions,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
}

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth, hasPermission, hasRole } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
  async (email: string, password: string) => {
    try {
      // Appel API au backend Laravel
      const response = await authService.login({ email, password });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Identifiants incorrects");
      }

      const { token } = response.data;
      const frontendUser = mapBackendUserToFrontend(response.data);

      // 1. Stocker dans le state Zustand (persiste automatiquement au localStorage)
      setAuth(frontendUser, token);

      // 2. Créer les cookies HTTP pour le middleware
      document.cookie = `rh_token=${token}; path=/; max-age=86400;`;
      document.cookie = `rh_user_role=${frontendUser.role}; path=/; max-age=86400;`;

      // 3. Feedback utilisateur
      toast.success(`Bienvenue, ${frontendUser.prenom} !`);
      
      // 4. Redirection selon le rôle
      const getRedirectUrl = (userRole: UserRole) => {
        switch (userRole) {
          case "EMPLOYE":
            return "/employe/dashboard";
          case "MANAGER":
            return "/manager/dashboard";
          case "RH":
            return "/rh/dashboard";
          case "DIRECTEUR":
          case "ADMIN":
            return "/directeur/dashboard";
          default:
            return "/employe/dashboard";
        }
      };
      
      const redirectUrl = getRedirectUrl(frontendUser.role);
      router.replace(redirectUrl);

      return { success: true, data: { user: frontendUser, token } };
    } catch (err: any) {
      const message = err?.message || err?.friendlyMessage || "Identifiants incorrects";
      toast.error(message);
      throw err;
    }
  },
  [setAuth, router]
);

  const logout = useCallback(async () => {
    try {
      // 1. Appeler le backend pour invalider le token
      await authService.logout();
    } catch (error) {
      // Ignorer les erreurs de logout
    } finally {
      // 2. Supprimer tous les cookies
      document.cookie = "rh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "rh_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "rh_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      
      // 3. Supprimer le localStorage (Zustand persiste sous 'rh-auth')
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("rh-auth");
        window.localStorage.removeItem("rh_token");
        window.localStorage.removeItem("rh_user");
        window.localStorage.removeItem("rh_user_role");
      }
      
      // 4. Nettoyer le store Zustand
      clearAuth();
      
      // 5. Rediriger vers login
      router.replace("/auth/login");
      toast.success("Déconnecté avec succès");
    }
  }, [clearAuth, router]);

  const can = useCallback(
    (permission: string) => hasPermission(permission),
    [hasPermission]
  );

  const is = useCallback(
    (role: UserRole | UserRole[]) => hasRole(role),
    [hasRole]
  );

  return { user, isAuthenticated, login, logout, can, is };
}
