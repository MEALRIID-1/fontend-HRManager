"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Contrat } from "@/types";

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrat: Contrat | null;
}

const COMPANY = {
  name: "HRManager SARL",
  legalStatus: "Société à responsabilité limitée",
  capital: "10 000 000 FCFA",
  address: "123 Rue du Management, Douala",
  representative: "Mme Amina Tchatchoua, Présidente",
};

const missionForPoste = (intitule?: string) => {
  if (!intitule) return "Assurer les missions confiées par la direction dans le respect des procédures internes.";
  const title = intitule.toLowerCase();
  if (title.includes("développeur")) {
    return "Concevoir, développer et maintenir les solutions numériques de l’entreprise, tout en garantissant qualité et sécurité.";
  }
  if (title.includes("responsable") || title.includes("manager") || title.includes("directeur")) {
    return "Piloter les activités de l’équipe, coordonner les projets transverses et assurer le suivi opérationnel des objectifs.";
  }
  if (title.includes("comptable")) {
    return "Gérer les écritures comptables, préparer les éléments de paie et assurer la conformité des audits financiers.";
  }
  if (title.includes("rh")) {
    return "Accompagner les collaborateurs, piloter les recrutements et assurer le suivi administratif du personnel.";
  }
  return `Réaliser les missions principales liées au poste de ${intitule} et contribuer activement à la performance de l’entreprise.`;
};

const professionalStatus = (poste?: Contrat["poste"]) => {
  if (!poste) return "Collaborateur";
  return poste.niveauHierarchique >= 3 ? "Cadre" : "Collaborateur";
};

export default function ContractPreviewModal({ isOpen, onClose, contrat }: ContractPreviewModalProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

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

  const previewData = useMemo(() => {
    if (!contrat) return null;
    const documentNumber = contrat.reference || `CTR-${contrat.id.slice(-4).toUpperCase()}`;
    return {
      documentNumber,
      employeeName: `${contrat.employe?.prenom || ""} ${contrat.employe?.nom || ""}`,
      jobTitle: contrat.poste?.intitule || "Poste non renseigné",
      mission: missionForPoste(contrat.poste?.intitule),
      status: professionalStatus(contrat.poste),
      salary: `${contrat.salaireBase.toLocaleString()} CFA brut par an`,
      paymentTerms: "Versement mensuel au 5 du mois sur le compte bancaire indiqué.",
      contractType: contrat.type,
      startDate: formatDate(contrat.dateDebut),
      workingDays: "218 jours de travail par an",
      signatureDate: formatDate(new Date().toISOString()),
      iban: contrat.employe?.rib || "Non renseigné",
      socialNumber: contrat.employe?.cnss || "Non renseigné",
    };
  }, [contrat]);

  const downloadPdf = async () => {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const html2pdfModule = await import("html2pdf.js/dist/html2pdf.js");
      const html2pdf = (html2pdfModule as any).default || (html2pdfModule as any).html2pdf || html2pdfModule;
      if (!html2pdf) {
        throw new Error("Impossible de charger html2pdf.js");
      }
      await html2pdf()
        .from(previewRef.current)
        .set({
          margin: 0.4,
          filename: `CONTRAT_${contrat?.reference || contrat?.id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .save();
    } catch (error) {
      console.error("Erreur génération PDF :", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !contrat || !previewData) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex h-full w-full max-w-6xl max-h-[94vh] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <div className="flex-shrink-0 flex w-full flex-col gap-4 border-b border-slate-200 bg-slate-50 p-6 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Aperçu contrat officiel</p>
                <h2 className="text-2xl font-bold text-slate-900">{previewData.employeeName}</h2>
                <p className="mt-1 text-sm text-slate-600">{previewData.jobTitle} • {previewData.contractType}</p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-white px-3 py-1 border border-slate-200">{previewData.documentNumber}</span>
              <span className="rounded-full bg-white px-3 py-1 border border-slate-200">{previewData.contractType}</span>
              <span className="rounded-full bg-white px-3 py-1 border border-slate-200">{contrat.statut}</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            <div ref={previewRef} className="mx-auto h-full w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white p-8 text-slate-800 print:p-0 print:border-none" id="contract-preview">
              <style>
                {`@media print {
                  body * { visibility: hidden; }
                  #contract-preview, #contract-preview * { visibility: visible; }
                  #contract-preview { position: absolute; left: 0; top: 0; width: 100%; }
                  .print-hidden { display: none !important; }
                  .print-page-break { page-break-after: always; }
                }`}
              </style>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 print:border-b print:border-slate-200">
                <div>
                  <p className="text-2xl font-bold text-slate-900">HRManager</p>
                  <p className="mt-1 text-sm text-slate-600">Document officiel interne</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">DOCUMENT OFFICIEL</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{previewData.documentNumber}</p>
                </div>
              </div>

              <div className="py-12 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Contrat de travail</p>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE</h1>
              </div>

              <section className="space-y-4 pb-8 print:pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">ENTRE LES SOUSSIGNÉS</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">Raison sociale</p>
                    <p className="mt-1 font-semibold text-slate-900">{COMPANY.name}</p>
                    <p className="mt-4 text-sm text-slate-600">Statut juridique</p>
                    <p className="mt-1 text-slate-900">{COMPANY.legalStatus}</p>
                    <p className="mt-4 text-sm text-slate-600">Capital</p>
                    <p className="mt-1 text-slate-900">{COMPANY.capital}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">Siège social</p>
                    <p className="mt-1 text-slate-900">{COMPANY.address}</p>
                    <p className="mt-4 text-sm text-slate-600">Représentant</p>
                    <p className="mt-1 text-slate-900">{COMPANY.representative}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pb-8 print:pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">LE SALARIÉ</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">Nom et prénom</p>
                    <p className="mt-1 font-semibold text-slate-900">{previewData.employeeName}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">Poste</p>
                    <p className="mt-1 font-semibold text-slate-900">{previewData.jobTitle}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">IBAN</p>
                    <p className="mt-1 font-mono text-slate-900">{previewData.iban}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">Numéro de sécurité sociale</p>
                    <p className="mt-1 font-mono text-slate-900">{previewData.socialNumber}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pb-8 print:pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">FONCTIONS ET ATTRIBUTIONS</p>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm text-slate-700 mb-3">{previewData.mission}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Statut</p>
                      <p className="mt-1 font-semibold text-slate-900">{previewData.status}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Poste</p>
                      <p className="mt-1 font-semibold text-slate-900">{previewData.jobTitle}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pb-8 print:pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">RÉMUNÉRATION</p>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm text-slate-700 mb-2">Montant annuel brut</p>
                  <p className="text-2xl font-semibold text-slate-900">{previewData.salary}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-700">{previewData.paymentTerms}</p>
                </div>
              </section>

              <section className="space-y-4 pb-8 print:pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">DURÉE DU TRAVAIL</p>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Type de contrat</p>
                    <p className="mt-1 text-slate-900">{previewData.contractType}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Date de début</p>
                    <p className="mt-1 text-slate-900">{previewData.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Forfait annuel</p>
                    <p className="mt-1 text-slate-900">{previewData.workingDays}</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2 pb-8 print:pb-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">FAIT POUR L’EMPLOYEUR</p>
                  <div className="mt-8 h-24 rounded-2xl border border-dashed border-slate-300 bg-white" />
                  <p className="mt-4 text-sm text-slate-600">Signature / Cachet</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">LE SALARIÉ (LU ET APPROUVÉ)</p>
                  <div className="mt-8 h-24 rounded-2xl border border-dashed border-slate-300 bg-white" />
                  <p className="mt-4 text-sm text-slate-600">Signature</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">Signature électronique</p>
                <p className="mt-2 text-sm text-slate-700">Date : {previewData.signatureDate}</p>
                <p className="mt-1 text-sm text-warning-dark">Statut : En attente de signature</p>
              </section>

              <div className="mt-10 border-t border-slate-200 pt-4 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
                PAGE 1 / 1 — DOCUMENT CONFIDENTIEL
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-6 print:hidden">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" icon={<Printer size={16} />} onClick={handlePrint}>
                Imprimer le contrat
              </Button>
              <Button icon={<Download size={16} />} onClick={downloadPdf} disabled={pdfLoading}>
                {pdfLoading ? "Téléchargement..." : "Télécharger PDF"}
              </Button>
            </div>
            <button onClick={onClose} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}