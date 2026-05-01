'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchMe } = useAuthStore();

  useEffect(() => {
    // Verify token on mount
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchMe();
    }
  }, [user, fetchMe]);

  const login = async (email: string, password: string) => {
    const { login: storeLogin } = useAuthStore.getState();
    await storeLogin(email, password);
    
    // Redirect based on role after successful login
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.roles?.[0]) {
      const role = currentUser.roles[0].nom;
      switch (role) {
        case 'admin':
          router.push('/directeur/dashboard');
          break;
        case 'rh':
          router.push('/rh/dashboard');
          break;
        case 'manager':
          router.push('/manager/dashboard');
          break;
        case 'employe':
          router.push('/employe/dashboard');
          break;
        default:
          router.push('/login');
      }
    }
  };

  const logout = async () => {
    const { logout: storeLogout } = useAuthStore.getState();
    await storeLogout();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole: useAuthStore.getState().hasRole,
    hasPermission: useAuthStore.getState().hasPermission,
    isAdmin: useAuthStore.getState().isAdmin,
    isRH: useAuthStore.getState().isRH,
    isManager: useAuthStore.getState().isManager,
    isEmploye: useAuthStore.getState().isEmploye,
  };
}

export const useMe = () => {
  const { fetchMe, user } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      fetchMe();
    }
  }, [user, fetchMe]);

  return { user, isLoading: false };
};
