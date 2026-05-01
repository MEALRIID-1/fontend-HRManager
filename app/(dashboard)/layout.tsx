'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // AuthGuard: Redirect if no token, fetch user if needed
  useEffect(() => {
    const init = async () => {
      if (!token && typeof window !== 'undefined') {
        router.push('/login');
        return;
      }

      // If we have a token but no user in store, fetch it
      if (token && !user) {
        try {
          await fetchMe?.();
        } catch (error) {
          console.error('Failed to fetch user:', error);
          router.push('/login');
        }
      }
      setIsLoading(false);
    };

    init();
  }, [token, user, router, fetchMe]);

  // Role-based route protection
  useEffect(() => {
    if (!user || !pathname || isLoading) return;

    // Use normalized primary role from the store for routing
    const primaryRole = (useAuthStore.getState().getPrimaryRoleSlug?.() || '').toLowerCase();
    const allowedRoutes: Record<string, string[]> = {
      directeur: ['/directeur'],
      admin: ['/directeur'],
      rh: ['/rh'],
      manager: ['/manager'],
      employe: ['/employe'],
    };

    const routesForRole = allowedRoutes[primaryRole] || allowedRoutes['employe'];
    const isAllowed = routesForRole.some(route => pathname.startsWith(route));
    if (!isAllowed) {
      // Redirect to user's dashboard (map admin -> /directeur)
      const target = primaryRole === 'admin' ? '/directeur' : `/${primaryRole}`;
      router.push(target);
    }
  }, [user, pathname, router, isLoading]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!token || isLoading) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
