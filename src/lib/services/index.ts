import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import { employeService } from "./employe.service";
import { employeeService } from "./employee.service";
import { contractService } from "./contract.service";
import { leaveService } from "./leave.service";
import { rhCongeService } from "./rh-conge.service";
import { authService } from "./auth.service";
import type {
  Contrat,
  Notification,
  ApiResponse,
  PaginatedResponse,
  FiltresContrat,
  StatsDashboard,
  RapportConge,
} from "@/types";

// Ré-exporter les types du service employé
export type {
  SoldeConges,
  ContratActif,
  ValidationWorkflow,
  CongeDetail,
} from "./employee.service";

// Ré-exporter les types du service RH congés
export type { ValidationPayload } from "./rh-conge.service";

// ── CONTRAT (Legacy - utiliser contractService pour le backend Laravel) ───────
export const contratService = {
  getAll: (filtres?: FiltresContrat) =>
    apiGet<PaginatedResponse<Contrat>>("/contracts", filtres),

  getById: (id: string) =>
    apiGet<ApiResponse<Contrat>>(`/contracts/${id}`),

  create: (data: Partial<Contrat>) =>
    apiPost<ApiResponse<Contrat>>("/contracts", data),

  update: (id: string, data: Partial<Contrat>) =>
    apiPut<ApiResponse<Contrat>>(`/contracts/${id}`, data),

  delete: (id: string) =>
    apiDelete<ApiResponse<null>>(`/contracts/${id}`),

  signer: (id: string) =>
    apiPatch<ApiResponse<Contrat>>(`/contracts/${id}/signer`),

  resilier: (id: string, motif: string) =>
    apiPost<ApiResponse<Contrat>>(`/contracts/${id}/terminate`, { motif }),

  getExpirantBientot: (joursAvant = 30) =>
    apiGet<PaginatedResponse<Contrat>>("/contracts/expiring", { joursAvant }),

  telecharger: (id: string) =>
    apiGet<Blob>(`/files/download/contract/${id}`),
};

// ── NOTIFICATION ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (page = 1, limit = 20) =>
    apiGet<PaginatedResponse<Notification>>("/notifications", { page, limit }),

  getRecent: () =>
    apiGet<ApiResponse<Notification[]>>("/notifications/recent"),

  getNonLues: () =>
    apiGet<ApiResponse<Notification[]>>("/notifications/unread"),

  getNbNonLues: () =>
    apiGet<ApiResponse<{ count: number }>>("/notifications/unread-count"),

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
    apiGet<ApiResponse<StatsDashboard>>("/reports/dashboard"),

  getChartData: (type?: "all" | "evolution" | "departments" | "leaves") =>
    apiGet<ApiResponse<{
      evolution?: { name: string; employes: number; embauches: number; departs: number }[];
      departments?: { name: string; value: number; color: string }[];
      leaves?: { name: string; demandes: number; approuves: number }[];
    }>>("/reports/charts", { type }),

  getRapportConges: (debut: string, fin: string) =>
    apiGet<ApiResponse<RapportConge>>("/reports/leaves", { debut, fin }),

  getRapportEffectifs: (debut: string, fin: string) =>
    apiGet<ApiResponse<unknown>>("/reports/employees", { debut, fin }),

  exporterRapport: (type: string, format: "csv" | "xlsx" | "pdf", params?: object) =>
    apiGet<Blob>(`/reports/${type}/export`, { format, ...params }),
};

// ── RBAC (Rôles et Permissions) ──────────────────────────────────────────────
export const rbacService = {
  getRoles: () =>
    apiGet<ApiResponse<{ id: string; name: string; description: string }[]>>("/roles"),

  getPermissions: () =>
    apiGet<ApiResponse<{ id: string; name: string; module: string }[]>>("/permissions"),

  getPermissionsByModule: () =>
    apiGet<ApiResponse<Record<string, { id: string; name: string }[]>>>("/permissions/by-module"),

  assignRole: (userId: string, roleId: string) =>
    apiPost<ApiResponse<null>>("/roles/assign", { user_id: userId, role_id: roleId }),

  removeRole: (userId: string, roleId: string) =>
    apiPost<ApiResponse<null>>("/roles/remove", { user_id: userId, role_id: roleId }),

  assignPermissionToRole: (roleId: string, permissionId: string) =>
    apiPost<ApiResponse<null>>("/permissions/assign-to-role", { role_id: roleId, permission_id: permissionId }),

  revokePermissionFromRole: (roleId: string, permissionId: string) =>
    apiPost<ApiResponse<null>>("/permissions/revoke-from-role", { role_id: roleId, permission_id: permissionId }),
};

// ── AUDIT ────────────────────────────────────────────────────────────────────
export const auditService = {
  getLogs: (params?: { page?: number; limit?: number }) =>
    apiGet<ApiResponse<any[]>>("/audit/logs", params),

  getTimeline: (entity: string, id: string) =>
    apiGet<ApiResponse<any[]>>(`/audit/timeline/${entity}/${id}`),

  getUserActivity: (userId: string) =>
    apiGet<ApiResponse<any[]>>(`/audit/user/${userId}/activity`),

  getStats: () =>
    apiGet<ApiResponse<any>>("/audit/stats"),
};

export { employeService, employeeService, contractService, leaveService, rhCongeService, authService };
