'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Download, Activity, Loader2, Clock, Shield } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

const fetchUsers = async () => {
  const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
  return response.data.data;
};

const generateActiviteReport = async (filters: any) => {
  const response = await api.get('/rapports/activite', { params: filters });
  return response.data;
};

const exportPDF = async (filters: any) => {
  const response = await api.get('/rapports/activite/export-pdf', {
    params: { type: 'activite', ...filters },
    responseType: 'blob',
  });
  return response.data;
};

const exportExcel = async (filters: any) => {
  const response = await api.get('/rapports/activite/export-excel', {
    params: { type: 'activite', ...filters },
    responseType: 'blob',
  });
  return response.data;
};

export default function ReportActiviteTab() {
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    date_debut: '',
    date_fin: '',
  });
  const [isGenerated, setIsGenerated] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const generateMutation = useMutation({
    mutationFn: generateActiviteReport,
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
    a.download = 'rapport_activite.pdf';
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
    a.download = 'rapport_activite.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const reportData = generateMutation.data;
  const isLoading = generateMutation.isPending;
  const reportPayload = reportData?.data ?? null;
  const activites = Array.isArray(reportPayload?.activites) ? reportPayload.activites : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres du rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
            <select
              value={filters.user_id}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.prenom} {user.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Toutes</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
              <option value="login">Connexion</option>
              <option value="logout">Déconnexion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur avant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur après</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activites.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.user?.prenom} {item.user?.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Shield size={14} className="text-purple-600" />
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.entite || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {item.valeur_avant ? JSON.stringify(item.valeur_avant) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {item.valeur_apres ? JSON.stringify(item.valeur_apres) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ip_address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {item.created_at}
                        </span>
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
