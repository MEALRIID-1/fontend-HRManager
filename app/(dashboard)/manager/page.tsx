'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Calendar, CheckCircle, UserCheck, Briefcase, Check, X } from 'lucide-react';

// Types pour le dashboard Manager
interface ManagerDashboardData {
  stats: {
    employes_equipe: number;
    conges_n1_attente: number;
    presents_aujourdhui: number;
    en_conge_semaine: number;
  };
  equipe: {
    id: number;
    nom: string;
    prenom: string;
    statut: 'present' | 'conge' | 'absent' | 'teletravail';
  }[];
  conges_n1_attente: {
    id: number;
    employe_nom: string;
    employe_prenom: string;
    type: string;
    date_debut: string;
    date_fin: string;
    jours: number;
  }[];
}

const fetchManagerDashboard = async (): Promise<ManagerDashboardData> => {
  const response = await api.get<{ data: ManagerDashboardData }>('/dashboard/manager');
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

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="space-y-3">
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'present':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Présent' };
    case 'conge':
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En congé' };
    case 'absent':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Absent' };
    case 'teletravail':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Télétravail' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: statut };
  }
};

export default function ManagerDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: fetchManagerDashboard,
    refetchInterval: 5 * 60 * 1000,
  });

  // Données de démonstration
  const demoData: ManagerDashboardData = {
    stats: {
      employes_equipe: 8,
      conges_n1_attente: 3,
      presents_aujourdhui: 6,
      en_conge_semaine: 2,
    },
    equipe: [
      { id: 1, nom: 'Dubois', prenom: 'Lucas', statut: 'present' },
      { id: 2, nom: 'Martin', prenom: 'Sophie', statut: 'teletravail' },
      { id: 3, nom: 'Bernard', prenom: 'Emma', statut: 'conge' },
      { id: 4, nom: 'Petit', prenom: 'Thomas', statut: 'present' },
      { id: 5, nom: 'Robert', prenom: 'Julie', statut: 'present' },
      { id: 6, nom: 'Richard', prenom: 'Nicolas', statut: 'absent' },
    ],
    conges_n1_attente: [
      { id: 1, employe_nom: 'Dubois', employe_prenom: 'Lucas', type: 'conge_paye', date_debut: '2024-07-20', date_fin: '2024-07-25', jours: 5 },
      { id: 2, employe_nom: 'Martin', employe_prenom: 'Sophie', type: 'rtt', date_debut: '2024-07-22', date_fin: '2024-07-22', jours: 1 },
      { id: 3, employe_nom: 'Bernard', employe_prenom: 'Emma', type: 'conge_sans_solde', date_debut: '2024-08-01', date_fin: '2024-08-10', jours: 10 },
    ],
  };

  const dashboardData = data && data.stats ? data : demoData;
  const stats = dashboardData?.stats ?? demoData.stats;
  const equipe = Array.isArray(dashboardData?.equipe) ? dashboardData.equipe : demoData.equipe;
  const congesN1Attente = Array.isArray(dashboardData?.conges_n1_attente) ? dashboardData.conges_n1_attente : demoData.conges_n1_attente;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Manager</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Employés dans son équipe',
      value: stats.employes_equipe,
      icon: <Users className="text-white" size={24} />,
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      title: "Congés équipe en attente (N1)",
      value: stats.conges_n1_attente,
      icon: <Calendar className="text-white" size={24} />,
      iconBg: 'bg-amber-500',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Présents aujourd\'hui',
      value: stats.presents_aujourdhui,
      icon: <UserCheck className="text-white" size={24} />,
      iconBg: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'En congé cette semaine',
      value: stats.en_conge_semaine,
      icon: <Briefcase className="text-white" size={24} />,
      iconBg: 'bg-purple-500',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Manager</h1>

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

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Équipe avec statuts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Mon Équipe ({equipe.length} membres)
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {equipe.map((membre) => {
              const badge = getStatutBadge(membre.statut);
              return (
                <div key={membre.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {membre.prenom[0]}{membre.nom[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{membre.prenom} {membre.nom}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Congés à valider N1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-amber-600" />
            Congés à valider (Validation N1)
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {congesN1Attente.map((conge) => (
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
