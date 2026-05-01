'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Download, Users, Loader2, Building2, Briefcase, Calendar, UserPlus, UserMinus } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

const fetchDepartements = async () => {
  const response = await api.get<{ data: any[] }>('/departements');
  return response.data.data;
};

const generateEmployesReport = async (filters: any) => {
  const response = await api.get('/rapports/employes', { params: filters });
  return response.data;
};

const exportPDF = async (filters: any) => {
  const response = await api.get('/rapports/export-pdf', {
    params: { type: 'employes', ...filters },
    responseType: 'blob',
  });
  return response.data;
};

const exportExcel = async (filters: any) => {
  const response = await api.get('/rapports/export-excel', {
    params: { type: 'employes', ...filters },
    responseType: 'blob',
  });
  return response.data;
};

export default function ReportEmployesTab() {
  const [filters, setFilters] = useState({
    date_embauche_debut: '',
    date_embauche_fin: '',
    departement_id: '',
    type_contrat: '',
    statut: '',
  });
  const [isGenerated, setIsGenerated] = useState(false);

  const { data: departements = [] } = useQuery({
    queryKey: ['departements'],
    queryFn: fetchDepartements,
  });

  const generateMutation = useMutation({
    mutationFn: generateEmployesReport,
    onSuccess: () => setIsGenerated(true),
  });

  const exportPDFMutation = useMutation({
    mutationFn: exportPDF,
  });

  const exportExcelMutation = useMutation({
    mutationFn: exportExcel,
  });

  const handleGenerate = () => {
    generateMutation.mutate(filters);
  };

  const handleExportPDF = async () => {
    const blob = await exportPDFMutation.mutateAsync(filters);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport_employes.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportExcel = async () => {
    const blob = await exportExcelMutation.mutateAsync(filters);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport_employes.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const reportData = generateMutation.data;
  const isLoading = generateMutation.isPending;

  const stats = reportData?.stats || {
    total_actifs: 0,
    nouveaux_ce_mois: 0,
    departs_ce_mois: 0,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres du rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date embauche début</label>
            <input
              type="date"
              value={filters.date_embauche_debut}
              onChange={(e) => setFilters({ ...filters, date_embauche_debut: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date embauche fin</label>
            <input
              type="date"
              value={filters.date_embauche_fin}
              onChange={(e) => setFilters({ ...filters, date_embauche_fin: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
            <select
              value={filters.departement_id}
              onChange={(e) => setFilters({ ...filters, departement_id: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              {departements.map((dep: any) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
            <select
              value={filters.type_contrat}
              onChange={(e) => setFilters({ ...filters, type_contrat: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="alternance">Alternance</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
              {isLoading ? 'Génération en cours...' : 'Générer le rapport'}
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Loader2 size={48} className="animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Génération du rapport en cours...</p>
        </div>
      )}

      {isGenerated && reportData && (
        <>
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_actifs}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserPlus size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nouveaux ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.nouveaux_ce_mois}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <UserMinus size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Départs ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.departs_ce_mois}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Résultats du rapport</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={exportPDFMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Download size={16} />
                  Exporter PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exportExcelMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Download size={16} />
                  Exporter Excel
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type contrat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date embauche</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.data?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.prenom} {item.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof item.departement === 'object' ? item.departement.nom : item.departement || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type_contrat || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date_embauche || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.salaire ? `${item.salaire.toLocaleString()} €` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.is_active ? 'actif' : 'inactif'} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
