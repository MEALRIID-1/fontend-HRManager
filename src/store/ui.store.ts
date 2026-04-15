import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifPanelOpen: boolean;
  nbNotifsNonLues: number;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  collapseSidebar: (collapsed: boolean) => void;
  toggleNotifPanel: () => void;
  setNbNotifsNonLues: (count: number) => void;
  decrementNotifsNonLues: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifPanelOpen: false,
  nbNotifsNonLues: 0,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  collapseSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleNotifPanel: () => set((s) => ({ notifPanelOpen: !s.notifPanelOpen })),
  setNbNotifsNonLues: (count) => set({ nbNotifsNonLues: count }),
  decrementNotifsNonLues: () =>
    set((s) => ({ nbNotifsNonLues: Math.max(0, s.nbNotifsNonLues - 1) })),
}));
