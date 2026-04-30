"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, CalendarDays, FileText, Briefcase, BarChart3, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { rapportService, leaveService } from "@/lib/services";
import type { StatsDashboard, PaginatedResponse } from "@/types";
import type { Conge } from "@/lib/services/leave.service";
import { SimplePieChart, SimpleLineChart } from "@/components/charts";
import { ExportPdfButton } from "@/components/export/ExportPdfButton";
import toast from "react-hot-toast";

// Types pour les données des graphiques
interface EvolutionData {
  name: string;
  employes: number;
}

interface LeavesTypeData {
  name: string;
  value: number;
}

export default function RHDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsDashboard | null>(null);
  
  // Données des graphiques
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [congesParTypeData, setCongesParTypeData] = useState<{ name: string; value: number }[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, leavesRes, chartsRes] = await Promise.all([
          rapportService.getDashboardStats(),
          leaveService.getAll({ statut: 'valide_manager' }),
          rapportService.getChartData('all'),
        ]);

        if (statsRes.success) {
          setStats({
            ...statsRes.data,
            congesEnAttenteN2: leavesRes.success ? (leavesRes.data as unknown as PaginatedResponse<Conge>).meta?.total || 0 : 0,
          });
          
          // Mettre à jour les données des graphiques
          if (chartsRes.success) {
            const chartsData = chartsRes.data;
            if (chartsData?.evolution) {
              setEvolutionData(chartsData.evolution.map((item: any) => ({
                name: item.name,
                employes: item.employes,
              })));
            }
            if (chartsData?.leaves) {
              setCongesParTypeData(chartsData.leaves.map((item: any) => ({
                name: item.name,
                value: item.demandes,
              })));
            }
          }
          setChartsLoading(false);
        } else {
          setError(statsRes.message || "Erreur lors du chargement des statistiques");
          toast.error(statsRes.message || "Erreur lors du chargement des statistiques");
        }
      } catch (err: any) {
        const msg = err?.message || "Erreur lors du chargement du tableau de bord";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Tableau de bord RH">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-slate-600">Chargement des données...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Tableau de bord RH">
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger mb-3" />
          <h3 className="text-lg font-semibold text-danger mb-2">Erreur de chargement</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrencyXAF = (value: number = 0) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <DashboardLayout title="Tableau de bord RH">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Tableau de bord RH</h2>
            <p className="text-sm text-slate-500">Vue d'ensemble de l'activité RH</p>
          </div>
          <ExportPdfButton 
            targetId="rh-dashboard-content" 
            filename="dashboard-rh.pdf"
            title="Dashboard RH - HRManager"
          />
        </div>
        
        {/* Contenu exportable */}
        <div id="rh-dashboard-content" className="space-y-6 bg-white p-4 rounded-xl">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total employés</p>
                <p className="text-3xl font-bold text-slate-800">{stats?.totalEmployes || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-warning/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Congés en attente N2</p>
                <p className="text-3xl font-bold text-slate-800">{stats?.congesEnAttenteN2 || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <CalendarDays className="text-warning" size={24} />
              </div>
            </div>
            {(stats?.congesEnAttenteN2 || 0) > 0 && (
              <Button variant="ghost" size="sm" className="mt-2 text-warning" onClick={() => router.push("/rh/conges")}>
                Voir <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </Card>

          <Card className="p-5 border-danger/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Contrats expirant 30j</p>
                <p className="text-3xl font-bold text-danger">{stats?.contratsExpirant30j || stats?.contratExpirantBientot || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                <FileText className="text-danger" size={24} />
              </div>
            </div>
            {(stats?.contratsExpirant30j || stats?.contratExpirantBientot || 0) > 0 && (
              <Button variant="ghost" size="sm" className="mt-2 text-danger" onClick={() => router.push("/rh/contrats")}>
                Agir <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Masse salariale/mois</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrencyXAF(stats?.masseSalarialeMois || 0)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Briefcase className="text-success" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Total demandes congés</p>
            <p className="text-xl font-bold text-slate-800">{stats?.totalDemandes || 0}</p>
          </Card>
          <Card className="p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Congés approuvés</p>
            <p className="text-xl font-bold text-success">{stats?.totalApprouves || stats?.congesApprouves || 0}</p>
          </Card>
          <Card className="p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Congés refusés</p>
            <p className="text-xl font-bold text-danger">{stats?.totalRefuses || 0}</p>
          </Card>
          <Card className="p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Total contrats</p>
            <p className="text-xl font-bold text-slate-800">{stats?.totalContrats || 0}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-primary-500" />
              Répartition des congés par type
            </CardTitle>
            {chartsLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Chargement des données...</span>
              </div>
            ) : !congesParTypeData || congesParTypeData.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={48} className="mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <SimplePieChart 
                data={congesParTypeData}
                height={250}
                colors={["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"]}
              />
            )}
          </Card>
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-primary-500" />
              Évolution des effectifs (6 mois)
            </CardTitle>
            {chartsLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Chargement des données...</span>
              </div>
            ) : !evolutionData || evolutionData.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={48} className="mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <SimpleLineChart 
                data={evolutionData}
                dataKey="employes"
                color="#0ea5e9"
                height={250}
                showArea={true}
              />
            )}
          </Card>
        </div>
        </div> {/* Fin rh-dashboard-content */}
      </div>
    </DashboardLayout>
  );
}
