"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { employeeService } from "@/lib/services";

/**
 * Layout pour les pages employé
 * Protège les routes /employe/* et vérifie que l'utilisateur a le rôle EMPLOYE
 */
export default function EmployeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, is } = useAuth();
  const router = useRouter();
  const { setNbNotifsNonLues } = useUIStore();

  // Vérification du rôle
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    // Si l'utilisateur n'est pas un employé, rediriger vers son dashboard
    if (user && !is("EMPLOYE")) {
      const redirectMap: Record<string, string> = {
        ADMIN: "/dashboard",
        RH: "/dashboard",
        MANAGER: "/dashboard",
      };
      router.replace(redirectMap[user.role] || "/dashboard");
    }
  }, [isAuthenticated, user, is, router]);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    if (isAuthenticated && is("EMPLOYE")) {
      const loadNotifsCount = async () => {
        try {
          const response = await employeeService.getNotificationsCount();
          if (response.success) {
            setNbNotifsNonLues(response.data.count);
          }
        } catch (error) {
          console.error("Erreur chargement notifications:", error);
        }
      };
      loadNotifsCount();
    }
  }, [isAuthenticated, is, setNbNotifsNonLues]);

  // Pendant la vérification, ne rien afficher
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si ce n'est pas un employé, ne rien afficher (la redirection va se faire)
  if (!is("EMPLOYE")) {
    return null;
  }

  return <>{children}</>;
}
