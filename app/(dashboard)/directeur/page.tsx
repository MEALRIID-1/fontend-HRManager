'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, FileText, Clock, CheckCircle, TrendingUp, TrendingDown, AlertTriangle, Briefcase } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Types pour le dashboard
interface DashboardData {
  stats: {
    total_employes: number;
    employes_variation: number;
    contrats_actifs: number;
    contrats_variation: number;
    conges_en_attente: number;
    conges_attente_variation: number;
    conges_approuves_mois: number;
    conges_approuves_variation: number;
  };
  conges_par_mois: { mois: string; nombre: number }[];
  repartition_departements: { nom: string; nombre: number }[];
  contrats_expirants: {
    id: number;
    employe_nom: string;
    employe_prenom: string;
    date_fin: string;
    jours_restants: number;
  }[];
  activite_recente: {
    id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    action: string;
    cible: string;
    date: string;
  }[];
}

// Fonction pour formatter les dates relatives
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'à l\'instant';
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours} h`;
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Couleurs pour le graphique pie
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const fetchAdminDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<{ data: DashboardData }>('/dashboard/admin');
  return response.data.data;
};

// Composant Skeleton pour les stats cards
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-14 w-14 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
}

// Composant Skeleton pour les graphiques
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  );
}

export default function DirecteurDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Données de démonstration si l'API n'est pas disponible
  const demoData: DashboardData = {
    stats: {
      total_employes: 42,
      employes_variation: 5.2,
      contrats_actifs: 38,
      contrats_variation: 2.1,
      conges_en_attente: 12,
      conges_attente_variation: -15.3,
      conges_approuves_mois: 28,
      conges_approuves_variation: 8.7,
    },
    conges_par_mois: [
      { mois: 'Jan', nombre: 15 },
      { mois: 'Fév', nombre: 22 },
      { mois: 'Mar', nombre: 18 },
      { mois: 'Avr', nombre: 25 },
      { mois: 'Mai', nombre: 28 },
      { mois: 'Juin', nombre: 20 },
    ],
    repartition_departements: [
      { nom: 'RH', nombre: 8 },
      { nom: 'IT', nombre: 15 },
      { nom: 'Ventes', nombre: 12 },
      { nom: 'Marketing', nombre: 7 },
    ],
    contrats_expirants: [
      { id: 1, employe_nom: 'Dupont', employe_prenom: 'Marie', date_fin: '2024-02-15', jours_restants: 5 },
      { id: 2, employe_nom: 'Martin', employe_prenom: 'Jean', date_fin: '2024-03-01', jours_restants: 18 },
      { id: 3, employe_nom: 'Bernard', employe_prenom: 'Sophie', date_fin: '2024-03-10', jours_restants: 27 },
    ],
    activite_recente: [
      { id: 1, utilisateur_nom: 'Admin', utilisateur_prenom: 'System', action: 'a approuvé', cible: 'congé de Marie Dupont', date: new Date(Date.now() - 5 * 60000).toISOString() },
      { id: 2, utilisateur_nom: 'RH', utilisateur_prenom: 'Manager', action: 'a créé', cible: 'contrat pour Jean Martin', date: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: 3, utilisateur_nom: 'Admin', utilisateur_prenom: 'System', action: 'a modifié', cible: 'fiche de paie #1234', date: new Date(Date.now() - 45 * 60000).toISOString() },
      { id: 4, utilisateur_nom: 'Manager', utilisateur_prenom: 'Team', action: 'a refusé', cible: 'congé de Paul Petit', date: new Date(Date.now() - 2 * 3600000).toISOString() },
    ],
  };

  const dashboardData = data || demoData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Directeur</h1>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats;

  const statCards = [
    {
      title: 'Employés actifs',
      value: stats.total_employes,
      variation: stats.employes_variation,
      icon: <Users className="text-white" size={24} />,
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Contrats actifs',
      value: stats.contrats_actifs,
      variation: stats.contrats_variation,
      icon: <FileText className="text-white" size={24} />,
      iconBg: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Congés en attente',
      value: stats.conges_en_attente,
      variation: stats.conges_attente_variation,
      icon: <Clock className="text-white" size={24} />,
      iconBg: 'bg-amber-500',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Congés approuvés ce mois',
      value: stats.conges_approuves_mois,
      variation: stats.conges_approuves_variation,
      icon: <CheckCircle className="text-white" size={24} />,
      iconBg: 'bg-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Directeur</h1>

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
                <div className="flex items-center gap-1 mt-2">
                  {card.variation > 0 ? (
                    <TrendingUp className="text-emerald-500" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500" size={16} />
                  )}
                  <span className={`text-sm font-medium ${card.variation > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.variation > 0 ? '+' : ''}{card.variation}% vs mois dernier
                  </span>
                </div>
              </div>
              <div className={`${card.iconBg} p-3 rounded-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique Barres - Congés par mois */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Congés par mois
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.conges_par_mois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="mois" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`${value} congés`, 'Nombre']}
                />
                <Bar dataKey="nombre" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Donut - Répartition par département */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-purple-600" />
            Répartition par département
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.repartition_departements}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="nombre"
                  nameKey="nom"
                >
                  {dashboardData.repartition_departements.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number, name: string) => [`${value} employés`, name]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertes - Contrats expirants */}
      {dashboardData.contrats_expirants.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Contrats expirant dans les 30 jours
          </h3>
          <div className="space-y-3">
            {dashboardData.contrats_expirants.map((contrat) => (
              <div
                key={contrat.id}
                className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {contrat.employe_prenom[0]}{contrat.employe_nom[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {contrat.employe_prenom} {contrat.employe_nom}
                    </p>
                    <p className="text-sm text-gray-500">Expire le {contrat.date_fin}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    contrat.jours_restants < 7
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {contrat.jours_restants < 7 ? 'URGENT' : ''} {contrat.jours_restants} jours
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activité Récente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité Récente</h3>
        <div className="space-y-4">
          {dashboardData.activite_recente.map((activite, index) => (
            <div key={activite.id} className="flex gap-4">
              {/* Timeline line */}
              {index !== dashboardData.activite_recente.length - 1 && (
                <div className="absolute left-7 top-12 bottom-0 w-px bg-gray-200" style={{ height: 'calc(100% - 48px)' }}></div>
              )}
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {activite.utilisateur_prenom[0]}{activite.utilisateur_nom[0]}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activite.utilisateur_prenom} {activite.utilisateur_nom}</span>{' '}
                  <span className="text-gray-600">{activite.action}</span>{' '}
                  <span className="font-medium">{activite.cible}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(activite.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
