import { create } from "zustand";

export type ToastType = "view" | "edit" | "delete";

export interface Toast {
  id: string;
  type: ToastType;
  timestamp: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `${Date.now()}-${Math.random()}`,
          type,
          timestamp: Date.now(),
        },
      ].slice(-3), // Keep only the last 3 toasts
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
