'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Download, Eye } from 'lucide-react';
import { FichePaie } from '@/types';
import ViewFichePaieModal from '@/components/modals/fiches-paie/ViewFichePaieModal';
import { useState } from 'react';

const fetchMesFichesPaie = async () => {
  const response = await api.get<{ data: FichePaie[] }>('/fiches-paie/mes-fiches');
  return response.data.data;
};

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function MesFichesPaie() {
  const [selectedFiche, setSelectedFiche] = useState<FichePaie | null>(null);

  const { data: fiches = [], isLoading } = useQuery({
    queryKey: ['mes-fiches-paie'],
    queryFn: fetchMesFichesPaie,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleDownload = (fiche: FichePaie) => {
    // In a real implementation, this would download the PDF
    console.log('Download PDF for fiche:', fiche.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-purple-600" />
        Mes Fiches de Paie
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : fiches.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune fiche de paie disponible</p>
      ) : (
        <div className="space-y-3">
          {fiches.slice(0, 12).map((fiche) => (
            <div
              key={fiche.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {months[fiche.mois - 1]} {fiche.annee}
                  </p>
                  <p className="text-sm text-gray-500">Net: {formatCurrency(fiche.net_a_payer)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFiche(fiche)}
                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Aperçu"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(fiche)}
                  className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Télécharger"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFiche && (
        <ViewFichePaieModal
          isOpen={!!selectedFiche}
          onClose={() => setSelectedFiche(null)}
          fiche={selectedFiche}
        />
      )}
    </div>
  );
}
