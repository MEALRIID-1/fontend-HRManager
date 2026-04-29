"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { employeeService } from "@/lib/services";
import toast from "react-hot-toast";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout pour les pages MANAGER
 * Vérifie le rôle et charge le compte de notifications
 */
export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { setNbNotifsNonLues } = useUIStore();

  // Vérification du rôle
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    const role = user?.role?.toUpperCase();
    if (role !== "MANAGER" && role !== "ADMIN") {
      toast.error("Accès réservé aux managers");
      router.replace("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, router]);

  // Chargement du nombre de notifications non lues
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadNotificationCount = async () => {
      try {
        const response = await employeeService.getNotificationsCount();
        if (response.success) {
          setNbNotifsNonLues(response.data.count);
        }
      } catch (error) {
        // Silencieux - pas critique
        console.log("Non connecté ou erreur notifications");
      }
    };

    loadNotificationCount();
  }, [isAuthenticated, setNbNotifsNonLues]);

  // Afficher un état de chargement si pas encore authentifié
  if (!isAuthenticated || (user?.role?.toUpperCase() !== "MANAGER" && user?.role?.toUpperCase() !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary-200 rounded-xl mb-4" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
