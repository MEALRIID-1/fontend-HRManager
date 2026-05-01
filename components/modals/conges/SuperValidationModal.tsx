'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Conge } from '@/types';
import Modal from '@/components/shared/Modal';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, Calendar, User } from 'lucide-react';

const superValidationSchema = z.object({
  motif: z.string().min(10, 'Le motif doit contenir au moins 10 caractères'),
  confirm: z.boolean().refine((val) => val === true, {
    message: 'Vous devez confirmer cette action',
  }),
});

type SuperValidationFormData = z.infer<typeof superValidationSchema>;

interface SuperValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conge: Conge;
}

export default function SuperValidationModal({ isOpen, onClose, conge }: SuperValidationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SuperValidationFormData>({
    resolver: zodResolver(superValidationSchema),
    defaultValues: {
      motif: '',
      confirm: false,
    },
  });

  const queryClient = useQueryClient();

  const superValidateMutation = useMutation({
    mutationFn: async (data: SuperValidationFormData) => {
      const response = await api.post(`/conges/${conge.id}/super-validation`, {
        commentaire: data.motif,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conges'] });
      setSuccessMessage('Super validation effectuée avec succès !');
      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        setStep(1);
        onClose();
      }, 2000);
    },
  });

  const onSubmit = (data: SuperValidationFormData) => {
    if (step === 1) {
      setStep(2);
    } else {
      superValidateMutation.mutate(data);
    }
  };

  const calculateDays = (dateDebut: string, dateFin: string) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Super Validation Admin" size="lg">
      {successMessage ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 text-center">{successMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Badge rouge Super Validation */}
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ShieldAlert className="text-red-600" size={24} />
            <div>
              <p className="font-bold text-red-800">SUPER VALIDATION ADMIN</p>
              <p className="text-sm text-red-600">Cette action bypasse le workflow de validation</p>
            </div>
          </div>

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

          {/* Avertissement */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm text-amber-800">
              <strong>Attention :</strong> Cette action validera tous les niveaux (N1, N2, N3) en une seule fois 
              et ne pourra pas être annulée. L'employé sera immédiatement notifié.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Motif obligatoire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif / Justification <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(min. 10 caractères)</span>
              </label>
              <textarea
                {...register('motif')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Veuillez justifier la super validation..."
                disabled={step === 2}
              />
              {errors.motif && (
                <p className="text-red-500 text-sm mt-1">{errors.motif.message}</p>
              )}
            </div>

            {/* Confirmation double (étape 2) */}
            {step === 2 && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('confirm')}
                    className="w-5 h-5 text-red-600 rounded mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-red-900">
                      Je confirme vouloir valider tous les niveaux de cette demande
                    </p>
                    <p className="text-sm text-red-700">
                      Cette action est irréversible et bypasse le workflow normal.
                    </p>
                  </div>
                </label>
                {errors.confirm && (
                  <p className="text-red-500 text-sm mt-2">{errors.confirm.message}</p>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  onClose();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
              )}
              <button
                type="submit"
                disabled={superValidateMutation.isPending}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldAlert size={18} />
                {superValidateMutation.isPending
                  ? 'Validation...'
                  : step === 1
                  ? 'Continuer'
                  : 'Valider tous les niveaux'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
