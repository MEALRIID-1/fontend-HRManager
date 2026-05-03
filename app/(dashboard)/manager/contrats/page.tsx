'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ViewContratModal from '@/components/modals/contrats/ViewContratModal';
import { FileText, Calendar, DollarSign, Clock, History, Users } from 'lucide-react';
import { Contrat } from '@/types';

const fetchContrats = async (params?: any) => {
  const response = await api.get<{ data: Contrat[] }>('/contrats', { params });
  return response.data.data;
};

export default function ManagerContratsPage() {
  const { user } = useAuthStore();
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);

  // departement is a string representing the department
  const departement = user?.departement || '';

  const { data: contrats = [], isLoading } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => fetchContrats(),
  });

  // Filter contrats by department
  const filteredContrats = useMemo(() => {
    if (!departement) return contrats;
    return contrats.filter(c => c.departement === departement);
  }, [contrats, departement]);

  const activeContracts = useMemo(() => {
    return filteredContrats.filter((c) => c.statut === 'actif' || c.etat === 'actif');
  }, [filteredContrats]);

  const historyContracts = useMemo(() => {
    return filteredContrats.filter((c) => c.statut !== 'actif' && c.etat !== 'actif');
  }, [filteredContrats]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const typeLabels: Record<string, string> = {
    cdi: 'CDI',
    cdd: 'CDD',
    stage: 'Stage',
    alternance: 'Alternance',
    freelance: 'Freelance',
  };

  const getAvatarLabel = (contrat: Contrat) => {
    const prenom = contrat.employe?.prenom ?? '';
    const nom = contrat.employe?.nom ?? '';
    const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.trim();
    return initials.toUpperCase() || '?';
  };

  const getDisplayName = (contrat: Contrat) => {
    if (contrat.employe?.prenom || contrat.employe?.nom) {
      return `${contrat.employe?.prenom ?? ''} ${contrat.employe?.nom ?? ''}`.trim();
    }
    return contrat.employe?.name ?? 'Employé';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contrats de mon Équipe"
        subtitle="Consultez les contrats actifs et l'historique de votre équipe"
        icon={<Users size={28} className="text-green-600" />}
      />

      {!departement && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Aucun département n'est associé à votre compte. La liste des contrats de l'équipe ne peut pas être chargée.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredContrats.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Aucun contrat trouvé pour votre département</p>
        </div>
      ) : (
        <>
          {/* Contrats Actifs */}
          {activeContracts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="text-green-600" size={20} />
                Contrats Actifs ({activeContracts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeContracts.map((contrat) => (
                  <div
                    key={contrat.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedContrat(contrat)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                        {getAvatarLabel(contrat)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{getDisplayName(contrat)}</p>
                        <p className="text-xs text-gray-500">{typeLabels[contrat.type]}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>Depuis {formatDate(contrat.date_debut)}</span>
                      </div>
                      {contrat.salaire_base && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign size={14} />
                          <span>{contrat.salaire_base.toLocaleString()} XAF</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique */}
          {historyContracts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="text-gray-600" size={20} />
                Historique ({historyContracts.length})
              </h2>
              <div className="space-y-2">
                {historyContracts.map((contrat) => (
                  <div
                    key={contrat.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer opacity-75"
                    onClick={() => setSelectedContrat(contrat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                          {getAvatarLabel(contrat)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{getDisplayName(contrat)}</p>
                          <p className="text-sm text-gray-500">{formatDate(contrat.date_debut)} - {contrat.date_fin ? formatDate(contrat.date_fin) : 'N/A'}</p>
                        </div>
                      </div>
                      <StatusBadge status="termine" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedContrat && (
        <ViewContratModal
          isOpen={!!selectedContrat}
          onClose={() => setSelectedContrat(null)}
          contrat={selectedContrat}
        />
      )}
    </div>
  );
}
