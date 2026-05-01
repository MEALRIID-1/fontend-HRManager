'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { TrendingUp, Download } from 'lucide-react';

const fetchRapportEquipe = async () => {
  const response = await api.get('/rapports/employes');
  return response.data.data;
};

export default function ManagerRapportsPage() {
  const { data: rapport, isLoading } = useQuery({
    queryKey: ['rapport-equipe'],
    queryFn: fetchRapportEquipe,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp size={32} className="text-purple-600" />
          Rapports d'Équipe
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download size={16} />
          Exporter PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Employés</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? '-' : rapport?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Actifs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{isLoading ? '-' : rapport?.actifs || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Nouveaux (30j)</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{isLoading ? '-' : rapport?.nouveaux || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Départs (30j)</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{isLoading ? '-' : rapport?.departs || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Département</h3>
        <p className="text-gray-500">Les graphiques et statistiques détaillées s'afficheront ici.</p>
      </div>
    </div>
  );
}
