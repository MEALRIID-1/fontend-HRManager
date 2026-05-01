'use client';

import { Conge } from '@/types';
import Modal from '@/components/shared/Modal';
import { Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

interface ViewCongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conge: Conge;
}

export default function ViewCongeModal({ isOpen, onClose, conge }: ViewCongeModalProps) {
  const calculateDays = (dateDebut: string, dateFin: string) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatutBadge = (etat: string) => {
    switch (etat) {
      case 'approuve':
        return <span className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full">Approuvé</span>;
      case 'en_attente':
        return <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 rounded-full">En attente</span>;
      case 'partiellement_valide':
        return <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">Partiel</span>;
      case 'refuse':
        return <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">Refusé</span>;
      default:
        return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">{etat}</span>;
    }
  };

  const getValidationIcon = (decision?: string) => {
    switch (decision) {
      case 'approuve':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'refuse':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getValidationBg = (decision?: string) => {
    switch (decision) {
      case 'approuve':
        return 'bg-emerald-50 border-emerald-200';
      case 'refuse':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const validations = conge.validations || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de la demande de congé" size="lg">
      <div className="space-y-6">
        {/* Header avec statut */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
              {conge.employe?.prenom?.[0]}{conge.employe?.nom?.[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{conge.employe?.prenom} {conge.employe?.nom}</h3>
              <p className="text-sm text-gray-500">{conge.employe?.email}</p>
            </div>
          </div>
          {getStatutBadge(conge.etat)}
        </div>

        {/* Détails du congé */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText size={16} />
              <span className="text-sm">Type de congé</span>
            </div>
            <p className="font-semibold text-gray-900">{conge.type?.replace('_', ' ')}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock size={16} />
              <span className="text-sm">Durée</span>
            </div>
            <p className="font-semibold text-gray-900">{calculateDays(conge.date_debut, conge.date_fin)} jours</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">Date début</span>
            </div>
            <p className="font-semibold text-gray-900">{conge.date_debut}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">Date fin</span>
            </div>
            <p className="font-semibold text-gray-900">{conge.date_fin}</p>
          </div>
        </div>

        {/* Timeline des validations */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Timeline des validations
          </h4>

          <div className="space-y-3">
            {[1, 2, 3].map((niveau) => {
              const validation = validations.find((v) => v.niveau === niveau);
              return (
                <div
                  key={niveau}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${getValidationBg(validation?.decision)}`}
                >
                  <div className="flex-shrink-0">
                    {getValidationIcon(validation?.decision)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">N{niveau}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        validation?.decision === 'approuve'
                          ? 'bg-emerald-100 text-emerald-700'
                          : validation?.decision === 'refuse'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {validation?.decision === 'approuve'
                          ? 'Approuvé'
                          : validation?.decision === 'refuse'
                          ? 'Refusé'
                          : 'En attente'}
                      </span>
                    </div>
                    {validation ? (
                      <>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Validateur:</span> {validation.validateur?.prenom} {validation.validateur?.nom}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Commentaire:</span> {validation.commentaire || '-'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(validation.created_at || '').toLocaleString('fr-FR')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">En attente de validation</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commentaire de la demande */}
        {conge.commentaire && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Commentaire de l&apos;employé</h4>
            <p className="text-blue-800 text-sm">{conge.commentaire}</p>
          </div>
        )}

        {/* Bouton fermer */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
