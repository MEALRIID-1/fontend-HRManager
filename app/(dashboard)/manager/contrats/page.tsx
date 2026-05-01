'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ViewContratModal from '@/components/modals/contrats/ViewContratModal';
import { FileText, Calendar, DollarSign, Building2, Download, Clock, History, Users } from 'lucide-react';
import { Contrat } from '@/types';

const fetchContrats = async (params?: any) => {
  const response = await api.get<{ data: Contrat[] }>('/contrats', { params });
  return response.data.data;
};

const fetchTeamEmployees = async (departementId: number) => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { departement_id: departementId, per_page: 100 } });
  return response.data.data;
};

export default function ManagerContratsPage() {
  const { user } = useAuthStore();
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);

  const departementId = typeof user?.departement === 'object' && user?.departement !== null ? user.departement.id : undefined;

  const { data: contrats = [], isLoading } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => fetchContrats(),
  });

  const { data: teamEmployees = [] } = useQuery({
    queryKey: ['manager-team-employees', departementId],
    queryFn: () => fetchTeamEmployees(departementId as number),
    enabled: !!departementId,
  });

  const teamContrats = useMemo(() => {
    const teamIds = teamEmployees.map((e) => e.id);
    return contrats.filter((c) => teamIds.includes(c.user_id) || teamIds.includes((c as any).employe_id));
  }, [contrats, teamEmployees]);

  const activeContracts = useMemo(() => {
    return teamContrats.filter((c) => c.statut === 'actif' || c.etat === 'actif');
  }, [teamContrats]);

  const historyContracts = useMemo(() => {
    return teamContrats.filter((c) => c.statut !== 'actif' && c.etat !== 'actif');
  }, [teamContrats]);

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

      {!departementId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Aucun département n'est associé à votre compte. La liste des contrats de l'équipe ne peut pas être chargée.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Contrats Actifs de l'équipe */}
          {activeContracts.length > 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-white" size={32} />
                    <div>
                      <h2 className="text-xl font-bold text-white">Contrats Actifs ({activeContracts.length})</h2>
                      <p className="text-blue-100">Membres de l'équipe en poste</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {activeContracts.map((contrat) => (
                  <div
                    key={contrat.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedContrat(contrat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {getAvatarLabel(contrat)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getDisplayName(contrat)}</p>
                          <p className="text-sm text-gray-500">
                            {typeLabels[contrat.type] || contrat.type} - {contrat.poste || 'Sans poste'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Depuis le {formatDate(contrat.date_debut)}</p>
                          {contrat.salaire_brut && (
                            <p className="text-sm font-medium text-gray-900">{contrat.salaire_brut.toLocaleString()} €/mois</p>
                          )}
                        </div>
                        <StatusBadge status="actif" size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <FileText className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-500">Aucun contrat actif dans votre équipe</p>
            </div>
          )}

          {/* Historique des contrats */}
          {historyContracts.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <History className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Historique des contrats ({historyContracts.length})</h3>
              </div>
              
              <div className="space-y-3">
                {historyContracts.map((contrat) => (
                  <div
                    key={contrat.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedContrat(contrat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="text-gray-400" size={18} />
                        <div>
                          <p className="font-medium text-gray-900">{getDisplayName(contrat)}</p>
                          <p className="text-sm text-gray-500">
                            {typeLabels[contrat.type] || contrat.type} - {formatDate(contrat.date_debut)} {contrat.date_fin ? `- ${formatDate(contrat.date_fin)}` : ''}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={contrat.statut || contrat.etat || 'expiré'} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedContrat && (
            <ViewContratModal
              isOpen={!!selectedContrat}
              onClose={() => setSelectedContrat(null)}
              contrat={selectedContrat}
              isAdmin={false}
            />
          )}
        </>
      )}
    </div>
  );
}
