'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Conge } from '@/types';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ViewCongeModal from '@/components/modals/conges/ViewCongeModal';
import { Trash2, RotateCcw, AlertTriangle, Eye, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// ✅ CORRECTION : Enlever /v1/ car base URL l'a déjà
const fetchDeletedConges = async (): Promise<Conge[]> => {
  const response = await api.get<{ data: Conge[] }>('/conges/trashed');
  return response.data.data;
};

export default function CorbeilleCongesPage() {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { data: conges, isLoading, refetch } = useQuery({
    queryKey: ['conges-trashed'],
    queryFn: fetchDeletedConges,
  });

  // ✅ Fonction pour actualiser
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/conges/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conges-trashed'] });
      queryClient.invalidateQueries({ queryKey: ['conges'] });
      showSuccess('Demande restaurée avec succès !');
    },
    onError: (error: any) => {
      console.error('Erreur restauration:', error);
      showSuccess('Erreur lors de la restauration');
    },
  });

  const forceDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/conges/${id}/force`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conges-trashed'] });
      showSuccess('Demande supprimée définitivement.');
    },
    onError: (error: any) => {
      console.error('Erreur suppression définitive:', error);
      showSuccess('Erreur lors de la suppression');
    },
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleRestore = (conge: Conge) => {
    if (confirm(`Restaurer la demande de congé #${conge.id} ?`)) {
      restoreMutation.mutate(conge.id);
    }
  };

  const handleForceDelete = (conge: Conge) => {
    if (confirm(`ATTENTION : Cette action est irréversible.\n\nSupprimer définitivement la demande #${conge.id} ?`)) {
      forceDeleteMutation.mutate(conge.id);
    }
  };

  const handleView = (conge: Conge) => {
    setSelectedConge(conge);
    setIsViewModalOpen(true);
  };

  const calculateDays = (dateDebut: string, dateFin: string) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatutBadge = (statut: string) => {
    switch (statut ) {
      case 'approuve':
        return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Approuvé</span>;
      case 'en_attente':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">En attente</span>;
      case 'partiellement_valide':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Partiel</span>;
      case 'refuse':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Refusé</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{statut}</span>;
    }
  };

  const columns = [
    {
      key: 'employe',
      header: 'Employé',
      render: (conge: Conge) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
            {conge.employe?.prenom?.[0]}{conge.employe?.nom?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{conge.employe?.prenom} {conge.employe?.nom}</p>
            {conge.employe?.departement && (
              <p className="text-xs text-gray-500">{conge.employe?.departement}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (conge: Conge) => <span className="text-gray-600">{conge.type?.replace('_', ' ') || '-'}</span>,
    },
    {
      key: 'periode',
      header: 'Période',
      render: (conge: Conge) => (
        <div>
          <p className="text-gray-900">
            {conge.date_debut ? new Date(conge.date_debut).toLocaleDateString('fr-FR') : '-'} 
            {' au '} 
            {conge.date_fin ? new Date(conge.date_fin).toLocaleDateString('fr-FR') : '-'}
          </p>
          <p className="text-xs text-gray-500">{calculateDays(conge.date_debut, conge.date_fin)} jour(s)</p>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (conge: Conge) => getStatutBadge(conge.statut),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (conge: Conge) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(conge)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleRestore(conge)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Restaurer"
            disabled={restoreMutation.isPending}
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => handleForceDelete(conge)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer définitivement"
            disabled={forceDeleteMutation.isPending}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      <PageHeader
        title="Corbeille - Congés"
        subtitle="Gestion des demandes de congés supprimées"
        icon={<Trash2 size={28} className="text-red-600" />}
        actions={
          <div className="flex gap-3">
            {/* ✅ Bouton actualiser */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              {/* {isRefreshing ? 'Actualisation...' : 'Actualiser'} */}
            </button>
            <Link
              href="/directeur/conges"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour aux congés
            </Link>
          </div>
        }
      />

      {/* Avertissement */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-medium text-amber-900">Zone de danger</p>
          <p className="text-sm text-amber-800">
            Les éléments dans la corbeille peuvent être restaurés ou supprimés définitivement. 
            La suppression définitive est irréversible.
          </p>
        </div>
      </div>

      {/* ✅ Message si pas de données */}
      {!isLoading && (!conges || conges.length === 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucune demande de congé dans la corbeille</p>
          <Link
            href="/directeur/conges"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700"
          >
            Voir les demandes actives
          </Link>
        </div>
      )}

      <DataTable
        columns={columns}
        data={conges || []}
        isLoading={isLoading}
        keyExtractor={(conge) => conge.id}
        emptyMessage="Aucune demande de congé dans la corbeille"
      />

      {selectedConge && (
        <ViewCongeModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          conge={selectedConge}
        />
      )}
    </div>
  );
}