'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Notification, ApiResponse } from '@/types';

const API_PATH = '/notifications';
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

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Notification[]>>(API_PATH);
      return response.data;
    },
    refetchInterval: 30000, // Polling every 30s
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<{ data: number }>(`${API_PATH}/unread-count`);
      return response.data.data;
    },
    refetchInterval: 10000, // Polling every 10s for badge
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Notification[]>>(`${API_PATH}?is_read=false`);
      return response.data;
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<Notification>>(`${API_PATH}/${id}/read`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Notification marquée comme lue');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du marquage');
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse<void>>(`${API_PATH}/read-all`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du marquage');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${API_PATH}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Notification supprimée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
