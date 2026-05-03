'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import AddEmployeModal from '@/components/modals/employes/AddEmployeModal';
import EditEmployeModal from '@/components/modals/employes/EditEmployeModal';
import ViewEmployeModal from '@/components/modals/employes/ViewEmployeModal';
import { Users, Plus, Trash2, Eye, Pencil, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const fetchEmployes = async (filters?: {
  search?: string;
  departement?: string;
  role?: string;
  statut?: string;
}): Promise<User[]> => {
  const response = await api.get<{ data: User[] }>('/employes', { params: filters });
  return response.data.data;
};

const departements = ['IT', 'RH', 'Ventes', 'Marketing', 'Finance', 'Opérations'];
const roles = ['admin', 'rh', 'manager', 'employe'];
const statuts = ['actif', 'inactif', 'en_conge'];

export default function RHEmployesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<User | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartement, setFilterDepartement] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const { data: employes, isLoading } = useQuery({
    queryKey: ['employes', { search: searchQuery, departement: filterDepartement, role: filterRole, statut: filterStatut }],
    queryFn: () => fetchEmployes({
      search: searchQuery,
      departement: filterDepartement,
      role: filterRole,
      statut: filterStatut,
    }),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/employes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleEdit = (employe: User) => {
    setSelectedEmploye(employe);
    setIsEditModalOpen(true);
  };

  const handleView = (employe: User) => {
    setSelectedEmploye(employe);
    setIsViewModalOpen(true);
  };

  const handleDelete = (employe: User) => {
    setSelectedEmploye(employe);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEmploye) {
      deleteMutation.mutate(selectedEmploye.id);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Actif</span>;
      case 'inactif':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Inactif</span>;
      case 'en_conge':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">En congé</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{statut}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Admin</span>;
      case 'rh':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">RH</span>;
      case 'manager':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Manager</span>;
      case 'employe':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Employé</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{role}</span>;
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
      key: 'roles',
      header: 'Rôle',
      render: (employe: User) => (
        <div className="flex gap-1">
          {employe.roles?.map((role) => (
            <span key={role.id}>{getRoleBadge(role.slug)}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'date_embauche',
      header: 'Date embauche',
      render: (employe: User) => (
        <span className="text-gray-600">
          {employe.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : '-'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (employe: User) => getStatutBadge(employe.statut || 'actif'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employe: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(employe)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(employe)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(employe)}
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
        title="Gestion des Employés"
        subtitle="Liste et gestion des employés de l'entreprise"
        icon={<Users size={28} />}
        actions={
          <div className="flex gap-3">
            <Link
              href="/rh/employes/corbeille"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 size={20} />
              Corbeille
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              <Plus size={20} />
              Nouvel Employé
            </button>
          </div>
        }
      />

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
              value={filterDepartement}
              onChange={(e) => setFilterDepartement(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les départements</option>
              {departements.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            {statuts.map((statut) => (
              <option key={statut} value={statut}>{statut}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employes || []}
        isLoading={isLoading}
        keyExtractor={(employe) => employe.id}
        emptyMessage="Aucun employé trouvé"
      />

      {/* Modals */}
      <AddEmployeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {selectedEmploye && (
        <>
          <EditEmployeModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            employe={selectedEmploye}
          />
          <ViewEmployeModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            employe={selectedEmploye}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedEmploye?.prenom} ${selectedEmploye?.nom} ? Cet employé sera déplacé vers la corbeille.`}
        confirmText="Supprimer"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
