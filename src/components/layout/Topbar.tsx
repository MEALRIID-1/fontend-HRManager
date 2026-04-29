"use client";
import React from "react";
import { Bell, Search, MoreVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { Avatar } from "@/components/ui";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * Barre supérieure responsive
 * - Desktop: titre à gauche, actions à droite
 * - Mobile/Tablette: titre compact, bouton ⋮ pour la sidebar
 */
export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { user } = useAuth();
  const { toggleNotifPanel, nbNotifsNonLues, setSidebarOpen, sidebarOpen } = useUIStore();

  return (
    <header className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 bg-white border-b border-slate-100 flex-shrink-0">
      {/* Left: page title (compact sur mobile) */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {title && (
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted hidden sm:block">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: actions, search, notifications, user, menu */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Actions personnalisées (masquées sur très petit écran) */}
        {actions && (
          <div className="hidden md:flex items-center gap-2 mr-2">
            {actions}
          </div>
        )}

        {/* Search - masqué sur mobile */}
        <button className={cn(
          "hidden md:flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200",
          "text-sm text-slate-400 bg-slate-50 hover:bg-white hover:border-primary-300",
          "transition-all duration-150 min-w-[160px]"
        )}>
          <Search size={14} />
          <span className="hidden lg:inline">Rechercher…</span>
          <span className="ml-auto text-xs bg-slate-200 rounded px-1 hidden xl:inline">⌘K</span>
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifPanel}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {nbNotifsNonLues > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold">
              {nbNotifsNonLues > 9 ? "9+" : nbNotifsNonLues}
            </span>
          )}
        </button>

        {/* User avatar - masqué sur très petit écran */}
        <div className="hidden sm:block">
          <Avatar nom={user?.nom} prenom={user?.prenom} src={user?.avatar} size="sm" />
        </div>

        {/* Bouton menu ⋮ (trois points) pour mobile/tablette */}
        <button
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors ml-1"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={20} /> : <MoreVertical size={20} />}
        </button>
      </div>
    </header>
  );
}
