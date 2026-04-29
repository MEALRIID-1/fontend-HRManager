import api, { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import type {
  Employe,
  Contrat,
  DemandeConge,
  ApiResponse,
  PaginatedResponse,
  CongesSolde,
  Notification,
} from "@/types";

// Types spécifiques employé
export interface SoldeConges {
  conge_annuel: number;
  maladie: number;
  maternite?: number;
  paternite?: number;
  sans_solde: number;
  exceptionnel: number;
}

export interface ContratActif {
  id: string;
  type: string;
  etat: string;
  date_debut: string;
  date_fin?: string;
  salaire_base: number;
}

export interface ValidationWorkflow {
  niveau: number;
  decision: string;
  commentaire?: string;
  date_validation: string;
  validateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface CongeDetail extends DemandeConge {
  validations: ValidationWorkflow[];
  motif_refus?: string;
  deleted_at?: string;
}

// Service pour les endpoints /me/* (accès employé à ses propres données)
export const employeeService = {
  // ── PROFIL ─────────────────────────────────────────────────────────────────
  
  /** Récupère le profil complet de l'utilisateur connecté */
  getMe: () => apiGet<ApiResponse<Employe>>("/me"),
  
  /** Upload de la photo de profil */
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiPost<ApiResponse<{ photo_url: string }>>("/me/photo", formData);
  },
  
  /** Change le mot de passe */
  changePassword: (data: {
    mot_de_passe_actuel: string;
    nouveau_mot_de_passe: string;
    confirmation: string;
  }) => apiPut<ApiResponse<null>>("/me/password", data),

  // ── CONTRATS ────────────────────────────────────────────────────────────────
  
  /** Liste tous les contrats de l'employé */
  getMesContrats: () =>
    apiGet<ApiResponse<{ data: Contrat[]; meta: { totalPages: number } }>>("/me/contrats"),
  
  /** Récupère uniquement le contrat actif */
  getContratActif: () =>
    apiGet<ApiResponse<ContratActif>>("/me/contrats/actif"),

  // ── CONGÉS ─────────────────────────────────────────────────────────────────
  
  /** Liste les congés de l'employé (actifs par défaut) */
  getMesConges: (params?: { 
    limit?: number; 
    exclure_annulees?: boolean;
    annulees_seulement?: boolean;
  }) => apiGet<ApiResponse<CongeDetail[]>>("/me/conges", params),
  
  /** Récupère le solde de congés */
  getSoldeConges: () =>
    apiGet<ApiResponse<SoldeConges>>("/me/conges/solde"),
  
  /** Compte les congés annulés (pour le badge corbeille) */
  getCorbeilleCount: () =>
    apiGet<ApiResponse<{ count: number }>>("/me/conges/corbeille/count"),
  
  /** Récupère le détail d'une demande avec workflow */
  getCongeById: (id: string) =>
    apiGet<ApiResponse<CongeDetail>>(`/me/conges/${id}`),
  
  /** Crée une nouvelle demande de congé */
  createConge: (data: {
    type: string;
    date_debut: string;
    date_fin: string;
  }) => {
    const typeMap: Record<string, string> = {
      ANNUEL: "conge_annuel",
      MALADIE: "maladie",
      MATERNITE: "maternite",
      PATERNITE: "paternite",
      SANS_SOLDE: "sans_solde",
      EXCEPTIONNEL: "exceptionnel",
    };

    const payload = {
      ...data,
      type: typeMap[data.type] ?? data.type,
    };

    return apiPost<ApiResponse<DemandeConge>>("/me/conges", payload);
  },
  
  /** Annule (soft delete) une demande de congé */
  cancelConge: (id: string) =>
    apiDelete<ApiResponse<null>>(`/me/conges/${id}`),
  
  /** Restaure une demande annulée */
  restoreConge: (id: string) =>
    apiPut<ApiResponse<DemandeConge>>(`/me/conges/${id}/restaurer`),

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  
  /** Liste les notifications de l'employé */
  getNotifications: (params?: { statut?: string; read_status?: string; limit?: number }) => {
    // Back-end expects `read_status` values: 'all'|'read'|'unread'
    const mapped: any = { ...(params || {}) };
    if (params?.statut) {
      if (params.statut === 'non_lu') mapped.read_status = 'unread';
      else if (params.statut === 'lu') mapped.read_status = 'read';
      else mapped.read_status = params.statut;
      delete mapped.statut;
    }
    return api
      .get("/notifications", { params: mapped })
      .then((r) => {
        const payload = r.data as any;
        if (!payload || !payload.success) return payload;

        const raw = payload.data;
        // Some backends return { notifications: [...], meta: {...} }
        const list = raw?.notifications ?? raw ?? [];

        const mapPriority = (p: string | null | undefined) => {
          if (!p) return 'NORMALE';
          const lower = p.toString().toLowerCase();
          return lower === 'normal' ? 'NORMALE' : lower === 'low' || lower === 'basse' ? 'BASSE' : lower === 'high' || lower === 'haute' ? 'HAUTE' : lower === 'urgent' ? 'URGENTE' : p.toString().toUpperCase();
        };

        const normalize = (n: any) => ({
          id: n.id?.toString(),
          userId: n.user_id?.toString(),
          type: n.type,
          titre: n.title ?? n.titre ?? '',
          message: n.message ?? '',
          priorite: mapPriority(n.priority ?? n.priorite),
          lue: !!(n.read_at ?? n.lue),
          lienAction: n.action_url ?? n.lien_action ?? n.lienAction ?? undefined,
          createdAt: n.created_at ?? n.createdAt ?? '',
        });

        const notifications = (Array.isArray(list) ? list : []).map(normalize);

        return {
          success: true,
          data: notifications,
          meta: raw?.meta ?? undefined,
          message: payload.message,
        } as ApiResponse<Notification[]>;
      });
  },
  
  /** Compte les notifications non lues */
  getNotificationsCount: () =>
    apiGet<ApiResponse<{ count: number }>>("/notifications/count-non-lues"),
  
  /** Marque une notification comme lue */
  markAsRead: (id: string) =>
    apiPatch<ApiResponse<null>>(`/notifications/${id}/lire`),
  
  /** Marque toutes les notifications comme lues */
  markAllAsRead: () =>
    apiPatch<ApiResponse<null>>("/notifications/lire-tout"),
  
  /** Supprime une notification */
  deleteNotification: (id: string) =>
    apiDelete<ApiResponse<null>>(`/notifications/${id}`),
};
