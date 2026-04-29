"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCircle, XCircle, AlertCircle, Clock,
  Check, AlertTriangle, ChevronLeft, ChevronRight,
  CalendarDays, FileText
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { cn, fromNow, formatDateTime } from "@/lib/utils";
import { employeeService } from "@/lib/services";
import { useUIStore } from "@/store/ui.store";
import type { Notification, TypeNotification } from "@/types";
import toast from "react-hot-toast";

// Mapping des types de notification vers icônes et couleurs
const NOTIFICATION_CONFIG: Record<TypeNotification, { icon: React.ReactNode; color: string; bg: string }> = {
  CONGE_SOUMIS: { icon: <Clock size={20} />, color: "text-blue-600", bg: "bg-blue-100" },
  CONGE_APPROUVE: { icon: <CheckCircle size={20} />, color: "text-emerald-600", bg: "bg-emerald-100" },
  CONGE_REFUSE: { icon: <XCircle size={20} />, color: "text-red-600", bg: "bg-red-100" },
  CONTRAT_EXPIRE_BIENTOT: { icon: <AlertCircle size={20} />, color: "text-amber-600", bg: "bg-amber-100" },
  ANNIVERSAIRE_EMBAUCHE: { icon: <CalendarDays size={20} />, color: "text-purple-600", bg: "bg-purple-100" },
  DOCUMENT_REQUIS: { icon: <FileText size={20} />, color: "text-indigo-600", bg: "bg-indigo-100" },
  RAPPEL_EVALUATION: { icon: <Clock size={20} />, color: "text-cyan-600", bg: "bg-cyan-100" },
  SYSTEME: { icon: <Bell size={20} />, color: "text-slate-600", bg: "bg-slate-100" },
};

// Labels des types
const TYPE_LABELS: Record<TypeNotification, string> = {
  CONGE_SOUMIS: "Congé soumis",
  CONGE_APPROUVE: "Congé approuvé",
  CONGE_REFUSE: "Congé refusé",
  CONTRAT_EXPIRE_BIENTOT: "Contrat expirant",
  ANNIVERSAIRE_EMBAUCHE: "Anniversaire",
  DOCUMENT_REQUIS: "Document requis",
  RAPPEL_EVALUATION: "Rappel évaluation",
  SYSTEME: "Système",
};

export default function EmployeNotificationsPage() {
  const router = useRouter();
  const { setNbNotifsNonLues, nbNotifsNonLues } = useUIStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"toutes" | "non_lues">("toutes");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Chargement des notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const params = activeTab === "non_lues" 
        ? { statut: "non_lu", page: currentPage, limit: 10 }
        : { page: currentPage, limit: 10 };

      const response = await employeeService.getNotifications(params);

      if (response.success) {
        setNotifications(response.data);
        // Mettre à jour le compte
        const countRes = await employeeService.getNotificationsCount();
        if (countRes.success) {
          setNbNotifsNonLues(countRes.data.count);
        }
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      setIsError(true);
      toast.error("Impossible de charger les notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [activeTab, currentPage]);

  // Marquer comme lue
  const markAsRead = async (notif: Notification) => {
    if (notif.lue) return;

    try {
      const response = await employeeService.markAsRead(notif.id);
      
      if (response.success) {
        // Optimistic update
        setNotifications(notifications.map(n => 
          n.id === notif.id ? { ...n, lue: true } : n
        ));
        setNbNotifsNonLues(Math.max(0, nbNotifsNonLues - 1));
      }
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  // Marquer tout comme lu
  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const response = await employeeService.markAllAsRead();
      
      if (response.success) {
        toast.success("Toutes les notifications marquées comme lues");
        setNotifications(notifications.map(n => ({ ...n, lue: true })));
        setNbNotifsNonLues(0);
      }
    } catch (error) {
      console.error("Erreur marquage tout lu:", error);
      toast.error("Échec du marquage");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Navigation depuis notification
  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif);
    
    if (notif.lienAction) {
      router.push(notif.lienAction);
    }
  };

  // Get config for notification type
  const getNotifConfig = (type: TypeNotification) => {
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEME;
  };

  // Filtrer les notifications affichées
  const displayedNotifications = activeTab === "non_lues" 
    ? notifications.filter(n => !n.lue)
    : notifications;

  if (isLoading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="text-danger mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Erreur de chargement
          </h3>
          <Button onClick={loadNotifications}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Notifications"
      subtitle={`${nbNotifsNonLues} non lue${nbNotifsNonLues > 1 ? "s" : ""}`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Tabs + Action */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("toutes")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                activeTab === "toutes"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveTab("non_lues")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2",
                activeTab === "non_lues"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Non lues
              {nbNotifsNonLues > 0 && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {nbNotifsNonLues}
                </span>
              )}
            </button>
          </div>

          {nbNotifsNonLues > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Check size={16} />}
              onClick={markAllAsRead}
              loading={isMarkingAll}
            >
              Tout marquer lu
            </Button>
          )}
        </div>

        {/* Liste */}
        <Card>
          <div className="divide-y divide-slate-100">
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notif) => {
                const config = getNotifConfig(notif.type);
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex items-start gap-4 p-4 cursor-pointer transition-colors",
                      notif.lue ? "hover:bg-slate-50" : "bg-blue-50/30 hover:bg-blue-50/50"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
                      config.bg, config.color
                    )}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn(
                            "font-medium",
                            notif.lue ? "text-slate-700" : "text-slate-900"
                          )}>
                            {notif.titre}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.lue && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="gray" size="sm">
                          {TYPE_LABELS[notif.type]}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {fromNow(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <Bell className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">
                  {activeTab === "non_lues"
                    ? "Aucune notification non lue"
                    : "Aucune notification"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                icon={<ChevronLeft size={16} />}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-slate-500">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                iconRight={<ChevronRight size={16} />}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
