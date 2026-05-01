'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { FileText, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { FichePaie } from '@/types';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useState } from 'react';

const fetchDeletedFichesPaie = async () => {
  const response = await api.get<{ data: FichePaie[] }>('/fiches-paie', { params: { trashed: true } });
  return response.data;
};

const restoreFichePaie = async (id: number) => {
  const response = await api.put(`/api/v1/fiches-paie/${id}/restore`);
  return response.data;
};

const permanentlyDeleteFichePaie = async (id: number) => {
  const response = await api.delete(`/api/v1/fiches-paie/${id}/force`);
  return response.data;
};

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function DirecteurFichesPaieCorbeillePage() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<FichePaie | null>(null);

  const { data: fichesData, isLoading } = useQuery({
    queryKey: ['fiches-paie', 'trashed'],
    queryFn: fetchDeletedFichesPaie,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreFichePaie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches-paie'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteFichePaie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches-paie'] });
      setConfirmDelete(null);
    },
  });

  const filteredFiches = fichesData?.data ?? [];

  const getAvatarLabel = (fiche: FichePaie) => {
    const prenom = fiche.employe?.prenom ?? '';
    const nom = fiche.employe?.nom ?? '';
    const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.trim();
    return initials.toUpperCase() || '?';
  };

  const getDisplayName = (fiche: FichePaie) => {
    if (fiche.employe?.prenom || fiche.employe?.nom) {
      return `${fiche.employe?.prenom ?? ''} ${fiche.employe?.nom ?? ''}`.trim();
    }
    return fiche.employe?.name ?? 'Employé';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const columns = [
    {
      key: 'employe',
      header: 'Employé',
      render: (fiche: FichePaie) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
            {getAvatarLabel(fiche)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{getDisplayName(fiche)}</p>
            <p className="text-sm text-gray-500">{fiche.employe?.email || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'periode',
      header: 'Mois/Année',
      render: (fiche: FichePaie) => (
        <span className="font-medium text-gray-900">
          {months[fiche.mois - 1]} {fiche.annee}
        </span>
      ),
    },
    {
      key: 'salaire_base',
      header: 'Salaire base',
      render: (fiche: FichePaie) => formatCurrency(fiche.salaire_base),
    },
    {
      key: 'net_a_payer',
      header: 'Net à payer',
      render: (fiche: FichePaie) => (
        <span className="font-semibold text-green-600">{formatCurrency(fiche.net_a_payer)}</span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (fiche: FichePaie) => <StatusBadge status={fiche.statut} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (fiche: FichePaie) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => restoreMutation.mutate(fiche.id)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
            title="Restaurer"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(fiche)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer définitivement"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corbeille - Fiches de Paie"
        subtitle="Restauration ou suppression définitive des fiches de paie"
        icon={<Trash2 size={28} className="text-red-600" />}
      />

      <DataTable
        columns={columns}
        data={filteredFiches}
        isLoading={isLoading}
        keyExtractor={(fiche) => fiche.id}
        emptyMessage="Aucune fiche de paie dans la corbeille"
      />

      {confirmDelete && (
        <ConfirmDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
          title="Supprimer définitivement"
          message="Êtes-vous sûr de vouloir supprimer définitivement cette fiche de paie ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
