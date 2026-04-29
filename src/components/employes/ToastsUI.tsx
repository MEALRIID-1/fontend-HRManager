"use client";
import React, { useState, useEffect } from "react";
import { Check, X, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, type Toast, type ToastVariant } from "@/store/toast.store";
import "@/styles/employees-liquid-glass.css";

// Configuration des couleurs et icônes par variant
const toastConfig: Record<ToastVariant, { color: string }> = {
  success: { color: "emerald" },
  error: { color: "red" },
  info: { color: "blue" },
  warning: { color: "amber" },
};

const toastIcons: Record<ToastVariant, React.ReactNode> = {
  success: <Check size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

interface ToastItemProps {
  toast: Toast;
  index: number;
  onClose: () => void;
}

function ToastItem({ toast, index, onClose }: ToastItemProps) {
  const config = toastConfig[toast.type];
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`toast toast-${config.color} ${isExiting ? "exiting" : ""}`}
      style={{
        transform: `translateY(${index * 16}px) scale(${1 - index * 0.02})`,
      }}
    >
      <div className="toast-icon">{toastIcons[toast.type]}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="ml-2 flex-shrink-0 hover:opacity-75 transition-opacity"
      >
        <X size={14} />
      </button>
      <div className="toast-progress" />
    </div>
  );
}

export function ToastsUI() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
