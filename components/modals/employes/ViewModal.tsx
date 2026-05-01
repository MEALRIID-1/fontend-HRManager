'use client';

import { User } from '@/types';
import Modal from '@/components/shared/Modal';
import { User as UserIcon, Mail, Building2, Briefcase, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface ViewEmployeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employe: User | null;
}

export default function ViewEmployeModal({ isOpen, onClose, employe }: ViewEmployeModalProps) {
  if (!employe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'employé" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
            {employe.prenom?.[0]}{employe.nom?.[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{employe.prenom} {employe.nom}</h3>
            <p className="text-gray-500">{employe.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <Building2 className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Département</p>
              <p className="font-medium">{employe.departement || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <Briefcase className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Poste</p>
              <p className="font-medium">{employe.poste || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Date d'embauche</p>
              <p className="font-medium">{employe.date_embauche || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            {employe.is_active ? (
              <>
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium text-green-600">Actif</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="text-red-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium text-red-600">Inactif</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Rôles</h4>
          <div className="flex flex-wrap gap-2">
            {employe.roles?.map((role) => (
              <span key={role.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {role.nom}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
