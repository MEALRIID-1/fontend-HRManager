"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { employeeService } from "@/lib/services";
import toast from "react-hot-toast";

export default function RHLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { setNbNotifsNonLues } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    const role = user?.role?.toUpperCase();
    if (role !== "RH" && role !== "ADMIN" && role !== "DIRECTEUR") {
      toast.error("Accès réservé aux RH");
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCount = async () => {
      try {
        const response = await employeeService.getNotificationsCount();
        if (response.success) setNbNotifsNonLues(response.data.count);
      } catch { /* silent */ }
    };
    loadCount();
  }, [isAuthenticated, setNbNotifsNonLues]);

  if (!isAuthenticated || (user?.role?.toUpperCase() !== "RH" && user?.role?.toUpperCase() !== "ADMIN" && user?.role?.toUpperCase() !== "DIRECTEUR")) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-pulse h-12 w-12 bg-primary-200 rounded-xl" /></div>;
  }

  return <>{children}</>;
}
