"use client";
import React from "react";
import { Bell, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { Avatar } from "@/components/ui";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { user } = useAuth();
  const { toggleNotifPanel, nbNotifsNonLues, setSidebarOpen, sidebarOpen } = useUIStore();

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100 flex-shrink-0">
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>
        {title && (
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: search, notifications, user */}
      <div className="flex items-center gap-2">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Search */}
        <button className={cn(
          "hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200",
          "text-sm text-slate-400 bg-slate-50 hover:bg-white hover:border-primary-300",
          "transition-all duration-150 min-w-[160px]"
        )}>
          <Search size={14} />
          <span>Rechercher…</span>
          <span className="ml-auto text-xs bg-slate-200 rounded px-1">⌘K</span>
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifPanel}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
        >
          <Bell size={18} />
          {nbNotifsNonLues > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold">
              {nbNotifsNonLues > 9 ? "9+" : nbNotifsNonLues}
            </span>
          )}
        </button>

        {/* User avatar */}
        <Avatar nom={user?.nom} prenom={user?.prenom} src={user?.avatar} size="sm" />
      </div>
    </header>
  );
}
