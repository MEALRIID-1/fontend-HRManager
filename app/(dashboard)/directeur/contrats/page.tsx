'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import AddContratModal from '@/components/modals/contrats/AddContratModal';
import ViewContratModal from '@/components/modals/contrats/ViewContratModal';
import { FileText, AlertTriangle, Filter, Search, Download, Printer, Trash2 } from 'lucide-react';
import { Contrat } from '@/types';

const fetchContrats = async (params?: any) => {
  const response = await api.get<{ data: Contrat[] }>('/contrats', { params });
  return response.data.data;
};

const fetchEmployes = async () => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
  return response.data.data;
};

export default function DirecteurContratsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);

  const { data: contrats = [], isLoading } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => fetchContrats(),
  });

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: fetchEmployes,
  });

  const handleDownloadContrat = async (contrat: Contrat) => {
    try {
      const response = await api.get(`/contrats/${contrat.id}/telecharger`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat-${contrat.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement contrat:', error);
      alert('Erreur lors du téléchargement du contrat');
    }
  };

  const filteredContrats = useMemo(() => {
    return contrats.filter((contrat) => {
      const status = contrat.statut ?? contrat.etat ?? 'actif';
      const search = searchQuery.trim().toLowerCase();
      
      if (typeFilter && contrat.type !== typeFilter) return false;
      if (statusFilter && status !== statusFilter) return false;
      if (employeeFilter && String(contrat.user_id) !== employeeFilter) return false;
      
      if (!search) return true;
      
      const employeName = `${contrat.employe?.prenom ?? ''} ${contrat.employe?.nom ?? ''}`.toLowerCase();
      return employeName.includes(search) || contrat.type.toLowerCase().includes(search);
    });
  }, [contrats, typeFilter, statusFilter, employeeFilter, searchQuery]);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    return filteredContrats.filter((contrat) => {
      const status = contrat.statut ?? contrat.etat ?? 'actif';
      if (status !== 'actif' || !contrat.date_fin) return false;
      
      const endDate = new Date(contrat.date_fin);
      return endDate <= thirtyDaysLater && endDate >= today;
    });
  }, [filteredContrats]);

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

  const columns = [
    {
      key: 'employe',
      header: 'Employé',
      render: (contrat: Contrat) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
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
      render: (contrat: Contrat) => <span className="font-medium text-gray-900">{contrat.type}</span>,
    },
    {
      key: 'periode',
      header: 'Dates',
      render: (contrat: Contrat) => (
        <div>
          <p className="text-gray-900">{contrat.date_debut}</p>
          {contrat.date_fin && <p className="text-sm text-gray-500">au {contrat.date_fin}</p>}
        </div>
      ),
    },
    {
      key: 'salaire',
      header: 'Salaire base',
      render: (contrat: Contrat) => (
        <span className="font-medium text-gray-900">
          {contrat.salaire_brut ? `${contrat.salaire_brut.toLocaleString()} XAF` : '-'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (contrat: Contrat) => <StatusBadge status={contrat.statut ?? contrat.etat ?? 'actif'} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (contrat: Contrat) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedContrat(contrat)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            title="Voir contrat"
          >
            <FileText size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadContrat(contrat)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
            title="Télécharger PDF"
          >
            <Download size={18} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
            title="Imprimer"
          >
            <Printer size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Contrats"
        subtitle="Administration de tous les contrats de l'entreprise"
        icon={<FileText size={28} className="text-green-600" />}
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white hover:bg-green-700 transition-colors"
          >
            Nouveau Contrat
          </button>
        }
      />

      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 text-red-600" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-900">⚠️ CONTRATS EXPIRANT BIENTÔT</p>
              <p className="text-sm text-red-800 mt-1">
                {expiringSoon.length} contrat(s) expirant dans les 30 jours
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
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

          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter size={14} />
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Tous</option>
                <option value="cdi">CDI</option>
                <option value="cdd">CDD</option>
                <option value="stage">Stage</option>
                <option value="alternance">Alternance</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="mb-1 text-sm font-medium text-gray-700">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Tous</option>
                <option value="actif">Actif</option>
                <option value="expiré">Expiré</option>
                <option value="résilié">Résilié</option>
              </select>
            </div>

            <div>
              <label className="mb-1 text-sm font-medium text-gray-700">Employé</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Tous</option>
                {employes.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.prenom} {emp.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredContrats}
        isLoading={isLoading}
        keyExtractor={(contrat) => contrat.id}
        emptyMessage="Aucun contrat correspondant aux filtres"
      />

      <AddContratModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingContrats={contrats}
      />

      {selectedContrat && (
        <ViewContratModal
          isOpen={!!selectedContrat}
          onClose={() => setSelectedContrat(null)}
          contrat={selectedContrat}
          isAdmin={true}
        />
      )}
    </div>
  );
}
