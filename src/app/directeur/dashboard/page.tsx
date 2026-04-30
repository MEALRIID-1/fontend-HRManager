"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, CalendarDays, FileText, Zap, AlertTriangle, ArrowRight, BarChart3, Loader2, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { rapportService, leaveService, auditService } from "@/lib/services";
import { SimpleLineChart, SimplePieChart, MultiBarChart } from "@/components/charts";
import { ExportPdfButton } from "@/components/export/ExportPdfButton";
import toast from "react-hot-toast";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

// Types pour les données des graphiques
interface EvolutionData {
  name: string;
  employes: number;
  embauches: number;
  departs: number;
}

interface DepartmentData {
  name: string;
  value: number;
  color?: string;
}

interface LeavesChartData {
  name: string;
  demandes: number;
  approuves: number;
}

export default function DirecteurDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployes: 0,
    congesEnAttenteN3: 0,
    congesBloques: 0,
    masseSalariale: 0,
    totalDemandes: 0,
    totalApprouves: 0,
    totalRefuses: 0,
    totalContrats: 0,
  });
  
  // Données des graphiques
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [repartitionDeptData, setRepartitionDeptData] = useState<DepartmentData[]>([]);
  const [congesData, setCongesData] = useState<LeavesChartData[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  // Historique d'activité
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsMeta, setLogsMeta] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les stats dashboard et les données des graphiques en parallèle
        const [statsRes, leavesRes, chartsRes] = await Promise.all([
          rapportService.getDashboardStats(),
          leaveService.getAll({ statut: "EN_ATTENTE_N3" }),
          rapportService.getChartData("all"),
        ]);

        if (statsRes.success) {
          const data = statsRes.data as any;
          setStats({
            totalEmployes: data?.totalEmployes || 0,
            congesEnAttenteN3: data?.congesEnAttenteN3 || 0,
            congesBloques: data?.congesBloques || 0,
            masseSalariale: data?.masseSalariale || 0,
            totalDemandes: data?.totalDemandes || 0,
            totalApprouves: data?.totalApprouves || 0,
            totalRefuses: data?.totalRefuses || 0,
            totalContrats: data?.totalContrats || 0,
          });
        } else {
          throw new Error((statsRes as any).message || "Erreur chargement stats");
        }

        // Mettre à jour les données des graphiques
        if (chartsRes.success) {
          const chartsData = chartsRes.data;
          if (chartsData?.evolution) setEvolutionData(chartsData.evolution);
          if (chartsData?.departments) setRepartitionDeptData(chartsData.departments);
          if (chartsData?.leaves) setCongesData(chartsData.leaves);
        }
        setChartsLoading(false);
        
        // Charger l'historique d'activité
        loadActivityLogs();
      } catch (err: any) {
        console.error("Erreur dashboard:", err);
        setError(err?.response?.data?.message || err?.message || "Erreur lors du chargement");
        toast.error(err?.response?.data?.message || err?.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Charger l'historique d'activité
  const loadActivityLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await auditService.getLogs({ page: logsPage, limit: 10 });
      if (res.success) {
        const data = res.data as any;
        setActivityLogs(data?.data || data || []);
        setLogsMeta(data?.meta || null);
      }
    } catch (err: any) {
      console.error("Erreur chargement logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Tableau de bord Directeur">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Tableau de bord Directeur">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tableau de bord Directeur">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Tableau de bord</h2>
            <p className="text-sm text-slate-500">Vue d'ensemble de l'activité RH</p>
          </div>
          <ExportPdfButton 
            targetId="dashboard-content" 
            filename="dashboard-directeur.pdf"
            title="Dashboard Directeur - HRManager"
          />
        </div>
        
        {/* Contenu exportable */}
        <div id="dashboard-content" className="space-y-6 bg-white p-4 rounded-xl">
        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total employés</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalEmployes}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>
          <Card className="p-5 border-warning/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Congés en attente N3</p>
                <p className="text-3xl font-bold text-slate-800">{stats.congesEnAttenteN3}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <CalendarDays className="text-warning" size={24} />
              </div>
            </div>
          </Card>
          <Card className="p-5 border-danger/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Congés bloqués ⚡</p>
                <p className="text-3xl font-bold text-danger">{stats.congesBloques}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                <Zap className="text-danger" size={24} />
              </div>
            </div>
            {stats.congesBloques > 0 && (
              <Button variant="ghost" size="sm" className="mt-2 text-danger" onClick={() => router.push("/directeur/conges?tab=super")}>
                Agir <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Masse salariale/mois</p>
                <p className="text-3xl font-bold text-slate-800">{formatXAF(stats.masseSalariale)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <FileText className="text-success" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* KPIs secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total demandes congés</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalDemandes}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Congés approuvés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalApprouves}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Congés refusés</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.totalRefuses}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total contrats</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalContrats}</p>
            </div>
          </Card>
        </div>

        {/* Alert Banner - conditionnelle */}
        {stats.congesBloques > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-amber-800">{stats.congesBloques} demande{stats.congesBloques > 1 ? 's' : ''} de congé requièrent une super validation</p>
              <p className="text-sm text-amber-700 mt-1">Des demandes sont bloquées dans le workflow depuis plus de 72h.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => router.push("/directeur/conges?tab=super")}>
              Voir les demandes
            </Button>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-primary-500" />
              Évolution effectifs 12 mois
            </CardTitle>
            {chartsLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Chargement...</span>
              </div>
            ) : !evolutionData || evolutionData.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={48} className="mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <MultiBarChart 
                data={evolutionData}
                bars={[
                  { dataKey: "embauches", color: "#22c55e", name: "Embauches" },
                  { dataKey: "departs", color: "#ef4444", name: "Départs" },
                ]}
                height={250}
              />
            )}
          </Card>
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <PieChart size={20} className="text-primary-500" />
              Répartition par département
            </CardTitle>
            {chartsLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Chargement...</span>
              </div>
            ) : !repartitionDeptData || repartitionDeptData.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-400">
                <PieChart size={48} className="mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <SimplePieChart 
                data={repartitionDeptData}
                height={250}
                colors={["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"]}
              />
            )}
          </Card>
        </div>

        {/* Chart Congés par type */}
        <Card className="p-6">
          <CardTitle className="flex items-center gap-2 mb-4">
            <CalendarDays size={20} className="text-primary-500" />
            Demandes de congés par type
          </CardTitle>
          {chartsLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-500">Chargement...</span>
            </div>
          ) : !congesData || congesData.length === 0 ? (
            <div className="h-[250px] flex flex-col items-center justify-center text-slate-400">
              <BarChart3 size={48} className="mb-2 opacity-50" />
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <MultiBarChart 
              data={congesData}
              bars={[
                { dataKey: "demandes", color: "#0ea5e9", name: "Demandes" },
                { dataKey: "approuves", color: "#22c55e", name: "Approuvées" },
              ]}
              height={250}
            />
          )}
        </Card>

        {/* Section Historique d'activité */}
        <Card className="p-6">
          <CardTitle className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-primary-500" />
            Historique d'activité
          </CardTitle>
          
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
              <span className="text-slate-500">Chargement...</span>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun historique d'activité disponible</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Heure</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Entité</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activityLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">
                          {log.created_at ? new Date(log.created_at).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {log.user?.nom} {log.user?.prenom}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={log.action?.includes('SUPPR') ? 'red' : log.action?.includes('CREATION') ? 'green' : 'blue'}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{log.entity_type}</td>
                        <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {logsMeta && logsMeta.last_page > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Page {logsMeta.current_page} sur {logsMeta.last_page}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setLogsPage(p => Math.max(1, p - 1)); loadActivityLogs(); }}
                      disabled={logsPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-slate-600 px-2">
                      {logsPage} / {logsMeta.last_page}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setLogsPage(p => Math.min(logsMeta.last_page, p + 1)); loadActivityLogs(); }}
                      disabled={logsPage === logsMeta.last_page}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
        </div> {/* Fin dashboard-content */}
      </div>
    </DashboardLayout>
  );
}
