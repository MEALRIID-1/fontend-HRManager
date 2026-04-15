import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import type {
  DemandeConge,
  ApiResponse,
  PaginatedResponse,
  FiltresConge,
} from "@/types";

export interface DecisionCongePayload {
  decision: "APPROUVE" | "REFUSE";
  commentaire?: string;
}

export const congeService = {
  getAll: (filtres?: FiltresConge) =>
    apiGet<PaginatedResponse<DemandeConge>>("/conges", filtres),

  getById: (id: string) =>
    apiGet<ApiResponse<DemandeConge>>(`/conges/${id}`),

  getMesDemandes: (employeId: string) =>
    apiGet<PaginatedResponse<DemandeConge>>(`/employes/${employeId}/conges`),

  getEnAttente: () =>
    apiGet<PaginatedResponse<DemandeConge>>("/conges/en-attente"),

  create: (data: Partial<DemandeConge>) =>
    apiPost<ApiResponse<DemandeConge>>("/conges", data),

  update: (id: string, data: Partial<DemandeConge>) =>
    apiPut<ApiResponse<DemandeConge>>(`/conges/${id}`, data),

  annuler: (id: string, motif?: string) =>
    apiPatch<ApiResponse<DemandeConge>>(`/conges/${id}/annuler`, { motif }),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/conges/${id}`),

  // Workflow N1 (Manager direct)
  approuverN1: (id: string, payload: DecisionCongePayload) =>
    apiPost<ApiResponse<DemandeConge>>(`/conges/${id}/approuver/n1`, payload),

  // Workflow N2 (RH)
  approuverN2: (id: string, payload: DecisionCongePayload) =>
    apiPost<ApiResponse<DemandeConge>>(`/conges/${id}/approuver/n2`, payload),

  // Workflow N3 (Direction)
  approuverN3: (id: string, payload: DecisionCongePayload) =>
    apiPost<ApiResponse<DemandeConge>>(`/conges/${id}/approuver/n3`, payload),

  getHistoriqueWorkflow: (id: string) =>
    apiGet<ApiResponse<DemandeConge["workflow"]>>(`/conges/${id}/workflow`),
};
