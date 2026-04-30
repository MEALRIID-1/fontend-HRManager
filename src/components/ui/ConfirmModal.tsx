"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
    btnClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    ringClass: "ring-red-100",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    btnClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    ringClass: "ring-amber-100",
  },
  info: {
    icon: <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">i</div>,
    btnClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    ringClass: "ring-blue-100",
  },
};

/**
 * Modal de confirmation réutilisable
 * Design system: animations slide-up + fade-in, fermeture Échap
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Fermer avec Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const config = variantConfig[variant];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]
                 flex items-center justify-center p-4
                 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden",
          "animate-in slide-in-from-bottom-4 duration-300 ease-out"
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start gap-4">
          <div className={cn("p-2 rounded-xl", config.ringClass)}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                       rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 min-w-[100px] flex items-center justify-center gap-2",
              config.btnClass
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>En cours...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
