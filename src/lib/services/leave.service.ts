import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types";

export interface Conge {
  id: string;
  employeId: string;
  employe?: {
    id: string;
    nom: string;
    prenom: string;
  };
  type: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  raison?: string;
  etat: string;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const leaveService = {
  getAll: (params?: {
    statut?: string;
    type?: string;
    inclure_archives?: boolean;
  }) => apiGet<PaginatedResponse<Conge>>("/conges", params),

  getById: (id: string) => apiGet<ApiResponse<Conge>>(`/conges/${id}`),

  create: (data: Partial<Conge>) =>
    apiPost<ApiResponse<Conge>>("/conges", data),

  update: (id: string, data: Partial<Conge>) =>
    apiPut<ApiResponse<Conge>>(`/conges/${id}`, data),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/conges/${id}`),

  approve: (id: string) =>
    apiPost<ApiResponse<Conge>>(`/conges/${id}/approve`),

  reject: (id: string, motif?: string) =>
    apiPost<ApiResponse<Conge>>(`/conges/${id}/reject`, { motif }),

  getTrashed: () =>
    apiGet<ApiResponse<{ data: Conge[]; meta?: any }>>("/conges/trashed"),

  restore: (id: string) =>
    apiPut<ApiResponse<Conge>>(`/conges/${id}/restore`),
};
