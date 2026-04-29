"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, CalendarDays, Bell, Clock, CheckCircle,
  AlertTriangle, ChevronRight, User, FileText,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { 
  cn, formatDate, formatCurrency, fromNow, 
  TYPE_CONGE_LABELS, STATUT_CONGE_LABELS, getStatutCongeVariant,
  TYPE_CONTRAT_LABELS, getStatutContratVariant,
  nbJoursEntre,
} from "@/lib/utils";
import { employeeService, type ContratActif, type SoldeConges, type CongeDetail } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import type { Notification } from "@/types";
import toast from "react-hot-toast";

// Types pour les données du dashboard
interface DashboardData {
  contrat: ContratActif | null;
  solde: SoldeConges | null;
  congesRecents: CongeDetail[];
  notifications: Notification[];
}

export default function EmployeDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setNbNotifsNonLues } = useUIStore();
  
  const [data, setData] = useState<DashboardData>({
    contrat: null,
    solde: null,
    congesRecents: [],
    notifications: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Chargement des données
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Appels API parallèles
        const [contratRes, soldeRes, congesRes, notifsRes] = await Promise.all([
          employeeService.getContratActif().catch(() => null),
          employeeService.getSoldeConges().catch(() => null),
          employeeService.getMesConges({ limit: 3, exclure_annulees: true }).catch(() => null),
          employeeService.getNotifications({ statut: "non_lu", limit: 3 }).catch(() => null),
        ]);

        setData({
          contrat: contratRes?.success ? contratRes.data : null,
          solde: soldeRes?.success ? soldeRes.data : null,
          congesRecents: congesRes?.success ? congesRes.data : [],
          notifications: notifsRes?.success ? notifsRes.data : [],
        });

        // Mettre à jour le badge de notifications
        if (notifsRes?.success) {
          const countRes = await employeeService.getNotificationsCount();
          if (countRes.success) {
            setNbNotifsNonLues(countRes.data.count);
          }
        }
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        setIsError(true);
        toast.error("Impossible de charger le tableau de bord");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [setNbNotifsNonLues]);

  // Calculer la durée restante du contrat
  const getDureeContrat = () => {
    if (!data.contrat?.date_fin) return "CDI - Illimité";
    const joursRestants = nbJoursEntre(new Date().toISOString(), data.contrat.date_fin);
    if (joursRestants <= 30) return `${joursRestants} jours restants`;
    const mois = Math.floor(joursRestants / 30);
    return `${mois} mois restants`;
  };

  // Vérifier si contrat expire bientôt
  const isContratExpiringSoon = () => {
    if (!data.contrat?.date_fin) return false;
    const joursRestants = nbJoursEntre(new Date().toISOString(), data.contrat.date_fin);
    return joursRestants <= 30;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="space-y-6">
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-40 animate-pulse bg-slate-100" />
            ))}
          </div>
          <Card className="h-64 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-slate-500 mb-4">
            Impossible de charger vos informations
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Bonjour, ${user?.prenom || "Employé"} !`}
      subtitle="Voici un résumé de votre situation"
    >
      <div className="space-y-6">
        {/* Alerte contrat expirant */}
        {isContratExpiringSoon() && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-warning flex-shrink-0" size={24} />
            <div>
              <p className="font-medium text-warning-dark">
                Votre contrat expire bientôt
              </p>
              <p className="text-sm text-warning-dark/80">
                Il reste {getDureeContrat()}. Contactez la RH pour le renouvellement.
              </p>
            </div>
          </div>
        )}

        {/* Cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mon Contrat */}
          <Card className="hover:shadow-card-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Briefcase className="text-primary-600" size={20} />
                </div>
                <CardTitle className="text-base">Mon Contrat</CardTitle>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              {data.contrat ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Type</span>
                    <span className="font-medium">
                      {TYPE_CONTRAT_LABELS[data.contrat.type as keyof typeof TYPE_CONTRAT_LABELS] || data.contrat.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">État</span>
                    <Badge variant={getStatutContratVariant(data.contrat.etat)} size="sm">
                      {data.contrat.etat === "actif" ? "Actif" : data.contrat.etat}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Période</span>
                    <span className="text-sm">
                      {formatDate(data.contrat.date_debut)} → {data.contrat.date_fin ? formatDate(data.contrat.date_fin) : "..."}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      {getDureeContrat()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucun contrat actif</p>
              )}
            </div>
          </Card>

          {/* Solde Congés */}
          <Card className="hover:shadow-card-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CalendarDays className="text-emerald-600" size={20} />
                </div>
                <CardTitle className="text-base">Solde Congés</CardTitle>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              {data.solde ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-slate-800">
                      {data.solde.conge_annuel}
                    </p>
                    <p className="text-xs text-slate-500">Annuel</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">
                      {data.solde.maladie}
                    </p>
                    <p className="text-xs text-slate-500">Maladie</p>
                  </div>
                  {(data.solde.maternite || 0) > 0 && (
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">
                        {data.solde.maternite}
                      </p>
                      <p className="text-xs text-slate-500">Maternité</p>
                    </div>
                  )}
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600">
                      {data.solde.sans_solde}
                    </p>
                    <p className="text-xs text-slate-500">Sans solde</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Chargement du solde...</p>
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="hover:shadow-card-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Bell className="text-amber-600" size={20} />
                </div>
                <CardTitle className="text-base">Notifications</CardTitle>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              {data.notifications.length > 0 ? (
                <div className="space-y-3">
                  {data.notifications.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => router.push("/employe/notifications")}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notif.lue ? "bg-slate-300" : "bg-primary-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">
                          {notif.titre}
                        </p>
                        <p className="text-xs text-slate-500">
                          {fromNow(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary-600"
                    onClick={() => router.push("/employe/notifications")}
                  >
                    Voir tout <ChevronRight size={16} />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm text-slate-500">Aucune notification</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Demandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Demandes Récentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              iconRight={<ChevronRight size={14} />}
              onClick={() => router.push("/employe/conges")}
            >
              Voir tout
            </Button>
          </CardHeader>
          <div className="space-y-3">
            {data.congesRecents.length > 0 ? (
              data.congesRecents.map((conge) => (
                <div
                  key={conge.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  onClick={() => router.push(`/employe/conges?id=${conge.id}`)}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
                    conge.statut.startsWith("APPROUVE") ? "bg-emerald-100 text-emerald-600" :
                    conge.statut.startsWith("REFUSE") ? "bg-red-100 text-red-600" :
                    "bg-amber-100 text-amber-600"
                  )}>
                    {conge.statut.startsWith("APPROUVE") ? <CheckCircle size={20} /> :
                     conge.statut.startsWith("REFUSE") ? <AlertTriangle size={20} /> :
                     <Clock size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">
                      {TYPE_CONGE_LABELS[conge.type]}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)} · {conge.nombreJours} jours
                    </p>
                  </div>
                  <Badge variant={getStatutCongeVariant(conge.statut)} size="sm">
                    {STATUT_CONGE_LABELS[conge.statut]}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Aucune demande récente</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push("/employe/conges")}
                >
                  Nouvelle demande
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
