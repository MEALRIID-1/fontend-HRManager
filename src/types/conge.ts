/**
 * Types pour le module Congés
 * Centralisés et strictement typés
 */

export type CongeEtat =
  | 'SOUMIS'
  | 'EN_ATTENTE_N1'
  | 'EN_ATTENTE_N2'
  | 'EN_ATTENTE_N3'
  | 'VALIDE_MANAGER'
  | 'VALIDE_RH'
  | 'VALIDE_DIRECTEUR'
  | 'APPROUVE'
  | 'APPROUVE_N1'
  | 'APPROUVE_N2'
  | 'REFUSE'
  | 'REFUSE_N1'
  | 'REFUSE_N2'
  | 'REFUSE_N3'
  | 'ANNULE'
  | 'BROUILLON';

export type TypeConge =
  | 'ANNUEL'
  | 'MALADIE'
  | 'MATERNITE'
  | 'PATERNITE'
  | 'SANS_SOLDE'
  | 'EXCEPTIONNEL';

export interface Validation {
  id: string;
  niveau: 'N1' | 'N2' | 'N3';
  decision: 'approuve' | 'refuse';
  commentaire?: string;
  date_validation: string;
  validateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface Conge {
  id: string;
  employe_id: string;
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    photo_profil?: string;
    departement?: { id: string; nom: string };
  };
  type: TypeConge;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  etat: CongeEtat;
  motif?: string;
  motif_refus?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  validations?: Validation[];
}

export interface SoldeConges {
  annuels: number;
  maladie: number;
  exceptionnels: number;
}

export interface CongeFormData {
  type: TypeConge;
  date_debut: string;
  date_fin: string;
  motif?: string;
}

export interface ValidationDecision {
  decision: 'approuve' | 'refuse';
  commentaire?: string;
}

// Mapping des états pour l'affichage
export const CONGE_ETAT_LABELS: Record<CongeEtat, string> = {
  SOUMIS: 'Soumis',
  EN_ATTENTE_N1: 'En attente N1',
  EN_ATTENTE_N2: 'En attente N2',
  EN_ATTENTE_N3: 'En attente N3',
  VALIDE_MANAGER: 'Validé Manager',
  VALIDE_RH: 'Validé RH',
  VALIDE_DIRECTEUR: 'Validé Directeur',
  APPROUVE: 'Approuvé',
  APPROUVE_N1: 'Approuvé N1',
  APPROUVE_N2: 'Approuvé N2',
  REFUSE: 'Refusé',
  REFUSE_N1: 'Refusé N1',
  REFUSE_N2: 'Refusé N2',
  REFUSE_N3: 'Refusé N3',
  ANNULE: 'Annulé',
  BROUILLON: 'Brouillon',
};

export const TYPE_CONGE_LABELS: Record<TypeConge, string> = {
  ANNUEL: 'Congé annuel',
  MALADIE: 'Congé maladie',
  MATERNITE: 'Congé maternité',
  PATERNITE: 'Congé paternité',
  SANS_SOLDE: 'Sans solde',
  EXCEPTIONNEL: 'Exceptionnel',
};
