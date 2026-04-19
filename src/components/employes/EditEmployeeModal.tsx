"use client";
import React, { useEffect, useState } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { TYPE_CONTRAT_LABELS } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import type { Employe, TypeContrat } from "@/types";

interface EditEmployeeModalProps {
  employee: Employe | null;
  onSubmit: (data: Partial<Employe>) => Promise<void>;
}

const TYPE_CONTRAT_OPTIONS = Object.entries(TYPE_CONTRAT_LABELS).map(([v, l]) => ({
  value: v,
  label: l,
}));

const GENRE_OPTIONS = [
  { value: "MASCULIN", label: "Masculin" },
  { value: "FEMININ", label: "Féminin" },
  { value: "AUTRE", label: "Autre" },
];

export default function EditEmployeeModal({ employee, onSubmit }: EditEmployeeModalProps) {
  const { employeeModalType, closeEmployeeModal } = useUIStore();
  const isOpen = employeeModalType === "edit" && employee !== null;

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    emailPro: "",
    telephone: "",
    genre: "",
    dateNaissance: "",
    nationalite: "",
    rue: "",
    ville: "",
    codePostal: "",
    pays: "",
    posteId: "",
    departementId: "",
    dateEmbauche: "",
    dateFin: "",
    typeContrat: "",
    salaireBase: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      setFormData({
        prenom: employee.prenom || "",
        nom: employee.nom || "",
        email: employee.email || "",
        emailPro: employee.emailPro || "",
        telephone: employee.telephone || "",
        genre: employee.genre || "",
        dateNaissance: employee.dateNaissance || "",
        nationalite: employee.nationalite || "",
        rue: employee.adresse?.rue || "",
        ville: employee.adresse?.ville || "",
        codePostal: employee.adresse?.codePostal || "",
        pays: employee.adresse?.pays || "",
        posteId: employee.posteId || "",
        departementId: employee.departementId || "",
        dateEmbauche: employee.dateEmbauche || "",
        dateFin: employee.dateFin || "",
        typeContrat: employee.typeContrat || "",
        salaireBase: employee.salaireBase?.toString() || "",
      });
      setErrors({});
      setIsExiting(false);
    }
  }, [isOpen, employee]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.dateEmbauche) newErrors.dateEmbauche = "La date d'embauche est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const submitData: Partial<Employe> = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        emailPro: formData.emailPro,
        telephone: formData.telephone,
        genre: formData.genre as any,
        dateNaissance: formData.dateNaissance,
        nationalite: formData.nationalite,
        adresse: {
          rue: formData.rue,
          ville: formData.ville,
          codePostal: formData.codePostal,
          pays: formData.pays,
        },
        posteId: formData.posteId,
        departementId: formData.departementId,
        dateEmbauche: formData.dateEmbauche,
        dateFin: formData.dateFin,
        typeContrat: formData.typeContrat as TypeContrat,
        salaireBase: parseInt(formData.salaireBase) || 0,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
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
          className={`w-full max-w-2xl max-h-[92vh] glass-container overflow-hidden flex flex-col animate-modal-in ${
            isExiting ? "animate-modal-out" : ""
          }`}
          style={{ backgroundColor: "rgba(6, 182, 212, 0.08)" }}
        >
          {/* Header with specular border */}
          <div
            className="relative px-6 pt-6 pb-4 border-b"
            style={{
              borderColor: "rgba(6, 182, 212, 0.2)",
              borderTop: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p
                  className="text-xs font-semibold uppercase-label mb-2"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Employés / Modifier
                </p>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "#22d3ee" }}
                >
                  Modifier {employee.prenom} {employee.nom}
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 rounded-lg transition-all duration-200 flex-shrink-0"
                style={{
                  color: "rgba(6, 182, 212, 0.6)",
                  backgroundColor: "transparent",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.1)";
                  e.currentTarget.style.color = "#22d3ee";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(6, 182, 212, 0.6)";
                }}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Prénom */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Prénom *
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                  placeholder="Prénom"
                  disabled={loading}
                  style={{
                    borderColor: errors.prenom ? "rgba(239, 68, 68, 0.3)" : "rgba(6, 182, 212, 0.2)",
                    backgroundColor: errors.prenom ? "rgba(239, 68, 68, 0.05)" : "rgba(6, 182, 212, 0.05)",
                  }}
                />
                {errors.prenom && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.prenom}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Nom *
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  placeholder="Nom"
                  disabled={loading}
                  style={{
                    borderColor: errors.nom ? "rgba(239, 68, 68, 0.3)" : "rgba(6, 182, 212, 0.2)",
                    backgroundColor: errors.nom ? "rgba(239, 68, 68, 0.05)" : "rgba(6, 182, 212, 0.05)",
                  }}
                />
                {errors.nom && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.nom}
                  </p>
                )}
              </div>

              {/* Email personnel */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Email personnel *
                </label>
                <input
                  type="email"
                  className="glass-input w-full"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemple.com"
                  disabled={loading}
                  style={{
                    borderColor: errors.email ? "rgba(239, 68, 68, 0.3)" : "rgba(6, 182, 212, 0.2)",
                    backgroundColor: errors.email ? "rgba(239, 68, 68, 0.05)" : "rgba(6, 182, 212, 0.05)",
                  }}
                />
                {errors.email && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Email professionnel */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Email professionnel
                </label>
                <input
                  type="email"
                  className="glass-input w-full"
                  value={formData.emailPro}
                  onChange={(e) => handleInputChange("emailPro", e.target.value)}
                  placeholder="email@entreprise.com"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Téléphone */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Téléphone *
                </label>
                <input
                  type="tel"
                  className="glass-input w-full"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange("telephone", e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  disabled={loading}
                  style={{
                    borderColor: errors.telephone ? "rgba(239, 68, 68, 0.3)" : "rgba(6, 182, 212, 0.2)",
                    backgroundColor: errors.telephone ? "rgba(239, 68, 68, 0.05)" : "rgba(6, 182, 212, 0.05)",
                  }}
                />
                {errors.telephone && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.telephone}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Genre
                </label>
                <select
                  className="glass-input w-full"
                  value={formData.genre}
                  onChange={(e) => handleInputChange("genre", e.target.value)}
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                    color: "rgb(203, 213, 225)",
                  }}
                >
                  <option value="">Sélectionner...</option>
                  {GENRE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date de naissance */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Date de naissance
                </label>
                <input
                  type="date"
                  className="glass-input w-full"
                  value={formData.dateNaissance}
                  onChange={(e) => handleInputChange("dateNaissance", e.target.value)}
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Nationalité */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Nationalité
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.nationalite}
                  onChange={(e) => handleInputChange("nationalite", e.target.value)}
                  placeholder="Nationalité"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Rue */}
              <div className="md:col-span-2">
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Rue
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.rue}
                  onChange={(e) => handleInputChange("rue", e.target.value)}
                  placeholder="Rue"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Ville */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Ville
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.ville}
                  onChange={(e) => handleInputChange("ville", e.target.value)}
                  placeholder="Ville"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Code postal */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Code postal
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.codePostal}
                  onChange={(e) => handleInputChange("codePostal", e.target.value)}
                  placeholder="Code postal"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Pays */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Pays
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={formData.pays}
                  onChange={(e) => handleInputChange("pays", e.target.value)}
                  placeholder="Pays"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Type de contrat */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Type de contrat
                </label>
                <select
                  className="glass-input w-full"
                  value={formData.typeContrat}
                  onChange={(e) => handleInputChange("typeContrat", e.target.value)}
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                    color: "rgb(203, 213, 225)",
                  }}
                >
                  <option value="">Sélectionner...</option>
                  {TYPE_CONTRAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date d'embauche */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Date d'embauche *
                </label>
                <input
                  type="date"
                  className="glass-input w-full"
                  value={formData.dateEmbauche}
                  onChange={(e) => handleInputChange("dateEmbauche", e.target.value)}
                  disabled={loading}
                  style={{
                    borderColor: errors.dateEmbauche ? "rgba(239, 68, 68, 0.3)" : "rgba(6, 182, 212, 0.2)",
                    backgroundColor: errors.dateEmbauche ? "rgba(239, 68, 68, 0.05)" : "rgba(6, 182, 212, 0.05)",
                  }}
                />
                {errors.dateEmbauche && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.dateEmbauche}
                  </p>
                )}
              </div>

              {/* Date de fin */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Date de fin
                </label>
                <input
                  type="date"
                  className="glass-input w-full"
                  value={formData.dateFin}
                  onChange={(e) => handleInputChange("dateFin", e.target.value)}
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>

              {/* Salaire de base */}
              <div>
                <label
                  className="text-xs font-semibold uppercase-label mb-2 block"
                  style={{ color: "rgba(34, 211, 238, 0.8)" }}
                >
                  Salaire de base
                </label>
                <input
                  type="number"
                  className="glass-input w-full"
                  value={formData.salaireBase}
                  onChange={(e) => handleInputChange("salaireBase", e.target.value)}
                  placeholder="0"
                  disabled={loading}
                  style={{
                    borderColor: "rgba(6, 182, 212, 0.2)",
                    backgroundColor: "rgba(6, 182, 212, 0.05)",
                  }}
                />
              </div>
            </div>

            {/* Errors summary */}
            {Object.keys(errors).length > 0 && (
              <div
                className="p-4 mb-6 rounded-lg border flex items-start gap-3"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
                <div>
                  <p className="font-medium mb-2" style={{ color: "#fecaca" }}>
                    Veuillez corriger les erreurs suivantes:
                  </p>
                  <ul className="text-sm space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} style={{ color: "#f87171" }}>
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: "rgba(6, 182, 212, 0.2)" }}
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
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 uppercase-label flex items-center gap-2"
              style={{
                background: loading
                  ? "rgba(6, 182, 212, 0.3)"
                  : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                color: "#ecf0f1",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Check size={16} />
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
