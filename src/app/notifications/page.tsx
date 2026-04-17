"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Bell, AlertTriangle, Clock, FileText, Download, X, ChevronRight, TrendingUp, Activity } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge, Button, Card, CardHeader, CardTitle } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";
import type { Notification } from "@/types";

const styles = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  .animate-slide-in {
    animation: slideIn 0.4s ease-out;
  }
  .animate-pulse-slow {
    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }
`;

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    type: "CONTRAT_EXPIRE_BIENTOT",
    titre: "Contrat expiré détecté",
    message: "Le contrat CDD de Marie Martin expirera dans 10 jours. Vérifiez les documents et relancez la signature.",
    priorite: "URGENTE",
    lue: false,
    lienAction: "/contrats",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "n2",
    userId: "u2",
    type: "DOCUMENT_REQUIS",
    titre: "Document manquant pour embauche",
    message: "Le dossier de Sophie Leroy nécessite une pièce d’identité supplémentaire avant validation finale.",
    priorite: "HAUTE",
    lue: false,
    lienAction: "/employes",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "n3",
    userId: "u3",
    type: "CONGE_SOUMIS",
    titre: "Demande de congé en attente",
    message: "Jean Dupont a soumis une demande de congé du 20 au 25 juillet. Votre validation est requise.",
    priorite: "NORMALE",
    lue: false,
    lienAction: "/conges",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "n4",
    userId: "u4",
    type: "RAPPEL_EVALUATION",
    titre: "Évaluation annuelle planifiée",
    message: "L’évaluation de Paul Bernard est prévue demain. Préparez le planning et le rapport d’accompagnement.",
    priorite: "NORMALE",
    lue: true,
    lienAction: "/rapports",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "n5",
    userId: "u5",
    type: "SYSTEME",
    titre: "Rapport de paie généré",
    message: "Le rapport de paie du mois de juin est prêt. Vous pouvez le télécharger ou l’exporter au format PDF.",
    priorite: "BASSE",
    lue: true,
    lienAction: "/rapports",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const HISTORY_ENTRIES = [
  {
    id: "h1",
    utilisateur: "Admin Martin",
    tache: "Vérification contrat",
    module: "Contrats",
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    details: "Contrat de Marie Martin marqué comme expirant bientôt, en attente de signature RH.",
  },
  {
    id: "h2",
    utilisateur: "RH Sophie",
    tache: "Ajout de document requis",
    module: "Employés",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    details: "Demande de pièce d’identité ajoutée au dossier de Sophie Leroy pour finaliser l’embauche.",
  },
  {
    id: "h3",
    utilisateur: "Manager Paul",
    tache: "Validation de congé",
    module: "Congés",
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    details: "Demande de Jean Dupont validée par le manager, attente de validation RH.",
  },
  {
    id: "h4",
    utilisateur: "Système",
    tache: "Génération de rapport",
    module: "Rapports",
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    details: "Rapport mensuel de paie de juin généré et disponible pour téléchargement.",
  },
  {
    id: "h5",
    utilisateur: "RH Marie",
    tache: "Planification entretien",
    module: "Paie",
    date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    details: "Entretien de suivi salarial programmé pour le 25 juillet avec le département finance.",
  },
];

const FILTERS = [
  { label: "Urgent", value: "urgent" },
  { label: "Demandes", value: "demandes" },
  { label: "Finances", value: "finances" },
];

type FilterKey = "urgent" | "demandes" | "finances";

const isVisibleByFilter = (notification: Notification, filter: FilterKey) => {
  if (filter === "urgent") return notification.priorite === "URGENTE" || notification.priorite === "HAUTE";
  if (filter === "demandes") return notification.type === "CONGE_SOUMIS" || notification.type === "DOCUMENT_REQUIS";
  if (filter === "finances") return notification.type === "CONTRAT_EXPIRE_BIENTOT" || notification.type === "RAPPEL_EVALUATION" || notification.type === "SYSTEME";
  return true;
};

const actionLabel = (notification: Notification) => {
  if (notification.type === "CONTRAT_EXPIRE_BIENTOT") return "Réviser le contrat";
  if (notification.type === "CONGE_SOUMIS") return "Voir le planning";
  if (notification.type === "DOCUMENT_REQUIS") return "Télécharger PDF";
  if (notification.type === "RAPPEL_EVALUATION") return "Voir l’évaluation";
  return "Voir le détail";
};

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("urgent");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.lue).length,
    [notifications]
  );

  const requiredActionsCount = useMemo(
    () => notifications.filter((item) => item.priorite === "URGENTE" || item.type === "CONGE_SOUMIS" || item.type === "DOCUMENT_REQUIS").length,
    [notifications]
  );

  const filteredNotifications = useMemo(
    () => notifications.filter((item) => isVisibleByFilter(item, selectedFilter)),
    [notifications, selectedFilter]
  );

  return (
    <>
      <style>{styles}</style>
      <DashboardLayout
        title="Centre de Notifications"
        subtitle="Surveillez les alertes importantes et les actions requises"
      >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div>
                <CardTitle>Centre de Notifications</CardTitle>
                <p className="text-sm text-slate-500">Toutes les mises à jour récentes et les actions à traiter.</p>
              </div>
            </CardHeader>

            <div className="space-y-6 p-6">
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Toutes les mises à jour</h3>
                    <p className="text-xs text-slate-500">Filtrez les notifications par priorité ou catégorie.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FILTERS.map((filter) => (
                      <Button
                        key={filter.value}
                        variant={selectedFilter === filter.value ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFilter(filter.value as FilterKey)}
                        className={cn(selectedFilter === filter.value ? "bg-primary-600 text-white" : "bg-white", "rounded-full")}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className={cn(
                    "card-hover p-5 border-2 transition-all",
                    unreadCount > 0 ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50" : "border-slate-100 bg-white"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl transition-all",
                        unreadCount > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                      )}>
                        <AlertTriangle size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase text-slate-600 tracking-wider">Alertes non lues</p>
                        <p className={cn(
                          "mt-2 text-3xl font-bold transition-all",
                          unreadCount > 0 ? "text-red-600" : "text-slate-900"
                        )}>
                          {unreadCount}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className={cn(
                    "card-hover p-5 border-2 transition-all",
                    requiredActionsCount > 0 ? "border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50" : "border-slate-100 bg-white"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl transition-all",
                        requiredActionsCount > 0 ? "bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700" : "bg-slate-100 text-slate-600"
                      )}>
                        <Bell size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase text-slate-600 tracking-wider">Actions requises</p>
                        <p className={cn(
                          "mt-2 text-3xl font-bold transition-all",
                          requiredActionsCount > 0 ? "text-primary-600" : "text-slate-900"
                        )}>
                          {requiredActionsCount}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Notifications récentes</h3>
                    <p className="text-xs text-slate-500">Les dernières alertes et actions disponibles dans le système.</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconRight={<ChevronRight size={14} />}
                    onClick={() => setShowHistoryModal(true)}
                  >
                    Charger les notifications précédentes
                  </Button>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 h-24" />
                    ))
                  ) : filteredNotifications.length === 0 ? (
                    <Card className="p-8 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <Bell size={24} className="text-slate-400" />
                        </div>
                      </div>
                      <p className="text-slate-500 font-medium">Aucune notification dans cette catégorie.</p>
                    </Card>
                  ) : (
                    filteredNotifications.map((notification, index) => (
                      <Card 
                        key={notification.id} 
                        className={cn(
                          "card-hover p-5 border-l-4 transition-all",
                          notification.priorite === "URGENTE" ? "border-l-red-500 bg-gradient-to-r from-red-50/80 to-white hover:border-l-red-600" 
                          : notification.priorite === "HAUTE" ? "border-l-yellow-500 bg-gradient-to-r from-yellow-50/80 to-white hover:border-l-yellow-600"
                          : "border-l-primary-500 bg-gradient-to-r from-primary-50/80 to-white hover:border-l-primary-600",
                          "border-r border-t border-b border-slate-100"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <Badge 
                                variant={
                                  notification.priorite === "URGENTE" ? "red" 
                                  : notification.priorite === "HAUTE" ? "yellow" 
                                  : "blue"
                                } 
                                size="sm"
                                className="font-bold"
                              >
                                {notification.priorite}
                              </Badge>
                              <span className="text-slate-500 text-xs font-medium">{formatDateTime(notification.createdAt)}</span>
                              {!notification.lue && (
                                <div className="flex items-center gap-1 ml-auto md:ml-0">
                                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-xs font-bold text-red-600">Nouveau</span>
                                </div>
                              )}
                            </div>
                            <h4 className="mt-3 text-base font-bold text-slate-900 line-clamp-2">{notification.titre}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => window.alert(`${actionLabel(notification)} (simulé)`)}
                              className="font-semibold"
                            >
                              {actionLabel(notification)}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, lue: true } : item))}
                            >
                              {notification.lue ? "✓ Lu" : "Marquer comme lu"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </section>
            </div>
          </Card>

          <Card className="hidden xl:block border-0 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <CardHeader className="relative border-b border-slate-100 pb-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  <Activity size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Aperçu rapide</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Synthèse des actions importantes</p>
                </div>
              </div>
            </CardHeader>
            <div className="relative space-y-3 p-6">
              {/* Dernière mise à jour */}
              <div className="card-hover rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                    <Clock size={20} />
                  </div>
                  <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                    À jour
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Dernière mise à jour</p>
                <p className="text-sm font-bold text-slate-900">{formatDateTime(new Date().toISOString())}</p>
              </div>

              {/* Stats principales avec animations */}
              <div className="grid gap-3">
                {/* Alertes non lues */}
                <div className={cn(
                  "card-hover rounded-2xl border-2 bg-gradient-to-br from-red-50 to-orange-50 p-5 group cursor-pointer",
                  unreadCount > 0 ? "border-red-200 animate-pulse-slow" : "border-slate-100"
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl group-hover:scale-110 transition-transform",
                      unreadCount > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                    )}>
                      <AlertTriangle size={20} />
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-full animate-slide-in">
                        {unreadCount} nouveau
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Alertes non lues</p>
                  <p className={cn(
                    "text-4xl font-bold transition-all",
                    unreadCount > 0 ? "text-red-600" : "text-slate-900"
                  )}>
                    {unreadCount}
                  </p>
                  {unreadCount > 0 && (
                    <p className="text-xs text-red-600 mt-2 font-medium">À traiter rapidement</p>
                  )}
                </div>

                {/* Actions requises */}
                <div className={cn(
                  "card-hover rounded-2xl border-2 bg-gradient-to-br from-primary-50 to-blue-50 p-5 group cursor-pointer",
                  requiredActionsCount > 0 ? "border-primary-200" : "border-slate-100"
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 group-hover:scale-110 transition-transform">
                      <TrendingUp size={20} />
                    </div>
                    {requiredActionsCount > 0 && (
                      <span className="text-xs font-bold text-white bg-primary-600 px-2.5 py-1 rounded-full animate-slide-in">
                        {requiredActionsCount} à faire
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Actions requises</p>
                  <p className={cn(
                    "text-4xl font-bold transition-all",
                    requiredActionsCount > 0 ? "text-primary-600" : "text-slate-900"
                  )}>
                    {requiredActionsCount}
                  </p>
                  {requiredActionsCount > 0 && (
                    <p className="text-xs text-primary-600 mt-2 font-medium">En attente de votre attention</p>
                  )}
                </div>
              </div>

              {/* Statistiques additionnelles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="card-hover rounded-xl border border-slate-100 bg-slate-50 p-3 text-center hover:bg-slate-100">
                  <p className="text-xs text-slate-600 font-medium">Lues</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{notifications.filter(n => n.lue).length}</p>
                </div>
                <div className="card-hover rounded-xl border border-slate-100 bg-slate-50 p-3 text-center hover:bg-slate-100">
                  <p className="text-xs text-slate-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{notifications.length}</p>
                </div>
              </div>

              {/* Action rapide */}
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={() => setShowHistoryModal(true)}
              >
                Voir l'historique complet
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </DashboardLayout>

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="relative border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity size={24} className="text-primary-600" />
                    Historique complet
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Toutes les actions et événements du système affichés en détail</p>
                </div>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                  onClick={() => setShowHistoryModal(false)}
                  aria-label="Fermer le modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-6 py-4 bg-slate-50/30">
              <div className="space-y-4">
                {HISTORY_ENTRIES.map((history, index) => (
                  <Card 
                    key={history.id} 
                    className="card-hover p-5 border-2 border-slate-100 bg-white hover:border-primary-200 hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600" />
                          <p className="text-sm font-bold text-slate-900">{history.utilisateur}</p>
                        </div>
                        <p className="text-sm font-medium text-primary-600 mb-2">{history.tache}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <Badge variant="indigo" size="sm" className="font-semibold">{history.module}</Badge>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDateTime(history.date)}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-sm leading-relaxed text-slate-700 border border-slate-200 lg:flex-1 lg:text-right">
                        {history.details}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-5 bg-gradient-to-r from-white via-slate-50/50 to-white">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => setShowHistoryModal(false)}
                  className="font-semibold"
                >
                  Fermer
                </Button>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={() => window.alert("Export d'historique simulé")}
                  className="font-semibold hover:shadow-lg transition-all"
                >
                  <Download size={18} className="mr-2" />
                  Télécharger l'historique
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
