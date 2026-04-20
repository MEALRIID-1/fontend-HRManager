"use client";
import React, { useState, useEffect } from "react";
import { Eye, Check, Trash2, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/toast.store";
import "@/styles/employees-liquid-glass.css";

const toastConfig: Record<ToastType, { message: string; color: string }> = {
  view: {
    message: "Profil consulté avec succès",
    color: "violet",
  },
  edit: {
    message: "Modifications enregistrées",
    color: "cyan",
  },
  delete: {
    message: "Employé supprimé avec succès",
    color: "red",
  },
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  view: <Eye size={18} />,
  edit: <Check size={18} />,
  delete: <Trash2 size={18} />,
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  index: number;
  onClose: () => void;
}

function ToastItem({ id, type, index, onClose }: ToastItemProps) {
  const config = toastConfig[type];
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
      <div className="toast-icon">{toastIcons[type]}</div>
      <div className="toast-message">{config.message}</div>
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
          id={toast.id}
          type={toast.type}
          index={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
