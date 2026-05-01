'use client';

import { Conge } from '@/types';
import Modal from '@/components/shared/Modal';
import { Calendar, User, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ViewCongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conge: Conge | null;
}

export default function ViewCongeModal({ isOpen, onClose, conge }: ViewCongeModalProps) {
  if (!conge) return null;

  const getStatusIcon = (etat: string) => {
    switch (etat) {
      case 'approuve': return <CheckCircle className="text-green-600" size={24} />;
      case 'refuse': return <XCircle className="text-red-600" size={24} />;
      case 'en_attente': return <Clock className="text-orange-600" size={24} />;
      default: return <AlertCircle className="text-blue-600" size={24} />;
    }
  };

  const getStatusText = (etat: string) => {
    switch (etat) {
      case 'approuve': return 'Approuvé';
      case 'refuse': return 'Refusé';
      case 'en_attente': return 'En attente';
      case 'partiellement_valide': return 'Partiellement validé';
      default: return etat;
    }
  };

  const getStatusClass = (etat: string) => {
    switch (etat) {
      case 'approuve': return 'bg-green-100 text-green-800';
      case 'refuse': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du congé" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <User className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {conge.employe?.prenom} {conge.employe?.nom}
            </h3>
            <p className="text-gray-500">{conge.employe?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Type de congé</p>
            <p className="font-semibold text-gray-900 capitalize">{conge.type.replace('_', ' ')}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Statut</p>
            <div className="flex items-center gap-2">
              {getStatusIcon(conge.etat)}
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusClass(conge.etat)}`}>
                {getStatusText(conge.etat)}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Date de début</p>
            <p className="font-semibold text-gray-900">{conge.date_debut}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Date de fin</p>
            <p className="font-semibold text-gray-900">{conge.date_fin}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">Commentaire</p>
          <p className="text-gray-700">{conge.commentaire || 'Aucun commentaire'}</p>
        </div>

        {conge.motif_refus && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 mb-1">Motif du refus</p>
            <p className="text-red-700">{conge.motif_refus}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
