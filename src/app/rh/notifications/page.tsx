"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  AlertTriangle,
  CalendarDays,
  FileText,
  User,
  Info,
  XCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { notificationService } from "@/lib/services";
import toast from "react-hot-toast";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: string;
  message: string;
  statut: "lu" | "non_lu";
  date_envoi: string;
  lu_at?: string;
  data?: any;
}

// ─── COMPOSANT ILLUSTRATION EMPTY STATE ───────────────────────────────────────
function EmptyStateIllustration({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="60" cy="60" r="50" fill="#F1F5F9" />
        <path d="M60 35C51.7157 35 45 41.7157 45 50V65L40 75H80L75 65V50C75 41.7157 68.2843 35 60 35Z" fill="white" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="60" cy="50" r="8" fill="#CBD5E1" />
        <path d="M55 62H65" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="35" r="15" fill="#3B82F6" />
        <path d="M80 35L83 38L90 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="text-lg font-medium text-slate-800 mb-2">{message}</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        Les nouvelles notifications apparaîtront ici automatiquement.
      </p>
    </div>
  );
}

// ─── FONCTIONS UTILITAIRES ────────────────────────────────────────────────────
function getNotificationIcon(type: string) {
  switch (type) {
    case "CONGE_SOUMIS":
    case "conge_a_valider":
      return <CalendarDays size={20} className="text-amber-500" />;
    case "CONGE_APPROUVE":
    case "conge_approuve":
      return <Check size={20} className="text-green-500" />;
    case "CONGE_REFUSE":
    case "conge_refuse":
      return <XCircle size={20} className="text-red-500" />;
    case "NOUVEAU_CONTRAT":
    case "contrat":
      return <FileText size={20} className="text-blue-500" />;
    case "NOUVELLE_FICHE_PAIE":
    case "fiche_paie":
      return <Info size={20} className="text-purple-500" />;
    case "RAPPEL":
    case "reminder":
      return <Bell size={20} className="text-orange-500" />;
    default:
      return <Bell size={20} className="text-slate-400" />;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "CONGE_SOUMIS":
    case "conge_a_valider":
      return "bg-amber-50 border-amber-200";
    case "CONGE_APPROUVE":
    case "conge_approuve":
      return "bg-green-50 border-green-200";
    case "CONGE_REFUSE":
    case "conge_refuse":
      return "bg-red-50 border-red-200";
    case "NOUVEAU_CONTRAT":
    case "contrat":
      return "bg-blue-50 border-blue-200";
    case "NOUVELLE_FICHE_PAIE":
    case "fiche_paie":
      return "bg-purple-50 border-purple-200";
    default:
      return "bg-slate-50 border-slate-200";
  }
}

function truncateMessage(message: string, maxLength: number = 80) {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function RhNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"toutes" | "non_lues">("toutes");
  const [markingAll, setMarkingAll] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      let notifRes;
      if (activeTab === "non_lues") {
        notifRes = await notificationService.getNonLues();
      } else {
        notifRes = await notificationService.getAll();
      }
      const countRes = await notificationService.getNbNonLues();

      if (notifRes.success) {
        const data = (notifRes.data as any)?.data || notifRes.data || [];
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setError((notifRes as any).message || "Erreur lors du chargement");
        toast.error((notifRes as any).message || "Erreur lors du chargement des notifications");
      }

      if (countRes.success) {
        setUnreadCount((countRes.data as any)?.count || 0);
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur de connexion";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await notificationService.marquerCommeLue(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, statut: "lu", lu_at: new Date().toISOString() } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success("Notification marquée comme lue");
      } else {
        toast.error(response.message || "Échec de l'opération");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!confirm("Marquer toutes les notifications comme lues ?")) return;
    
    setMarkingAll(true);
    try {
      const response = await notificationService.marquerToutesLues();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, statut: "lu", lu_at: new Date().toISOString() })));
        setUnreadCount(0);
        toast.success("Toutes les notifications ont été marquées comme lues");
      } else {
        toast.error(response.message || "Échec de l'opération");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la mise à jour");
    } finally {
      setMarkingAll(false);
    }
  };

  // Filtrer les notifications selon l'onglet actif
  const filteredNotifications = activeTab === "non_lues"
    ? notifications.filter(n => n.statut === "non_lu")
    : notifications;

  return (
    <DashboardLayout title="Notifications" subtitle="Centre de notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Bell className="text-blue-600" size={24} />
              Notifications
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Consultez et gérez vos notifications en temps réel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="rounded-lg transition-all duration-200"
            >
              {markingAll ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <CheckCheck size={18} className="mr-2" />
              )}
              Tout marquer comme lu
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 lg:w-fit mb-6">
              <TabsTrigger value="toutes" className="flex items-center gap-2">
                <Bell size={16} />
                Toutes
                <Badge variant="gray" size="sm" className="ml-1">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="non_lues" className="flex items-center gap-2">
                <Bell size={16} className="text-amber-500" />
                Non lues
                {unreadCount > 0 && (
                  <Badge variant="yellow" size="sm" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="toutes" className="space-y-4">
              {renderNotificationList()}
            </TabsContent>

            <TabsContent value="non_lues" className="space-y-4">
              {renderNotificationList()}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );

  function renderNotificationList() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <span className="text-slate-500">Chargement des notifications...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl p-6 bg-red-50 border border-red-200 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <p className="text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={loadNotifications} className="mt-4">
            Réessayer
          </Button>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <EmptyStateIllustration 
          message={activeTab === "non_lues" ? "Aucune notification non lue" : "Aucune notification"} 
        />
      );
    }

    return (
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => notification.statut === "non_lu" && handleMarkAsRead(notification.id)}
            className={`
              flex items-start gap-4 p-4 rounded-xl border cursor-pointer
              transition-all duration-200 hover:shadow-sm
              ${getNotificationColor(notification.type)}
              ${notification.statut === "non_lu" ? "ring-1 ring-blue-400/50" : "opacity-75"}
            `}
          >
            {/* Icône */}
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${notification.statut === "non_lu" ? "font-medium text-slate-900" : "text-slate-600"}`}>
                {truncateMessage(notification.message)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatDistanceToNow(new Date(notification.date_envoi), { addSuffix: true, locale: fr })}
              </p>
            </div>

            {/* Badge non lu */}
            {notification.statut === "non_lu" && (
              <Badge variant="blue" size="sm" className="flex-shrink-0">
                Nouveau
              </Badge>
            )}

            {/* Bouton marquer comme lu */}
            {notification.statut === "non_lu" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead(notification.id);
                }}
                className="flex-shrink-0 text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                <Check size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }
}
