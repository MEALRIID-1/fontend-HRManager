"use client";
import React, { useState, useEffect } from "react";
import { X, Camera, FileText, CheckCircle, Lightbulb } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Employe, TypeContrat } from "@/types";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Employe>) => void | Promise<void>;
}

const TIPS = [
  "Utilisez l'adresse email professionnelle @entreprise.com pour l'accès aux outils internes.",
  "La photo de profil doit être au format carré (JPG ou PNG) de préférence.",
  "La date d'embauche détermine le calcul automatique des congés payés.",
];

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    emailPro: "",
    telephone: "",
    iban: "",
    posteId: "",
    departementId: "",
    dateEmbauche: "",
    typeContrat: "CDI",
    salaireBase: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedFields, setCompletedFields] = useState<string[]>([]);

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.emailPro.trim()) newErrors.emailPro = "L'email professionnel est requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.dateEmbauche) newErrors.dateEmbauche = "La date d'embauche est requise";
    if (!formData.posteId) newErrors.posteId = "Le poste est requis";
    if (!formData.departementId) newErrors.departementId = "Le département est requis";
    if (!formData.salaireBase) newErrors.salaireBase = "Le salaire de base est requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Tracker les champs complétés
    if (value.trim() && !completedFields.includes(field)) {
      setCompletedFields([...completedFields, field]);
    }
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulation API
        
        const submitData: Partial<Employe> = {
          nom: formData.nom,
          prenom: formData.prenom,
          emailPro: formData.emailPro,
          telephone: formData.telephone,
          posteId: formData.posteId,
          departementId: formData.departementId,
          dateEmbauche: formData.dateEmbauche,
          typeContrat: formData.typeContrat as TypeContrat,
          salaireBase: parseInt(formData.salaireBase) || 0,
          rib: formData.iban,
        };
        
        await onSubmit(submitData);
        
        // Reset form
        setFormData({
          prenom: "",
          nom: "",
          emailPro: "",
          telephone: "",
          iban: "",
          posteId: "",
          departementId: "",
          dateEmbauche: "",
          typeContrat: "CDI",
          salaireBase: "",
        });
        setCompletedFields([]);
        setErrors({});
        
        onClose();
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const progressPercentage = Math.round((completedFields.length / 9) * 100);

  return (
    <>
      {/* Backdrop avec animation */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="flex items-start justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">EMPLOYÉS / NOUVEL EMPLOYÉ</p>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Ajouter un collaborateur</h1>
              <p className="text-slate-600">Complétez les informations pour intégrer un nouveau membre à l'équipe.</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-8 p-8">
              {/* Main Form */}
              <form onSubmit={handleSubmit} className="flex-1 space-y-8">
                {/* Photo Upload Section */}
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-lg transition-all group">
                      <Camera size={40} className="text-slate-400 group-hover:text-slate-500 transition-colors" />
                    </div>
                    {completedFields.length > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-primary-600 rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Photo de profil</p>
                    <p className="text-xs mt-1">JPG ou PNG, max 2 MB</p>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-3 block">Informations personnelles</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Prénom</label>
                      <Input
                        value={formData.prenom}
                        onChange={(e) => handleInputChange("prenom", e.target.value)}
                        placeholder="ex: Jean"
                        className={cn("text-sm", errors.prenom && "border-red-500 focus:ring-red-500")}
                      />
                      {errors.prenom && <p className="text-xs text-red-500 mt-1.5">{errors.prenom}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Nom</label>
                      <Input
                        value={formData.nom}
                        onChange={(e) => handleInputChange("nom", e.target.value)}
                        placeholder="ex: Dupont"
                        className={cn("text-sm", errors.nom && "border-red-500 focus:ring-red-500")}
                      />
                      {errors.nom && <p className="text-xs text-red-500 mt-1.5">{errors.nom}</p>}
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-3 block flex items-center gap-2">
                    Email professionnel
                  </label>
                  <Input
                    type="email"
                    value={formData.emailPro}
                    onChange={(e) => handleInputChange("emailPro", e.target.value)}
                    placeholder="jean.dupont@entreprise.com"
                    className={cn("text-sm", errors.emailPro && "border-red-500 focus:ring-red-500")}
                  />
                  {errors.emailPro && <p className="text-xs text-red-500 mt-1.5">{errors.emailPro}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-2 block">Numéro de téléphone</label>
                    <Input
                      value={formData.telephone}
                      onChange={(e) => handleInputChange("telephone", e.target.value)}
                      placeholder="+33 6 00 00 00 00"
                      className={cn("text-sm", errors.telephone && "border-red-500 focus:ring-red-500")}
                    />
                    {errors.telephone && <p className="text-xs text-red-500 mt-1.5">{errors.telephone}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-2 block">IBAN</label>
                    <Input
                      value={formData.iban}
                      onChange={(e) => handleInputChange("iban", e.target.value)}
                      placeholder="FR26 0000 0000 0000"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="pt-6 border-t border-slate-200">
                  <label className="text-sm font-semibold text-slate-900 mb-3 block flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-primary-600" />
                    </div>
                    Détails du poste
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Poste</label>
                      <select
                        value={formData.posteId}
                        onChange={(e) => handleInputChange("posteId", e.target.value)}
                        className={cn(
                          "w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                          errors.posteId && "border-red-500 focus:ring-red-500"
                        )}
                      >
                        <option value="">Sélectionner un poste</option>
                        <option value="p1">Développeur</option>
                        <option value="p2">Designer</option>
                        <option value="p3">Manager</option>
                        <option value="p4">RH</option>
                        <option value="p5">Comptable</option>
                      </select>
                      {errors.posteId && <p className="text-xs text-red-500 mt-1.5">{errors.posteId}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Département</label>
                      <select
                        value={formData.departementId}
                        onChange={(e) => handleInputChange("departementId", e.target.value)}
                        className={cn(
                          "w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                          errors.departementId && "border-red-500 focus:ring-red-500"
                        )}
                      >
                        <option value="">Sélectionner un département</option>
                        <option value="d1">Informatique</option>
                        <option value="d2">Ressources Humaines</option>
                        <option value="d3">Finance</option>
                        <option value="d4">Commercial</option>
                        <option value="d5">Logistique</option>
                      </select>
                      {errors.departementId && <p className="text-xs text-red-500 mt-1.5">{errors.departementId}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Date d'embauche</label>
                      <Input
                        type="date"
                        value={formData.dateEmbauche}
                        onChange={(e) => handleInputChange("dateEmbauche", e.target.value)}
                        className={cn("text-sm", errors.dateEmbauche && "border-red-500 focus:ring-red-500")}
                      />
                      {errors.dateEmbauche && <p className="text-xs text-red-500 mt-1.5">{errors.dateEmbauche}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Type de contrat</label>
                      <div className="flex gap-2">
                        {["CDI", "CDD", "Stage"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleInputChange("typeContrat", type)}
                            className={cn(
                              "flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
                              formData.typeContrat === type
                                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                                : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-medium text-slate-700 mb-2 block">Salaire de base (CFA)</label>
                    <Input
                      type="number"
                      value={formData.salaireBase}
                      onChange={(e) => handleInputChange("salaireBase", e.target.value)}
                      placeholder="200000"
                      className={cn("text-sm", errors.salaireBase && "border-red-500 focus:ring-red-500")}
                    />
                    {errors.salaireBase && <p className="text-xs text-red-500 mt-1.5">{errors.salaireBase}</p>}
                  </div>
                </div>
              </form>

              {/* Sidebar */}
              <div className="w-72 space-y-6 pl-8 border-l border-slate-200">
                {/* Tips Section */}
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                    <Lightbulb size={18} className="text-amber-500" />
                    Conseils de saisie
                  </h3>
                  <div className="space-y-3">
                    {TIPS.map((tip, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <CheckCircle size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-700 leading-snug">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Progression</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Champs complétés</span>
                      <span className="text-sm font-bold text-slate-900">{completedFields.length}/9</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Team Status Card */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Statut de l'équipe</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-100">
                      <span className="text-xs text-slate-700">Effectif actuel</span>
                      <span className="text-lg font-bold text-slate-900">142</span>
                    </div>
                    <p className="text-xs text-slate-600 text-center">
                      Capacité de recrutement : <span className="font-semibold text-primary-600">180 collaborateurs</span>
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white">
                  <p className="text-sm font-medium leading-relaxed">
                    "Bâtir l'avenir, ensemble."
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Rejoignez notre culture d'excellence</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-8 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </div>
              ) : (
                "Enregistrer l'employé"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
