'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { FichePaie } from '@/types';
import AddFichePaieModal from '@/components/modals/fiches-paie/AddFichePaieModal';
import ViewFichePaieModal from '@/components/modals/fiches-paie/ViewFichePaieModal';

const fetchFichesPaie = async (params?: any) => {
  const response = await api.get<{ success: boolean; message: string; data: FichePaie[] }>('/fiches-paie', { params });
  const payload = response.data.data as any;
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const fetchEmployes = async () => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
  return response.data.data;
};

const deleteFichePaie = async (id: number) => {
  const response = await api.delete(`/fiches-paie/${id}`);
  return response.data;
};

const downloadFichePaiePdf = async (id: number) => {
  const response = await api.get(`/fiches-paie/${id}/telecharger`, {
    responseType: 'blob',
  });

  const contentType = String(response.headers?.['content-type'] || 'application/pdf');
  const blob = new Blob([response.data], {
    type: contentType,
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bulletin-paie-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface FichesPaieListProps {
  isAdmin?: boolean;
}

export default function FichesPaieList({ isAdmin = false }: FichesPaieListProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    mois: '',
    annee: '',
    employe_id: '',
    statut: '',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState<FichePaie | null>(null);

  const { data: fichesData, isLoading } = useQuery({
    queryKey: ['fiches-paie', filters],
    queryFn: () => fetchFichesPaie(filters),
  });

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: fetchEmployes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFichePaie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiches-paie'] });
    },
  });

  // CORRECTION ICI - Version sécurisée avec vérification
  const filteredFiches = useMemo(() => {
    // Vérification que fichesData existe et que c'est un tableau
    if (!fichesData || !Array.isArray(fichesData)) {
      return [];
    }
    
    // Copie du tableau et tri
    return [...fichesData].sort((a, b) => {
      if (b.annee !== a.annee) return b.annee - a.annee;
      return b.mois - a.mois;
    });
  }, [fichesData]);

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
    return 'Employé';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
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
      key: 'heures_sup',
      header: 'Heures sup',
      render: (fiche: FichePaie) => <span className="text-gray-600">{fiche.heures_sup || 0}h</span>,
    },
    {
      key: 'absences',
      header: 'Absences',
      render: (fiche: FichePaie) => <span className="text-gray-600">{fiche.absences || 0}j</span>,
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
            onClick={() => setSelectedFiche(fiche)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
            title="Aperçu"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={() => downloadFichePaiePdf(fiche.id)}
            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Télécharger PDF"
          >
            <Download size={18} />
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => deleteMutation.mutate(fiche.id)}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiches de Paie"
        subtitle="Gestion des bulletins de salaire"
        icon={<FileText size={28} className="text-purple-600" />}
        actions={
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700 transition-colors"
          >
            <FileText size={18} />
            Générer une fiche
          </button>
        }
      />

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
            <select
              value={filters.mois}
              onChange={(e) => setFilters({ ...filters, mois: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
            <select
              value={filters.annee}
              onChange={(e) => setFilters({ ...filters, annee: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Toutes</option>
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employé</label>
            <select
              value={filters.employe_id}
              onChange={(e) => setFilters({ ...filters, employe_id: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              {employes.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.prenom} {emp.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              <option value="brouillon">Brouillon</option>
              <option value="validee">Validé</option>
              <option value="payee">Envoyé</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredFiches}
        isLoading={isLoading}
        keyExtractor={(fiche) => fiche.id}
        emptyMessage="Aucune fiche de paie"
      />

      {showAddModal && (
        <AddFichePaieModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedFiche && (
        <ViewFichePaieModal
          isOpen={!!selectedFiche}
          onClose={() => setSelectedFiche(null)}
          fiche={selectedFiche}
        />
      )}
    </div>
  );
}