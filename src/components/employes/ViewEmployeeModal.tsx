"use client";
import React, { useEffect, useState } from "react";
import { X, Mail, Phone, Briefcase, Calendar, MapPin, Award } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { formatDate, STATUT_EMPLOYE_LABELS, TYPE_CONTRAT_LABELS } from "@/lib/utils";
import "@/styles/liquid-glass.css";
import type { Employe } from "@/types";

interface ViewEmployeeModalProps {
  employee: Employe | null;
  onClose?: () => void;
}

export default function ViewEmployeeModal({ employee, onClose }: ViewEmployeeModalProps) {
  const { employeeModalType, closeEmployeeModal } = useUIStore();
  const isOpen = employeeModalType === "view" && employee !== null;
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      closeEmployeeModal();
      onClose?.();
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isExiting) {
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
  }, [isOpen, isExiting]);

  if (!isOpen || !employee) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 ${isExiting ? "animate-backdrop-blur-out" : "animate-backdrop-blur-in"}`}
        style={{
          backgroundColor: isExiting ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.4)",
          backdropFilter: isExiting ? "blur(0px)" : "blur(20px)",
          transition: "all var(--duration-slow) var(--easing-smooth)",
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
        style={{
          animation: isExiting ? "modal-exit 200ms var(--easing-apple) forwards" : "modal-enter 400ms var(--easing-apple) forwards",
        }}
      >
        <div className="pointer-events-auto w-full max-w-2xl glass-base animate-levitate rounded-[28px]">
          {/* Header */}
          <div className="relative flex items-start justify-between p-8 border-b border-white/10">
            <div className="flex items-center gap-4 flex-1">
              {/* Avatar */}
              <div
                style={{
                  background: "linear-gradient(135deg, #6358ff 0%, #a78bfa 100%)",
                  boxShadow: "0 20px 40px rgba(99, 88, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                }}
                className="w-16 h-16 rounded-[18px] text-white flex items-center justify-center text-xl font-bold flex-shrink-0"
              >
                {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {employee.prenom} {employee.nom}
                </h1>
                <p className="text-sm text-gray-400 mt-1 font-mono">{employee.matricule}</p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-8 max-h-[65vh]">
            {/* Status & Contract */}
            <div className="flex gap-4 mb-8">
              {/* Status Badge */}
              <div
                style={{
                  background: "rgba(99, 88, 255, 0.2)",
                  border: "1px solid rgba(150, 130, 255, 0.4)",
                  borderRadius: "12px",
                }}
                className="px-4 py-2 inline-flex items-center gap-2 backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                <span className="text-sm font-medium text-[#a78bfa]">
                  {STATUT_EMPLOYE_LABELS[employee.statut]}
                </span>
              </div>

              {/* Contract Badge */}
              <div
                style={{
                  background: "rgba(6, 182, 212, 0.2)",
                  border: "1px solid rgba(34, 211, 238, 0.4)",
                  borderRadius: "12px",
                }}
                className="px-4 py-2 inline-flex items-center gap-2 backdrop-blur-md"
              >
                <span className="text-sm font-medium text-[#22d3ee]">
                  {TYPE_CONTRAT_LABELS[employee.typeContrat]}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Personal Info */}
              <section>
                <h3 className="uppercase-label text-white mb-4 block">Informations Personnelles</h3>
                <div className="space-y-4">
                  <div>
                    <p className="uppercase-label text-gray-500 mb-1">Genre</p>
                    <p className="text-white">
                      {employee.genre === "MASCULIN" ? "Masculin" : employee.genre === "FEMININ" ? "Féminin" : "Autre"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase-label text-gray-500 mb-1">Date de naissance</p>
                    <p className="text-white">{formatDate(employee.dateNaissance)}</p>
                  </div>
                  <div>
                    <p className="uppercase-label text-gray-500 mb-1">Nationalité</p>
                    <p className="text-white">{employee.nationalite}</p>
                  </div>
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h3 className="uppercase-label text-white mb-4 block">Coordonnées</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-[#a78bfa] mt-1 flex-shrink-0" />
                    <div>
                      <p className="uppercase-label text-gray-500 mb-1">Email professionnel</p>
                      <p className="text-white break-all text-sm">{employee.emailPro || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-[#a78bfa] mt-1 flex-shrink-0" />
                    <div>
                      <p className="uppercase-label text-gray-500 mb-1">Téléphone</p>
                      <p className="text-white">{employee.telephone}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Professional Info */}
              <section>
                <h3 className="uppercase-label text-white mb-4 block">Informations Professionnelles</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase size={16} className="text-[#a78bfa] mt-1 flex-shrink-0" />
                    <div>
                      <p className="uppercase-label text-gray-500 mb-1">Poste</p>
                      <p className="text-white">{employee.poste?.intitule || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="uppercase-label text-gray-500 mb-1">Département</p>
                    <p className="text-white">{employee.departement?.nom || "-"}</p>
                  </div>
                  <div>
                    <p className="uppercase-label text-gray-500 mb-1">Niveau hiérarchique</p>
                    <p className="text-white">{employee.poste?.niveauHierarchique || "-"}</p>
                  </div>
                </div>
              </section>

              {/* Employment Data */}
              <section>
                <h3 className="uppercase-label text-white mb-4 block">Données d'emploi</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-[#a78bfa] mt-1 flex-shrink-0" />
                    <div>
                      <p className="uppercase-label text-gray-500 mb-1">Date d'embauche</p>
                      <p className="text-white">{formatDate(employee.dateEmbauche)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="uppercase-label text-gray-500 mb-1">Salaire de base</p>
                    <p className="text-white font-medium">
                      {new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF" }).format(employee.salaireBase)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section className="md:col-span-2">
                <h3 className="uppercase-label text-white mb-4 block">Adresse</h3>
                <div
                  style={{
                    background: "rgba(99, 88, 255, 0.1)",
                    border: "1px solid rgba(150, 130, 255, 0.2)",
                    borderRadius: "16px",
                  }}
                  className="flex items-start gap-3 p-4 backdrop-blur-md"
                >
                  <MapPin size={16} className="text-[#a78bfa] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white">{employee.adresse?.rue || "-"}</p>
                    <p className="text-gray-400 text-sm">{employee.adresse?.codePostal} {employee.adresse?.ville}</p>
                    <p className="text-gray-400 text-sm">{employee.adresse?.pays}</p>
                  </div>
                </div>
              </section>

              {/* Congés */}
              <section className="md:col-span-2">
                <h3 className="uppercase-label text-white mb-4 block">Congés restants</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Annuels", value: employee.congesRestants?.annuels || 0, color: "rgba(99, 88, 255, 0.2)", textColor: "#a78bfa", icon: "📅" },
                    { label: "Maladie", value: employee.congesRestants?.maladie || 0, color: "rgba(34, 211, 238, 0.2)", textColor: "#22d3ee", icon: "🏥" },
                    { label: "Exceptionnels", value: employee.congesRestants?.exceptionnels || 0, color: "rgba(168, 139, 250, 0.2)", textColor: "#c4b5fd", icon: "🎉" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: item.color,
                        border: `1px solid ${item.textColor}40`,
                        borderRadius: "16px",
                      }}
                      className="p-4 text-center backdrop-blur-md"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="uppercase-label text-gray-400 mb-2">{item.label}</p>
                      <p style={{ color: item.textColor }} className="text-3xl font-bold">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button
              onClick={handleClose}
              style={{
                backdrop: "blur(8px)",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
              className="px-6 py-2.5 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
