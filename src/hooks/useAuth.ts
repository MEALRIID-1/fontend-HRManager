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
        id: 1,
        prenom: "Demo",
        nom: "User",
        email,
        role: "ADMIN" as UserRole,
      };
      const fakeToken = "demo-token";

      setAuth(fakeUser, fakeToken);

      // Pose un cookie factice pour que le middleware le voie
      document.cookie = `rh_token=${fakeToken}; path=/;`;

      toast.success(`Bienvenue, ${fakeUser.prenom} !`);
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
    clearAuth();
    router.push("/auth/login");
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
