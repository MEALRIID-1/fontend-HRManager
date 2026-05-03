'use client';

import Modal from '@/components/shared/Modal';
import { Download, Printer, Building2, User, Euro, Loader2 } from 'lucide-react';
import { FichePaie } from '@/types';
import api from '@/lib/api';
import { useState, useEffect } from 'react';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [ficheData, setFicheData] = useState<FichePaie | null>(null);

  // Charger les données complètes si nécessaire
  useEffect(() => {
    if (fiche?.id && isOpen) {
      const fetchFicheDetails = async () => {
        try {
          const response = await api.get<{ success: boolean; data: FichePaie }>(`/fiches-paie/${fiche.id}`);
          setFicheData(response.data.data || fiche);
        } catch (error) {
          console.error('Erreur chargement fiche:', error);
          setFicheData(fiche);
        }
      };
      fetchFicheDetails();
    } else {
      setFicheData(fiche);
    }
  }, [fiche, isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get(`/fiches-paie/${fiche.id}/telecharger`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });

      // Try to extract filename from content-disposition header
      let filename = `bulletin-paie-${fiche.periode || fiche.id}.pdf`;
      const disposition = (response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])) as string | undefined;
      if (disposition) {
        const match = /filename\*?=([^;]+)/i.exec(disposition);
        if (match && match[1]) {
          filename = match[1].replace(/UTF-8''/, '').replace(/"/g, '').trim();
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Protection contre les données null
  if (!ficheData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Bulletin de Salaire" size="xl">
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      </Modal>
    );
  }

  // Utiliser les données transformées
  const moisIndex = (ficheData.mois || 1) - 1;
  const moisNom = months[moisIndex] || '';
  const annee = ficheData.annee || new Date().getFullYear();

  const salaire_base = ficheData.salaire_base || 0;
  const net_a_payer = ficheData.net_a_payer || 0;
  const heures_sup = ficheData.heures_sup || 0;
  const absences = ficheData.absences || 0;
  const employe = ficheData.employe || {};

  // Calculs
  const cotisations = salaire_base * 0.23;
  const net = salaire_base - cotisations;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulletin de Salaire" size="xl">
      <div className="max-h-[85vh] overflow-y-auto" id="print-area">
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
                {moisNom} {annee}
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
                  {employe.prenom} {employe.nom}
                </h3>
                <p className="text-sm text-gray-500">{employe.email || ''}</p>
                <p className="text-sm text-gray-500">
                  Matricule: {employe.matricule || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="space-y-4 mb-6">
            {/* Salaire */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Euro size={16} className="text-green-600" />
                Détails du Salaire
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salaire de base</span>
                  <span className="font-medium text-gray-900">{formatCurrency(salaire_base)}</span>
                </div>
                
                {heures_sup > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heures supplémentaires</span>
                    <span className="font-medium text-gray-900">{heures_sup}h</span>
                  </div>
                )}
                
                {absences > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absences</span>
                    <span className="font-medium text-gray-900">{absences}j</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-semibold text-gray-900">Total Brut</span>
                  <span className="font-bold text-gray-900">{formatCurrency(salaire_base)}</span>
                </div>
              </div>
            </div>

            {/* Cotisations */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Cotisations Sociales (23%)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Cotisations salariales</span>
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
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(net_a_payer)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Salaire brut: {formatCurrency(salaire_base)} - Cotisations: {formatCurrency(cotisations)}
              </p>
            </div>
          </div>

          {/* Statut */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              Statut: <span className="font-semibold text-gray-900">{ficheData.statut_label || ficheData.statut}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
