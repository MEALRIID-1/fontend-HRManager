import { apiGet, apiPost, apiPut } from "@/lib/api";
import { storage } from "@/lib/utils";
import type { User, ApiResponse } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  roles: string[];
  permissions: string[];
  token: string;
  expiresIn: number;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await apiPost<ApiResponse<LoginResponse>>("/login", payload);
    if (res.success && res.data) {
      storage.set("rh_token", res.data.token);
      storage.set("rh_user", res.data.user);
      const role = res.data.user?.role || res.data.roles?.[0] || "EMPLOYE";
      storage.set("rh_user_role", role);
    }
    return res;
  },

  logout: async () => {
    try {
      await apiPost("/logout");
    } finally {
      storage.remove("rh_token");
      storage.remove("rh_user");
      storage.remove("rh_user_role");
    }
  },

  refreshToken: () =>
    apiPost<ApiResponse<{ token: string }>>("/refresh-token"),

  changePassword: (payload: ChangePasswordPayload) =>
    apiPut<ApiResponse<null>>("/me/password", {
      mot_de_passe_actuel: payload.currentPassword,
      nouveau_mot_de_passe: payload.newPassword,
      confirmation: payload.confirmPassword,
    }),

  forgotPassword: (email: string) =>
    apiPost<ApiResponse<null>>("/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiPost<ApiResponse<null>>("/reset-password", { token, newPassword }),

  me: () => apiGet<ApiResponse<User>>("/me"),

  getStoredUser: (): User | null => storage.get<User>("rh_user"),
  getStoredToken: (): string | null => storage.get<string>("rh_token"),
  isTokenPresent: (): boolean => !!storage.get<string>("rh_token"),
};
