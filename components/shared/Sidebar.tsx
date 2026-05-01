'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Bell, 
  Settings,
  LogOut,
  X,
  TrendingUp,
  User
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  // Navigation items by role
  const navItems: NavItem[] = [
    // Dashboard (all roles)
    { href: '/directeur', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, roles: ['admin'] },
    { href: '/rh', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, roles: ['rh'] },
    { href: '/manager', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, roles: ['manager'] },
    { href: '/employe', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, roles: ['employe'] },
    
    // Employés
    { href: '/directeur/employes', label: 'Employés', icon: <Users size={20} />, roles: ['admin'] },
    { href: '/rh/employes', label: 'Employés', icon: <Users size={20} />, roles: ['rh'] },
    { href: '/manager/employes', label: 'Employés', icon: <Users size={20} />, roles: ['manager'] },
    { href: '/employe/profil', label: 'Mon Profil', icon: <User size={20} />, roles: ['employe'] },
    
    // Congés
    { href: '/directeur/conges', label: 'Congés', icon: <Calendar size={20} />, roles: ['admin'] },
    { href: '/rh/conges', label: 'Congés', icon: <Calendar size={20} />, roles: ['rh'] },
    { href: '/manager/conges', label: 'Congés', icon: <Calendar size={20} />, roles: ['manager'] },
    { href: '/employe/conges', label: 'Mes Congés', icon: <Calendar size={20} />, roles: ['employe'] },
    
    // Contrats
    { href: '/directeur/contrats', label: 'Contrats', icon: <FileText size={20} />, roles: ['admin'] },
    { href: '/rh/contrats', label: 'Contrats', icon: <FileText size={20} />, roles: ['rh'] },
    { href: '/manager/contrats', label: 'Contrats', icon: <FileText size={20} />, roles: ['manager'] },
    { href: '/employe/contrat', label: 'Mon Contrat', icon: <FileText size={20} />, roles: ['employe'] },
    
    // Fiches de paie (all except employe has different label)
    { href: '/directeur/fiches-paie', label: 'Fiches de paie', icon: <CreditCard size={20} />, roles: ['admin', 'rh', 'manager'] },
    
    // Notifications (all roles with badge)
    { href: '/directeur/notifications', label: 'Notifications', icon: <Bell size={20} />, roles: ['admin'], badge: unreadCount },
    { href: '/rh/notifications', label: 'Notifications', icon: <Bell size={20} />, roles: ['rh'], badge: unreadCount },
    { href: '/manager/notifications', label: 'Notifications', icon: <Bell size={20} />, roles: ['manager'], badge: unreadCount },
    { href: '/employe/notifications', label: 'Notifications', icon: <Bell size={20} />, roles: ['employe'], badge: unreadCount },
    
    // Rapports
    { href: '/directeur/rapports', label: 'Rapports', icon: <TrendingUp size={20} />, roles: ['admin'] },
    { href: '/rh/rapports', label: 'Rapports', icon: <TrendingUp size={20} />, roles: ['rh'] },
    { href: '/manager/rapports', label: 'Rapports', icon: <TrendingUp size={20} />, roles: ['manager'] },
    
    // Paramètres (admin only)
    { href: '/directeur/parametres', label: 'Paramètres', icon: <Settings size={20} />, roles: ['admin'] },
  ];

  const normalize = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  
  // Build user roles array from user.roles
  const userRoles = (user?.roles || [])
    .flatMap(r => {
      const roles = [];
      if (r.slug) roles.push(r.slug.toLowerCase());
      if (r.nom) roles.push(normalize(r.nom));
      return roles;
    })
    .filter(Boolean);
  
  // Get primary role
  const primaryRole = useAuthStore.getState().getPrimaryRoleSlug?.() || '';
  const userRole = primaryRole.toLowerCase();
  
  // Filter nav items by role and get correct href based on user's role
  const filteredNavItems = navItems.filter(item => {
    // Check if user has any of the required roles
    const hasRole = item.roles.some(requiredRole => {
      const normalizedRequired = requiredRole.toLowerCase();
      return userRoles.some(userRole => userRole === normalizedRequired || userRole.includes(normalizedRequired));
    });
    
    if (!hasRole) return false;

    // For notifications, rapports - ensure item available for user's primary role
    if (item.href.includes('/notifications') || item.href.includes('/rapports')) {
      const itemBaseRole = item.roles[0]?.toLowerCase() || '';
      return userRole === itemBaseRole;
    }

    return true;
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HRManager</span>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              // Get the correct href based on user's role
              let href = item.href;
              
              // For role-specific paths, replace the role part with user's primary role
              if (userRole && (item.href.includes('/notifications') || item.href.includes('/rapports') || item.href.includes('/employes') || item.href.includes('/conges') || item.href.includes('/contrats'))) {
                // Replace role prefix with user's actual role
                const roleMatch = /\/(admin|directeur|rh|manager|employe)\//.exec(item.href);
                if (roleMatch) {
                  href = item.href.replace(roleMatch[0], `/${userRole}/`);
                }
              }
              
              const isActive = pathname === href || pathname?.startsWith(href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#2563EB] text-white shadow-md' 
                        : 'text-gray-600 hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? 'bg-white text-[#2563EB]' : 'bg-red-500 text-white'
                      }`}>
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
