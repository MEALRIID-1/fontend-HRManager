"use client";
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import NotificationPanel from "@/components/notifications/NotificationPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * Layout responsive du tableau de bord
 * - Desktop (≥1024px): Sidebar visible, padding standard
 * - Tablette (768-1023px): Sidebar cachée, bouton ⋮ pour afficher
 * - Mobile (<768px): Sidebar cachée, padding réduit, contenu adapté
 */
export default function DashboardLayout({
  children, title, subtitle, actions,
}: DashboardLayoutProps) {
  const { sidebarOpen, setSidebarOpen, notifPanelOpen } = useUIStore();

  // Fermer la sidebar mobile quand on clique sur l'overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar - visible uniquement sur desktop (≥1024px) */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile/Tablette sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={handleOverlayClick}
        >
          {/* Backdrop sombre avec blur */}
          <div 
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm transition-opacity duration-300" 
            aria-hidden="true"
          />
          
          {/* Sidebar slide-in */}
          <div 
            className="absolute left-0 top-0 h-full shadow-2xl animate-slide-in-left"
            onClick={(e) => e.stopPropagation()} // Empêcher la fermeture quand on clique sur la sidebar
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar title={title} subtitle={subtitle} actions={actions} />

        {/* Zone de contenu principal - padding responsive */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-4 lg:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Notification drawer */}
      {notifPanelOpen && <NotificationPanel />}
    </div>
  );
}
