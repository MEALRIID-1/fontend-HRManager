'use client';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  // Congés
  en_attente: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'En attente' },
  partiellement_valide: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Partiellement validé' },
  approuve: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approuvé' },
  refuse: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refusé' },
  // Contrats & Employés
  actif: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Actif' },
  inactif: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactif' },
  termine: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminé' },
  // Types de congés
  conge_paye: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Congé payé' },
  conge_sans_solde: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Congé sans solde' },
  rtt: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'RTT' },
  maladie: { bg: 'bg-red-100', text: 'text-red-800', label: 'Maladie' },
  formation: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Formation' },
  // Types de contrats
  CDI: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'CDI' },
  CDD: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'CDD' },
  Stage: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Stage' },
  Alternance: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Alternance' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}
