"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, FileText, Bell,
  BarChart3, Settings, LogOut, ChevronLeft, Menu, Building2, User, Briefcase, Trash2,
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
  requiredRole?: string;
}

// Navigation pour DIRECTEUR/ADMIN (super admin)
const DIRECTEUR_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord",  href: "/directeur/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Congés",           href: "/directeur/conges",    icon: <CalendarDays size={18} /> },
  { label: "Rapports",         href: "/directeur/rapports",  icon: <BarChart3 size={18} /> },
  { label: "Notifications",    href: "/directeur/notifications", icon: <Bell size={18} /> },
];

// Navigation pour RH
const RH_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord",  href: "/rh/dashboard",      icon: <LayoutDashboard size={18} /> },
  { label: "Employés",         href: "/rh/employes",      icon: <Users size={18} /> },
  { label: "Contrats",         href: "/rh/contrats",      icon: <FileText size={18} /> },
  { label: "Fiches de Paie",   href: "/rh/fiches-paie",   icon: <Briefcase size={18} /> },
  { label: "Congés",           href: "/rh/conges",        icon: <CalendarDays size={18} /> },
  { label: "Rapports",         href: "/rh/rapports",      icon: <BarChart3 size={18} /> },
  { label: "Notifications",    href: "/rh/notifications", icon: <Bell size={18} /> },
];

// Navigation pour MANAGER
const MANAGER_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord",  href: "/manager/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Mon Équipe",       href: "/manager/equipe",    icon: <Users size={18} /> },
  { label: "Congés Équipe",    href: "/manager/conges",    icon: <CalendarDays size={18} /> },
  { label: "Contrats Équipe",  href: "/manager/contrats",  icon: <FileText size={18} /> },
  { label: "Notifications",    href: "/manager/notifications", icon: <Bell size={18} /> },
];

// Navigation pour EMPLOYÉ
const EMPLOYE_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord",  href: "/employe/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Mon Profil",       href: "/employe/profil",    icon: <User size={18} /> },
  { label: "Mon Contrat",      href: "/employe/contrat",   icon: <Briefcase size={18} /> },
  { label: "Mes Congés",       href: "/employe/conges",    icon: <CalendarDays size={18} /> },
  { label: "Notifications",    href: "/employe/notifications", icon: <Bell size={18} /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Paramètres",       href: "/directeur/parametres", icon: <Settings size={18} />, requiredRole: "DIRECTEUR" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const { sidebarCollapsed, collapseSidebar, nbNotifsNonLues } = useUIStore();

  const isActive = (href: string) =>
    href === "/dashboard" || href === "/employe/dashboard" 
      ? pathname === href 
      : pathname.startsWith(href);

  // Déterminer quelle navigation afficher selon le rôle
  const getNavItems = () => {
    switch (user?.role) {
      case "EMPLOYE":
        return EMPLOYE_NAV_ITEMS;
      case "MANAGER":
        return MANAGER_NAV_ITEMS;
      case "RH":
        return RH_NAV_ITEMS;
      case "DIRECTEUR":
      case "ADMIN":
        return DIRECTEUR_NAV_ITEMS;
      default:
        return EMPLOYE_NAV_ITEMS;
    }
  };

  const NAV_ITEMS = getNavItems();

  const visibleItems = NAV_ITEMS.filter(
    (item: NavItem) => !item.requiredPermission || can(item.requiredPermission)
  );
  
  const visibleBottomItems = BOTTOM_ITEMS.filter(
    (item: NavItem) => !item.requiredRole || user?.role === item.requiredRole
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
            badge={item.href.includes("/notifications") ? nbNotifsNonLues : undefined}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
        {visibleBottomItems.map((item: NavItem) => (
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
