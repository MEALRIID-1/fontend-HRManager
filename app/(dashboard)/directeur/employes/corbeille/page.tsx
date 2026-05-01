'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Trash2, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const fetchDeletedEmployes = async (): Promise<User[]> => {
  const response = await api.get<{ data: User[] }>('/employes/trashed');
  return response.data.data;
};

export default function CorbeilleEmployesPage() {
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<User | null>(null);

  const { data: employes, isLoading } = useQuery({
    queryKey: ['employes-trash'],
    queryFn: fetchDeletedEmployes,
  });

  const queryClient = useQueryClient();

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<{ data: User }>(`/employes/${id}/restore`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes-trash'] });
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      setIsRestoreDialogOpen(false);
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/employes/${id}/force`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes-trash'] });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleRestore = (employe: User) => {
    setSelectedEmploye(employe);
    setIsRestoreDialogOpen(true);
  };

  const handlePermanentDelete = (employe: User) => {
    setSelectedEmploye(employe);
    setIsDeleteDialogOpen(true);
  };

  const confirmRestore = () => {
    if (selectedEmploye) {
      restoreMutation.mutate(selectedEmploye.id);
    }
  };

  const confirmPermanentDelete = () => {
    if (selectedEmploye) {
      permanentDeleteMutation.mutate(selectedEmploye.id);
    }
  };

  const columns = [
    {
      key: 'nom',
      header: 'Employé',
      render: (employe: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-semibold">
            {employe.prenom?.[0]}{employe.nom?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{employe.prenom} {employe.nom}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (employe: User) => <span className="text-gray-600">{employe.email}</span>,
    },
    {
      key: 'departement',
      header: 'Département',
      render: (employe: User) => <span className="text-gray-600">{employe.departement || '-'}</span>,
    },
    {
      key: 'deleted_at',
      header: 'Supprimé le',
      render: (employe: User) => (
        <span className="text-gray-600">
          {employe.deleted_at 
            ? new Date(employe.deleted_at).toLocaleDateString('fr-FR') 
            : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employe: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRestore(employe)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Restaurer"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => handlePermanentDelete(employe)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        title="Corbeille - Employés"
        subtitle="Employés supprimés (Admin uniquement)"
        icon={<AlertTriangle size={28} className="text-amber-500" />}
        actions={
          <Link
            href="/directeur/employes"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour à la liste
          </Link>
        }
      />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-600" size={24} />
          <div>
            <p className="font-medium text-amber-900">Zone dangereuse - Admin uniquement</p>
            <p className="text-sm text-amber-700">
              Les employés dans la corbeille peuvent être restaurés. 
              La suppression définitive est irréversible.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employes || []}
        isLoading={isLoading}
        keyExtractor={(employe) => employe.id}
        emptyMessage="Aucun employé dans la corbeille"
      />

      <ConfirmDialog
        isOpen={isRestoreDialogOpen}
        onClose={() => setIsRestoreDialogOpen(false)}
        onConfirm={confirmRestore}
        title="Restaurer l'employé"
        message={`Êtes-vous sûr de vouloir restaurer ${selectedEmploye?.prenom} ${selectedEmploye?.nom} ? L'employé sera de nouveau actif.`}
        confirmText="Restaurer"
        type="success"
        isLoading={restoreMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmPermanentDelete}
        title="Suppression définitive"
        message={`ATTENTION : Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement ${selectedEmploye?.prenom} ${selectedEmploye?.nom} ?`}
        confirmText="Supprimer définitivement"
        type="danger"
        isLoading={permanentDeleteMutation.isPending}
      />
    </div>
  );
}
