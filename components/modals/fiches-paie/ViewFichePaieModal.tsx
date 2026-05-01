'use client';

import Modal from '@/components/shared/Modal';
import { FileText, Download, Printer, Building2, User, Calendar, Euro } from 'lucide-react';
import { FichePaie } from '@/types';

interface ViewFichePaieModalProps {
  isOpen: boolean;
  onClose: () => void;
  fiche: FichePaie;
}

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function ViewFichePaieModal({ isOpen, onClose, fiche }: ViewFichePaieModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would download the PDF
    console.log('Download PDF for fiche:', fiche.id);
  };

  const cotisations = fiche.total_cotisations || 0;
  const netImposable = fiche.total_brut - cotisations;
  const netAPayer = fiche.net_a_payer;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulletin de Salaire" size="xl">
      <div className="max-h-[85vh] overflow-y-auto">
        {/* Official Payslip Format */}
        <div className="bg-white p-8 border border-gray-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">HRManager</h2>
                <p className="text-sm text-gray-500">Solutions de Gestion RH</p>
                <p className="text-sm text-gray-500">contact@hrmanager.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bulletin de Paie</p>
              <p className="text-lg font-semibold text-gray-900">
                {months[fiche.mois - 1]} {fiche.annee}
              </p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <User size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {fiche.employe?.prenom} {fiche.employe?.nom}
                </h3>
                <p className="text-sm text-gray-500">{fiche.employe?.email || ''}</p>
                <p className="text-sm text-gray-500">
                  {(fiche.employe?.departement as string) || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="space-y-4 mb-6">
            {/* Salaire Brut */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Euro size={16} className="text-green-600" />
                Salaire Brut
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salaire de base</span>
                  <span className="font-medium text-gray-900">{formatCurrency(fiche.salaire_base)}</span>
                </div>
                {fiche.heures_sup && fiche.heures_sup > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heures supplémentaires ({fiche.heures_sup}h)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(fiche.heures_sup * 25)}</span>
                  </div>
                )}
                {fiche.absences && fiche.absences > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Absences ({fiche.absences}j)</span>
                    <span className="font-medium">-{formatCurrency((fiche.salaire_base / 21.67) * fiche.absences)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-semibold text-gray-900">Total Brut</span>
                  <span className="font-bold text-gray-900">{formatCurrency(fiche.total_brut)}</span>
                </div>
              </div>
            </div>

            {/* Cotisations */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Cotisations Sociales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sécurité sociale</span>
                  <span className="font-medium text-gray-900">{formatCurrency(cotisations * 0.45)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retraite</span>
                  <span className="font-medium text-gray-900">{formatCurrency(cotisations * 0.25)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CSG / CRDS</span>
                  <span className="font-medium text-gray-900">{formatCurrency(cotisations * 0.15)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prélèvement à la source</span>
                  <span className="font-medium text-gray-900">{formatCurrency(cotisations * 0.15)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-semibold text-gray-900">Total Cotisations</span>
                  <span className="font-bold text-red-600">-{formatCurrency(cotisations)}</span>
                </div>
              </div>
            </div>

            {/* Net */}
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Euro size={16} className="text-green-600" />
                Net à Payer
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Net imposable</span>
                  <span className="font-medium text-gray-900">{formatCurrency(netImposable)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-bold text-lg text-gray-900">Net à payer</span>
                  <span className="font-bold text-2xl text-green-600">{formatCurrency(netAPayer)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-2">Employeur</p>
                <div className="border-b border-gray-300 pb-2">
                  <p className="font-semibold text-gray-900">HRManager</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Date: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Employé</p>
                <div className="border-b border-gray-300 pb-2">
                  <p className="font-semibold text-gray-900">
                    {fiche.employe?.prenom} {fiche.employe?.nom}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Signature électronique</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Printer size={18} />
          Imprimer
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Télécharger PDF
        </button>
      </div>
    </Modal>
  );
}
