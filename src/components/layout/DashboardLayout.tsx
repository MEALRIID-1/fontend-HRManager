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

export default function DashboardLayout({
  children, title, subtitle, actions,
}: DashboardLayoutProps) {
  const { sidebarOpen, notifPanelOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <div className={cn(
        "hidden md:flex transition-all duration-300",
      )}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} actions={actions} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Notification drawer */}
      {notifPanelOpen && <NotificationPanel />}
    </div>
  );
}
