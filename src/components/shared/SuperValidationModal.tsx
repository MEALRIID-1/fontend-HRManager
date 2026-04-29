"use client";

import { useState } from "react";
import { Zap, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SuperValidationModalProps {
  /** Le congé à valider */ 
  conge: {
    id: string;
    employe?: { nom: string; prenom: string };
    type: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
    nombreJours: number;
  } | null;
  /** Étapes manquantes dans le workflow */
  etapesManquantes: string[];
  /** Callback après validation */
  onValidate: (decision: "approuve" | "refuse", commentaire: string, motifRefus?: string) => Promise<void>;
  /** Callback fermeture */
  onClose: () => void;
}

/**
 * Modal de Super Validation pour le Directeur/Admin
 * Permet d'approuver/refuser un congé en court-circuitant le workflow normal
 */
export function SuperValidationModal({
  conge,
  etapesManquantes,
  onValidate,
  onClose,
}: SuperValidationModalProps) {
  const [decision, setDecision] = useState<"approuve" | "refuse" | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!conge) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      toast.error("Veuillez choisir une décision");
      return;
    }

    if (!commentaire.trim()) {
      toast.error("Le commentaire est obligatoire pour une super validation");
      return;
    }

    if (decision === "refuse" && !motifRefus.trim()) {
      toast.error("Le motif de refus est obligatoire");
      return;
    }

    try {
      setIsSubmitting(true);
      await onValidate(decision, commentaire, motifRefus);
      toast.success(
        decision === "approuve" 
          ? "Demande approuvée par super validation" 
          : "Demande refusée par super validation"
      );
      onClose();
    } catch (error) {
      console.error("Erreur super validation:", error);
      toast.error("Échec de la super validation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Super Validation
                  <Badge variant="yellow" className="text-amber-700">⚡ Direct</Badge>
                </h2>
                <p className="text-sm text-white/80">
                  Approbation en court-circuitant le workflow
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-100 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="font-medium text-amber-800">
                Vous allez traiter cette demande en court-circuitant le workflow normal.
              </p>
              <p className="text-amber-700 mt-1">
                Étapes manquantes : {etapesManquantes.join(" → ")}
              </p>
              <p className="text-amber-600 mt-1">
                Cette action est irréversible et sera notifiée à toute la chaîne.
              </p>
            </div>
          </div>
        </div>

        {/* Congé Info */}
        <div className="p-4 border-b border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {conge.employe?.prenom} {conge.employe?.nom}
              </span>
              <Badge variant="blue">{conge.type}</Badge>
            </div>
            <div className="text-sm text-slate-600">
              {new Date(conge.dateDebut).toLocaleDateString("fr-FR")} →{" "}
              {new Date(conge.dateFin).toLocaleDateString("fr-FR")}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {conge.nombreJours} jour{conge.nombreJours > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Decision Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Décision <span className="text-danger">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDecision("approuve")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                  decision === "approuve"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 hover:border-green-300 hover:bg-green-50/50"
                )}
              >
                ✅ Approuver
              </button>
              <button
                type="button"
                onClick={() => setDecision("refuse")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                  decision === "refuse"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 hover:border-red-300 hover:bg-red-50/50"
                )}
              >
                ❌ Refuser
              </button>
            </div>
          </div>

          {/* Commentaire obligatoire */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Commentaire <span className="text-danger">*</span>
              <span className="text-xs text-slate-400 font-normal ml-1">
                (obligatoire pour super validation)
              </span>
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Expliquez la raison de cette super validation..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Motif refus (si refus sélectionné) */}
          {decision === "refuse" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motif du refus <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                placeholder="Raison du refus..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant={decision === "refuse" ? "danger" : "primary"}
              className={cn(
                "flex-1",
                decision === "approuve" && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              )}
              loading={isSubmitting}
              disabled={!decision}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Traitement...
                </>
              ) : decision === "approuve" ? (
                "Confirmer l'approbation directe"
              ) : decision === "refuse" ? (
                "Confirmer le refus direct"
              ) : (
                "Confirmer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
