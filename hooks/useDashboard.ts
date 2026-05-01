'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats, ApiResponse } from '@/types';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/admin');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useRHDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'rh'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/rh');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useManagerDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/manager');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useEmployeDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'employe'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/employe');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
