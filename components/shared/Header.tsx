'use client';

import { useState } from 'react';
import { Menu, ChevronDown, User, Lock, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onMenuClick?: () => void;
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  'directeur': 'Directeur',
  'rh': 'Ressources Humaines',
  'manager': 'Manager',
  'employe': 'Employé',
  'employes': 'Employés',
  'conges': 'Congés',
  'contrats': 'Contrats',
  'fiches-paie': 'Fiches de paie',
  'notifications': 'Notifications',
  'rapports': 'Rapports',
  'parametres': 'Paramètres',
  'profil': 'Mon Profil',
  'contrat': 'Mon Contrat',
};

function generateBreadcrumb(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Dashboard', href: '/' }];

  return parts.map((part, index) => {
    const href = '/' + parts.slice(0, index + 1).join('/');
    const label = breadcrumbMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
    return { label, href };
  });
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const breadcrumbs = generateBreadcrumb(pathname || '');
  const role = user?.roles?.[0]?.nom?.toLowerCase() || '';

  const handleProfile = () => {
    router.push(`/${role}/profil`);
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    // TODO: Implement change password modal/page
    console.log('Change password clicked');
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Menu + Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-gray-500">{user?.roles?.[0]?.nom || 'Utilisateur'}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={16} />
                    Mon profil
                  </button>

                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Lock size={16} />
                    Changer mot de passe
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
