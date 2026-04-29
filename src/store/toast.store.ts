import { create } from "zustand";

// Types de toast disponibles
export type ToastVariant = "success" | "error" | "info" | "warning";

// Interface ToastType pour les appels à addToast
export interface ToastType {
  type: ToastVariant;
  message: string;
}

export interface Toast extends ToastType {
  id: string;
  timestamp: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `${Date.now()}-${Math.random()}`,
          ...toast,
          timestamp: Date.now(),
        },
      ].slice(-3), // Keep only the last 3 toasts
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
