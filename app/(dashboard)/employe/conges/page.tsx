'use client';

import { useState } from 'react';
import { useMesConges, useCreateConge } from '@/hooks/useConges';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { congeSchema, CongeFormData } from '@/lib/validations';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function EmployeCongesPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: mesConges, isLoading } = useMesConges();
  const createConge = useCreateConge();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CongeFormData>({
    resolver: zodResolver(congeSchema),
  });

  const onSubmit = async (data: CongeFormData) => {
    await createConge.mutateAsync(data);
    setShowModal(false);
    reset();
  };

  const getStatusIcon = (etat: string) => {
    switch (etat) {
      case 'approuve':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'refuse':
        return <XCircle className="text-red-600" size={20} />;
      case 'en_attente':
        return <Clock className="text-orange-600" size={20} />;
      default:
        return <AlertCircle className="text-blue-600" size={20} />;
    }
  };

  const getStatusLabel = (etat: string) => {
    switch (etat) {
      case 'approuve':
        return 'Approuvé';
      case 'refuse':
        return 'Refusé';
      case 'en_attente':
        return 'En attente';
      case 'partiellement_valide':
        return 'Partiellement validé';
      default:
        return etat;
    }
  };

  const getStatusClass = (etat: string) => {
    switch (etat) {
      case 'approuve':
        return 'bg-green-100 text-green-800';
      case 'refuse':
        return 'bg-red-100 text-red-800';
      case 'en_attente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar size={32} className="text-blue-600" />
          Mes Congés
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Demander un congé
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mesConges?.data?.map((conge) => (
                <tr key={conge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {conge.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conge.date_debut} au {conge.date_fin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.ceil((new Date(conge.date_fin).getTime() - new Date(conge.date_debut).getTime()) / (1000 * 60 * 60 * 24)) + 1} jours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(conge.etat)}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(conge.etat)}`}>
                        {getStatusLabel(conge.etat)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conge.commentaire || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Demander un congé</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de congé</label>
                <select {...register('type')} className="mt-1 block w-full rounded border p-2">
                  <option value="conge_paye">Congé payé</option>
                  <option value="conge_sans_solde">Congé sans solde</option>
                  <option value="rtt">RTT</option>
                  <option value="maladie">Maladie</option>
                  <option value="formation">Formation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                <input type="date" {...register('date_debut')} className="mt-1 block w-full rounded border p-2" />
                {errors.date_debut && <p className="text-red-500 text-sm">{errors.date_debut.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                <input type="date" {...register('date_fin')} className="mt-1 block w-full rounded border p-2" />
                {errors.date_fin && <p className="text-red-500 text-sm">{errors.date_fin.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commentaire</label>
                <textarea {...register('commentaire')} rows={3} className="mt-1 block w-full rounded border p-2" placeholder="Motif du congé..." />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Demander</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
