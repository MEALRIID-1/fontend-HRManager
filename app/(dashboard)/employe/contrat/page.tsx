'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ViewContratModal from '@/components/modals/contrats/ViewContratModal';
import { FileText, Calendar, DollarSign, Building2, Download, Clock, History } from 'lucide-react';
import { Contrat } from '@/types';

const fetchContrats = async (params?: any) => {
  const response = await api.get<{ data: Contrat[] }>('/contrats', { params });
  return response.data.data;
};

export default function EmployeContratPage() {
  const { user } = useAuthStore();
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);

  const { data: contrats = [], isLoading } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => fetchContrats(),
  });

  const myContrats = useMemo(() => {
    return contrats.filter((c) => (c.user_id === user?.id || (c as any).employe_id === user?.id));
  }, [contrats, user]);

  const activeContract = useMemo(() => {
    return myContrats.find((c) => c.statut === 'actif' || c.etat === 'actif');
  }, [myContrats]);

  const historyContracts = useMemo(() => {
    return myContrats.filter((c) => c.statut !== 'actif' && c.etat !== 'actif');
  }, [myContrats]);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon Contrat"
        subtitle="Consultez votre contrat actif et l'historique de vos contrats"
        icon={<FileText size={28} className="text-green-600" />}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Contrat Actif */}
          {activeContract ? (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-white" size={32} />
                    <div>
                      <h2 className="text-xl font-bold text-white">Contrat {typeLabels[activeContract.type] || activeContract.type}</h2>
                      <p className="text-green-100">Contrat actif</p>
                    </div>
                  </div>
                  <StatusBadge status="actif" size="md" />
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-semibold text-gray-900">{formatDate(activeContract.date_debut)}</p>
                      </div>
                    </div>
                    
                    {activeContract.date_fin && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="text-orange-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date de fin</p>
                          <p className="font-semibold text-gray-900">{formatDate(activeContract.date_fin)}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Département</p>
                        <p className="font-semibold text-gray-900">{activeContract.departement || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <DollarSign className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Salaire brut mensuel</p>
                        <p className="font-semibold text-gray-900">
                          {activeContract.salaire_brut ? `${activeContract.salaire_brut.toLocaleString()} €` : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Poste</p>
                        <p className="font-semibold text-gray-900">{activeContract.poste || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedContrat(activeContract)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={20} />
                    Voir le contrat complet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <FileText className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-500">Aucun contrat actif trouvé</p>
            </div>
          )}

          {/* Historique des contrats */}
          {historyContracts.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <History className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Historique des contrats</h3>
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
                          <p className="font-medium text-gray-900">{typeLabels[contrat.type] || contrat.type}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(contrat.date_debut)} {contrat.date_fin ? `- ${formatDate(contrat.date_fin)}` : ''}
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
