'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, ApiResponse } from '@/types';

const API_PATH = '/employes';
const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      console.log('Success:', message);
      alert(message); // Replace with proper toast library
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      console.error('Error:', message);
      alert(message); // Replace with proper toast library
    }
  },
};

export const useEmployes = (params?: { page?: number; per_page?: number; search?: string }) => {
  return useQuery({
    queryKey: ['employes', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User[]>>(API_PATH, { params });
      return response.data;
    },
  });
};

export const useEmploye = (id: number) => {
  return useQuery({
    queryKey: ['employe', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(`${API_PATH}/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useTrashedEmployes = () => {
  return useQuery({
    queryKey: ['employes', 'trashed'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User[]>>(`${API_PATH}/trashed`);
      return response.data;
    },
  });
};

export const useCreateEmploye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.post<ApiResponse<User>>(API_PATH, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      queryClient.invalidateQueries({ queryKey: ['employes-manager'] });
      toast.success('Employé créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateEmploye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const response = await api.put<ApiResponse<User>>(`${API_PATH}/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      queryClient.invalidateQueries({ queryKey: ['employes-manager'] });
      queryClient.invalidateQueries({ queryKey: ['employe', variables.id] });
      toast.success('Employé mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteEmploye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${API_PATH}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      queryClient.invalidateQueries({ queryKey: ['employes-manager'] });
      toast.success('Employé supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useRestoreEmploye = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<User>>(`${API_PATH}/${id}/restore`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      queryClient.invalidateQueries({ queryKey: ['employes-manager'] });
      queryClient.invalidateQueries({ queryKey: ['employes', 'trashed'] });
      toast.success('Employé restauré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la restauration');
    },
  });
};
