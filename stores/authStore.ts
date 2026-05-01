import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role, Permission } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  
  // Getters
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isRH: () => boolean;
  isManager: () => boolean;
  isEmploye: () => boolean;
  getPrimaryRoleSlug?: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // API returns { success: boolean, message: string, data: { token, user } }
          const response = await api.post<{ success: boolean; message: string; data: { token: string; user: User } }>('/auth/login', { email, password });
          const { token, user } = response.data.data;
          
          set({ user, token, isAuthenticated: true, isLoading: false });
          
          // Store in localStorage for axios interceptor
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Store user role in cookie for middleware
          const userRole = user.roles?.[0]?.nom || 'employe';
          document.cookie = `user_role=${userRole}; path=/; max-age=86400`;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } finally {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },

      fetchMe: async () => {
        try {
          const response = await api.get<{ data: User }>('/auth/me');
          set({ user: response.data.data, isAuthenticated: true });
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),

      // Getters
      hasRole: (role: string) => {
        const user = get().user;
        if (!user || !user.roles) return false;
        const normalize = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const target = normalize(role);
        return user.roles.some((r: Role) => {
          return normalize(r.nom) === target || normalize((r as any).slug) === target;
        });
      },

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        
        // Admin has all permissions
        if (user.roles?.some((r: Role) => r.nom === 'admin')) return true;
        
        // Check direct permissions
        if (user.permissions && user.permissions.includes(permission)) return true;
        
        // Check role permissions
        if (user.roles) {
          for (const role of user.roles) {
            if (role.permissions && role.permissions.some((p: Permission) => p.name === permission)) {
              return true;
            }
          }
        }
        
        return false;
      },

      isAdmin: () => get().hasRole('admin') || get().hasRole('administrateur'),
      isRH: () => get().hasRole('rh') || get().hasRole('ressourceshumaines'),
      isManager: () => get().hasRole('manager'),
      isEmploye: () => get().hasRole('employe') || get().hasRole('employé'),

      // Return a normalized primary role slug to use for routing (admin/rh/manager/employe/directeur)
      getPrimaryRoleSlug: () => {
        const user = get().user;
        if (!user || !user.roles || user.roles.length === 0) return 'employe';
        const normalize = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const role = user.roles[0] as any;
        const slug = normalize(role.slug || '');
        const nom = normalize(role.nom || '');

        if (slug.includes('admin') || nom.includes('administrateur')) return 'admin';
        if (slug.includes('directeur') || nom.includes('directeur')) return 'directeur';
        if (slug.includes('rh') || nom.includes('ressourceshumaines')) return 'rh';
        if (slug.includes('manager') || nom.includes('manager')) return 'manager';
        if (slug.includes('employe') || nom.includes('employe') || nom.includes('employe')) return 'employe';

        // fallback
        return slug || nom || 'employe';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
