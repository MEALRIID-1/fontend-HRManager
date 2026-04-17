"use client";
import React, { useState } from "react";
import { Bell, AlertCircle, FileText, DollarSign, CheckCircle, Download, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "contract" | "leave" | "payroll" | "policy";
  title: string;
  description: string;
  time: string;
  priority: "high" | "normal" | "low";
  actions?: Array<{
    label: string;
    variant: "primary" | "outline";
    action: () => void;
  }>;
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "contract",
      title: "Contrat expiré détaité",
      description: "Le contrat de développeur senior pour Alex Rivera a officiellement expiré. Un renouvellement immédiat ou une procédure de fin de contrat est nécessaire pour rester conforme.",
      time: "14:20",
      priority: "high",
      actions: [
        { label: "Réviser le contrat", variant: "primary", action: () => console.log("Réviser") },
        { label: "Ignorer", variant: "outline", action: () => console.log("Ignorer") },
      ],
    },
    {
      id: "2",
      type: "leave",
      title: "Demande de congé validée",
      description: "La demande de congés payés de Sarah Jenkins (12 mai - 18 mai) a été approuvée par le chef de département. Le calendrier a été synchronisé.",
      time: "11:05",
      priority: "normal",
      actions: [
        { label: "Voir le planning", variant: "primary", action: () => console.log("Voir planning") },
      ],
    },
    {
      id: "3",
      type: "payroll",
      title: "Cycle de paie publié",
      description: "Les bulletins de paie mensuels pour le Cycle Q3-MAI ont été générés avec succès et publiés sur les portails des employés.",
      time: "Hier",
      priority: "normal",
      actions: [
        { label: "Voir les rapports", variant: "primary", action: () => console.log("Voir rapports") },
        { label: "Télécharger PDF", variant: "outline", action: () => console.log("Télécharger") },
      ],
    },
    {
      id: "4",
      type: "policy",
      title: "Mise à jour de politique partagée",
      description: "De nouvelles directives sur le travail à distance ont été publiées dans le manuel interne. Tous les chefs de département sont priés de les partager lors des réunions hebdomadaires.",
      time: "Hier",
      priority: "low",
    },
  ]);

  const unreadCount = 12;
  const actionRequiredCount = 5;

  const filters = [
    { id: "all", label: "Toutes les mises à jour", icon: Bell },
    { id: "urgent", label: "Urgent", icon: AlertCircle },
    { id: "requests", label: "Demandes", icon: FileText },
    { id: "finances", label: "Finances", icon: DollarSign },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "contract":
        return <FileText size={24} className="text-red-500" />;
      case "leave":
        return <CheckCircle size={24} className="text-blue-500" />;
      case "payroll":
        return <DollarSign size={24} className="text-blue-500" />;
      case "policy":
        return <AlertCircle size={24} className="text-slate-400" />;
      default:
        return <Bell size={24} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "normal":
        return "border-l-blue-500";
      case "low":
        return "border-l-slate-300";
      default:
        return "border-l-slate-300";
    }
  };

  return (
    <DashboardLayout
      title="Centre de Notifications"
      subtitle="Activité du système"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filter Buttons */}
          <div className="space-y-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeFilter === filter.id
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon size={18} />
                  <span className="text-sm">{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Overview */}
          <Card className="p-6 mt-8">
            <h3 className="font-semibold text-slate-900 mb-6">Aperçu rapide</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Alertes non lues</p>
                <p className="text-3xl font-bold text-primary-600">{unreadCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Action requise</p>
                <p className="text-3xl font-bold text-amber-600">{actionRequiredCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "border-l-4 p-6 transition-all hover:shadow-md",
                  getPriorityColor(notification.priority)
                )}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {notification.description}
                    </p>

                    {/* Actions */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex gap-2">
                        {notification.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.variant}
                            size="sm"
                            onClick={action.action}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="flex items-center gap-2">
              Charger les notifications précédentes
              <ChevronDown size={16} />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
