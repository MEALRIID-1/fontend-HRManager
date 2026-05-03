'use client';

import { useEffect, useState } from 'react';
import FichesPaieList from '@/components/shared/FichesPaieList';
import api from '@/lib/api';

export default function RHFichesPaiePage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await api.get('/auth/me');
        const roles = response.data.data?.roles || [];
        const hasAdminRole = roles.some((r: any) => r.slug === 'admin');
        setIsAdmin(hasAdminRole);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkUserRole();
  }, []);

  return <FichesPaieList isAdmin={isAdmin} />;
}
