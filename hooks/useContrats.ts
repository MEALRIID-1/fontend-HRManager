'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Contrat, ApiResponse } from '@/types';

const API_PATH = '/contrats';
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

export const useContrats = (params?: { 
  page?: number; 
  per_page?: number; 
  type?: string;
  etat?: string;
  expirant_bientot?: boolean;
  jours?: number;
}) => {
  return useQuery({
    queryKey: ['contrats', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Contrat[]>>(API_PATH, { params });
      return response.data;
    },
  });
};

export const useContrat = (id: number) => {
  return useQuery({
    queryKey: ['contrat', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Contrat>>(`${API_PATH}/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useContratActif = (employeId: number) => {
  return useQuery({
    queryKey: ['contrat', 'actif', employeId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Contrat>>(`${API_PATH}/actif/${employeId}`);
      return response.data.data;
    },
    enabled: !!employeId,
  });
};

export const useCreateContrat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Contrat>) => {
      const response = await api.post<ApiResponse<Contrat>>(API_PATH, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      toast.success('Contrat créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateContrat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Contrat> }) => {
      const response = await api.put<ApiResponse<Contrat>>(`${API_PATH}/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      queryClient.invalidateQueries({ queryKey: ['contrat', variables.id] });
      toast.success('Contrat mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteContrat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${API_PATH}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      toast.success('Contrat supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useRestoreContrat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<Contrat>>(`${API_PATH}/${id}/restore`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      toast.success('Contrat restauré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la restauration');
    },
  });
};

export const useGenerateContratPDF = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<{ url: string }>>(`${API_PATH}/${id}/imprimer`);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('PDF généré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la génération PDF');
    },
  });
};
