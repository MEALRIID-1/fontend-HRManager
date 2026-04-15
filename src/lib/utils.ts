import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

// ---- Class merging utility ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Date formatters ----
export const formatDate = (date: string | Date, pattern = "dd/MM/yyyy") =>
  format(new Date(date), pattern, { locale: fr });

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), "dd/MM/yyyy à HH:mm", { locale: fr });

export const fromNow = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });

export const nbJoursEntre = (debut: string | Date, fin: string | Date) =>
  Math.abs(differenceInDays(new Date(fin), new Date(debut))) + 1;

export const isExpiringSoon = (date: string | Date, joursAvant = 30) => {
  const target = new Date(date);
  const now = new Date();
  const limit = new Date(now);
  limit.setDate(now.getDate() + joursAvant);
  return isAfter(target, now) && isBefore(target, limit);
};

// ---- Number formatters ----
export const formatCurrency = (amount: number, currency = "XAF") =>
  new Intl.NumberFormat("fr-CM", { style: "currency", currency }).format(amount);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n);

// ---- String helpers ----
export const initials = (nom: string, prenom: string) =>
  `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

export const fullName = (nom: string, prenom: string) =>
  `${prenom} ${nom}`;

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (str: string, maxLength: number) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;

// ---- Status labels & colors ----
export const STATUT_EMPLOYE_LABELS: Record<string, string> = {
  ACTIF:        "Actif",
  INACTIF:      "Inactif",
  SUSPENDU:     "Suspendu",
  DEMISSIONNE:  "Démissionné",
};

export const STATUT_CONGE_LABELS: Record<string, string> = {
  BROUILLON:       "Brouillon",
  EN_ATTENTE_N1:   "En attente (N1)",
  APPROUVE_N1:     "Approuvé N1",
  REFUSE_N1:       "Refusé N1",
  EN_ATTENTE_N2:   "En attente (N2)",
  APPROUVE_N2:     "Approuvé N2",
  REFUSE_N2:       "Refusé N2",
  EN_ATTENTE_N3:   "En attente (N3)",
  APPROUVE_N3:     "Approuvé ✓",
  REFUSE_N3:       "Refusé",
  ANNULE:          "Annulé",
};

export const TYPE_CONGE_LABELS: Record<string, string> = {
  ANNUEL:       "Congé annuel",
  MALADIE:      "Congé maladie",
  MATERNITE:    "Congé maternité",
  PATERNITE:    "Congé paternité",
  EXCEPTIONNEL: "Congé exceptionnel",
  SANS_SOLDE:   "Sans solde",
  FORMATION:    "Formation",
};

export const STATUT_CONTRAT_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_COURS:  "En cours",
  SIGNE:     "Signé",
  EXPIRE:    "Expiré",
  RESILIE:   "Résilié",
};

export const TYPE_CONTRAT_LABELS: Record<string, string> = {
  CDI:           "CDI",
  CDD:           "CDD",
  STAGE:         "Stage",
  FREELANCE:     "Freelance",
  APPRENTISSAGE: "Apprentissage",
};

// ---- Status color variants ----
export type BadgeVariant = "blue" | "green" | "yellow" | "red" | "gray" | "indigo";

export const getStatutEmployeVariant = (statut: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    ACTIF:       "green",
    INACTIF:     "gray",
    SUSPENDU:    "yellow",
    DEMISSIONNE: "red",
  };
  return map[statut] ?? "gray";
};

export const getStatutCongeVariant = (statut: string): BadgeVariant => {
  if (statut.startsWith("APPROUVE")) return "green";
  if (statut.startsWith("REFUSE"))   return "red";
  if (statut.startsWith("EN_ATTENTE")) return "yellow";
  if (statut === "ANNULE")           return "gray";
  return "indigo";
};

export const getStatutContratVariant = (statut: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    EN_COURS:  "green",
    SIGNE:     "blue",
    BROUILLON: "gray",
    EXPIRE:    "red",
    RESILIE:   "red",
  };
  return map[statut] ?? "gray";
};

// ---- Workflow helpers ----
export const getNiveauWorkflowLabel = (niveau: number) => {
  const labels: Record<number, string> = {
    1: "Manager direct",
    2: "RH",
    3: "Direction",
  };
  return labels[niveau] ?? `Niveau ${niveau}`;
};

export const isCongeApprouvedefinitif = (statut: string) => statut === "APPROUVE_N3";
export const isCongeEnCours = (statut: string) =>
  ["EN_ATTENTE_N1", "APPROUVE_N1", "EN_ATTENTE_N2", "APPROUVE_N2", "EN_ATTENTE_N3"].includes(statut);

// ---- Role helpers ----
export const ROLE_LABELS: Record<string, string> = {
  ADMIN:   "Administrateur",
  RH:      "Responsable RH",
  MANAGER: "Manager",
  EMPLOYE: "Employé",
};

export const canApproveN1 = (role: string) => ["ADMIN", "RH", "MANAGER"].includes(role);
export const canApproveN2 = (role: string) => ["ADMIN", "RH"].includes(role);
export const canApproveN3 = (role: string) => ["ADMIN"].includes(role);

// ---- Local storage ----
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  set: <T>(key: string, value: T) => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};
