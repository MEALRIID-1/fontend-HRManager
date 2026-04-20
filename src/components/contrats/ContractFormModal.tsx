"use client";
import React, { useEffect, useState, useMemo } from "react";
import { X, FileSignature } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { employeService } from "@/lib/services";
import type { Contrat, Employe, TypeContrat, StatutContrat } from "@/types";

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Contrat>) => void | Promise<void>;
  contrat?: Contrat | null;
}

const statusOptions: StatutContrat[] = ["BROUILLON", "EN_COURS", "SIGNE", "EXPIRE", "RESILIE"];
const contractOptions: TypeContrat[] = ["CDI", "CDD", "STAGE", "FREELANCE", "APPRENTISSAGE"];

const calculateTrialPeriod = (dateDebut?: string, type?: TypeContrat): string => {
  if (!dateDebut) return "";
  
  const start = new Date(dateDebut);
  
  // Définir la période d'essai selon le type de contrat
  let trialMonths = 0;
  switch (type) {
    case "CDI":
    case "CDD":
      trialMonths = 3;
      break;
    case "STAGE":
      trialMonths = 1;
      break;
    case "APPRENTISSAGE":
      trialMonths = 2;
      break;
    default:
      trialMonths = 1;
  }
  
  const trial = new Date(start);
  trial.setMonth(trial.getMonth() + trialMonths);
  
  return trial.toISOString().split("T")[0];
};

export default function ContractFormModal({ isOpen, onClose, onSubmit, contrat }: ContractFormModalProps) {
  const isEditing = !!contrat;
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [formData, setFormData] = useState({
    employeId: "",
    type: "CDI" as TypeContrat,
    statut: "BROUILLON" as StatutContrat,
    salaireBase: "",
    dateDebut: "",
    dateFin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadEmployees();
      if (isEditing && contrat) {
        setFormData({
          employeId: contrat.employeId,
          type: contrat.type,
          statut: contrat.statut,
          salaireBase: contrat.salaireBase.toString(),
          dateDebut: contrat.dateDebut,
          dateFin: contrat.dateFin || "",
        });
      } else {
        setFormData({
          employeId: "",
          type: "CDI",
          statut: "BROUILLON",
          salaireBase: "",
          dateDebut: "",
          dateFin: "",
        });
      }
      setErrors({});
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isEditing, contrat]);

  const loadEmployees = async () => {
    try {
      const response = await employeService.getAll();
      const payload = response as any;

      if (Array.isArray(payload)) {
        setEmployees(payload);
      } else if (Array.isArray(payload.data)) {
        setEmployees(payload.data);
      } else {
        setEmployees(payload.data?.data || []);
      }
    } catch (error) {
      console.error("Erreur chargement employés :", error);
    }
  };

  const trialPeriod = useMemo(() => {
    return calculateTrialPeriod(formData.dateDebut, formData.type);
  }, [formData.dateDebut, formData.type]);

  const employeeOptions = useMemo(() => {
    const options = employees.map((emp) => ({
      value: emp.id,
      label: `${emp.prenom} ${emp.nom}`,
    }));

    if (isEditing && contrat?.employe && !options.some((option) => option.value === contrat.employeId)) {
      options.unshift({
        value: contrat.employeId,
        label: `${contrat.employe.prenom} ${contrat.employe.nom}`,
      });
    }

    return options;
  }, [employees, contrat, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employeId.trim()) newErrors.employeId = "L'employé est requis";
    if (!formData.salaireBase.trim()) newErrors.salaireBase = "Le salaire est requis";
    if (!formData.dateDebut) newErrors.dateDebut = "La date de début est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const submitData: Partial<Contrat> = {
        ...(isEditing && contrat ? { id: contrat.id } : {}),
        employeId: formData.employeId,
        type: formData.type,
        statut: formData.statut,
        salaireBase: parseInt(formData.salaireBase, 10) || 0,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || undefined,
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Erreur formulaire contrat :", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedEmployee = employees.find(emp => emp.id === formData.employeId) || contrat?.employe;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 print:hidden">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileSignature size={18} className="text-primary-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">
                  {isEditing ? "Modification de Contrat" : "Nouveau Contrat"}
                </p>
              </div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {isEditing ? "Modifier le contrat" : "Créer un nouveau contrat"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {isEditing 
                  ? selectedEmployee 
                    ? `${selectedEmployee.prenom} ${selectedEmployee.nom}`
                    : "Mettez à jour les informations du contrat."
                  : "Renseignez les données importantes du contrat"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6 px-8 py-6">
            {/* Section 1: Informations personnelles */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-primary-600" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                  Informations du salarié
                </h3>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Employé <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formData.employeId}
                    onChange={(e) => handleChange("employeId", e.target.value)}
                    options={employeeOptions}
                    placeholder="Sélectionner un employé..."
                    className={cn(
                      "text-sm transition-all",
                      errors.employeId && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.employeId && (
                    <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1">
                      <span>•</span> {errors.employeId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Détails du contrat */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-primary-600" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                  Détails du contrat
                </h3>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Type de contrat
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value as TypeContrat)}
                    options={contractOptions.map((type) => ({ value: type, label: type }))}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    État
                  </label>
                  <Select
                    value={formData.statut}
                    onChange={(e) => handleChange("statut", e.target.value as StatutContrat)}
                    options={statusOptions.map((statut) => ({ value: statut, label: statut }))}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Salaire brut annuel (CFA) <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.salaireBase}
                    onChange={(e) => handleChange("salaireBase", e.target.value)}
                    placeholder="450 000"
                    className={cn(
                      "text-sm",
                      errors.salaireBase && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.salaireBase && (
                    <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1">
                      <span>•</span> {errors.salaireBase}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Dates */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-primary-600" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                  Période de travail
                </h3>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date de début <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => handleChange("dateDebut", e.target.value)}
                    className={cn(
                      "text-sm",
                      errors.dateDebut && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.dateDebut && (
                    <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1">
                      <span>•</span> {errors.dateDebut}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date de fin <span className="text-slate-400 font-normal">(optionnel)</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => handleChange("dateFin", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Période d'essai calculée */}
              {!isEditing && trialPeriod && (
                <div className="mt-5 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                        Période d'essai calculée
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">{formData.dateDebut}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-semibold text-slate-900">{trialPeriod}</span>
                      </p>
                      <p className="mt-2 text-xs text-slate-600">
                        {(() => {
                          const start = new Date(formData.dateDebut);
                          const end = new Date(trialPeriod);
                          const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                          const months = Math.floor(days / 30);
                          return `Durée: ${months} mois (~${days} jours)`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 hover:border-slate-400"
              >
                Annuler
              </button>
              <Button
                type="submit"
                disabled={loading}
                icon={<FileSignature size={16} />}
              >
                {loading
                  ? "Enregistrement..."
                  : isEditing
                    ? "Modifier le contrat"
                    : "Créer le contrat"
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}