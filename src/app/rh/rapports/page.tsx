"use client";

import React, { useEffect, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  BarChart3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from "@/components/charts";
import { rapportService } from "@/lib/services";
import toast from "react-hot-toast";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type RapportType = "effectifs" | "conges" | "absenteisme" | "masse-salariale";

interface RapportData {
  data: any[];
  meta?: { total: number; per_page: number; current_page: number; last_page: number };
  chartData?: any[];
  summary?: { [key: string]: number };
}

// ─── COMPOSANT ILLUSTRATION EMPTY STATE ───────────────────────────────────────
function EmptyStateIllustration() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="60" cy="60" r="50" fill="#F1F5F9" />
        <rect x="35" y="40" width="50" height="40" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M45 55H75" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <path d="M45 65H65" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="35" r="15" fill="#3B82F6" />
        <path d="M80 35L83 38L90 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="text-lg font-medium text-slate-800 mb-2">Aucune donnée</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        Aucune donnée disponible pour les critères sélectionnés. Essayez de modifier les filtres.
      </p>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function RhRapportsPage() {
  const [activeTab, setActiveTab] = useState<RapportType>("effectifs");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rapportData, setRapportData] = useState<RapportData | null>(null);
  
  // Filtres
  const [dateDebut, setDateDebut] = useState<string>(
    format(startOfMonth(subMonths(new Date(), 6)), "yyyy-MM-dd")
  );
  const [dateFin, setDateFin] = useState<string>(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [departement, setDepartement] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Chargement des données
  useEffect(() => {
    loadRapportData();
  }, [activeTab, dateDebut, dateFin, departement, currentPage]);

  const loadRapportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        periode_debut: dateDebut,
        periode_fin: dateFin,
        departement: departement || undefined,
        page: currentPage,
        per_page: 10,
      };

      let response;
      switch (activeTab) {
        case "effectifs":
          response = await rapportService.getRapportEffectifs(params);
          break;
        case "conges":
          response = await rapportService.getRapportConges(params);
          break;
        case "absenteisme":
          response = await rapportService.getRapportAbsenteisme(params);
          break;
        case "masse-salariale":
          response = await rapportService.getRapportMasseSalariale(params);
          break;
        default:
          response = await rapportService.getRapportEffectifs(params);
      }

      if (response.success) {
        setRapportData(response.data);
      } else {
        setError(response.message || "Erreur lors du chargement du rapport");
        toast.error(response.message || "Erreur lors du chargement");
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur de connexion";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      toast.loading(`Export ${format.toUpperCase()} en cours...`);
      const params = {
        type: activeTab,
        format: (format === "excel" ? "xlsx" : format) as "csv" | "pdf" | "xlsx",
        periode_debut: dateDebut,
        periode_fin: dateFin,
        departement: departement || undefined,
      };
      
      const response = await rapportService.exporterRapport(params);
      
      if (response.success && response.data?.url) {
        window.open(response.data.url, "_blank");
        toast.success(`Export ${format.toUpperCase()} généré avec succès`);
      } else {
        toast.error("Échec de la génération de l'export");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'export");
    }
  };

  const formatCurrencyXAF = (value: number = 0) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Rendu du tableau selon le type de rapport
  const renderTable = () => {
    if (!rapportData?.data || rapportData.data.length === 0) {
      return <EmptyStateIllustration />;
    }

    const data = rapportData.data;

    switch (activeTab) {
      case "effectifs":
        return (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Département</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Poste</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date embauche</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.nom} {item.prenom}</td>
                  <td className="px-4 py-3">{item.departement}</td>
                  <td className="px-4 py-3">{item.poste}</td>
                  <td className="px-4 py-3">{item.date_embauche ? format(new Date(item.date_embauche), "dd/MM/yyyy") : "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.statut === "ACTIF" ? "green" : "gray"}>{item.statut}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "conges":
        return (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Période</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Jours</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.employe_nom}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.date_debut} → {item.date_fin}</td>
                  <td className="px-4 py-3">{item.nb_jours}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      item.statut === "APPROUVE" ? "green" :
                      item.statut === "REFUSE" ? "red" :
                      item.statut === "EN_ATTENTE" ? "yellow" : "gray"
                    }>{item.statut}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "absenteisme":
        return (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Département</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Jours absents</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">% Absentéisme</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dernier congé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.nom} {item.prenom}</td>
                  <td className="px-4 py-3">{item.departement}</td>
                  <td className="px-4 py-3">{item.jours_absents}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${item.taux_absenteisme > 10 ? "text-red-600" : "text-green-600"}`}>
                      {item.taux_absenteisme}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.dernier_conge || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "masse-salariale":
        return (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Département</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nb employés</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Masse salariale</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Salaire moyen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">% du total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.departement}</td>
                  <td className="px-4 py-3">{item.nb_employes}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrencyXAF(item.masse_salariale)}</td>
                  <td className="px-4 py-3">{formatCurrencyXAF(item.salaire_moyen)}</td>
                  <td className="px-4 py-3">{item.pourcentage_total}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  // Rendu du graphique selon le type
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (!rapportData?.chartData || rapportData.chartData.length === 0) {
      return (
        <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
          <BarChart3 size={48} className="mb-2 opacity-50" />
          <p>Aucune donnée disponible</p>
        </div>
      );
    }

    const chartData = rapportData.chartData;

    switch (activeTab) {
      case "effectifs":
        return <SimpleBarChart data={chartData} dataKey="nombre" height={300} colors={["#3B82F6"]} />;
      case "conges":
        return <SimplePieChart data={chartData} height={300} colors={["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6"]} />;
      case "absenteisme":
        return <SimpleLineChart data={chartData} dataKey="taux" height={300} color="#ef4444" showArea={true} />;
      case "masse-salariale":
        return <SimpleBarChart data={chartData} dataKey="masse" height={300} colors={["#10b981"]} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Rapports RH" subtitle="Analyses et statistiques RH">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Rapports et analyses</h2>
            <p className="text-sm text-slate-500">Consultez les rapports détaillés et exportez les données</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("csv")}
              className="rounded-lg transition-all duration-200"
            >
              <Download size={16} className="mr-2" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("excel")}
              className="rounded-lg transition-all duration-200"
            >
              <FileSpreadsheet size={16} className="mr-2" />
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("pdf")}
              className="rounded-lg transition-all duration-200"
            >
              <FileText size={16} className="mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card className="p-4 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Date début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => { setDateDebut(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => { setDateFin(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
              <select
                value={departement}
                onChange={(e) => { setDepartement(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Tous les départements</option>
                <option value="TECHNIQUE">Technique</option>
                <option value="RH">Ressources Humaines</option>
                <option value="FINANCE">Finance</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>
            <Button
              size="md"
              variant="ghost"
              onClick={loadRapportData}
              className="rounded-lg transition-all duration-200"
            >
              <Filter size={18} className="mr-2" />
              Filtrer
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as RapportType); setCurrentPage(1); }}>
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="effectifs" className="flex items-center gap-2">
              <Users size={16} />
              <span className="hidden sm:inline">Effectifs</span>
            </TabsTrigger>
            <TabsTrigger value="conges" className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span className="hidden sm:inline">Congés</span>
            </TabsTrigger>
            <TabsTrigger value="absenteisme" className="flex items-center gap-2">
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Absentéisme</span>
            </TabsTrigger>
            <TabsTrigger value="masse-salariale" className="flex items-center gap-2">
              <DollarSign size={16} />
              <span className="hidden sm:inline">Masse Salariale</span>
            </TabsTrigger>
          </TabsList>

          {["effectifs", "conges", "absenteisme", "masse-salariale"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {/* Graphique */}
              <Card className="p-6">
                <CardTitle className="flex items-center gap-2 mb-4 text-lg">
                  <BarChart3 size={20} className="text-blue-500" />
                  Visualisation
                </CardTitle>
                {renderChart()}
              </Card>

              {/* Tableau */}
              <Card className="p-6">
                <CardTitle className="flex items-center justify-between mb-4 text-lg">
                  <span>Détails</span>
                  {rapportData?.summary && (
                    <div className="flex gap-4 text-sm">
                      {Object.entries(rapportData.summary).map(([key, value]) => (
                        <span key={key} className="text-slate-600">
                          <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                          <span className="font-semibold">
                            {typeof value === "number" && value > 1000
                              ? formatCurrencyXAF(value)
                              : value}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </CardTitle>

                {error ? (
                  <div className="rounded-xl p-6 bg-red-50 border border-red-200 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                    <p className="text-red-700">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadRapportData} className="mt-4">
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    {renderTable()}
                  </div>
                )}

                {/* Pagination */}
                {!loading && !error && rapportData?.meta && rapportData.meta.last_page > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      Page {rapportData.meta.current_page} sur {rapportData.meta.last_page}
                      ({rapportData.meta.total} résultats)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <span className="text-sm text-slate-600 px-2">
                        {currentPage} / {rapportData.meta.last_page}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(rapportData.meta!.last_page, p + 1))}
                        disabled={currentPage === rapportData.meta.last_page}
                        className="rounded-lg"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
