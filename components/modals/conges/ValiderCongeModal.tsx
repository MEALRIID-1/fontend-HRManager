'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Conge } from '@/types';
import Modal from '@/components/shared/Modal';
import { CheckCircle, XCircle, Calendar, User, AlertCircle } from 'lucide-react';

const validationSchema = z.object({
  decision: z.enum(['approuve', 'refuse']),
  motif: z.string().min(10, 'Le motif doit contenir au moins 10 caractères'),
});

type ValidationFormData = z.infer<typeof validationSchema>;

interface ValiderCongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conge: Conge;
}

export default function ValiderCongeModal({ isOpen, onClose, conge }: ValiderCongeModalProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ValidationFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      decision: 'approuve',
      motif: '',
    },
  });

  const decision = watch('decision');
  const queryClient = useQueryClient();

  const validateMutation = useMutation({
    mutationFn: async (data: ValidationFormData) => {
      const response = await api.post(`/conges/${conge.id}/valider`, {
        decision: data.decision,
        commentaire: data.motif,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conges'] });
      setSuccessMessage(decision === 'approuve' ? 'Congé approuvé avec succès !' : 'Congé refusé.');
      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        onClose();
      }, 2000);
    },
  });

  const onSubmit = (data: ValidationFormData) => {
    validateMutation.mutate(data);
  };

  const calculateDays = (dateDebut: string, dateFin: string) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Validation de la demande de congé" size="lg">
      {successMessage ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            decision === 'approuve' ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {decision === 'approuve' ? (
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <p className="text-lg font-semibold text-gray-900 text-center">{successMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Détails du congé */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{conge.employe?.prenom} {conge.employe?.nom}</p>
                <p className="text-sm text-gray-500">{conge.employe?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="font-medium text-gray-900">
                  {conge.type?.replace('_', ' ')} • {calculateDays(conge.date_debut, conge.date_fin)} jours
                </p>
                <p className="text-sm text-gray-500">Du {conge.date_debut} au {conge.date_fin}</p>
              </div>
            </div>
          </div>

          {/* Formulaire de décision */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Choix de la décision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Décision</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="approuve"
                    {...register('decision')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle size={18} />
                    Approuver
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="refuse"
                    {...register('decision')}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1 text-red-700">
                    <XCircle size={18} />
                    Refuser
                  </span>
                </label>
              </div>
            </div>

            {/* Motif obligatoire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif / Commentaire <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(min. 10 caractères)</span>
              </label>
              <textarea
                {...register('motif')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Veuillez justifier votre décision de ${decision === 'approuve' ? 'validation' : 'refus'}...`}
              />
              {errors.motif && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  {errors.motif.message}
                </div>
              )}
            </div>

            {/* Avertissement si refus */}
            {decision === 'refuse' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-sm text-red-800">
                  Le refus d'une demande de congé est définitif. L'employé sera notifié par email.
                </p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={validateMutation.isPending}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  decision === 'approuve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {validateMutation.isPending
                  ? 'Traitement...'
                  : decision === 'approuve'
                  ? 'Confirmer l\'approbation'
                  : 'Confirmer le refus'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
