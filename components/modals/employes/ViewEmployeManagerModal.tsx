'use client';

import { User } from '@/types';
import Modal from '@/components/shared/Modal';
import { Mail, Building2, Calendar, CreditCard, BadgeCheck, Briefcase, Sun, History } from 'lucide-react';

interface ViewEmployeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employe: User;
}

export default function ViewEmployeManagerModal({ isOpen, onClose, employe }: ViewEmployeManagerModalProps) {
  const getRoleBadge = (role: string) => {
    if (!role) {
      return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">-</span>;
    }
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrateur':
        return <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">Admin</span>;
      case 'rh':
      case 'ressources humaines':
        return <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">RH</span>;
      case 'manager':
        return <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 rounded-full">Manager</span>;
      case 'employe':
      case 'employé':
        return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">Employé</span>;
      default:
        return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">{role}</span>;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <span className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full">Actif</span>;
      case 'inactif':
        return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">Inactif</span>;
      case 'en_conge':
        return <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full">En congé</span>;
      default:
        return <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">{statut}</span>;
    }
  };

  // Données de démonstration pour les congés récents
  const congesRecents = [
    { id: 1, type: 'Congé payé', periode: '15-22 Août 2024', jours: 7, statut: 'Approuvé' },
    { id: 2, type: 'RTT', periode: '6 Sept 2024', jours: 1, statut: 'En attente' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fiche Employé - Vue Manager" size="lg">
      <div className="space-y-6">
        {/* Header avec photo et nom */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
            {employe.prenom?.[0]}{employe.nom?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employe.prenom} {employe.nom}</h2>
            <div className="flex items-center gap-2 mt-2">
              {employe.roles?.map((role) => (
                <span key={role.id}>{getRoleBadge(role.slug)}</span>
              ))}
              {getStatutBadge(employe.statut || 'actif')}
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BadgeCheck className="text-blue-600" size={20} />
              Informations personnelles
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{employe.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Département</p>
                  <p className="font-medium text-gray-900">{employe.departement || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="text-gray-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Date d'embauche</p>
                  <p className="font-medium text-gray-900">
                    {employe.date_embauche 
                      ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') 
                      : '-'}
                  </p>
                </div>
              </div>

              {employe.iban && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="text-gray-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">IBAN</p>
                    <p className="font-medium text-gray-900">{employe.iban}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contrat et Congés */}
          <div className="space-y-6">
            {/* Contrat actif */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Briefcase className="text-emerald-600" size={20} />
                Contrat actif
              </h3>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900">CDI</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Depuis</p>
                    <p className="font-semibold text-gray-900">
                      {employe.date_embauche 
                        ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solde congés */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Sun className="text-orange-600" size={20} />
                Solde de congés
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-orange-600">18</p>
                  <p className="text-xs text-gray-600">Congés payés</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-xs text-gray-600">RTT</p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-600">0</p>
                  <p className="text-xs text-gray-600">Sans solde</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Congés récents */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <History className="text-purple-600" size={20} />
            Congés récents
          </h3>
          <div className="space-y-2">
            {congesRecents.map((conge) => (
              <div key={conge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sun className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{conge.type}</p>
                    <p className="text-sm text-gray-500">{conge.periode} • {conge.jours} jour(s)</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  conge.statut === 'Approuvé' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {conge.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
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
