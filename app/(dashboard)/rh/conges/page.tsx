'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Conge } from '@/types';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ValiderCongeModal from '@/components/modals/conges/ValiderCongeModal';
import ViewCongeModal from '@/components/modals/conges/ViewCongeModal';
import { Calendar, Eye, CheckCircle, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const fetchConges = async (filters?: {
  statut?: string;
  type?: string;
  date_debut?: string;
  date_fin?: string;
  departement_id?: string;
  employe_id?: string;
}): Promise<Conge[]> => {
  const response = await api.get<{ data: Conge[] }>('/conges', { params: filters });
  return response.data.data;
};

const tabs = [
  { key: 'tous', label: 'Tous' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'approuve', label: 'Approuvés' },
  { key: 'refuse', label: 'Refusés' },
];

const typesConge = ['conge_paye', 'rtt', 'conge_sans_solde', 'maladie', 'formation'];
const departements = ['IT', 'RH', 'Ventes', 'Marketing', 'Finance', 'Opérations'];

export default function RHCongesPage() {
  const [activeTab, setActiveTab] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  
  const [isValiderModalOpen, setIsValiderModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);

  const queryClient = useQueryClient();

  const { data: conges, isLoading } = useQuery({
    queryKey: ['conges-rh', activeTab, { type: filterType, date_debut: filterDateDebut, date_fin: filterDateFin, departement_id: filterDepartement }],
    queryFn: () => fetchConges({
      statut: activeTab === 'tous' ? undefined : activeTab,
      type: filterType,
      date_debut: filterDateDebut,
      date_fin: filterDateFin,
      departement_id: filterDepartement,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/conges/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conges-rh'] });
    },
  });

  const handleValider = (conge: Conge) => {
    setSelectedConge(conge);
    setIsValiderModalOpen(true);
  };

  const handleView = (conge: Conge) => {
    setSelectedConge(conge);
    setIsViewModalOpen(true);
  };

  const handleDelete = (conge: Conge) => {
    if (confirm(`Supprimer la demande de congé #${conge.id} ?`)) {
      deleteMutation.mutate(conge.id);
    }
  };

  const getStatutBadge = (etat: string) => {
    switch (etat) {
      case 'approuve':
        return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Approuvé</span>;
      case 'en_attente':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">En attente</span>;
      case 'partiellement_valide':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Partiel</span>;
      case 'refuse':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Refusé</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{etat}</span>;
    }
  };

  const getValidationBadges = (conge: Conge) => {
    const validations = conge.validations || [];
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((niveau) => {
          const validation = validations.find((v) => v.niveau === niveau);
          let colorClass = 'bg-gray-100 text-gray-500';
          let icon = '⏳';
          if (validation?.decision === 'approuve') {
            colorClass = 'bg-emerald-100 text-emerald-700';
            icon = '✓';
          } else if (validation?.decision === 'refuse') {
            colorClass = 'bg-red-100 text-red-700';
            icon = '✕';
          }
          return (
            <span key={niveau} className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`} title={validation?.commentaire || 'En attente'}>
              N{niveau} {icon}
            </span>
          );
        })}
      </div>
    );
  };

  const calculateDays = (dateDebut: string, dateFin: string) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const filteredConges = conges?.filter((conge) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      conge.employe?.nom?.toLowerCase().includes(search) ||
      conge.employe?.prenom?.toLowerCase().includes(search) ||
      conge.type?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      key: 'employe',
      header: 'Employé',
      render: (conge: Conge) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            {conge.employe?.prenom?.[0]}{conge.employe?.nom?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{conge.employe?.prenom} {conge.employe?.nom}</p>
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
          <p className="text-gray-900">{conge.date_debut} au {conge.date_fin}</p>
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
      key: 'validations',
      header: 'Validations',
      render: (conge: Conge) => getValidationBadges(conge),
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
          {(conge.statut === 'en_attente' || conge.statut === 'partiellement_valide') && (
            <button
              onClick={() => handleValider(conge)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Valider/Refuser"
            >
              <CheckCircle size={18} />
            </button>
          )}
          <button
            onClick={() => handleDelete(conge)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
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
        title="Gestion des Congés"
        subtitle="Validation des demandes de congés (RH)"
        icon={<Calendar size={28} className="text-blue-600" />}
        actions={
          <Link
            href="/rh/conges/corbeille"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Trash2 size={20} />
            Corbeille
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.key
                ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              {typesConge.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <select
            value={filterDepartement}
            onChange={(e) => setFilterDepartement(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les départements</option>
            {departements.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={filterDateDebut}
              onChange={(e) => setFilterDateDebut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Date début"
            />
            <input
              type="date"
              value={filterDateFin}
              onChange={(e) => setFilterDateFin(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Date fin"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredConges || []}
        isLoading={isLoading}
        keyExtractor={(conge) => conge.id}
        emptyMessage="Aucune demande de congé"
      />

      {selectedConge && (
        <>
          <ValiderCongeModal
            isOpen={isValiderModalOpen}
            onClose={() => setIsValiderModalOpen(false)}
            conge={selectedConge}
          />
          <ViewCongeModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            conge={selectedConge}
          />
        </>
      )}
    </div>
  );
}
