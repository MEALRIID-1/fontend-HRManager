"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  X,
  FileText,
  ChevronRight,
  Copy,
  Printer,
  Download,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

interface ContratLettreProps {
  isOpen: boolean;
  onClose: () => void;
  contrat: {
    id: string;
    employe: {
      nom: string;
      prenom: string;
      adresse?: string;
    };
    type: string;
    dateDebut: string;
    dateFin?: string;
    salaire?: number;
    fonction?: string;
    etat: string;
    articles?: Array<{
      numero: number;
      titre: string;
      contenu: string;
    }>;
  } | null;
}

const ETAPES_WORKFLOW = [
  { id: "brouillon", label: "Brouillon", color: "gray" },
  { id: "en_cours", label: "En cours", color: "blue" },
  { id: "signe", label: "Signé", color: "green" },
] as const;

/**
 * Modal de lettre de contrat officielle
 * Design: Watermark CONFIDENTIEL, breadcrumb, progression
 */
export function ContratLettre({ isOpen, onClose, contrat }: ContratLettreProps) {
  // Fermer avec Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papiers");
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !contrat) return null;

  // Déterminer l'étape actuelle
  const currentStepIndex = ETAPES_WORKFLOW.findIndex(
    (e) => e.id === contrat.etat.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden",
          "animate-in slide-in-from-bottom-8 duration-300 ease-out"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Contrats</span>
            <ChevronRight className="w-4 h-4" />
            <span>Aperçu</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-800">
              {contrat.employe.prenom} {contrat.employe.nom}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copier le lien"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progression */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">État:</span>
            <div className="flex items-center gap-2">
              {ETAPES_WORKFLOW.map((etape, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={etape.id} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 mx-1",
                          isActive ? "text-blue-500" : "text-gray-300"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {etape.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content - Lettre */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-200px)] p-8 print:p-0">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] text-gray-200 text-6xl font-bold tracking-widest opacity-20">
              CONFIDENTIEL
            </div>
          </div>

          {/* En-tête entreprise */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              HR Manager
            </h1>
            <p className="text-sm text-gray-500">
              123 Avenue des Champs-Élysées, 75008 Paris
            </p>
            <p className="text-sm text-gray-500">SIRET: 123 456 789 00012</p>
          </div>

          {/* Titre */}
          <div className="text-center mb-8 pb-4 border-b-2 border-gray-800">
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">
              Contrat de {contrat.type === "CDI" ? "travail" : contrat.type}
            </h2>
          </div>

          {/* Info employé */}
          <div className="mb-6 text-gray-700">
            <p className="mb-4">
              Entre les soussignés:
            </p>
            <p className="pl-4 mb-2">
              <strong>HR Manager</strong>, représentée par son Directeur des Ressources Humaines,
            </p>
            <p className="text-center my-4">et</p>
            <p className="pl-4 mb-4">
              <strong>
                {contrat.employe.prenom} {contrat.employe.nom.toUpperCase()}
              </strong>
              {contrat.employe.adresse && (
                <>, demeurant au {contrat.employe.adresse}</>
              )}
            </p>
            <p>Il a été convenu ce qui suit:</p>
          </div>

          {/* Articles */}
          <div className="space-y-6">
            {(contrat.articles || getDefaultArticles(contrat)).map((article) => (
              <div key={article.numero} className="pl-4">
                <h3 className="font-bold text-gray-800 mb-2">
                  Article {article.numero} - {article.titre}
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {article.contenu}
                </p>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="mt-12 pt-8 border-t border-gray-300">
            <p className="text-center text-gray-500 mb-8">
              Fait en deux exemplaires, le {new Date().toLocaleDateString("fr-FR")}
            </p>

            <div className="grid grid-cols-2 gap-16">
              <div>
                <p className="text-sm text-gray-500 mb-4">L&apos;employeur:</p>
                <div className="h-20 border-b border-gray-300" />
                <p className="mt-2 text-sm font-medium">Directeur RH</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-4">L&apos;employé:</p>
                <div className="h-20 border-b border-gray-300" />
                <p className="mt-2 text-sm font-medium">
                  {contrat.employe.prenom} {contrat.employe.nom}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Référence: C-{contrat.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
            >
              Télécharger PDF
            </Button>
            <Button
              variant="primary"
              icon={<Share2 className="w-4 h-4" />}
            >
              Envoyer pour signature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Articles par défaut selon le type de contrat
function getDefaultArticles(contrat: ContratLettreProps["contrat"]) {
  if (!contrat) return [];

  return [
    {
      numero: 1,
      titre: "Engagement",
      contenu: `M. ${contrat.employe.prenom} ${contrat.employe.nom} est engagé en qualité de ${contrat.fonction || "Collaborateur"} à compter du ${contrat.dateDebut}.`,
    },
    {
      numero: 2,
      titre: "Durée",
      contenu:
        contrat.type === "CDI"
          ? "Le présent contrat est conclu pour une durée indéterminée."
          : `Le présent contrat est conclu pour une durée déterminée se terminant le ${contrat.dateFin}.`,
    },
    {
      numero: 3,
      titre: "Rémunération",
      contenu: `La rémunération brute mensuelle est fixée à ${contrat.salaire?.toLocaleString("fr-FR")} EUR, payable par virement bancaire.`,
    },
    {
      numero: 4,
      titre: "Horaires",
      contenu: "L'horaire de travail est de 35 heures par semaine, réparties du lundi au vendredi.",
    },
    {
      numero: 5,
      titre: "Congés payés",
      contenu: "L'employé bénéficie de 25 jours ouvrés de congés payés par an, conformément à la législation en vigueur.",
    },
  ];
}

export default ContratLettre;
