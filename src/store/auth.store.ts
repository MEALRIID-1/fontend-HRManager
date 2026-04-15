import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === "ADMIN") return true;
        return user.permissions.includes(permission as User["permissions"][number]);
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(user.role);
      },
    }),
    {
      name: "rh-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
