import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import { employeService } from "./employe.service";
import type {
  Contrat,
  Notification,
  ApiResponse,
  PaginatedResponse,
  FiltresContrat,
  StatsDashboard,
  RapportConge,
} from "@/types";

// ── CONTRAT ──────────────────────────────────────────────────────────────────
export const contratService = {
  getAll: (filtres?: FiltresContrat) =>
    apiGet<PaginatedResponse<Contrat>>("/contrats", filtres),

  getById: (id: string) =>
    apiGet<ApiResponse<Contrat>>(`/contrats/${id}`),

  create: (data: Partial<Contrat>) =>
    apiPost<ApiResponse<Contrat>>("/contrats", data),

  update: (id: string, data: Partial<Contrat>) =>
    apiPut<ApiResponse<Contrat>>(`/contrats/${id}`, data),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/contrats/${id}`),

  signer: (id: string) =>
    apiPatch<ApiResponse<Contrat>>(`/contrats/${id}/signer`),

  resilier: (id: string, motif: string) =>
    apiPatch<ApiResponse<Contrat>>(`/contrats/${id}/resilier`, { motif }),

  getExpirantBientot: (joursAvant = 30) =>
    apiGet<PaginatedResponse<Contrat>>("/contrats/expirant", { joursAvant }),

  telecharger: (id: string) =>
    apiGet<Blob>(`/contrats/${id}/telecharger`),
};

// ── NOTIFICATION ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (page = 1, limit = 20) =>
    apiGet<PaginatedResponse<Notification>>("/notifications", { page, limit }),

  getNonLues: () =>
    apiGet<ApiResponse<Notification[]>>("/notifications/non-lues"),

  getNbNonLues: () =>
    apiGet<ApiResponse<{ count: number }>>("/notifications/count"),

  marquerCommeLue: (id: string) =>
    apiPatch<ApiResponse<null>>(`/notifications/${id}/lire`),

  marquerToutesLues: () =>
    apiPatch<ApiResponse<null>>("/notifications/lire-tout"),

  supprimer: (id: string) =>
    apiDelete<ApiResponse<null>>(`/notifications/${id}`),
};

// ── RAPPORT / DASHBOARD ───────────────────────────────────────────────────────
export const rapportService = {
  getDashboardStats: () =>
    apiGet<ApiResponse<StatsDashboard>>("/rapports/dashboard"),

  getRapportConges: (debut: string, fin: string) =>
    apiGet<ApiResponse<RapportConge>>("/rapports/conges", { debut, fin }),

  getRapportEffectifs: (debut: string, fin: string) =>
    apiGet<ApiResponse<unknown>>("/rapports/effectifs", { debut, fin }),

  exporterRapport: (type: string, format: "pdf" | "excel", params?: object) =>
    apiGet<Blob>(`/rapports/${type}/exporter`, { format, ...params }),
};

export { employeService };
