"use client";
import React, { useEffect } from "react";
import { Check, AlertCircle, Trash2, Eye, X } from "lucide-react";
import "@/styles/liquid-glass.css";

export type ToastType = "success" | "info" | "warning" | "error";
export type ToastAction = "view" | "edit" | "delete";

export interface Toast {
  id: string;
  action: ToastAction;
  message: string;
  type: ToastType;
  timestamp: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
  index: number;
}

const getToastConfig = (action: ToastAction) => {
  const configs: Record<ToastAction, { icon: React.ReactNode; bgColor: string; textColor: string; accentColor: string }> = {
    view: {
      icon: <Eye size={18} />,
      bgColor: "rgba(99, 88, 255, 0.2)",
      textColor: "#a78bfa",
      accentColor: "rgba(99, 88, 255, 0.4)",
    },
    edit: {
      icon: <Check size={18} />,
      bgColor: "rgba(6, 182, 212, 0.2)",
      textColor: "#22d3ee",
      accentColor: "rgba(6, 182, 212, 0.4)",
    },
    delete: {
      icon: <Trash2 size={18} />,
      bgColor: "rgba(239, 68, 68, 0.2)",
      textColor: "#f87171",
      accentColor: "rgba(239, 68, 68, 0.4)",
    },
  };

  return configs[action] || configs.view;
};

function ToastItem({ toast, onClose, index }: ToastItemProps) {
  const config = getToastConfig(toast.action);

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      style={{
        animation: `toast-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        transform: `translateY(${index * 80}px) scale(${1 - index * 0.05})`,
      }}
      className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
    >
      {/* Glass Container */}
      <div
        style={{
          backdropFilter: "blur(30px) saturate(180%)",
          background: config.bgColor,
          borderRadius: "16px",
          border: `1px solid ${config.accentColor}`,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
        }}
        className="flex items-center gap-3 px-4 py-3 w-full max-w-xs animate-levitate"
      >
        {/* Icon */}
        <div style={{ color: config.textColor }} className="flex-shrink-0">
          {config.icon}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p style={{ color: config.textColor }} className="text-sm font-medium whitespace-nowrap">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(toast.id)}
          className="ml-1 flex-shrink-0 hover:opacity-75 transition-opacity"
          style={{ color: config.textColor }}
        >
          <X size={16} />
        </button>

        {/* Progress Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "2px",
            background: config.textColor,
            borderRadius: "0 0 16px 0",
            animation: `progress-bar 3000ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} index={index} />
      ))}
    </>
  );
}
