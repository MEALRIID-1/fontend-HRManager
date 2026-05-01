'use client';

import { Printer, Download, FileText, Building, MapPin, DollarSign, Calendar } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import { Contrat } from '@/types';

interface ViewContratModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrat: Contrat | null;
  isAdmin?: boolean;
}

const typeLabels: Record<string, string> = {
  cdi: 'Contrat de travail à durée indéterminée',
  cdd: 'Contrat de travail à durée déterminée',
  stage: 'Convention de stage',
  alternance: 'Contrat d\'alternance',
  freelance: 'Contrat de prestation de services',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ViewContratModal({ isOpen, onClose, contrat, isAdmin = true }: ViewContratModalProps) {
  if (!contrat) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // Appel API pour télécharger le PDF
    try {
      const response = await fetch(`/api/contrats/${contrat.id}/telecharger`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat_${contrat.employe?.nom}_${contrat.employe?.prenom}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aperçu du Contrat" size="xl">
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="bg-white border-2 border-gray-300 p-8 shadow-lg max-w-4xl mx-auto" id="contract-preview">
          {/* En-tête */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Building className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HRManager</h1>
                <p className="text-sm text-gray-500">Solutions de Gestion RH</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>123 Avenue des Technologies</p>
              <p>75000 Paris</p>
              <p>Tél: +33 1 23 45 67 89</p>
              <p>Email: contact@hrmanager.com</p>
            </div>
          </div>

          {/* Destinataire */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">À l'attention de :</p>
            <p className="text-lg font-semibold text-gray-900">
              M./Mme {contrat.employe?.prenom} {contrat.employe?.nom}
            </p>
            <p className="text-sm text-gray-600">{contrat.employe?.email}</p>
            <p className="text-sm text-gray-600">{contrat.departement || 'Département non spécifié'}</p>
          </div>

          {/* Objet */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Objet :</p>
            <p className="text-lg font-semibold text-gray-900">{typeLabels[contrat.type] || 'Contrat de travail'}</p>
          </div>

          {/* Corps du contrat */}
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-sm text-gray-500">Paris, le {formatDate(contrat.date_debut)}</p>

            <p>
              Madame, Monsieur,
            </p>

            <p>
              En référence à nos échanges et suite à votre recrutement au sein de notre entreprise, nous avons le plaisir de vous confirmer votre engagement selon les modalités ci-dessous :
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={18} />
                Dispositions du contrat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <span className="font-medium">Date de début :</span> {formatDate(contrat.date_debut)}
                  </div>
                </div>
                {contrat.date_fin && (
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="mt-0.5 text-gray-500" />
                    <div>
                      <span className="font-medium">Date de fin :</span> {formatDate(contrat.date_fin)}
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <span className="font-medium">Poste :</span> {contrat.poste || 'Non spécifié'}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <span className="font-medium">Salaire brut mensuel :</span> {contrat.salaire_brut ? `${contrat.salaire_brut.toLocaleString()} €` : 'Non spécifié'}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 1 - Engagement</h3>
            <p>
              Vous êtes engagé en qualité de {contrat.poste || 'collaborateur'} au sein de notre établissement. Votre engagement prend effet à compter du {formatDate(contrat.date_debut)}.
              {contrat.date_fin && ` et prendra fin le ${formatDate(contrat.date_fin)}.`}
              {contrat.type === 'cdi' && ' pour une durée indéterminée.'}
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 2 - Période d'essai</h3>
            <p>
              Le présent contrat est soumis à une période d'essai de {contrat.type === 'cdi' ? '2 mois' : contrat.type === 'cdd' ? '1 mois' : '15 jours'}, renouvelable une fois pour les contrats à durée indéterminée.
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 3 - Lieu de travail</h3>
            <p>
              Votre lieu de travail est situé à nos bureaux de Paris, ou tout autre lieu désigné par la direction dans le cadre de vos fonctions.
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 4 - Durée du travail</h3>
            <p>
              La durée du travail est fixée à 35 heures hebdomadaires, réparties sur 5 jours ouvrables, conformément à la législation en vigueur.
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 5 - Rémunération</h3>
            <p>
              En contrepartie de votre travail, vous percevrez un salaire brut mensuel de {contrat.salaire_brut ? `${contrat.salaire_brut.toLocaleString()} €` : '[à définir]'}.
              Ce salaire sera versé mensuellement à terme échu, sous déduction des cotisations sociales légales.
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 6 - Congés payés</h3>
            <p>
              Vous bénéficiez des congés payés annuels dans les conditions prévues par la convention collective applicable à notre entreprise.
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 7 - Obligation de discrétion</h3>
            <p>
              Vous vous engagez à ne pas divulguer, notamment pendant la durée de votre engagement et après sa cessation, aucune information confidentielle dont vous auriez connaissance dans l'exercice de vos fonctions.
            </p>

            <h3 className="font-semibold text-gray-900 mt-6 mb-3">Article 8 - Clause de non-concurrence</h3>
              <p>
                Pendant la durée de votre contrat et pour une période de 6 mois après sa cessation, vous vous interdirez, sans l'autorisation écrite de l'entreprise, d'exercer une activité concurrente ou de travailler pour une entreprise concurrente.
              </p>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Le présent contrat est établi en deux exemplaires originaux, dont un vous est remis et l'autre conservé par l'employeur.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">L'Employeur</p>
              <p className="font-semibold text-gray-900 mb-8">HRManager</p>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-600">Signature</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Le Salarié</p>
              <p className="font-semibold text-gray-900 mb-8">{contrat.employe?.prenom} {contrat.employe?.nom}</p>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-600">Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      {isAdmin && (
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
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Télécharger PDF
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">Ce contrat est en lecture seule. Contactez le RH pour toute modification.</p>
        </div>
      )}
    </Modal>
  );
}
