'use client';

import { useState } from 'react';
import { useConges, useValidateConge, useRefuseConge } from '@/hooks/useConges';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ManagerCongesPage() {
  const { data: congesData, isLoading } = useConges({ statut: 'en_attente', per_page: 50 });
  const validateMutation = useValidateConge();
  const refuseMutation = useRefuseConge();
  const [selectedConge, setSelectedConge] = useState<number | null>(null);
  const [motifRefus, setMotifRefus] = useState('');

  const handleValidate = async (id: number) => {
    await validateMutation.mutateAsync({ id, commentaire: 'Validé par le manager (N1)' });
  };

  const handleRefuse = async (id: number) => {
    if (!motifRefus.trim()) {
      alert('Veuillez saisir un motif de refus');
      return;
    }
    await refuseMutation.mutateAsync({ id, motif_refus: motifRefus });
    setSelectedConge(null);
    setMotifRefus('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar size={32} className="text-orange-600" />
          Validation des Congés (N1)
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {congesData?.data?.map((conge) => (
                <tr key={conge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {conge.employe?.prenom} {conge.employe?.nom}
                    </div>
                    <div className="text-sm text-gray-500">{conge.employe?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conge.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conge.date_debut} au {conge.date_fin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      En attente N1
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidate(conge.id)}
                        disabled={validateMutation.isPending}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <CheckCircle size={16} />
                        Valider
                      </button>
                      <button
                        onClick={() => setSelectedConge(conge.id)}
                        disabled={refuseMutation.isPending}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <XCircle size={16} />
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedConge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Motif du refus</h3>
            <textarea
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              rows={3}
              placeholder="Saisissez le motif du refus..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedConge(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => handleRefuse(selectedConge)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
