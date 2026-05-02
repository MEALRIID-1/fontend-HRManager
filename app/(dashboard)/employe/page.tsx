'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Calendar, FileText, Clock, Sun, Umbrella, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import MesFichesPaie from '@/components/shared/MesFichesPaie';

// Types pour le dashboard Employé
interface EmployeDashboardData {
  jours_conge: {
    conge_paye: number;
    rtt: number;
    conge_sans_solde: number;
  };
  demandes_en_cours: number;
  contrat: {
    type: string;
    date_debut: string;
    date_fin: string | null;
  };
  prochains_conges: {
    id: number;
    type: string;
    date_debut: string;
    date_fin: string;
    jours: number;
  }[];
  dernieres_demandes: {
    id: number;
    type: string;
    date_debut: string;
    date_fin: string;
    etat: 'en_attente' | 'approuve' | 'refuse' | 'partiellement_valide';
  }[];
}

const fetchEmployeDashboard = async (): Promise<EmployeDashboardData> => {
  const response = await api.get<{ data: EmployeDashboardData }>('/dashboard/employe');
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

// Calendrier simplifié custom
function MiniCalendar({ conges }: { conges: { date_debut: string; date_fin: string }[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const isDateInConge = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return conges.some(conge => {
      const start = new Date(conge.date_debut);
      const end = new Date(conge.date_fin);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
          <div key={`${day}-${index}`} className="p-2 text-gray-500 font-medium">{day}</div>
        ))}
        {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isConge = isDateInConge(day);
          const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
          return (
            <div
              key={day}
              className={`p-2 rounded-lg ${
                isToday ? 'bg-blue-100 text-blue-700 font-bold' : ''
              } ${isConge ? 'bg-orange-100 text-orange-700' : ''} ${!isToday && !isConge ? 'hover:bg-gray-50' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-100 rounded"></div>
          <span>Congé</span>
        </div>
      </div>
    </div>
  );
}

const getEtatBadge = (etat: string) => {
  switch (etat) {
    case 'en_attente':
      return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'En attente' };
    case 'approuve':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approuvé' };
    case 'refuse':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Refusé' };
    case 'partiellement_valide':
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Partiel' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: etat };
  }
};

export default function EmployeDashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['employe-dashboard'],
    queryFn: fetchEmployeDashboard,
    refetchInterval: 5 * 60 * 1000,
  });

  // Données de démonstration
  const demoData: EmployeDashboardData = {
    jours_conge: {
      conge_paye: 18,
      rtt: 5,
      conge_sans_solde: 0,
    },
    demandes_en_cours: 2,
    contrat: {
      type: 'CDI',
      date_debut: '2023-01-15',
      date_fin: null,
    },
    prochains_conges: [
      { id: 1, type: 'conge_paye', date_debut: '2024-08-15', date_fin: '2024-08-22', jours: 7 },
      { id: 2, type: 'rtt', date_debut: '2024-09-06', date_fin: '2024-09-06', jours: 1 },
    ],
    dernieres_demandes: [
      { id: 1, type: 'conge_paye', date_debut: '2024-07-15', date_fin: '2024-07-20', etat: 'approuve' },
      { id: 2, type: 'rtt', date_debut: '2024-07-25', date_fin: '2024-07-25', etat: 'en_attente' },
      { id: 3, type: 'conge_paye', date_debut: '2024-08-01', date_fin: '2024-08-05', etat: 'en_attente' },
      { id: 4, type: 'conge_paye', date_debut: '2024-06-10', date_fin: '2024-06-15', etat: 'refuse' },
    ],
  };

  const dashboardData = data || demoData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mon Espace Employé</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Jours de congé restants',
      value: dashboardData.jours_conge.conge_paye,
      subtext: `+ ${dashboardData.jours_conge.rtt} RTT`,
      icon: <Sun className="text-white" size={24} />,
      iconBg: 'bg-orange-500',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Demandes en cours',
      value: dashboardData.demandes_en_cours,
      subtext: 'En attente de validation',
      icon: <Clock className="text-white" size={24} />,
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Contrat actif',
      value: dashboardData.contrat.type,
      subtext: `Depuis ${new Date(dashboardData.contrat.date_debut).toLocaleDateString('fr-FR')}`,
      icon: <FileText className="text-white" size={24} />,
      iconBg: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Bonjour, {user?.prenom} !
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border-2 ${card.borderColor} p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
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
        {/* Mon Planning - Calendrier */}
        <div className="space-y-6">
          <MiniCalendar conges={dashboardData.prochains_conges} />

          {/* Mon Contrat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-600" />
              Mon Contrat
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Type</span>
                <span className="font-medium">{dashboardData.contrat.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date de début</span>
                <span className="font-medium">{new Date(dashboardData.contrat.date_debut).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Date de fin</span>
                <span className="font-medium">{dashboardData.contrat.date_fin ? new Date(dashboardData.contrat.date_fin).toLocaleDateString('fr-FR') : 'CDI en cours'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mes Dernières Demandes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Umbrella size={20} className="text-blue-600" />
            Mes Dernières Demandes
          </h3>
          <div className="space-y-3">
            {dashboardData.dernieres_demandes.slice(0, 5).map((demande) => {
              const badge = getEtatBadge(demande.etat);
              return (
                <div key={demande.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{demande.type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500">
                      {demande.date_debut} au {demande.date_fin}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mes Fiches de Paie */}
        <MesFichesPaie />
      </div>
    </div>
  );
}
