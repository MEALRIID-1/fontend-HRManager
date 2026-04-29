"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { contractService } from "@/lib/services";
import toast from "react-hot-toast";

const TYPE_CONTRAT_OPTIONS = [
  { value: "CDI", label: "CDI - Contrat à durée indéterminée" },
  { value: "CDD", label: "CDD - Contrat à durée déterminée" },
  { value: "STAGE", label: "Stage" },
  { value: "ALTERNANCE", label: "Alternance" },
  { value: "INTERIM", label: "Intérim" },
];

const STATUT_CONTRAT_OPTIONS = [
  { value: "ACTIF", label: "Actif" },
  { value: "EN_COURS", label: "En cours de signature" },
  { value: "SUSPENDU", label: "Suspendu" },
];

export default function NouveauContratPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeId: "",
    type: "CDI",
    reference: "",
    dateDebut: "",
    dateFin: "",
    salaireBase: "",
    statut: "EN_COURS",
    poste: "",
    departementId: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeId.trim()) {
      toast.error("Veuillez sélectionner un employé");
      return;
    }
    if (!formData.dateDebut) {
      toast.error("Veuillez sélectionner une date de début");
      return;
    }
    if (!formData.salaireBase || parseFloat(formData.salaireBase) <= 0) {
      toast.error("Veuillez saisir un salaire valide");
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        ...formData,
        salaireBase: parseFloat(formData.salaireBase),
      };

      const res = await contractService.create(data as any);
      
      if (res.success) {
        toast.success("Contrat créé avec succès");
        router.push("/rh/contrats");
      } else {
        toast.error(res.message || "Erreur lors de la création");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la création du contrat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title="Nouveau contrat"
      subtitle="Création d'un nouveau contrat de travail"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/rh/contrats")}>
            <ArrowLeft size={18} className="mr-2" />
            Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <Card className="p-5">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base">Informations générales</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Employé <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.employeId}
                    onChange={(e) => handleChange("employeId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner un employé</option>
                    <option value="emp_1">Jean Dupont</option>
                    <option value="emp_2">Marie Martin</option>
                    <option value="emp_3">Pierre Durand</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    À remplacer par une vraie liste d'employés depuis l'API
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type de contrat <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {TYPE_CONTRAT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Référence du contrat"
                  value={formData.reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  placeholder="Ex: CDD-2024-001"
                />

                <Input
                  label="Poste"
                  value={formData.poste}
                  onChange={(e) => handleChange("poste", e.target.value)}
                  placeholder="Ex: Développeur Full Stack"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Département
                  </label>
                  <select
                    value={formData.departementId}
                    onChange={(e) => handleChange("departementId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner un département</option>
                    <option value="tech">Technique</option>
                    <option value="rh">Ressources Humaines</option>
                    <option value="finance">Finance</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Période et Salaire */}
            <Card className="p-5">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base">Période et Salaire</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date de début <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => handleChange("dateDebut", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date de fin
                    {formData.type === "CDD" && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => handleChange("dateFin", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required={formData.type === "CDD"}
                  />
                  {formData.type === "CDI" && (
                    <p className="text-xs text-slate-500 mt-1">Laisser vide pour un CDI</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salaire de base (XAF) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.salaireBase}
                    onChange={(e) => handleChange("salaireBase", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 250000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Statut initial
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => handleChange("statut", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {STATUT_CONTRAT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes */}
          <Card className="p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-base">Notes et commentaires</CardTitle>
            </CardHeader>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notes additionnelles sur le contrat..."
            />
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.push("/rh/contrats")}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Créer le contrat
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
