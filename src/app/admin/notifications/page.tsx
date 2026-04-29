"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { Bell, Check, Trash2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { employeeService } from "@/lib/services";
import type { Notification } from "@/types";
import { fromNow, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const [notifsRes, countRes] = await Promise.all([
        employeeService.getNotifications(),
        employeeService.getNotificationsCount(),
      ]);

      if (notifsRes.success) {
        setNotifications(notifsRes.data || []);
      } else {
        setError(notifsRes.message || "Erreur lors du chargement");
      }

      if (countRes.success) {
        setUnreadCount(countRes.data.count || 0);
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur lors du chargement des notifications";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await employeeService.markAsRead(id);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, lue: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success("Notification marquée comme lue");
      } else {
        toast.error(res.message || "Erreur");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await employeeService.markAllAsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
        setUnreadCount(0);
        toast.success("Toutes les notifications ont été marquées comme lues");
      } else {
        toast.error(res.message || "Erreur");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await employeeService.deleteNotification(id);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification supprimée");
      } else {
        toast.error(res.message || "Erreur");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur");
    }
  };

  const filteredNotifications = activeTab === "unread"
    ? notifications.filter(n => !n.lue)
    : notifications;

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case "urgente": return "bg-danger text-white";
      case "haute": return "bg-warning text-white";
      case "normale": return "bg-primary-100 text-primary-700";
      case "basse": return "bg-slate-100 text-slate-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Notifications Admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-slate-600">Chargement des notifications...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Notifications Admin">
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger mb-3" />
          <h3 className="text-lg font-semibold text-danger mb-2">Erreur de chargement</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={loadNotifications}>
            <RefreshCw size={18} className="mr-2" />
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Centre de Notifications"
      subtitle="Gestion des notifications système"
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary-500" />
            <span className="text-slate-600">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check size={18} className="mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <NotificationsList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              getPriorityColor={getPriorityColor}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <NotificationsList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              getPriorityColor={getPriorityColor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Sous-composant pour la liste des notifications
interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priorite: string) => string;
}

function NotificationsList({ notifications, onMarkAsRead, onDelete, getPriorityColor }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucune notification</h3>
        <p className="text-slate-500">Vous n'avez pas de notifications dans cette catégorie.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            "p-4 transition-all hover:shadow-md",
            !notification.lue && "border-l-4 border-l-primary-500 bg-primary-50/30"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex-shrink-0 w-2 h-2 rounded-full mt-2",
              !notification.lue ? "bg-primary-500" : "bg-slate-300"
            )} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "font-medium text-slate-800",
                  !notification.lue && "font-semibold"
                )}>
                  {notification.titre}
                </h4>
                <Badge className={getPriorityColor(notification.priorite)} size="sm">
                  {notification.priorite}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-slate-400">
                {fromNow(notification.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {!notification.lue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Marquer comme lue"
                >
                  <Check size={18} className="text-success" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                title="Supprimer"
              >
                <Trash2 size={18} className="text-danger" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
