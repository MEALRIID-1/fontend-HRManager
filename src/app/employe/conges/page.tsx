"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays, Plus, Trash2, Eye, XCircle, AlertTriangle,
  ChevronRight, Clock, CheckCircle, X, RotateCcw
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Input, Select } from "@/components/ui";
import {
  cn, formatDate, nbJoursEntre,
  TYPE_CONGE_LABELS, STATUT_CONGE_LABELS, getStatutCongeVariant,
} from "@/lib/utils";
import { employeeService, type SoldeConges, type CongeDetail } from "@/lib/services";
import toast from "react-hot-toast";

// Types
interface NouvelleDemandeForm {
  type: string;
  date_debut: string;
  date_fin: string;
}

export default function EmployeCongesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const congeId = searchParams.get("id");

  const [conges, setConges] = useState<CongeDetail[]>([]);
  const [solde, setSolde] = useState<SoldeConges | null>(null);
  const [corbeilleCount, setCorbeilleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Modals
  const [showNouvelleDemande, setShowNouvelleDemande] = useState(false);
  const [showDetail, setShowDetail] = useState<CongeDetail | null>(null);
  const [showAnnulerConfirm, setShowAnnulerConfirm] = useState<CongeDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState<NouvelleDemandeForm>({
    type: "ANNUEL",
    date_debut: "",
    date_fin: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Chargement des données
  const loadData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const [congesRes, soldeRes, corbeilleRes] = await Promise.all([
        employeeService.getMesConges({ exclure_annulees: true }),
        employeeService.getSoldeConges(),
        employeeService.getCorbeilleCount(),
      ]);

      if (congesRes.success) {
        setConges(congesRes.data);
      }
      if (soldeRes.success) {
        setSolde(soldeRes.data);
      }
      if (corbeilleRes.success) {
        setCorbeilleCount(corbeilleRes.data.count);
      }
    } catch (error) {
      console.error("Erreur chargement congés:", error);
      setIsError(true);
      toast.error("Impossible de charger vos congés");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ouvrir le détail si ID dans URL
  useEffect(() => {
    if (congeId && conges.length > 0) {
      const conge = conges.find(c => c.id === congeId);
      if (conge) setShowDetail(conge);
    }
  }, [congeId, conges]);

  // Calculer jours ouvrés
  const calculerJours = () => {
    if (!formData.date_debut || !formData.date_fin) return 0;
    return nbJoursEntre(formData.date_debut, formData.date_fin);
  };

  // Valider formulaire
  const validerFormulaire = () => {
    const errors: Record<string, string> = {};

    if (!formData.type) errors.type = "Type requis";
    if (!formData.date_debut) errors.date_debut = "Date de début requise";
    if (!formData.date_fin) errors.date_fin = "Date de fin requise";

    if (formData.date_debut && formData.date_fin) {
      if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
        errors.date_fin = "Doit être après la date de début";
      }
      if (new Date(formData.date_debut) < new Date()) {
        errors.date_debut = "Ne peut pas être dans le passé";
      }
      // Vérifier chevauchement
      const jours = calculerJours();
      if (jours <= 0) {
        errors.date_fin = "Période invalide";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre nouvelle demande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validerFormulaire()) return;

    try {
      setIsSubmitting(true);
      const response = await employeeService.createConge(formData);

      if (response.success) {
        toast.success("Demande de congé soumise");
        setShowNouvelleDemande(false);
        setFormData({ type: "ANNUEL", date_debut: "", date_fin: "" });
        loadData(); // Recharger
      } else {
        toast.error(response.message || "Échec de la soumission");
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast.error("Échec de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annuler (soft delete)
  const handleAnnuler = async () => {
    if (!showAnnulerConfirm) return;

    try {
      setIsSubmitting(true);
      const response = await employeeService.cancelConge(showAnnulerConfirm.id);

      if (response.success) {
        toast.success("Demande annulée — consultez la Corbeille pour la restaurer");
        // Optimistic update
        setConges(conges.filter(c => c.id !== showAnnulerConfirm.id));
        setCorbeilleCount(prev => prev + 1);
        setShowAnnulerConfirm(null);
      } else {
        toast.error("Échec de l'annulation");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast.error("Échec de l'annulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Peut annuler?
  const canCancel = (conge: CongeDetail) => {
    return ["BROUILLON", "EN_ATTENTE_N1"].includes(conge.statut);
  };

  // Options type congé
  const typeOptions = [
    { value: "ANNUEL", label: "Congé annuel" },
    { value: "MALADIE", label: "Congé maladie" },
    { value: "MATERNITE", label: "Congé maternité" },
    { value: "PATERNITE", label: "Congé paternité" },
    { value: "SANS_SOLDE", label: "Sans solde" },
    { value: "EXCEPTIONNEL", label: "Exceptionnel" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Mes Congés">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Card key={i} className="h-24 animate-pulse bg-slate-100" />)}
          </div>
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Mes Congés">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="text-danger mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
          <Button onClick={loadData}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Mes Congés"
      subtitle="Gérez vos demandes de congés"
      actions={
        <div className="flex items-center gap-3">
          {/* Bouton Corbeille */}
          {corbeilleCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => router.push("/employe/conges/corbeille")}
              className="relative"
            >
              Corbeille
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-danger text-white text-xs font-bold">
                {corbeilleCount}
              </span>
            </Button>
          )}
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setShowNouvelleDemande(true)}
          >
            Nouvelle demande
          </Button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Solde en bandeau */}
        {solde && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <div className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{solde.conge_annuel}</p>
                <p className="text-sm text-emerald-700">Congés annuels</p>
              </div>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{solde.maladie}</p>
                <p className="text-sm text-blue-700">Maladie</p>
              </div>
            </Card>
            {(solde.maternite || 0) > 0 && (
              <Card className="bg-purple-50 border-purple-200">
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">{solde.maternite}</p>
                  <p className="text-sm text-purple-700">Maternité</p>
                </div>
              </Card>
            )}
            <Card className="bg-amber-50 border-amber-200">
              <div className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{solde.sans_solde}</p>
                <p className="text-sm text-amber-700">Sans solde</p>
              </div>
            </Card>
          </div>
        )}

        {/* Liste des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes en cours</CardTitle>
          </CardHeader>

          <div className="px-6 pb-6">
            {conges.length > 0 ? (
              <div className="space-y-3">
                {conges.map((conge) => (
                  <div
                    key={conge.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
                      conge.statut.startsWith("APPROUVE") ? "bg-emerald-100 text-emerald-600" :
                      conge.statut.startsWith("REFUSE") ? "bg-red-100 text-red-600" :
                      conge.statut === "BROUILLON" ? "bg-slate-100 text-slate-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      {conge.statut.startsWith("APPROUVE") ? <CheckCircle size={20} /> :
                       conge.statut.startsWith("REFUSE") ? <XCircle size={20} /> :
                       conge.statut === "BROUILLON" ? <Clock size={20} /> :
                       <Clock size={20} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800">
                          {TYPE_CONGE_LABELS[conge.type]}
                        </p>
                        <Badge variant={getStatutCongeVariant(conge.statut)} size="sm">
                          {STATUT_CONGE_LABELS[conge.statut]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)} · {conge.nombreJours} jours
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={16} />}
                        onClick={() => setShowDetail(conge)}
                      >
                        Voir
                      </Button>
                      {canCancel(conge) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger/10"
                          icon={<XCircle size={16} />}
                          onClick={() => setShowAnnulerConfirm(conge)}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Aucune demande active</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowNouvelleDemande(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Nouvelle demande
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal nouvelle demande */}
      {showNouvelleDemande && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Nouvelle demande de congé</h2>
              <button onClick={() => setShowNouvelleDemande(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Select
                label="Type de congé"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                error={formErrors.type}
                options={typeOptions}
                required
              />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={formData.date_debut}
                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                error={formErrors.date_debut}
                min={new Date().toISOString().split("T")[0]}
                required
              />
              <Input
                label="Date de fin"
                type="date"
                value={formData.date_fin}
                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                error={formErrors.date_fin}
                min={formData.date_debut || new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Prévisualisation jours */}
            {formData.date_debut && formData.date_fin && (
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-sm text-slate-600">
                  Durée estimée: <span className="font-semibold">{calculerJours()} jour(s)</span>
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowNouvelleDemande(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Soumettre
              </Button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Modal détail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Détail de la demande</h2>
              <button onClick={() => setShowDetail(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-medium">{TYPE_CONGE_LABELS[showDetail.type]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Période</span>
                <span className="font-medium">
                  {formatDate(showDetail.dateDebut)} → {formatDate(showDetail.dateFin)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Durée</span>
                <span className="font-medium">{showDetail.nombreJours} jours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Statut</span>
                <Badge variant={getStatutCongeVariant(showDetail.statut)}>
                  {STATUT_CONGE_LABELS[showDetail.statut]}
                </Badge>
              </div>

              {/* Workflow */}
              {showDetail.validations && showDetail.validations.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-medium mb-3">Workflow d'approbation</h4>
                  <div className="space-y-2">
                    {showDetail.validations.map((validation, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          validation.decision === "APPROUVE" ? "bg-emerald-100 text-emerald-600" :
                          validation.decision === "REFUSE" ? "bg-red-100 text-red-600" :
                          "bg-slate-200 text-slate-600"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Niveau {validation.niveau}
                            {validation.validateur && (
                              <span className="text-slate-500 ml-2">
                                ({validation.validateur.prenom} {validation.validateur.nom})
                              </span>
                            )}
                          </p>
                          {validation.commentaire && (
                            <p className="text-xs text-slate-500">{validation.commentaire}</p>
                          )}
                        </div>
                        <Badge
                          size="sm"
                          variant={validation.decision === "APPROUVE" ? "green" : validation.decision === "REFUSE" ? "red" : "gray"}
                        >
                          {validation.decision}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motif refus */}
              {showDetail.motif_refus && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Motif du refus:</span> {showDetail.motif_refus}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowDetail(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation annulation */}
      {showAnnulerConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Confirmer l'annulation</h2>
              <button onClick={() => setShowAnnulerConfirm(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <AlertTriangle className="text-amber-600 flex-shrink-0" size={24} />
                <p className="text-sm text-amber-800">
                  Cette demande sera annulée et déplacée dans la corbeille.
                  Vous pourrez la restaurer depuis la Corbeille.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="font-medium">{TYPE_CONGE_LABELS[showAnnulerConfirm.type]}</p>
                <p className="text-sm text-slate-500">
                  {formatDate(showAnnulerConfirm.dateDebut)} → {formatDate(showAnnulerConfirm.dateFin)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAnnulerConfirm(null)}
                >
                  Non, garder
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  loading={isSubmitting}
                  onClick={handleAnnuler}
                >
                  Oui, annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
