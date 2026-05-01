'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ViewEmployeManagerModal from '@/components/modals/employes/ViewEmployeManagerModal';
import { Users, Eye, Search } from 'lucide-react';

const fetchEmployesByDepartement = async (departementId: number, search?: string): Promise<User[]> => {
  const response = await api.get<{ data: User[] }>('/employes', { 
    params: { 
      departement_id: departementId,
      search 
    } 
  });
  return response.data.data;
};

export default function ManagerEmployesPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<User | null>(null);

  const { data: employes, isLoading } = useQuery({
    queryKey: ['employes-manager', user?.departement?.id, searchQuery],
    queryFn: () => fetchEmployesByDepartement(user?.departement?.id || 0, searchQuery),
    enabled: !!user?.departement?.id,
  });

  const handleView = (employe: User) => {
    setSelectedEmploye(employe);
    setIsViewModalOpen(true);
  };

  const getStatutCongeBadge = (statut: string) => {
    switch (statut) {
      case 'en_conge':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">En congé</span>;
      case 'present':
        return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Présent</span>;
      case 'teletravail':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Télétravail</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{statut || 'Présent'}</span>;
    }
  };

  const columns = [
    {
      key: 'nom',
      header: 'Employé',
      render: (employe: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            {employe.prenom?.[0]}{employe.nom?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{employe.prenom} {employe.nom}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'poste',
      header: 'Poste',
      render: (employe: User) => <span className="text-gray-600">{employe.poste || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (employe: User) => <span className="text-gray-600">{employe.email}</span>,
    },
    {
      key: 'statut_conge',
      header: 'Statut congé',
      render: (employe: User) => getStatutCongeBadge(employe.statut_conge || 'present'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employe: User) => (
        <button
          onClick={() => handleView(employe)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Voir"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Mon Équipe - ${user?.departement?.nom || 'Département'}`}
        subtitle={`${employes?.length || 0} employé(s) dans votre département`}
        icon={<Users size={28} />}
      />

      {/* Filtre recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employes || []}
        isLoading={isLoading}
        keyExtractor={(employe) => employe.id}
        emptyMessage="Aucun employé dans votre département"
      />

      {selectedEmploye && (
        <ViewEmployeManagerModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          employe={selectedEmploye}
        />
      )}
    </div>
  );
}
