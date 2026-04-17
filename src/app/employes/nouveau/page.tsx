"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, Info } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { TYPE_CONTRAT_LABELS } from "@/lib/utils";
import type { Employe, TypeContrat } from "@/types";

export default function NouvelEmployePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    emailPro: "",
    telephone: "",
    iban: "",
    poste: "",
    departement: "",
    dateEmbauche: "",
    typeContrat: "CDI",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.emailPro.trim()) newErrors.emailPro = "L'email professionnel est requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.poste.trim()) newErrors.poste = "Le poste est requis";
    if (!formData.departement.trim()) newErrors.departement = "Le département est requis";
    if (!formData.dateEmbauche.trim()) newErrors.dateEmbauche = "La date d'embauche est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const employeeData: Partial<Employe> = {
        prenom: formData.prenom,
        nom: formData.nom,
        emailPro: formData.emailPro,
        email: formData.emailPro,
        telephone: formData.telephone,
        rib: formData.iban,
        posteId: formData.poste,
        departementId: formData.departement,
        dateEmbauche: formData.dateEmbauche,
        typeContrat: formData.typeContrat as TypeContrat,
      };

      try {
        // Appel API (à adapter selon votre backend)
        console.log("Nouvel employé créé:", employeeData);
        router.push("/employes");
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Employés / <span className="text-primary-600">Nouvel employé</span>
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ajouter un collaborateur</h1>
          <p className="text-slate-600">Complétez les informations pour intégrer un nouveau membre à l'équipe.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Section */}
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
                    <Camera size={32} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Info */}
              <Card className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Prénom</label>
                    <Input
                      value={formData.prenom}
                      onChange={(e) => handleInputChange("prenom", e.target.value)}
                      placeholder="ex: Jean"
                    />
                    {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Nom</label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => handleInputChange("nom", e.target.value)}
                      placeholder="ex: Dupont"
                    />
                    {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    Email professionnel
                    <Info size={16} className="text-slate-400" />
                  </label>
                  <Input
                    type="email"
                    value={formData.emailPro}
                    onChange={(e) => handleInputChange("emailPro", e.target.value)}
                    placeholder="jean.dupont@entreprise.com"
                  />
                  {errors.emailPro && <p className="text-xs text-red-500 mt-1">{errors.emailPro}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    Numéro de téléphone
                    <Info size={16} className="text-slate-400" />
                  </label>
                  <Input
                    value={formData.telephone}
                    onChange={(e) => handleInputChange("telephone", e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                  />
                  {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    IBAN
                    <Info size={16} className="text-slate-400" />
                  </label>
                  <Input
                    value={formData.iban}
                    onChange={(e) => handleInputChange("iban", e.target.value)}
                    placeholder="FR26 0000 0000 0000 0000 0000"
                  />
                </div>
              </Card>

              {/* Job Details */}
              <Card className="p-6 space-y-4 border-l-4 border-l-primary-600">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-bold">📋</span>
                  </div>
                  <h3 className="font-medium text-slate-900">Détails du poste</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Poste</label>
                    <select
                      value={formData.poste}
                      onChange={(e) => handleInputChange("poste", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sélectionner un poste</option>
                      <option value="p1">Développeur</option>
                      <option value="p2">Designer</option>
                      <option value="p3">Manager</option>
                      <option value="p4">RH</option>
                      <option value="p5">Comptable</option>
                    </select>
                    {errors.poste && <p className="text-xs text-red-500 mt-1">{errors.poste}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Département</label>
                    <select
                      value={formData.departement}
                      onChange={(e) => handleInputChange("departement", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sélectionner un département</option>
                      <option value="d1">Informatique</option>
                      <option value="d2">Ressources Humaines</option>
                      <option value="d3">Finance</option>
                      <option value="d4">Commercial</option>
                      <option value="d5">Logistique</option>
                    </select>
                    {errors.departement && <p className="text-xs text-red-500 mt-1">{errors.departement}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Date d'embauche</label>
                  <Input
                    type="date"
                    value={formData.dateEmbauche}
                    onChange={(e) => handleInputChange("dateEmbauche", e.target.value)}
                    placeholder="mm/dd/yyyy"
                  />
                  {errors.dateEmbauche && <p className="text-xs text-red-500 mt-1">{errors.dateEmbauche}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Type de contrat</label>
                  <div className="flex gap-2">
                    {["CDI", "CDD", "Stage"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInputChange("typeContrat", type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.typeContrat === type
                            ? "bg-primary-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button type="submit" className="px-8">
                  Enregistrer l'employé
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tips Section */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info size={20} className="text-primary-600" />
                Conseils de saisie
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Utilisez l'adresse email professionnelle @entreprise.com pour l'accès aux outils internes.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>La photo de profil doit être au format carré (JPG ou PNG) de préférence.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>La date d'embauche détermine le calcul automatique des congés payés.</span>
                </li>
              </ul>
            </Card>

            {/* Team Status Section */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Statut de l'équipe</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600">Effectif actuel</span>
                  <span className="text-2xl font-bold text-primary-600">142</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Capacité de recrutement : 180 collaborateurs</p>
              </div>

              {/* Quote Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 text-white text-center">
                <div className="text-2xl mb-2">🌅</div>
                <h4 className="font-semibold mb-1">Bâtir l'avenir, ensemble.</h4>
                <p className="text-xs text-slate-300">Renforcez une culture d'excellence</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
