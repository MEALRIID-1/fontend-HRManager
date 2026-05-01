'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Shield, Plus, Edit, Trash, Loader2, Users, Key } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import { Switch } from '@/components/ui/switch';

const fetchRoles = async () => {
  const response = await api.get<{ data: any[] }>('/parametres/roles');
  return response.data.data;
};

const fetchPermissions = async (roleId: number) => {
  const response = await api.get<{ data: any[] }>(`/api/v1/parametres/roles/${roleId}/permissions`);
  return response.data.data;
};

const savePermissions = async (roleId: number, permissions: number[]) => {
  const response = await api.put(`/api/v1/parametres/roles/${roleId}/permissions`, { permissions });
  return response.data;
};

const deleteRole = async (roleId: number) => {
  const response = await api.delete(`/api/v1/parametres/roles/${roleId}`);
  return response.data;
};

const permissionGroups = [
  {
    name: 'Employés',
    permissions: [
      { id: 1, name: 'Voir employés' },
      { id: 2, name: 'Créer employé' },
      { id: 3, name: 'Modifier employé' },
      { id: 4, name: 'Supprimer employé' },
    ],
  },
  {
    name: 'Congés',
    permissions: [
      { id: 5, name: 'Voir congés' },
      { id: 6, name: 'Valider congés' },
      { id: 7, name: 'Refuser congés' },
      { id: 8, name: 'Gérer ses congés' },
    ],
  },
  {
    name: 'Contrats',
    permissions: [
      { id: 9, name: 'Voir contrats' },
      { id: 10, name: 'Créer contrat' },
      { id: 11, name: 'Modifier contrat' },
      { id: 12, name: 'Supprimer contrat' },
    ],
  },
  {
    name: 'Rapports',
    permissions: [
      { id: 13, name: 'Voir rapports' },
      { id: 14, name: 'Exporter rapports' },
      { id: 15, name: 'Générer rapports' },
    ],
  },
  {
    name: 'Paramètres',
    permissions: [
      { id: 16, name: 'Gérer les rôles' },
      { id: 17, name: 'Gérer les permissions' },
      { id: 18, name: 'Modifier profil' },
    ],
  },
  {
    name: 'Fiches de Paie',
    permissions: [
      { id: 19, name: 'Voir fiches de paie' },
      { id: 20, name: 'Générer fiche de paie' },
      { id: 21, name: 'Valider fiche de paie' },
    ],
  },
];

export default function GestionRolesTab() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const { data: rolePermissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['role-permissions', selectedRole?.id],
    queryFn: () => fetchPermissions(selectedRole?.id),
    enabled: !!selectedRole?.id && showPermissionsModal,
  });

  const savePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: number[] }) =>
      savePermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowPermissionsModal(false);
      setSelectedRole(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const handleViewPermissions = async (role: any) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p: any) => p.id) || []);
    setShowPermissionsModal(true);
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    savePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissions: selectedPermissions,
    });
  };

  const handleDeleteRole = (role: any) => {
    if (role.nb_utilisateurs === 0) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des Rôles</h3>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700 transition-colors"
        >
          <Plus size={18} />
          Nouveau Rôle
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role: any) => (
            <div
              key={role.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{role.nom}</h4>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Niveau</span>
                  <span className="font-medium text-gray-900">{role.niveau || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Key size={14} />
                    Permissions
                  </span>
                  <span className="font-medium text-gray-900">{role.nb_permissions || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users size={14} />
                    Utilisateurs
                  </span>
                  <span className="font-medium text-gray-900">{role.nb_utilisateurs || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleViewPermissions(role)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Key size={14} />
                  Permissions
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Modifier"
                >
                  <Edit size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRole(role)}
                  disabled={role.nb_utilisateurs > 0}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={role.nb_utilisateurs > 0 ? 'Impossible de supprimer : utilisateurs assignés' : 'Supprimer'}
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Permissions */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedRole(null);
        }}
        title={`Permissions - ${selectedRole?.nom}`}
        size="lg"
      >
        {isLoadingPermissions ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {permissionGroups.map((group) => (
              <div key={group.name} className="space-y-3">
                <h4 className="font-semibold text-gray-900">{group.name}</h4>
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{permission.name}</span>
                      <Switch
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handleTogglePermission(permission.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedRole(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={savePermissionsMutation.isPending}
                className="rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savePermissionsMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin inline mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder les permissions'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
