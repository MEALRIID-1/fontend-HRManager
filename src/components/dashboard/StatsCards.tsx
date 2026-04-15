"use client";
import React from "react";
import {
  Users, UserCheck, UserPlus, CalendarDays,
  FileText, TrendingUp, Clock, AlertCircle,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { StatsDashboard } from "@/types";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "red" | "indigo" | "purple";
  loading?: boolean;
}

const colorMap = {
  blue:   { bg: "bg-primary-50",  icon: "text-primary-600", border: "border-primary-100" },
  green:  { bg: "bg-emerald-50",  icon: "text-emerald-600", border: "border-emerald-100" },
  yellow: { bg: "bg-amber-50",    icon: "text-amber-600",   border: "border-amber-100" },
  red:    { bg: "bg-red-50",      icon: "text-red-600",     border: "border-red-100" },
  indigo: { bg: "bg-indigo-50",   icon: "text-indigo-600",  border: "border-indigo-100" },
  purple: { bg: "bg-purple-50",   icon: "text-purple-600",  border: "border-purple-100" },
};

export function StatCard({ title, value, change, changeLabel, icon, color, loading }: StatCardProps) {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="h-4 w-16 rounded-lg bg-slate-200" />
        </div>
        <div className="h-7 w-20 rounded-lg bg-slate-200 mb-2" />
        <div className="h-3 w-28 rounded-lg bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-card-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", colors.bg, colors.border)}>
          <span className={colors.icon}>{icon}</span>
        </div>
        {change !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
            change >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>
            <TrendingUp size={11} className={change < 0 ? "rotate-180" : ""} />
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="text-sm text-muted">{changeLabel ?? title}</p>
    </div>
  );
}

interface DashboardStatsProps {
  stats?: StatsDashboard;
  loading?: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const cards: StatCardProps[] = [
    {
      title: "Total employés",
      value: stats?.totalEmployes ?? 0,
      change: stats?.nouveauxCeMois ? Math.round((stats.nouveauxCeMois / (stats.totalEmployes || 1)) * 100) : undefined,
      changeLabel: "Total des employés",
      icon: <Users size={20} />,
      color: "blue",
    },
    {
      title: "Employés actifs",
      value: stats?.emploiesActifs ?? 0,
      changeLabel: "Employés actifs",
      icon: <UserCheck size={20} />,
      color: "green",
    },
    {
      title: "Nouvelles recrues",
      value: stats?.nouveauxCeMois ?? 0,
      changeLabel: "Ce mois-ci",
      icon: <UserPlus size={20} />,
      color: "indigo",
    },
    {
      title: "Congés en attente",
      value: stats?.congesEnAttente ?? 0,
      changeLabel: "À valider",
      icon: <CalendarDays size={20} />,
      color: "yellow",
    },
    {
      title: "Contrats expirant",
      value: stats?.contratExpirantBientot ?? 0,
      changeLabel: "Dans 30 jours",
      icon: <AlertCircle size={20} />,
      color: "red",
    },
    {
      title: "Taux de présence",
      value: `${stats?.tauxPresence ?? 0}%`,
      changeLabel: "Ce mois-ci",
      icon: <Clock size={20} />,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} loading={loading} />
      ))}
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

export function QuickAction({ label, description, icon, color, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full p-4 rounded-2xl border",
        "bg-white hover:shadow-card-md transition-all duration-150 text-left group",
        "border-slate-100"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
        color
      )}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
          {label}
        </p>
        <p className="text-xs text-muted truncate">{description}</p>
      </div>
    </button>
  );
}
