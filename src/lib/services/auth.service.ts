import { apiPost } from "@/lib/api";
import { storage } from "@/lib/utils";
import type { User, ApiResponse } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
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
    const res = await apiPost<ApiResponse<LoginResponse>>("/auth/login", payload);
    if (res.success) {
      storage.set("rh_token", res.data.token);
      storage.set("rh_user", res.data.user);
    }
    return res;
  },

  logout: async () => {
    try {
      await apiPost("/auth/logout");
    } finally {
      storage.remove("rh_token");
      storage.remove("rh_user");
    }
  },

  refreshToken: () =>
    apiPost<ApiResponse<{ token: string }>>("/auth/refresh"),

  changePassword: (payload: ChangePasswordPayload) =>
    apiPost<ApiResponse<null>>("/auth/change-password", payload),

  forgotPassword: (email: string) =>
    apiPost<ApiResponse<null>>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiPost<ApiResponse<null>>("/auth/reset-password", { token, newPassword }),

  me: () => apiPost<ApiResponse<User>>("/auth/me"),

  getStoredUser: (): User | null => storage.get<User>("rh_user"),
  getStoredToken: (): string | null => storage.get<string>("rh_token"),
  isTokenPresent: (): boolean => !!storage.get<string>("rh_token"),
};
