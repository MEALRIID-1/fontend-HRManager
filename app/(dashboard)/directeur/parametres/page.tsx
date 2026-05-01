'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import MonProfilTab from '@/components/shared/settings/MonProfilTab';
import GestionRolesTab from '@/components/shared/settings/GestionRolesTab';
import GestionPermissionsUtilisateursTab from '@/components/shared/settings/GestionPermissionsUtilisateursTab';

export default function DirecteurParametresPage() {
  const [activeTab, setActiveTab] = useState<'profil' | 'roles' | 'permissions'>('profil');

  const tabs = [
    { id: 'profil' as const, label: 'Mon Profil' },
    { id: 'roles' as const, label: 'Gestion des Rôles' },
    { id: 'permissions' as const, label: 'Gestion des Permissions Utilisateurs' },
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="space-y-6">
        <PageHeader
          title="Paramètres"
          subtitle="Gestion du profil, des rôles et des permissions"
          icon={<Settings size={28} className="text-purple-600" />}
        />

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {activeTab === 'profil' && <MonProfilTab />}
          {activeTab === 'roles' && <GestionRolesTab />}
          {activeTab === 'permissions' && <GestionPermissionsUtilisateursTab />}
        </div>
      </div>
    </div>
  );
}
