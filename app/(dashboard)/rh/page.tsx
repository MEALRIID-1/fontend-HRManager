'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, UserPlus, CheckCircle, FileText, TrendingUp, Check, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Types pour le dashboard RH
interface RHDashboardData {
  stats: {
    employes_actifs: number;
    nouvelles_embauches: number;
    conges_n2_attente: number;
    contrats_crees: number;
  };
  evolution_embauches: { mois: string; nombre: number }[];
  conges_n2_attente: {
    id: number;
    employe_nom: string;
    employe_prenom: string;
    type: string;
    date_debut: string;
    date_fin: string;
    jours: number;
  }[];
}

const fetchRHDashboard = async (): Promise<RHDashboardData> => {
  const response = await api.get<{ data: RHDashboardData }>('/dashboard/rh');
  return response.data.data;
};

// Skeleton components
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-14 w-14 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  );
}

export default function RHDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['rh-dashboard'],
    queryFn: fetchRHDashboard,
    refetchInterval: 5 * 60 * 1000,
  });

  // Données de démonstration
  const demoData: RHDashboardData = {
    stats: {
      employes_actifs: 42,
      nouvelles_embauches: 5,
      conges_n2_attente: 8,
      contrats_crees: 12,
    },
    evolution_embauches: [
      { mois: 'Jan', nombre: 2 },
      { mois: 'Fév', nombre: 3 },
      { mois: 'Mar', nombre: 1 },
      { mois: 'Avr', nombre: 4 },
      { mois: 'Mai', nombre: 5 },
      { mois: 'Juin', nombre: 5 },
    ],
    conges_n2_attente: [
      { id: 1, employe_nom: 'Martin', employe_prenom: 'Sophie', type: 'conge_paye', date_debut: '2024-07-15', date_fin: '2024-07-25', jours: 10 },
      { id: 2, employe_nom: 'Dubois', employe_prenom: 'Lucas', type: 'rtt', date_debut: '2024-07-20', date_fin: '2024-07-20', jours: 1 },
      { id: 3, employe_nom: 'Leroy', employe_prenom: 'Emma', type: 'conge_sans_solde', date_debut: '2024-08-01', date_fin: '2024-08-10', jours: 10 },
    ],
  };

  const dashboardData = data || demoData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord RH</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const stats = dashboardData.stats;

  const statCards = [
    {
      title: 'Employés actifs',
      value: stats.employes_actifs,
      icon: <Users className="text-white" size={24} />,
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Nouvelles embauches ce mois',
      value: stats.nouvelles_embauches,
      icon: <UserPlus className="text-white" size={24} />,
      iconBg: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Congés à valider (N2)',
      value: stats.conges_n2_attente,
      icon: <CheckCircle className="text-white" size={24} />,
      iconBg: 'bg-amber-500',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Contrats créés ce mois',
      value: stats.contrats_crees,
      icon: <FileText className="text-white" size={24} />,
      iconBg: 'bg-purple-500',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord RH</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border-2 ${card.borderColor} p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.iconBg} p-3 rounded-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique + Congés à valider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LineChart - Évolution embauches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Évolution des embauches (6 mois)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.evolution_embauches}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="mois" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => [`${value} embauches`, 'Nombre']}
                />
                <Line type="monotone" dataKey="nombre" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congés à valider N2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-amber-600" />
            Congés à valider (Validation N2)
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.conges_n2_attente.map((conge) => (
              <div key={conge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                    {conge.employe_prenom[0]}{conge.employe_nom[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{conge.employe_prenom} {conge.employe_nom}</p>
                    <p className="text-sm text-gray-500">
                      {conge.type.replace('_', ' ')} • {conge.date_debut} au {conge.date_fin} • {conge.jours} jours
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Valider">
                    <Check size={18} />
                  </button>
                  <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Refuser">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
