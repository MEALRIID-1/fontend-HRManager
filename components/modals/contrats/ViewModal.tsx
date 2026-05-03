'use client';

import { Contrat } from '@/types';
import Modal from '@/components/shared/Modal';
import { FileText, User, Calendar, DollarSign, Building2, CheckCircle, XCircle, Download } from 'lucide-react';

interface ViewContratModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrat: Contrat | null;
}

export default function ViewContratModal({ isOpen, onClose, contrat }: ViewContratModalProps) {
  if (!contrat) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du contrat" size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <FileText className="text-green-600" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Contrat {contrat.type}</h3>
            <div className="flex items-center gap-2 mt-1">
              {contrat.etat === 'actif' ? (
                <>
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="text-green-600 font-medium">Actif</span>
                </>
              ) : (
                <>
                  <XCircle className="text-gray-400" size={16} />
                  <span className="text-gray-400 font-medium">Terminé</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <User className="text-gray-400" size={20} />
              <p className="text-sm text-gray-500">Employé</p>
            </div>
            <p className="font-semibold text-gray-900">
              {contrat.employe?.prenom} {contrat.employe?.nom}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-gray-400" size={20} />
              <p className="text-sm text-gray-500">Date de début</p>
            </div>
            <p className="font-semibold text-gray-900">{contrat.date_debut}</p>
          </div>

          {contrat.date_fin && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-gray-400" size={20} />
                <p className="text-sm text-gray-500">Date de fin</p>
              </div>
              <p className="font-semibold text-gray-900">{contrat.date_fin}</p>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-gray-400" size={20} />
              <p className="text-sm text-gray-500">Département</p>
            </div>
            <p className="font-semibold text-gray-900">{contrat.departement || '-'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-gray-400" size={20} />
              <p className="text-sm text-gray-500">Poste</p>
            </div>
            <p className="font-semibold text-gray-900">{contrat.poste || '-'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-gray-400" size={20} />
              <p className="text-sm text-gray-500">Salaire de base</p>
            </div>
            <p className="font-semibold text-gray-900">
              {contrat.salaire_base ? `${contrat.salaire_base.toLocaleString()} XAF` : '-'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Fermer
          </button>
          <button
            onClick={() => console.log('Download PDF')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download size={18} />
            Télécharger PDF
          </button>
        </div>
      </div>
    </Modal>
  );
}
