"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, FileText, Bell,
  BarChart3, Settings, LogOut, ChevronLeft, Menu, Building2,
} from "lucide-react";
import { cn, ROLE_LABELS } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { Avatar } from "@/components/ui";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  requiredPermission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord",  href: "/dashboard",       icon: <LayoutDashboard size={18} /> },
  { label: "Employés",         href: "/employes",         icon: <Users size={18} />,        requiredPermission: "employes:read" },
  { label: "Congés",           href: "/conges",           icon: <CalendarDays size={18} /> },
  { label: "Contrats",         href: "/contrats",         icon: <FileText size={18} />,     requiredPermission: "contrats:read" },
  { label: "Notifications",    href: "/notifications",    icon: <Bell size={18} /> },
  { label: "Rapports",         href: "/rapports",         icon: <BarChart3 size={18} />,    requiredPermission: "rapports:read" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Paramètres",       href: "/settings",         icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const { sidebarCollapsed, collapseSidebar, nbNotifsNonLues } = useUIStore();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredPermission || can(item.requiredPermission)
  );

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-navy border-r border-white/10",
        "transition-all duration-300 ease-in-out flex-shrink-0",
        sidebarCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0",
        sidebarCollapsed && "justify-center px-0"
      )}>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500 shadow-blue">
          <Building2 size={20} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">RH Manager</p>
            <p className="text-xs text-white/50 truncate">Gestion RH</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => collapseSidebar(!sidebarCollapsed)}
        className={cn(
          "absolute -right-3.5 top-[72px] z-10",
          "flex h-7 w-7 items-center justify-center rounded-full",
          "bg-white border border-slate-200 text-slate-500 shadow-sm",
          "hover:bg-primary-50 hover:text-primary-600 transition-colors"
        )}
      >
        {sidebarCollapsed
          ? <Menu size={13} />
          : <ChevronLeft size={13} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={sidebarCollapsed}
            badge={item.href === "/notifications" ? nbNotifsNonLues : undefined}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={sidebarCollapsed} />
        ))}

        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 rounded-xl px-2 py-2 mt-2",
          "bg-white/5 transition-colors hover:bg-white/10 cursor-pointer",
          sidebarCollapsed && "justify-center px-0"
        )}>
          <Avatar nom={user?.nom} prenom={user?.prenom} src={user?.avatar} size="sm" />
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-white/50 truncate">
                {user?.role ? ROLE_LABELS[user.role] : ""}
              </p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="flex-shrink-0 text-white/40 hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10"
              title="Se déconnecter"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  item, active, collapsed, badge,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
        "transition-all duration-150 group",
        active
          ? "bg-primary-500 text-white shadow-blue"
          : "text-white/60 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-0"
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {badge && badge > 0 && (
        <span className={cn(
          "flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
          active ? "bg-white text-primary-600" : "bg-danger text-white",
          collapsed && "absolute -top-1 -right-1 h-4 w-4 text-[10px]"
        )}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
