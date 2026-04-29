import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Contrat, ApiResponse, StatutContrat } from "@/types";

export const contractService = {
  getAll: (params?: { 
    search?: string; 
    statut?: string; 
    inclure_archives?: boolean;
  }) =>
    apiGet<ApiResponse<{ data: Contrat[]; meta?: any }>>("/contracts", params),

  getById: (id: string) =>
    apiGet<ApiResponse<Contrat>>(`/contracts/${id}`),

  getExpiring: () =>
    apiGet<ApiResponse<Contrat[]>>("/contracts/expiring"),

  getStats: () =>
    apiGet<ApiResponse<{ total: number; actifs: number; expirant: number }>>("/contracts/stats"),

  create: (data: Partial<Contrat>) =>
    apiPost<ApiResponse<Contrat>>("/contracts", data),

  update: (id: string, data: Partial<Contrat>) =>
    apiPut<ApiResponse<Contrat>>(`/contracts/${id}`, data),

  terminate: (id: string, data: { date_fin: string; motif: string }) =>
    apiPost<ApiResponse<Contrat>>(`/contracts/${id}/terminate`, data),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/contracts/${id}`),

  restore: (id: string) =>
    apiPut<ApiResponse<Contrat>>(`/contracts/${id}/restore`),

  getTrashed: () =>
    apiGet<ApiResponse<{ data: Contrat[]; meta?: any }>>("/contracts/trashed"),
};
