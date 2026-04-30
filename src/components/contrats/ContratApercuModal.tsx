"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface ContratDetail {
  id: number;
  type?: string;
  date_debut?: string;
  date_fin?: string;
  etat?: string;
  salaire_base?: number;
  employe?: {
    prenom?: string;
    nom?: string;
    date_naissance?: string;
    departement?: { nom?: string } | string;
  };
  entreprise?: {
    nom?: string;
    adresse?: string;
    ville?: string;
  };
  directeur?: {
    prenom?: string;
    nom?: string;
  };
}

interface ContratApercuModalProps {
  contratId: number | null;
  onClose: () => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
}

export function ContratApercuModal({ contratId, onClose }: ContratApercuModalProps) {
  const { user } = useAuth();
  const canDownload = ["rh", "directeur", "admin"].includes(user?.role ?? "");
  const [contrat, setContrat] = useState<ContratDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contratId) return;
    fetchContrat(contratId);
  }, [contratId]);

  const fetchContrat = async (id: number) => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      setContrat(json.data || json);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprimer = () => {
    window.print();
  };

  const handleTelechargerPDF = async () => {
    if (!contrat) return;
    setIsPrinting(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/${contrat.id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Impossible de générer le PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrat_${contrat.employe?.nom}_${contrat.employe?.prenom}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPrinting(false);
    }
  };

  // Fermer avec Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!contratId) return null;

  const initiales = contrat?.employe
    ? `${contrat.employe.prenom?.[0] || ""}${contrat.employe.nom?.[0] || ""}`.toUpperCase()
    : "??";

  return (
    <>
      {/* CSS pour l'impression */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #contrat-print-zone { display: block !important; }
          #contrat-print-zone { position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Aperçu du contrat</h2>
              {contrat && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {contrat.employe?.prenom} {contrat.employe?.nom} — {contrat.type?.toUpperCase()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Bouton Imprimer */}
              <button
                onClick={handleImprimer}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                🖨️ Imprimer
              </button>

              {/* Bouton PDF — RH et Admin uniquement */}
              {canDownload && (
                <button
                  onClick={handleTelechargerPDF}
                  disabled={isPrinting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 active:scale-95 transition-all duration-200"
                >
                  {isPrinting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Génération...
                    </>
                  ) : (
                    <>📄 Télécharger PDF</>
                  )}
                </button>
              )}

              {/* Fermer */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Corps */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && contrat && (
              <div
                id="contrat-print-zone"
                ref={printRef}
                className="bg-white shadow-sm rounded-xl mx-auto p-12 max-w-3xl font-serif text-gray-800 leading-relaxed"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* En-tête entreprise */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-white font-bold text-xl">HR</span>
                    </div>
                    <p className="font-bold text-lg text-gray-900">{contrat.entreprise?.nom || "HRManager Entreprise"}</p>
                    <p className="text-sm text-gray-500">{contrat.entreprise?.adresse || ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{contrat.entreprise?.ville || "Douala"}, le {formatDate(contrat.date_debut)}</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">Réf : CTR-{String(contrat.id).padStart(4, "0")}</p>
                  </div>
                </div>

                {/* Titre */}
                <div className="text-center mb-10">
                  <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-2 inline-block">
                    Contrat de Travail à {contrat.type?.toUpperCase()}
                  </h1>
                </div>

                {/* Parties */}
                <div className="mb-8">
                  <p className="mb-4"><strong>Entre les soussignés :</strong></p>
                  <div className="pl-6 border-l-4 border-blue-200 mb-6">
                    <p>La société <strong>{contrat.entreprise?.nom || "HRManager Entreprise"}</strong>,</p>
                    <p>représentée par <strong>{contrat.directeur?.prenom} {contrat.directeur?.nom}</strong>, en qualité de Directeur Général,</p>
                    <p>ci-après dénommée <strong>« l&apos;Employeur »</strong>,</p>
                  </div>
                  <p className="mb-2"><strong>Et :</strong></p>
                  <div className="pl-6 border-l-4 border-green-200">
                    <p>
                      {contrat.employe?.prenom &&
                      ["A", "E", "I", "O", "U"].includes(contrat.employe.prenom[0].toUpperCase())
                        ? "Mme/M."
                        : "M./Mme"}{" "}
                      <strong>{contrat.employe?.prenom} {contrat.employe?.nom}</strong>,
                    </p>
                    {contrat.employe?.date_naissance && (
                      <p>Né(e) le <strong>{formatDate(contrat.employe.date_naissance)}</strong>,</p>
                    )}
                    <p>ci-après dénommé(e) <strong>« le Salarié »</strong>,</p>
                  </div>
                </div>

                <p className="text-center font-semibold mb-8 text-gray-600">Il a été convenu et arrêté ce qui suit :</p>

                {/* Article 1 */}
                <div className="mb-6">
                  <h2 className="font-bold uppercase text-gray-900 mb-2 border-b border-gray-200 pb-1">Article 1 — Engagement et Fonction</h2>
                  <p>
                    La société s&apos;engage à employer <strong>{contrat.employe?.prenom} {contrat.employe?.nom}</strong> en qualité de{" "}
                    <strong>
                      {typeof contrat.employe?.departement === "string"
                        ? contrat.employe.departement
                        : contrat.employe?.departement?.nom || "collaborateur(trice)"}
                    </strong>{" "}
                    à compter du <strong>{formatDate(contrat.date_debut)}</strong>.
                  </p>
                </div>

                {/* Article 2 */}
                <div className="mb-6">
                  <h2 className="font-bold uppercase text-gray-900 mb-2 border-b border-gray-200 pb-1">Article 2 — Durée du Contrat</h2>
                  {contrat.type === "CDI" ? (
                    <p>
                      Le présent contrat est conclu pour une <strong>durée indéterminée</strong>, prenant effet le{" "}
                      <strong>{formatDate(contrat.date_debut)}</strong>.
                    </p>
                  ) : (
                    <p>
                      Le présent contrat est conclu pour une <strong>durée déterminée</strong> allant du{" "}
                      <strong>{formatDate(contrat.date_debut)}</strong> au{" "}
                      <strong>{contrat.date_fin ? formatDate(contrat.date_fin) : "date à définir"}</strong>.
                    </p>
                  )}
                </div>

                {/* Article 3 — salaire masqué pour Manager */}
                {canDownload && (
                  <div className="mb-6">
                    <h2 className="font-bold uppercase text-gray-900 mb-2 border-b border-gray-200 pb-1">Article 3 — Rémunération</h2>
                    <p>
                      Le Salarié percevra une rémunération mensuelle brute de{" "}
                      <strong>{Number(contrat.salaire_base).toLocaleString("fr-FR")} XAF</strong>.
                    </p>
                  </div>
                )}

                {/* Article 4 */}
                <div className="mb-10">
                  <h2 className="font-bold uppercase text-gray-900 mb-2 border-b border-gray-200 pb-1">Article 4 — Période d&apos;Essai</h2>
                  {contrat.etat === "periode_essai" ? (
                    <p>
                      Le présent contrat est soumis à une période d&apos;essai dont les modalités sont définies par la convention collective applicable.
                    </p>
                  ) : (
                    <p>Aucune période d&apos;essai n&apos;est prévue au présent contrat.</p>
                  )}
                </div>

                {/* Signatures */}
                <div className="mt-14 pt-6 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-500 mb-8">
                    Fait à {contrat.entreprise?.ville || "Douala"}, le {formatDate(contrat.date_debut)}, en deux exemplaires originaux.
                  </p>
                  <div className="grid grid-cols-2 gap-16">
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 mb-1">L&apos;Employeur</p>
                      <p className="text-sm text-gray-500 mb-12">{contrat.directeur?.prenom} {contrat.directeur?.nom}</p>
                      <div className="border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-400">Signature et cachet</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 mb-1">Le Salarié</p>
                      <p className="text-sm text-gray-500 mb-12">{contrat.employe?.prenom} {contrat.employe?.nom}</p>
                      <div className="border-t border-gray-400 pt-2">
                        <p className="text-xs text-gray-400">Signature précédée de la mention &quot;Lu et approuvé&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ContratApercuModal;
