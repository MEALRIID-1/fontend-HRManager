"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Clock, CalendarDays, FileText, AlertCircle,
  CheckCircle, XCircle, Bell, ArrowRight, UserCheck,
  Briefcase, ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { cn, fromNow } from "@/lib/utils";
import type { DemandeConge, Notification, Employe, Contrat } from "@/types";
import toast from "react-hot-toast";
import { leaveService, employeService } from "@/lib/services";
import { useAuthStore } from "@/store/auth.store";

// Types pour les données du dashboard
interface DashboardStats {
  demandesEnAttente: number;
  presentsAujourdhui: number;
  absentsAujourdhui: number;
  periodesEssai: number;
  contratsExpirant: number;
}

interface DashboardData {
  stats: DashboardStats;
  demandesRecentes: DemandeConge[];
  notifications: Notification[];
  employesPeriodeEssai: Employe[];
  contratsExpirant: Contrat[];
}

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Chargement des données
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const [congesRes, equipeRes] = await Promise.all([
        leaveService.getAll({ statut: "EN_ATTENTE_N1" }),
        employeService.getAll({ manager_id: user?.id, per_page: 100 } as any),
      ]);

      const demandes: DemandeConge[] = ((congesRes as any)?.data?.data ?? []) as DemandeConge[];
      const equipe: Employe[] = ((equipeRes.data as any)?.data ?? []) as Employe[];

      const actifs = equipe.filter((e: any) => e.statut === "ACTIF" || e.statut === "actif");
      const absents = equipe.filter((e: any) => e.statut === "EN_CONGE" || e.statut === "en_conge");

      const dashboardData: DashboardData = {
        stats: {
          demandesEnAttente: demandes.length,
          presentsAujourdhui: actifs.length,
          absentsAujourdhui: absents.length,
          periodesEssai: 0,
          contratsExpirant: 0,
        },
        demandesRecentes: demandes.slice(0, 5),
        notifications: [],
        employesPeriodeEssai: [],
        contratsExpirant: [],
      };

      setData(dashboardData);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      setIsError(true);
      toast.error("Impossible de charger le dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Actions rapides
  const handleQuickValidate = async (id: string, decision: "approuve" | "refuse") => {
    try {
      if (decision === "approuve") {
        await leaveService.approve(id);
        toast.success("Congé validé");
      } else {
        await leaveService.reject(id);
        toast.success("Congé refusé");
      }
      loadDashboardData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Échec de l'action");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-slate-100" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 h-96 animate-pulse bg-slate-100" />
            <Card className="h-96 animate-pulse bg-slate-100" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-danger mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
          <Button onClick={loadDashboardData}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { stats, demandesRecentes, notifications, employesPeriodeEssai, contratsExpirant } = data;

  return (
    <DashboardLayout
      title="Tableau de bord"
      subtitle={`${stats.presentsAujourdhui} présents aujourd'hui`}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Demandes en attente */}
          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-warning" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Demandes en attente</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.demandesEnAttente}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="text-warning" size={24} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 -ml-2 text-warning"
                onClick={() => router.push("/manager/conges")}
              >
                Valider <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </Card>

          {/* Équipe du jour */}
          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-success" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Présents aujourd'hui</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.presentsAujourdhui}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <UserCheck className="text-success" size={24} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="red" size="sm">{stats.absentsAujourdhui} absents</Badge>
              </div>
            </div>
          </Card>

          {/* Périodes d'essai */}
          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-blue-500" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Périodes d'essai</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.periodesEssai}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <CalendarDays className="text-blue-500" size={24} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {employesPeriodeEssai.length > 0 && `Fin le ${new Date(employesPeriodeEssai[0].dateEmbauche).toLocaleDateString("fr-FR")}`}
              </p>
            </div>
          </Card>

          {/* Contrats expirant */}
          <Card className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-danger" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Contrats expirant</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.contratsExpirant}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
                  <FileText className="text-danger" size={24} />
                </div>
              </div>
              <p className="mt-3 text-xs text-danger">
                {contratsExpirant.length > 0 && `Expire le ${new Date(contratsExpirant[0].dateFin!).toLocaleDateString("fr-FR")}`}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demandes récentes */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} className="text-primary-500" />
                Demandes récentes à valider
                {demandesRecentes.length > 0 && (
                  <Badge variant="blue">{demandesRecentes.length}</Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/manager/conges")}
              >
                Voir tout <ChevronRight size={14} />
              </Button>
            </CardHeader>
            
            <div className="divide-y divide-slate-100">
              {demandesRecentes.length > 0 ? (
                demandesRecentes.slice(0, 5).map((demande) => (
                  <div
                    key={demande.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        nom={demande.employe?.nom}
                        prenom={demande.employe?.prenom}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-slate-800">
                          {demande.employe?.prenom} {demande.employe?.nom}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Badge variant="blue" size="sm">{demande.type}</Badge>
                          <span>
                            {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} →{" "}
                            {new Date(demande.dateFin).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="text-slate-400">({demande.nombreJours}j)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Badge urgence si > 48h */}
                      {new Date(demande.createdAt).getTime() < Date.now() - 48 * 60 * 60 * 1000 && (
                        <Badge variant="red" size="sm">Urgent</Badge>
                      )}
                      
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={<CheckCircle size={14} />}
                        onClick={() => handleQuickValidate(demande.id, "approuve")}
                      >
                        Valider
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        icon={<XCircle size={14} />}
                        onClick={() => handleQuickValidate(demande.id, "refuse")}
                        className="text-danger hover:bg-danger/10"
                      >
                        Refuser
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-500">Aucune demande en attente</p>
                </div>
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bell size={18} className="text-primary-500" />
                Notifications
                {notifications.filter(n => !n.lue).length > 0 && (
                  <Badge variant="red">{notifications.filter(n => !n.lue).length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => router.push("/manager/notifications")}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-colors",
                    notif.lue ? "hover:bg-slate-50" : "bg-blue-50/30 hover:bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!notif.lue && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm",
                        notif.lue ? "text-slate-600" : "text-slate-800"
                      )}>
                        {notif.titre}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {fromNow(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="mx-auto text-slate-300 mb-2" size={24} />
                  <p className="text-sm text-slate-400">Aucune notification</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-100 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push("/manager/notifications")}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
