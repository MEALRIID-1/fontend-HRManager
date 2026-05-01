'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Trash2, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { Contrat } from '@/types';

const fetchDeletedContrats = async () => {
  const response = await api.get<{ data: Contrat[] }>('/contrats', { params: { only_trashed: true, per_page: 100 } });
  return response.data.data;
};

const restoreContrat = async (id: number) => {
  const response = await api.post(`/contrats/${id}/restore`);
  return response.data;
};

const forceDeleteContrat = async (id: number) => {
  const response = await api.delete(`/contrats/${id}/force`);
  return response.data;
};

export default function DirecteurContratsCorbeillePage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [contratToRestore, setContratToRestore] = useState<Contrat | null>(null);
  const [contratToDelete, setContratToDelete] = useState<Contrat | null>(null);

  const { data: contrats = [], isLoading } = useQuery({
    queryKey: ['contrats-deleted'],
    queryFn: fetchDeletedContrats,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreContrat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrats-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      setContratToRestore(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: forceDeleteContrat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrats-deleted'] });
      setContratToDelete(null);
    },
  });

  const filteredContrats = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return contrats;
    
    return contrats.filter((contrat) => {
      const employeName = `${contrat.employe?.prenom ?? ''} ${contrat.employe?.nom ?? ''}`.toLowerCase();
      return employeName.includes(search) || contrat.type.toLowerCase().includes(search);
    });
  }, [contrats, searchQuery]);

  const getAvatarLabel = (contrat: Contrat) => {
    const prenom = contrat.employe?.prenom ?? '';
    const nom = contrat.employe?.nom ?? '';
    const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.trim();
    return initials.toUpperCase() || '?';
  };

  const getDisplayName = (contrat: Contrat) => {
    if (contrat.employe?.prenom || contrat.employe?.nom) {
      return `${contrat.employe?.prenom ?? ''} ${contrat.employe?.nom ?? ''}`.trim();
    }
    return contrat.employe?.name ?? 'Employé';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const columns = [
    {
      key: 'employe',
      header: 'Employé',
      render: (contrat: Contrat) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
            {getAvatarLabel(contrat)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{getDisplayName(contrat)}</p>
            <p className="text-sm text-gray-500">{contrat.employe?.email || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type contrat',
      render: (contrat: Contrat) => <span className="font-medium text-gray-900">{contrat.type.toUpperCase()}</span>,
    },
    {
      key: 'periode',
      header: 'Dates',
      render: (contrat: Contrat) => (
        <div>
          <p className="text-gray-900">{formatDate(contrat.date_debut)}</p>
          {contrat.date_fin && <p className="text-sm text-gray-500">au {formatDate(contrat.date_fin)}</p>}
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (contrat: Contrat) => <StatusBadge status="supprimé" size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (contrat: Contrat) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setContratToRestore(contrat)}
            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Restaurer"
          >
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={() => setContratToDelete(contrat)}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer définitivement"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleRestore = () => {
    if (contratToRestore) {
      restoreMutation.mutate(contratToRestore.id);
    }
  };

  const handleForceDelete = () => {
    if (contratToDelete) {
      deleteMutation.mutate(contratToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corbeille des Contrats"
        subtitle="Contrats supprimés (restaurables ou suppression définitive)"
        icon={<Trash2 size={28} className="text-red-600" />}
      />

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 text-amber-600" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">⚠️ Zone de corbeille</p>
            <p className="text-sm text-amber-800 mt-1">
              Les contrats dans la corbeille peuvent être restaurés. La suppression définitive est irréversible.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un employé ou un type de contrat..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredContrats}
        isLoading={isLoading}
        keyExtractor={(contrat) => contrat.id}
        emptyMessage="La corbeille est vide"
      />

      {contratToRestore && (
        <ConfirmDialog
          isOpen={!!contratToRestore}
          onClose={() => setContratToRestore(null)}
          onConfirm={handleRestore}
          title="Restaurer le contrat"
          message={`Voulez-vous vraiment restaurer le contrat de ${getDisplayName(contratToRestore)} ?`}
          confirmText={restoreMutation.isPending ? 'Restauration...' : 'Restaurer'}
          cancelText="Annuler"
          type="info"
          isLoading={restoreMutation.isPending}
        />
      )}

      {contratToDelete && (
        <ConfirmDialog
          isOpen={!!contratToDelete}
          onClose={() => setContratToDelete(null)}
          onConfirm={handleForceDelete}
          title="Suppression définitive"
          message={`Cette action est irréversible. Voulez-vous vraiment supprimer définitivement le contrat de ${getDisplayName(contratToDelete)} ?`}
          confirmText={deleteMutation.isPending ? 'Suppression...' : 'Supprimer définitivement'}
          cancelText="Annuler"
          type="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
