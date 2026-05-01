'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Shield, Loader2, ArrowRight } from 'lucide-react';
import Modal from '@/components/shared/Modal';

const fetchUsers = async () => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
  return response.data.data;
};

const fetchUserPermissions = async (userId: number) => {
  const response = await api.get<{ data: any }>(`/api/v1/parametres/users/${userId}/permissions`);
  return response.data;
};

const fetchRoles = async () => {
  const response = await api.get<{ data: any[] }>('/parametres/roles');
  return response.data.data;
};

const changeUserRole = async (userId: number, roleId: number) => {
  const response = await api.put(`/api/v1/parametres/users/${userId}/role`, { role_id: roleId });
  return response.data;
};

export default function GestionPermissionsUtilisateursTab() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: userPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['user-permissions', selectedUserId],
    queryFn: () => fetchUserPermissions(selectedUserId!),
    enabled: !!selectedUserId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => changeUserRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', selectedUserId] });
      setShowRoleModal(false);
      setSelectedRoleId(null);
    },
  });

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleOpenRoleModal = () => {
    setShowRoleModal(true);
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  const handleSaveRoleChange = () => {
    if (selectedUserId && selectedRoleId) {
      changeRoleMutation.mutate({ userId: selectedUserId, roleId: selectedRoleId });
    }
  };

  const selectedUser = users.find((u: any) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Select Employee */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Choisir un employé</label>
        <select
          value={selectedUserId || ''}
          onChange={(e) => handleUserSelect(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="">Sélectionner un employé</option>
          {users.map((user: any) => (
            <option key={user.id} value={user.id}>
              {user.prenom} {user.nom} - {user.email}
            </option>
          ))}
        </select>
      </div>

      {selectedUserId && selectedUser && (
        <>
          {/* Current Roles */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-purple-600" />
              Rôles actuels
            </h3>
            <div className="space-y-3">
              {selectedUser.roles && selectedUser.roles.length > 0 ? (
                selectedUser.roles.map((role: any) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{role.nom}</p>
                        <p className="text-sm text-gray-500">{role.description || ''}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Aucun rôle assigné</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleOpenRoleModal}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700 transition-colors"
              >
                Changer de rôle
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Effective Permissions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-purple-600" />
              Permissions effectives
            </h3>
            {isLoadingPermissions ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={32} className="animate-spin text-purple-600" />
              </div>
            ) : (userPermissions as any)?.permissions && (userPermissions as any).permissions.length > 0 ? (
              <div className="space-y-3">
                {(userPermissions as any).permissions.map((permission: any) => (
                  <div
                    key={permission.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="p-2 bg-green-100 rounded-full">
                      <Shield size={14} className="text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">{permission.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune permission disponible</p>
            )}
          </div>
        </>
      )}

      {/* Modal Change Role */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedRoleId(null);
        }}
        title="Changer le rôle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un nouveau rôle</label>
            <select
              value={selectedRoleId || ''}
              onChange={(e) => handleRoleChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Sélectionner un rôle</option>
              {roles.map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.nom} - {role.description || ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowRoleModal(false);
                setSelectedRoleId(null);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSaveRoleChange}
              disabled={!selectedRoleId || changeRoleMutation.isPending}
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {changeRoleMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin inline mr-2" />
                  Changement...
                </>
              ) : (
                'Sauvegarder'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
