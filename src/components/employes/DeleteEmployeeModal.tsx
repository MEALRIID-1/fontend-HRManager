"use client";
import React, { useEffect, useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import type { Employe } from "@/types";

interface DeleteEmployeeModalProps {
  employee: Employe | null;
  onConfirm: (employeeId: string) => Promise<void>;
}

export default function DeleteEmployeeModal({ employee, onConfirm }: DeleteEmployeeModalProps) {
  const { employeeModalType, closeEmployeeModal } = useUIStore();
  const isOpen = employeeModalType === "delete" && employee !== null;
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, loading]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      closeEmployeeModal();
    }, 200);
  };

  const handleConfirm = async () => {
    if (!employee) return;
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await onConfirm(employee.id);
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-200 ${
          isExiting ? "blur-transition-out" : "blur-transition-in"
        }`}
        onClick={!loading ? handleClose : undefined}
        style={{
          backgroundColor: isExiting ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.35)",
          backdropFilter: isExiting ? "blur(0px)" : "blur(20px)",
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`w-full max-w-md glass-container animate-modal-in ${
            isExiting ? "animate-modal-out" : ""
          }`}
          style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
        >
          {/* Header with specular border */}
          <div
            className="relative px-6 pt-6 pb-4 border-b"
            style={{
              borderColor: "rgba(239, 68, 68, 0.2)",
              borderTop: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <AlertTriangle size={20} style={{ color: "#f87171" }} />
                  </div>
                  <h2
                    className="text-lg font-semibold uppercase-label"
                    style={{ color: "#f87171" }}
                  >
                    Confirmer la suppression
                  </h2>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 rounded-lg transition-all duration-200 flex-shrink-0"
                style={{
                  color: "rgba(239, 68, 68, 0.6)",
                  backgroundColor: "transparent",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(239, 68, 68, 0.6)";
                }}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Warning message */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.06)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <p style={{ color: "#fecaca" }} className="text-sm">
                <span className="font-semibold">⚠️ Attention:</span> Cette action est{" "}
                <span className="font-semibold">irréversible</span>. Toutes les données de cet
                employé seront supprimées définitivement.
              </p>
            </div>

            {/* Employee details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "rgba(203, 213, 225, 0.7)" }}>
                  Employé à supprimer:
                </span>
                <span className="text-sm font-semibold" style={{ color: "#f87171" }}>
                  {employee.prenom} {employee.nom}
                </span>
              </div>

              {employee.matricule && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(203, 213, 225, 0.7)" }}>
                    Matricule:
                  </span>
                  <span className="font-mono text-xs" style={{ color: "rgba(203, 213, 225, 0.9)" }}>
                    {employee.matricule}
                  </span>
                </div>
              )}

              {employee.email && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(203, 213, 225, 0.7)" }}>
                    Email:
                  </span>
                  <span className="text-xs truncate" style={{ color: "rgba(203, 213, 225, 0.9)" }}>
                    {employee.email}
                  </span>
                </div>
              )}

              {employee.poste?.intitule && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(203, 213, 225, 0.7)" }}>
                    Poste:
                  </span>
                  <span className="text-xs" style={{ color: "rgba(203, 213, 225, 0.9)" }}>
                    {employee.poste.intitule}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}
          >
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 uppercase-label"
              style={{
                backgroundColor: "rgba(148, 163, 184, 0.1)",
                color: "rgb(203, 213, 225)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "rgba(148, 163, 184, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(148, 163, 184, 0.1)";
              }}
            >
              Annuler
            </button>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 uppercase-label flex items-center gap-2"
              style={{
                background: loading
                  ? "rgba(239, 68, 68, 0.3)"
                  : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#fef2f2",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Trash2 size={16} />
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
