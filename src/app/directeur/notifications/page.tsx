"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Check, Clock3, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge, Button, Card, CardHeader, CardTitle } from "@/components/ui";
import { employeeService } from "@/lib/services";
import { cn, formatDateTime } from "@/lib/utils";
import type { Notification } from "@/types";

const tabs = [
  { label: "Toutes", value: "all" },
  { label: "Non lues", value: "unread" },
];

export default function DirecteurNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await employeeService.getNotifications(
          activeTab === "unread" ? { statut: "non_lu", limit: 20 } : { limit: 20 }
        );
        if (!alive) return;

        if (response.success && Array.isArray(response.data)) {
          setNotifications(response.data);
          return;
        }

        setError(response?.message || "Erreur lors du chargement des notifications.");
      } catch {
        setError("Erreur lors du chargement des notifications.");
      }
    };

    loadNotifications().finally(() => {
      if (alive) {
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.lue).length, [notifications]);

  const visibleNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((item) => !item.lue);
    }

    return notifications;
  }, [activeTab, notifications]);

  const markAsRead = async (notification: Notification) => {
    if (notification.lue) return;

    setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, lue: true } : item)));

    try {
      const response = await employeeService.markAsRead(notification.id);
      if (!response?.success) {
        throw new Error(response?.message || "Impossible de marquer la notification comme lue");
      }
    } catch (caught: any) {
      setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, lue: false } : item)));
      setError(caught?.response?.data?.message || caught?.message || "Impossible de marquer la notification comme lue");
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setNotifications((current) => current.map((item) => ({ ...item, lue: true })));

    try {
      const response = await employeeService.markAllAsRead();
      if (!response?.success) {
        throw new Error(response?.message || "Impossible de tout marquer comme lu");
      }
    } catch (caught: any) {
      setError(caught?.response?.data?.message || caught?.message || "Impossible de tout marquer comme lu");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <DashboardLayout title="Notifications" subtitle="Alertes et actions à traiter pour le comité directeur">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Total visible</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{notifications.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Bell size={20} />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Non lues</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{unreadCount}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle size={20} />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Dernière sync</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(new Date().toISOString())}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                <Clock3 size={20} />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-5 flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Centre de notifications</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Les notifications sont lues et mises à jour directement depuis la base de données.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.value as "all" | "unread")}
                >
                  {tab.label}
                </Button>
              ))}
              <Button variant="secondary" size="sm" iconRight={<CheckCheck size={16} />} onClick={markAllAsRead} loading={markingAll}>
                Tout marquer lu
              </Button>
            </div>
          </CardHeader>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <Check size={28} className="mx-auto text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                {activeTab === "unread" ? "Aucune notification non lue." : "Aucune notification à afficher dans ce filtre."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all hover:shadow-sm",
                    notification.lue ? "border-slate-200 bg-white" : "border-primary-200 bg-primary-50/40"
                  )}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={notification.priorite === "URGENTE" ? "red" : notification.priorite === "HAUTE" ? "yellow" : "blue"} size="sm">
                          {notification.priorite}
                        </Badge>
                        <span className="text-xs text-slate-500">{formatDateTime(notification.createdAt)}</span>
                        {!notification.lue && <span className="text-xs font-semibold text-primary-700">Nouveau</span>}
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-slate-900">{notification.titre}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                    </div>
                    <div className="shrink-0">
                      <Badge variant={notification.lue ? "gray" : "green"}>{notification.lue ? "Lue" : "Action"}</Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
