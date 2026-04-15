"use client";
import React, { useEffect, useState } from "react";
import { X, Bell, CheckCheck, Trash2 } from "lucide-react";
import { cn, fromNow } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { notificationService } from "@/lib/services";
import { Button, Badge, EmptyState } from "@/components/ui";
import type { Notification, TypeNotification } from "@/types";

const TYPE_CONFIG: Record<TypeNotification, { label: string; color: string }> = {
  CONGE_SOUMIS:            { label: "Congé soumis",        color: "blue" },
  CONGE_APPROUVE:          { label: "Congé approuvé",       color: "green" },
  CONGE_REFUSE:            { label: "Congé refusé",         color: "red" },
  CONTRAT_EXPIRE_BIENTOT:  { label: "Contrat expirant",     color: "yellow" },
  ANNIVERSAIRE_EMBAUCHE:   { label: "Anniversaire",         color: "indigo" },
  DOCUMENT_REQUIS:         { label: "Document requis",      color: "yellow" },
  RAPPEL_EVALUATION:       { label: "Évaluation",           color: "blue" },
  SYSTEME:                 { label: "Système",              color: "gray" },
};

export default function NotificationPanel() {
  const { toggleNotifPanel, decrementNotifsNonLues } = useUIStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for development
    setNotifications([
      {
        id: "1",
        userId: "u1",
        type: "CONGE_SOUMIS",
        titre: "Nouvelle demande de congé",
        message: "Jean Dupont a soumis une demande de congé annuel du 20 au 25 juillet.",
        priorite: "NORMALE",
        lue: false,
        lienAction: "/conges",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: "2",
        userId: "u1",
        type: "CONTRAT_EXPIRE_BIENTOT",
        titre: "Contrat expirant bientôt",
        message: "Le contrat CDD de Marie Martin expire dans 15 jours.",
        priorite: "HAUTE",
        lue: false,
        lienAction: "/contrats",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "3",
        userId: "u1",
        type: "CONGE_APPROUVE",
        titre: "Congé approuvé",
        message: "Votre demande de congé a été approuvée par la direction.",
        priorite: "NORMALE",
        lue: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: "4",
        userId: "u1",
        type: "ANNIVERSAIRE_EMBAUCHE",
        titre: "Anniversaire d'embauche",
        message: "Paul Bernard fête ses 3 ans dans l'entreprise aujourd'hui ! 🎉",
        priorite: "BASSE",
        lue: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.marquerCommeLue(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
    );
    decrementNotifsNonLues();
  };

  const markAllRead = async () => {
    try {
      await notificationService.marquerToutesLues();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.lue).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={toggleNotifPanel}
      />

      {/* Panel */}
      <div className={cn(
        "fixed right-0 top-0 z-50 h-full w-full max-w-sm",
        "bg-white border-l border-slate-100 shadow-2xl",
        "flex flex-col animate-slide-in-right"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary-600" />
            <h2 className="text-base font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="blue" size="sm">{unreadCount} nouvelles</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <CheckCheck size={13} />
                Tout lire
              </button>
            )}
            <button
              onClick={toggleNotifPanel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-2 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={24} />}
              title="Aucune notification"
              description="Vous êtes à jour !"
            />
          ) : (
            <div>
              {notifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type] ?? { label: "Info", color: "gray" };
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "group flex gap-3 px-4 py-3.5 border-b border-slate-50",
                      "hover:bg-slate-50 transition-colors cursor-pointer",
                      !notif.lue && "bg-primary-50/40"
                    )}
                    onClick={() => !notif.lue && markAsRead(notif.id)}
                  >
                    {/* Dot */}
                    <div className="flex flex-col items-center pt-1 flex-shrink-0">
                      <div className={cn(
                        "h-2 w-2 rounded-full flex-shrink-0 transition-opacity",
                        !notif.lue ? "bg-primary-500" : "bg-transparent"
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm leading-tight",
                          !notif.lue ? "font-semibold text-slate-800" : "font-medium text-slate-600"
                        )}>
                          {notif.titre}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-slate-400 hover:text-danger rounded transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={config.color as "blue" | "green" | "red" | "yellow" | "gray" | "indigo"} size="sm">
                          {config.label}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{fromNow(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4">
          <Button variant="secondary" size="sm" className="w-full" onClick={toggleNotifPanel}>
            Voir toutes les notifications
          </Button>
        </div>
      </div>
    </>
  );
}
