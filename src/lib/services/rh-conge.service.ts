import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import type { DemandeConge, ApiResponse, StatutConge } from "@/types";

export interface ValidationPayload {
  decision: "approuve" | "refuse";
  commentaire?: string;
  motif_refus?: string;
}

export const rhCongeService = {
  // Récupérer tous les congés (RH/Manager)
  getAll: (params?: {
    statut?: string;
    employe_id?: string;
    inclure_archives?: boolean;
  }) =>
    apiGet<ApiResponse<{ data: DemandeConge[]; meta?: any }>>("/conges", params),

  // Récupérer les congés en attente N2 (pour RH)
  getEnAttenteN2: () =>
    apiGet<ApiResponse<DemandeConge[]>>("/conges?statut=EN_ATTENTE_N2"),

  // Récupérer les congés en attente N3 (pour Directeur)
  getEnAttenteN3: () =>
    apiGet<ApiResponse<DemandeConge[]>>("/conges?statut=EN_ATTENTE_N3"),

  // Valider un congé (N2 ou N3)
  valider: (id: string, payload: ValidationPayload) =>
    apiPost<ApiResponse<DemandeConge>>(`/conges/${id}/valider`, payload),

  // Super validation (Directeur peut court-circuiter)
  superValider: (id: string, payload: ValidationPayload) =>
    apiPost<ApiResponse<DemandeConge>>(`/conges/${id}/super-valider`, payload),

  // Refuser un congé
  refuser: (id: string, motif: string) =>
    apiPost<ApiResponse<DemandeConge>>(`/conges/${id}/refuser`, { motif }),

  // Restaurer un congé annulé
  restore: (id: string) =>
    apiPut<ApiResponse<DemandeConge>>(`/conges/${id}/restaurer`),

  // Supprimer définitivement
  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/conges/${id}`),
};
