import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth, hasPermission, hasRole } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
  async (email: string, password: string) => {
    try {
      const fakeUser = {
        id: "1",
        prenom: "Demo",
        nom: "User",
        email,
        role: "ADMIN" as UserRole,
        permissions: [], // permissions vides pour ADMIN
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: undefined,
        departementId: undefined,
        employeId: undefined,
      };
      const fakeToken = "demo-token-" + Date.now();

      // 1. Stocker dans le state Zustand (persiste automatiquement au localStorage)
      setAuth(fakeUser, fakeToken);

      // 2. Créer le cookie HTTP pour le middleware
      document.cookie = `rh_token=${fakeToken}; path=/; max-age=86400;`;

      // 3. Feedback utilisateur
      toast.success(`Bienvenue, ${fakeUser.prenom} !`);
      
      // 4. Redirection
      router.replace("/dashboard");

      return { success: true, data: { user: fakeUser, token: fakeToken } };
    } catch (err) {
      toast.error("Identifiants incorrects");
      throw err;
    }
  },
  [setAuth, router]
);

  const logout = useCallback(async () => {
    // 1. Supprimer le token du cookie
    document.cookie = "rh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // 2. Supprimer le localStorage (Zustand persiste sous 'rh-auth')
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("rh-auth");
      window.localStorage.removeItem("rh_token");
      window.localStorage.removeItem("rh_user");
    }
    
    // 3. Nettoyer le store Zustand
    clearAuth();
    
    // 4. Rediriger vers login
    router.replace("/auth/login");
    toast.success("Déconnecté avec succès");
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
