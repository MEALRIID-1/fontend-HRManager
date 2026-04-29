import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import type {
  Employe,
  ApiResponse,
  PaginatedResponse,
  FiltresEmploye,
  StatutEmploye,
} from "@/types";

export const employeService = {
  getAll: (filtres?: FiltresEmploye) =>
    apiGet<ApiResponse<{ data: Employe[]; meta?: { total: number; per_page: number; current_page: number } }>>("/employees", filtres),

  getById: (id: string) =>
    apiGet<ApiResponse<Employe>>(`/employees/${id}`),

  create: (data: Partial<Employe>) =>
    apiPost<ApiResponse<Employe>>("/employees", data),

  update: (id: string, data: Partial<Employe>) =>
    apiPut<ApiResponse<Employe>>(`/employees/${id}`, data),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/employees/${id}`),

  restore: (id: string) =>
    apiPut<ApiResponse<Employe>>(`/employees/${id}/restore`),

  getTrashed: () =>
    apiGet<ApiResponse<{ data: Employe[]; meta?: any }>>("/employees/trashed"),

  updateStatut: (id: string, statut: StatutEmploye) =>
    apiPatch<ApiResponse<Employe>>(`/employees/${id}/statut`, { statut }),

  uploadPhoto: async (id: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    const { default: api } = await import("@/lib/api");
    return api.post<ApiResponse<{ photo_url: string }>>(`/files/photo/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getStats: () =>
    apiGet<ApiResponse<{ total_employes: number; actifs: number; nouveaux: number }>>("/employees/stats"),
};
