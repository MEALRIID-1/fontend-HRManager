'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ReportCongesTab from './reports/ReportCongesTab';
import ReportEmployesTab from './reports/ReportEmployesTab';
import ReportActiviteTab from './reports/ReportActiviteTab';

interface ReportsProps {
  isAdmin?: boolean;
}

export default function Reports({ isAdmin = false }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'conges' | 'employes' | 'activite'>('conges');

  const tabs: Array<{ id: 'conges' | 'employes' | 'activite'; label: string }> = [
    { id: 'conges', label: 'Rapport Congés' },
    { id: 'employes', label: 'Rapport Employés' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'activite', label: 'Rapport Activité' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports et Statistiques"
        subtitle="Génération et export de rapports détaillés"
        icon={<TrendingUp size={28} className="text-purple-600" />}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
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
      <ErrorBoundary>
        {activeTab === 'conges' && <ReportCongesTab />}
        {activeTab === 'employes' && <ReportEmployesTab />}
        {activeTab === 'activite' && isAdmin && <ReportActiviteTab />}
      </ErrorBoundary>
    </div>
  );
}
