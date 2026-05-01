'use client';

import { useState } from 'react';
import { Printer, Download, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { Contrat } from '@/types';

interface ContratLetterProps {
  contrat: Contrat;
  mode?: 'view' | 'print';
  onClose?: () => void;
}

const typeLabels: Record<string, string> = {
  cdi: 'Indéterminée',
  cdd: 'Déterminée',
  stage: 'Stage',
  alternance: 'Alternance',
  freelance: 'Freelance',
};

export default function ContratLetter({ contrat, mode = 'view', onClose }: ContratLetterProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/api/v1/contrats/${contrat.id}/pdf`, {
        responseType: 'blob',
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrat-${contrat.id}-${contrat.employe?.nom || 'Employe'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const contractNumber = `CTR-${contrat.id}-${new Date(contrat.date_debut).getFullYear()}`;
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  if (mode === 'print') {
    return (
      <div className="contract-letter">
        <div className="a4-page">
          {/* Header */}
          <div className="header">
            <div className="header-left">
              <div className="logo">
                <Building2 size={48} className="text-purple-600" />
              </div>
              <div className="company-info">
                <h1 className="company-name">HRManager SARL</h1>
                <p className="company-address">123 Avenue de l'Entreprise</p>
                <p className="company-contact">75000 Paris</p>
                <p className="company-contact">Tél: +33 1 23 45 67 89</p>
                <p className="company-contact">Email: contact@hrmanager.fr</p>
              </div>
            </div>
            <div className="header-right">
              <p className="date">Paris, le {currentDate}</p>
              <p className="contract-number">{contractNumber}</p>
            </div>
          </div>

          {/* Recipient */}
          <div className="recipient">
            <p className="attention">À l'attention de : M./Mme {contrat.employe?.prenom} {contrat.employe?.nom}</p>
            <p className="department">Département : {contrat.departement || '-'}</p>
          </div>

          {/* Object */}
          <div className="object">
            <p className="object-title">OBJET : Contrat de Travail à Durée {typeLabels[contrat.type] || contrat.type}</p>
          </div>

          {/* Body */}
          <div className="body">
            <div className="clause">
              <p className="clause-title">Clause 1 — Engagement</p>
              <p className="clause-text">
                La société HRManager SARL, ci-après dénommée « l'employeur », engage M./Mme {contrat.employe?.prenom} {contrat.employe?.nom} en qualité de {contrat.poste || 'Employé'} à compter du {formatDate(contrat.date_debut)} conformément aux dispositions du présent contrat.
              </p>
            </div>

            <div className="clause">
              <p className="clause-title">Clause 2 — Durée</p>
              <p className="clause-text">
                {contrat.type === 'cdi' ? (
                  <>Le présent contrat est conclu à durée indéterminée. Il prend effet à compter du {formatDate(contrat.date_debut)}.</>
                ) : (
                  <>Le présent contrat est conclu à durée déterminée du {formatDate(contrat.date_debut)} au {contrat.date_fin ? formatDate(contrat.date_fin) : '[Date de fin à préciser]'}. Il ne pourra être renouvelé que par avenant signé des deux parties.</>
                )}
              </p>
            </div>

            <div className="clause">
              <p className="clause-title">Clause 3 — Rémunération</p>
              <p className="clause-text">
                En contrepartie de son travail, l'employé percevra un salaire mensuel brut de {contrat.salaire_base ? formatCurrency(contrat.salaire_base) : '[Montant à préciser]'} FCFA. Cette rémunération sera versée mensuellement, sous déduction des cotisations sociales légales et fiscales.
              </p>
            </div>

            <div className="clause">
              <p className="clause-title">Clause 4 — Lieu de travail</p>
              <p className="clause-text">
                L'employé exercera ses fonctions au siège de l'entreprise situé à Paris, ou dans tout autre lieu désigné par l'employeur dans l'intérêt du service.
              </p>
            </div>

            <div className="clause">
              <p className="clause-title">Clause 5 — Durée de travail</p>
              <p className="clause-text">
                La durée du travail est fixée à 35 heures hebdomadaires, réparties du lundi au vendredi, conformément à la législation en vigueur. Des horaires différents pourront être définis d'un commun accord.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="signatures">
            <div className="signature-left">
              <p className="signature-title">Le Directeur Général</p>
              <p className="signature-name">[Nom du Directeur Général]</p>
              <div className="signature-box">
                <p className="signature-label">Signature & Cachet</p>
              </div>
            </div>
            <div className="signature-right">
              <p className="signature-title">L'Employé</p>
              <p className="signature-name">{contrat.employe?.prenom} {contrat.employe?.nom}</p>
              <div className="signature-box">
                <p className="signature-label">Lu et approuvé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lettre de Contrat</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 flex items-center gap-2 transition-colors"
            >
              <Printer size={18} />
              Imprimer
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="p-8 border-b-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Building2 size={48} className="text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">HRManager SARL</h1>
                    <p className="text-gray-600 text-sm">123 Avenue de l'Entreprise</p>
                    <p className="text-gray-600 text-sm">75000 Paris</p>
                    <p className="text-gray-600 text-sm">Tél: +33 1 23 45 67 89</p>
                    <p className="text-gray-600 text-sm">Email: contact@hrmanager.fr</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-700 font-medium">Paris, le {currentDate}</p>
                  <p className="text-purple-600 font-semibold mt-2">{contractNumber}</p>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className="p-8 border-b border-gray-200">
              <p className="text-lg text-gray-900">
                À l'attention de : M./Mme {contrat.employe?.prenom} {contrat.employe?.nom}
              </p>
              <p className="text-gray-600 mt-1">Département : {contrat.departement || '-'}</p>
            </div>

            {/* Object */}
            <div className="p-8 border-b border-gray-200">
              <p className="text-xl font-bold text-gray-900">
                OBJET : Contrat de Travail à Durée {typeLabels[contrat.type] || contrat.type}
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              <div>
                <p className="font-bold text-gray-900 mb-2">Clause 1 — Engagement</p>
                <p className="text-gray-700 leading-relaxed">
                  La société HRManager SARL, ci-après dénommée « l'employeur », engage M./Mme {contrat.employe?.prenom} {contrat.employe?.nom} en qualité de {contrat.poste || 'Employé'} à compter du {formatDate(contrat.date_debut)} conformément aux dispositions du présent contrat.
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900 mb-2">Clause 2 — Durée</p>
                <p className="text-gray-700 leading-relaxed">
                  {contrat.type === 'cdi' ? (
                    <>Le présent contrat est conclu à durée indéterminée. Il prend effet à compter du {formatDate(contrat.date_debut)}.</>
                  ) : (
                    <>Le présent contrat est conclu à durée déterminée du {formatDate(contrat.date_debut)} au {contrat.date_fin ? formatDate(contrat.date_fin) : '[Date de fin à préciser]'}. Il ne pourra être renouvelé que par avenant signé des deux parties.</>
                  )}
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900 mb-2">Clause 3 — Rémunération</p>
                <p className="text-gray-700 leading-relaxed">
                  En contrepartie de son travail, l'employé percevra un salaire mensuel brut de {contrat.salaire_base ? formatCurrency(contrat.salaire_base) : '[Montant à préciser]'} FCFA. Cette rémunération sera versée mensuellement, sous déduction des cotisations sociales légales et fiscales.
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900 mb-2">Clause 4 — Lieu de travail</p>
                <p className="text-gray-700 leading-relaxed">
                  L'employé exercera ses fonctions au siège de l'entreprise situé à Paris, ou dans tout autre lieu désigné par l'employeur dans l'intérêt du service.
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900 mb-2">Clause 5 — Durée de travail</p>
                <p className="text-gray-700 leading-relaxed">
                  La durée du travail est fixée à 35 heures hebdomadaires, réparties du lundi au vendredi, conformément à la législation en vigueur. Des horaires différents pourront être définis d'un commun accord.
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="p-8 mt-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="font-bold text-gray-900">Le Directeur Général</p>
                  <p className="text-gray-600 text-sm mt-1">[Nom du Directeur Général]</p>
                  <div className="mt-8 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400 text-sm">Signature & Cachet</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">L'Employé</p>
                  <p className="text-gray-600 text-sm mt-1">{contrat.employe?.prenom} {contrat.employe?.nom}</p>
                  <div className="mt-8 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400 text-sm">Lu et approuvé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .contract-letter,
          .contract-letter * {
            visibility: visible;
          }
          .contract-letter {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            box-shadow: none;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
