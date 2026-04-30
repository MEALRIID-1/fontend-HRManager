import { cn } from "@/lib/utils";

interface BadgeProps {
  etat?: string;
  label?: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'gray' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const ETAT_CONFIG: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  // Congés
  'SOUMIS':            { label: 'En attente',    variant: 'warning' },
  'EN_ATTENTE_N1':     { label: 'En attente N1', variant: 'warning' },
  'EN_ATTENTE_N2':     { label: 'En attente N2', variant: 'warning' },
  'EN_ATTENTE_N3':     { label: 'En attente N3', variant: 'warning' },
  'VALIDE_MANAGER':    { label: 'Validé N1',     variant: 'info' },
  'VALIDE_RH':         { label: 'Validé N2',     variant: 'info' },
  'VALIDE_DIRECTEUR':  { label: 'Validé N3',     variant: 'success' },
  'APPROUVE':          { label: 'Approuvé',      variant: 'success' },
  'APPROUVE_N1':       { label: 'Approuvé N1',   variant: 'success' },
  'APPROUVE_N2':       { label: 'Approuvé N2',   variant: 'success' },
  'REFUSE':            { label: 'Refusé',          variant: 'error' },
  'REFUSE_N1':         { label: 'Refusé N1',     variant: 'error' },
  'REFUSE_N2':         { label: 'Refusé N2',     variant: 'error' },
  'REFUSE_N3':         { label: 'Refusé N3',     variant: 'error' },
  'ANNULE':            { label: 'Annulé',          variant: 'gray' },
  'BROUILLON':         { label: 'Brouillon',       variant: 'gray' },
  // Contrats
  'ACTIF':             { label: 'Actif',           variant: 'success' },
  'EN_COURS':          { label: 'En cours',        variant: 'success' },
  'SIGNE':             { label: 'Signé',           variant: 'success' },
  'EXPIRE':            { label: 'Expiré',          variant: 'error' },
  'RESILIE':           { label: 'Résilié',         variant: 'gray' },
  'BROUILLON_CONTRAT': { label: 'Brouillon',       variant: 'warning' },
  // Employés
  'ACTIF_USER':        { label: 'Actif',           variant: 'success' },
  'INACTIF':           { label: 'Inactif',         variant: 'gray' },
  'SUSPENDU':          { label: 'Suspendu',        variant: 'warning' },
  'DEMISSIONNE':       { label: 'Démissionné',     variant: 'error' },
};

const VARIANT_CLASSES: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  error:   'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info:    'bg-blue-100 text-blue-700 border-blue-200',
  gray:    'bg-slate-100 text-slate-600 border-slate-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
};

const DOT_COLORS: Record<string, string> = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
  gray:    'bg-slate-400',
  purple:  'bg-purple-500',
};

/**
 * Composant Badge réutilisable pour afficher les états
 * @example <Badge etat="APPROUVE" />
 * @example <Badge label="Archivé" variant="error" />
 */
export function Badge({ etat, label, variant, size = 'md', dot = true }: BadgeProps) {
  const config = etat ? ETAT_CONFIG[etat.toUpperCase()] : null;
  const finalLabel = label || config?.label || etat || '—';
  const finalVariant = variant || config?.variant || 'gray';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        VARIANT_CLASSES[finalVariant]
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', DOT_COLORS[finalVariant])} />
      )}
      {finalLabel}
    </span>
  );
}
