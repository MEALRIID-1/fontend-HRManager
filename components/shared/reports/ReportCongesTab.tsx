'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Calendar, Download, FileText, BarChart3, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import Skeleton from '@/components/shared/Skeleton';

const fetchDepartements = async () => {
  const response = await api.get<{ data: any[] }>('/departements');
  return response.data.data;
};

const generateCongesReport = async (filters: any) => {
  const response = await api.get('/rapports/conges', { params: filters });
  return response.data;
};

const exportPDF = async (filters: any) => {
  const response = await api.get('/rapports/conges/export-pdf', {
    params: { type: 'conges', ...filters },
    responseType: 'blob',
  });
  return response.data;
};

const exportExcel = async (filters: any) => {
  const response = await api.get('/rapports/conges/export-excel', {
    params: { type: 'conges', ...filters },
    responseType: 'blob',
  });
  return response.data;
};

export default function ReportCongesTab() {
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    departement_id: '',
    type: '',
    statut: '',
  });
  const [isGenerated, setIsGenerated] = useState(false);

  const { data: departements = [] } = useQuery({
    queryKey: ['departements'],
    queryFn: fetchDepartements,
  });

  const generateMutation = useMutation({
    mutationFn: generateCongesReport,
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
    a.download = 'rapport_conges.pdf';
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
    a.download = 'rapport_conges.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const reportData = generateMutation.data;
  const isLoading = generateMutation.isPending;
  const reportPayload = reportData?.data ?? null;
  const conges = Array.isArray(reportPayload?.conges) ? reportPayload.conges : [];

  const stats = reportPayload?.statistiques || {
    total: 0,
    approuvees: 0,
    refusees: 0,
    jours_totaux: 0,
  };

  const topEmployees = Array.isArray(reportPayload?.top_employees) ? reportPayload.top_employees : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres du rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de congé</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Tous</option>
              <option value="conge_paye">Congé payé</option>
              <option value="conge_sans_solde">Sans solde</option>
              <option value="rtt">RTT</option>
              <option value="maladie">Maladie</option>
              <option value="formation">Formation</option>
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
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
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

      {isGenerated && reportPayload && (
        <>
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total demandes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="w-5 h-5 bg-green-600 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approuvées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approuvees}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <div className="w-5 h-5 bg-red-600 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Refusées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.refusees}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jours totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.jours_totaux}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {topEmployees.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 size={20} className="text-purple-600" />
                  Top 10 Employés par Jours de Congé
                </h3>
              </div>
              <div className="space-y-3">
                {topEmployees.map((emp: any, index: number) => (
                  <div key={emp.id} className="flex items-center gap-4">
                    <span className="w-8 text-sm text-gray-500">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {emp.prenom} {emp.nom}
                        </span>
                        <span className="text-sm text-gray-600">{emp.total_jours} jours</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${(emp.total_jours / topEmployees[0].total_jours) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb jours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validé par</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conges.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.employe?.prenom} {item.employe?.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type_label || item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date_debut} au {item.date_fin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nombre_jours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.statut} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.valide_par || '-'}
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
