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
    apiGet<PaginatedResponse<Employe>>("/employes", filtres),

  getById: (id: string) =>
    apiGet<ApiResponse<Employe>>(`/employes/${id}`),

  create: (data: Partial<Employe>) =>
    apiPost<ApiResponse<Employe>>("/employes", data),

  update: (id: string, data: Partial<Employe>) =>
    apiPut<ApiResponse<Employe>>(`/employes/${id}`, data),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/employes/${id}`),

  updateStatut: (id: string, statut: StatutEmploye) =>
    apiPatch<ApiResponse<Employe>>(`/employes/${id}/statut`, { statut }),

  uploadAvatar: async (id: string, file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    const { default: api } = await import("@/lib/api");
    return api.post<ApiResponse<{ avatarUrl: string }>>(`/employes/${id}/avatar`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getDocuments: (id: string) =>
    apiGet<ApiResponse<Document[]>>(`/employes/${id}/documents`),

  getSoldeConges: (id: string) =>
    apiGet<ApiResponse<{ annuels: number; maladie: number }>>(`/employes/${id}/conges/solde`),
};
