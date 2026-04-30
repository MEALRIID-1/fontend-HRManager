import { apiGet, apiPost } from "@/lib/api";
import type { Employe, ApiResponse, PaginatedResponse } from "@/types";

interface MembreDetail {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  telephone?: string;
  statut: string;
  photo_profil?: string;
  departement?: { id: string; nom: string; code?: string };
  contrat_actif?: {
    type: string;
    date_debut?: string;
    date_fin?: string;
    etat?: string;
  };
  conges?: Array<{
    id: string;
    type: string;
    date_debut: string;
    date_fin: string;
    nombre_jours: number;
    statut: string;
  }>;
}

interface ContratEquipe {
  id: string;
  type: string;
  date_debut: string;
  date_fin?: string;
  etat: string;
  employe: {
    id: string;
    nom: string;
    prenom: string;
    photo?: string;
    departement?: { id: string; nom: string };
  };
  created_at: string;
}

interface CongeEquipe {
  id: string;
  type: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  etat: string;
  employe: {
    id: string;
    nom: string;
    prenom: string;
    photo?: string;
  };
  validations?: Array<{
    id: string;
    niveau: string;
    statut: string;
    validateur?: {
      id: string;
      nom: string;
      prenom: string;
    };
  }>;
}

export const managerService = {
  // ── ÉQUIPE ─────────────────────────────────────────────────────────────────

  /** Liste les membres de l'équipe */
  getEquipe: (params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }) =>
    apiGet<ApiResponse<{ data: Employe[]; meta: any }>>("/manager/equipe", params),

  /** Détail d'un membre de l'équipe */
  getMembreDetail: (id: string) =>
    apiGet<ApiResponse<MembreDetail>>(`/manager/equipe/${id}`),

  // ── CONTRATS ÉQUIPE ────────────────────────────────────────────────────────

  /** Liste les contrats de l'équipe */
  getContrats: (params?: {
    search?: string;
    statut?: string;
    type?: string;
    page?: number;
    per_page?: number;
  }) =>
    apiGet<ApiResponse<{ data: ContratEquipe[]; meta: any }>>("/manager/contrats", params),

  /** Détail d'un contrat */
  getContratById: (id: string) =>
    apiGet<ApiResponse<ContratEquipe>>(`/manager/contrats/${id}`),

  // ── CONGÉS ÉQUIPE ───────────────────────────────────────────────────────────

  /** Liste les congés de l'équipe */
  getConges: (params?: {
    etat?: string;
    type?: string;
    page?: number;
    per_page?: number;
  }) =>
    apiGet<ApiResponse<{ data: CongeEquipe[]; meta: any }>>("/manager/conges", params),

  /** Détail d'une demande de congé */
  getCongeById: (id: string) =>
    apiGet<ApiResponse<CongeEquipe>>(`/manager/conges/${id}`),

  /** Approuver une demande (workflow N1) */
  approuverConge: (id: string, commentaire?: string) =>
    apiPost<ApiResponse<CongeEquipe>>(`/manager/conges/${id}/approuver`, { commentaire }),

  /** Refuser une demande */
  refuserConge: (id: string, motif: string) =>
    apiPost<ApiResponse<CongeEquipe>>(`/manager/conges/${id}/refuser`, { motif }),
};
