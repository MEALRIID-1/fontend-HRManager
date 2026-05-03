'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Conge, ApiResponse } from '@/types';

const API_PATH = '/conges';

export const useConges = (params?: { 
  page?: number; 
  per_page?: number; 
  statut?: string;
  type?: string;
  date_debut?: string;
  date_fin?: string;
}) => {
  return useQuery({
    queryKey: ['conges', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Conge[]>>(API_PATH, { params });
      return response.data;
    },
  });
};

export const useMesConges = () => {
  return useQuery({
    queryKey: ['mes-conges'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Conge[]>>(`${API_PATH}/mes-conges`);
      return response.data;
    },
  });
};

export const useCreateConge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Conge>) => {
      const response = await api.post<ApiResponse<Conge>>(API_PATH, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conges'] });
      queryClient.invalidateQueries({ queryKey: ['mes-conges'] });
    },
  });
};

export const useValidateConge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, decision, motif, commentaire }: { id: number; decision?: 'approuve' | 'refuse'; motif?: string; commentaire?: string }) => {
      const response = await api.post<ApiResponse<Conge>>(`${API_PATH}/${id}/valider`, {
        decision: decision || 'approuve',
        motif: motif || commentaire || 'Validé par le manager (N1)',
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conges'] });
      queryClient.invalidateQueries({ queryKey: ['conge', variables.id] });
    },
  });
};

export const useRefuseConge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, motif_refus }: { id: number; motif_refus: string }) => {
      const response = await api.post<ApiResponse<Conge>>(`${API_PATH}/${id}/refuser`, { motif_refus });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conges'] });
      queryClient.invalidateQueries({ queryKey: ['conge', variables.id] });
    },
  });
};
