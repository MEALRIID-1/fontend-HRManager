import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register validation
export const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(100),
  prenom: z.string().min(2, 'Le prénom doit faire au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Change password validation
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
  new_password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Employe validation
export const employeSchema = z.object({
  nom: z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(100),
  prenom: z.string().min(2, 'Le prénom doit faire au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  departement: z.string().optional(),
  poste: z.string().optional(),
  date_embauche: z.string().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  role_ids: z.array(z.number()).optional(),
});

export type EmployeFormData = z.infer<typeof employeSchema>;

// Conge validation
export const congeSchema = z.object({
  type: z.enum(['conge_paye', 'conge_sans_solde', 'rtt', 'maladie', 'formation']),
  date_debut: z.string().min(1, 'Date de début requise'),
  date_fin: z.string().min(1, 'Date de fin requise'),
  commentaire: z.string().max(500, 'Maximum 500 caractères').optional(),
}).refine((data) => {
  if (data.date_debut && data.date_fin) {
    return new Date(data.date_fin) >= new Date(data.date_debut);
  }
  return true;
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['date_fin'],
});

export type CongeFormData = z.infer<typeof congeSchema>;

// Contrat validation
export const contratSchema = z.object({
  employe_id: z.number().min(1, 'Employé requis'),
  type: z.enum(['CDI', 'CDD', 'Stage', 'Alternance']),
  date_debut: z.string().min(1, 'Date de début requise'),
  date_fin: z.string().optional(),
  salaire_base: z.number().min(0).optional(),
  poste: z.string().optional(),
  departement: z.string().optional(),
}).refine((data) => {
  if (data.type !== 'CDI' && !data.date_fin) {
    return false;
  }
  return true;
}, {
  message: 'Date de fin requise pour CDD, Stage et Alternance',
  path: ['date_fin'],
});

export type ContratFormData = z.infer<typeof contratSchema>;

// Fiche Paie validation
export const fichePaieSchema = z.object({
  employe_id: z.number().min(1, 'Employé requis'),
  mois: z.number().min(1).max(12),
  annee: z.number().min(2000).max(2100),
  salaire_base: z.number().min(0),
  heures_sup: z.number().min(0).optional(),
  absences: z.number().min(0).optional(),
});

export type FichePaieFormData = z.infer<typeof fichePaieSchema>;

// Validation decision
export const validationSchema = z.object({
  decision: z.enum(['approuve', 'refuse']),
  commentaire: z.string().optional(),
  motif_refus: z.string().optional(),
});

export type ValidationFormData = z.infer<typeof validationSchema>;

// Paramètres / Profil validation
export const profilSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  departement: z.string().optional(),
  iban: z.string().optional(),
});

export type ProfilFormData = z.infer<typeof profilSchema>;

// Role validation
export const roleSchema = z.object({
  nom: z.string().min(2, 'Le nom du rôle est requis'),
  description: z.string().optional(),
  niveau: z.number().optional(),
  permissions: z.array(z.number()).optional(),
});

export type RoleFormData = z.infer<typeof roleSchema>;

