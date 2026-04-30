// ============================================================
// TYPES GLOBAUX — Système RH
// ============================================================

// ----- AUTHENTIFICATION -----
export type UserRole = "ADMIN" | "DIRECTEUR" | "RH" | "MANAGER" | "EMPLOYE";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar?: string;
  departementId?: string;
  employeId?: string;
  permissions: Permission[];
  createdAt: string;
  lastLogin?: string;
}

export type Permission =
  | "employes:read"
  | "employes:write"
  | "employes:delete"
  | "conges:read"
  | "conges:write"
  | "conges:approve_n1"
  | "conges:approve_n2"
  | "conges:approve_n3"
  | "contrats:read"
  | "contrats:write"
  | "rapports:read"
  | "rapports:export"
  | "notifications:manage"
  | "admin:full";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ----- DÉPARTEMENT / ORGANISATION -----
export interface Departement {
  id: string;
  nom: string;
  code: string;
  responsableId: string;
  responsable?: Employe;
  nombreEmployes: number;
  createdAt: string;
}

export interface Poste {
  id: string;
  intitule: string;
  code: string;
  departementId: string;
  niveauHierarchique: number;
  salaireMin?: number;
  salaireMax?: number;
}

// ----- EMPLOYÉ -----
export type StatutEmploye = "ACTIF" | "INACTIF" | "SUSPENDU" | "DEMISSIONNE";
export type TypeContrat = "CDI" | "CDD" | "STAGE" | "FREELANCE" | "APPRENTISSAGE";
export type Genre = "MASCULIN" | "FEMININ" | "AUTRE";

export interface Employe {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  emailPro?: string;
  telephone: string;
  genre: Genre;
  dateNaissance: string;
  nationalite: string;
  adresse: Adresse;
  avatar?: string;
  statut: StatutEmploye;
  dateEmbauche: string;
  dateFin?: string;
  posteId: string;
  poste?: Poste;
  departementId: string;
  departement?: Departement;
  managerId?: string;
  manager?: Employe;
  typeContrat: TypeContrat;
  salaireBase: number;
  rib?: string;
  cnss?: string;
  congesRestants: CongesSolde;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Adresse {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
}

export interface CongesSolde {
  annuels: number;
  maladie: number;
  maternite?: number;
  paternite?: number;
  exceptionnels: number;
}

// ----- DOCUMENT -----
export interface Document {
  id: string;
  nom: string;
  type: string;
  url?: string;
  createdAt: string;
}

// ----- CONGÉS -----
export type TypeConge =
  | "ANNUEL"
  | "MALADIE"
  | "MATERNITE"
  | "PATERNITE"
  | "EXCEPTIONNEL"
  | "SANS_SOLDE"
  | "FORMATION";

export type StatutConge =
  | "BROUILLON"
  | "EN_ATTENTE_N1"
  | "APPROUVE_N1"
  | "REFUSE_N1"
  | "EN_ATTENTE_N2"
  | "APPROUVE_N2"
  | "REFUSE_N2"
  | "EN_ATTENTE_N3"
  | "APPROUVE_N3"
  | "REFUSE_N3"
  | "ANNULE";

export interface DemandeConge {
  id: string;
  employeId: string;
  employe?: Employe;
  type: TypeConge;
  statut: StatutConge;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif: string;
  justificatif?: string;
  workflow: WorkflowConge;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowConge {
  niveauActuel: 1 | 2 | 3;
  etapes: EtapeWorkflow[];
}

export interface EtapeWorkflow {
  niveau: 1 | 2 | 3;
  label: string;
  approbateurId?: string;
  approbateur?: User;
  statut: "EN_ATTENTE" | "APPROUVE" | "REFUSE" | "SKIPPED";
  commentaire?: string;
  dateDecision?: string;
}

// ----- CONTRAT -----
export type StatutContrat = "BROUILLON" | "EN_COURS" | "SIGNE" | "EXPIRE" | "RESILIE";

export interface Contrat {
  id: string;
  reference: string;
  employeId: string;
  employe?: Employe;
  type: TypeContrat;
  statut: StatutContrat;
  dateDebut: string;
  dateFin?: string;
  posteId: string;
  poste?: Poste;
  departementId: string;
  salaireBase: number;
  avantages: string[];
  clauses?: string;
  fichierUrl?: string;
  signatureEmploye?: string;
  signatureRH?: string;
  datSignature?: string;
  createdAt: string;
  updatedAt: string;
}

// ----- NOTIFICATION -----
export type TypeNotification =
  | "CONGE_SOUMIS"
  | "CONGE_APPROUVE"
  | "CONGE_REFUSE"
  | "CONTRAT_EXPIRE_BIENTOT"
  | "ANNIVERSAIRE_EMBAUCHE"
  | "DOCUMENT_REQUIS"
  | "RAPPEL_EVALUATION"
  | "SYSTEME";

export type PrioriteNotification = "BASSE" | "NORMALE" | "HAUTE" | "URGENTE";

export interface Notification {
  id: string;
  userId: string;
  type: TypeNotification;
  titre: string;
  message: string;
  priorite: PrioriteNotification;
  lue: boolean;
  lienAction?: string;
  createdAt: string;
}

// ----- RAPPORT -----
export interface StatsDashboard {
  // Employés
  totalEmployes: number;
  emploiesActifs: number;
  nouveauxCeMois: number;
  departements: number;

  // Congés
  congesEnAttente: number;
  congesApprouves: number;
  congesEnAttenteN2?: number;
  congesEnAttenteN3?: number;
  congesBloques?: number;
  totalDemandes?: number;
  totalApprouves?: number;
  totalRefuses?: number;

  // Contrats
  contratExpirantBientot: number;
  contratsExpirant30j?: number;
  totalContrats?: number;

  // Finances
  masseSalarialeMois?: number;
  masseSalariale?: number;

  // Présence
  tauxPresence: number;
  tauxAbsenteismeMois?: number;
}

export interface RapportConge {
  periodeDebut: string;
  periodeFin: string;
  totalDemandes: number;
  approuvees: number;
  refusees: number;
  enAttente: number;
  parType: Record<TypeConge, number>;
  parDepartement: Array<{ departement: string; total: number }>;
}

// ----- PAGINATION & API -----
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ----- RE-EXPORTS TYPES SPÉCIFIQUES -----
export type {
  Conge,
  CongeEtat,
  Validation,
  SoldeConges,
  CongeFormData,
  ValidationDecision,
  CONGE_ETAT_LABELS,
  TYPE_CONGE_LABELS,
} from './conge';
// Note: TypeConge est déjà défini localement dans ce fichier

// ----- FILTRES -----
export interface FiltresEmploye {
  search?: string;
  departementId?: string;
  statut?: StatutEmploye;
  typeContrat?: TypeContrat;
  page?: number;
  limit?: number;
}

export interface FiltresConge {
  search?: string;
  statut?: StatutConge;
  type?: TypeConge;
  employeId?: string;
  departementId?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export interface FiltresContrat {
  search?: string;
  statut?: StatutContrat;
  type?: TypeContrat;
  employeId?: string;
  expirantAvant?: string;
  page?: number;
  limit?: number;
}
