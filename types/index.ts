export interface User {
  id: number;
  nom: string;
  prenom: string;
  name?: string;
  email: string;
  matricule?: string;
  departement?: string;
  poste?: string;
  photo_profil?: string | null;
  photo_url?: string | null;
  date_embauche?: string;
  telephone?: string;
  adresse?: string;
  iban?: string;
  is_active: boolean;
  statut?: string;
  deleted_at?: string | null;
  roles: Role[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  niveau_validation?: number;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  module?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conge {
  id: number;
  employe_id: number;
  employe?: User;
  type: 'conge_paye' | 'conge_sans_solde' | 'rtt' | 'maladie' | 'formation';
  date_debut: string;
  date_fin: string;
  etat: 'en_attente' | 'partiellement_valide' | 'approuve' | 'refuse';
  niveau_validation: number;
  motif_refus?: string;
  commentaire?: string;
  validations?: Validation[];
  created_at?: string;
  updated_at?: string;
}

export interface Validation {
  id: number;
  conge_id: number;
  validateur_id: number;
  validateur?: User;
  niveau: number;
  decision: 'approuve' | 'refuse';
  commentaire?: string;
  created_at?: string;
}

export interface Contrat {
  id: number;
  user_id: number;
  employe?: User;
  type: 'cdi' | 'cdd' | 'stage' | 'alternance' | 'freelance';
  date_debut: string;
  date_fin?: string;
  statut: 'actif' | 'expiré' | 'résilié';
  etat?: 'actif' | 'termine';
  salaire_brut?: number;
  salaire_base?: number;
  poste?: string;
  departement?: string;
  pdf_url?: string;
  document_path?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FichePaie {
  id: number;
  employe_id: number;
  employe?: User;
  mois: number;
  annee: number;
  salaire_base: number;
  heures_sup?: number;
  absences?: number;
  total_brut: number;
  total_cotisations: number;
  net_a_payer: number;
  statut: 'brouillon' | 'validee' | 'payee';
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  titre: string;
  message: string;
  is_read?: boolean;
  lu?: boolean;
  statut?: 'lu' | 'non_lu';
  action_url?: string;
  icone?: string;
  data?: Record<string, unknown>;
  reference_id?: number;
  reference_type?: string;
  date_lecture?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_employes: number;
  conges_en_attente: number;
  contrats_actifs: number;
  fiches_paie_mois: number;
  graphiques?: {
    conges_par_mois: { mois: string; total: number }[];
    repartition_departements: { departement: string; total: number }[];
  };
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user?: User;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type UserRole = 'admin' | 'rh' | 'manager' | 'employe';
