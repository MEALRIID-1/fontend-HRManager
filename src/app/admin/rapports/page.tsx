"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { FileText, Download, Calendar, Users, BarChart3, Loader2, AlertTriangle } from "lucide-react";
import { rapportService } from "@/lib/services";
import type { StatsDashboard, RapportConge } from "@/types";
import toast from "react-hot-toast";

export default function AdminRapportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<StatsDashboard | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsRes = await rapportService.getDashboardStats();
        if (statsRes.success) {
          setDashboardStats(statsRes.data);
        } else {
          setError(statsRes.message || "Erreur lors du chargement");
          toast.error(statsRes.message || "Erreur lors du chargement");
        }
      } catch (err: any) {
        const msg = err?.message || "Erreur lors du chargement des rapports";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrencyXAF = (value: number = 0) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = (type: string) => {
    toast.success(`Export ${type} déclenché - Fonctionnalité à implémenter`);
  };

  if (loading) {
    return (
      <DashboardLayout title="Rapports Admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-slate-600">Chargement des rapports...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Rapports Admin">
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger mb-3" />
          <h3 className="text-lg font-semibold text-danger mb-2">Erreur de chargement</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Rapports Administrateur"
      subtitle="Visualisation et export des données RH"
    >
      <div className="space-y-6">
        {/* Actions rapides */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download size={18} className="mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText size={18} className="mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="conges">Congés</TabsTrigger>
            <TabsTrigger value="employes">Employés</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total employés</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardStats?.totalEmployes || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <Users className="text-primary-600" size={24} />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Employés actifs</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardStats?.emploiesActifs || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                    <Users className="text-success" size={24} />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Congés en attente</p>
                    <p className="text-3xl font-bold text-warning">{dashboardStats?.congesEnAttente || 0}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                    <Calendar className="text-warning" size={24} />
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Masse salariale</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrencyXAF(dashboardStats?.masseSalarialeMois || 0)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    <BarChart3 className="text-primary-600" size={24} />
                  </div>
                </div>
              </Card>
            </div>

            {/* KPIs secondaires */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-50">
                <p className="text-xs text-slate-500">Nouveaux ce mois</p>
                <p className="text-xl font-bold text-slate-800">{dashboardStats?.nouveauxCeMois || 0}</p>
              </Card>
              <Card className="p-4 bg-slate-50">
                <p className="text-xs text-slate-500">Départements</p>
                <p className="text-xl font-bold text-slate-800">{dashboardStats?.departements || 0}</p>
              </Card>
              <Card className="p-4 bg-slate-50">
                <p className="text-xs text-slate-500">Taux de présence</p>
                <p className="text-xl font-bold text-success">{dashboardStats?.tauxPresence || 0}%</p>
              </Card>
              <Card className="p-4 bg-slate-50">
                <p className="text-xs text-slate-500">Contrats expirant</p>
                <p className="text-xl font-bold text-danger">{dashboardStats?.contratExpirantBientot || 0}</p>
              </Card>
            </div>
          </TabsContent>

          {/* Congés Tab */}
          <TabsContent value="conges">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} className="text-primary-500" />
                  Rapport des congés
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-slate-800">{dashboardStats?.totalDemandes || 0}</p>
                    <p className="text-sm text-slate-500">Total demandes</p>
                  </div>
                  <div className="p-4 bg-success/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-success">{dashboardStats?.totalApprouves || dashboardStats?.congesApprouves || 0}</p>
                    <p className="text-sm text-slate-500">Approuvées</p>
                  </div>
                  <div className="p-4 bg-danger/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-danger">{dashboardStats?.totalRefuses || 0}</p>
                    <p className="text-sm text-slate-500">Refusées</p>
                  </div>
                </div>
                <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  Graphique répartition des congés - À implémenter
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Employés Tab */}
          <TabsContent value="employes">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} className="text-primary-500" />
                  Rapport des employés
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  Tableau des employés par département - À implémenter
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
