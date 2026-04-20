import { create } from "zustand";

export type EmployeeModalsType = "view" | "edit" | "delete" | null;

interface UIStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifPanelOpen: boolean;
  nbNotifsNonLues: number;
  employeeModalType: EmployeeModalsType;
  selectedEmployeeId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  collapseSidebar: (collapsed: boolean) => void;
  toggleNotifPanel: () => void;
  setNbNotifsNonLues: (count: number) => void;
  decrementNotifsNonLues: () => void;
  openEmployeeModal: (type: EmployeeModalsType, employeeId?: string) => void;
  closeEmployeeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifPanelOpen: false,
  nbNotifsNonLues: 0,
  employeeModalType: null,
  selectedEmployeeId: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  collapseSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleNotifPanel: () => set((s) => ({ notifPanelOpen: !s.notifPanelOpen })),
  setNbNotifsNonLues: (count) => set({ nbNotifsNonLues: count }),
  decrementNotifsNonLues: () =>
    set((s) => ({ nbNotifsNonLues: Math.max(0, s.nbNotifsNonLues - 1) })),
  openEmployeeModal: (type, employeeId) =>
    set({ employeeModalType: type, selectedEmployeeId: employeeId || null }),
  closeEmployeeModal: () =>
    set({ employeeModalType: null, selectedEmployeeId: null }),
}));
