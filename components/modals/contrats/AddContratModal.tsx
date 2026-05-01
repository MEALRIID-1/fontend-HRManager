'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Contrat } from '@/types';
import Modal from '@/components/shared/Modal';
import { User, Calendar, AlertTriangle, Building2 } from 'lucide-react';

const contratSchema = z.object({
  user_id: z.number().min(1, 'L\'employé est requis'),
  type: z.enum(['cdi', 'cdd', 'stage', 'alternance', 'freelance']),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().optional(),
  salaire_brut: z.number().min(0, 'Le salaire doit être positif'),
});

type ContratFormData = z.infer<typeof contratSchema>;

interface AddContratModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingContrats: Contrat[];
}

const typeLabels: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  alternance: 'Alternance',
  freelance: 'Freelance',
};

export default function AddContratModal({ isOpen, onClose, existingContrats }: AddContratModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContratFormData>({
    resolver: zodResolver(contratSchema),
    defaultValues: {
      type: 'cdi',
      date_debut: '',
      date_fin: '',
      salaire_brut: 0,
    },
  });

  const type = useWatch({ control, name: 'type' });
  const userId = useWatch({ control, name: 'user_id' });

  useEffect(() => {
    if (isOpen) {
      reset();
      setError(null);
    }
  }, [isOpen, reset]);

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: async () => {
      const response = await api.get<{ data: any[] }>('/employes', { params: { per_page: 100 } });
      return response.data.data;
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContratFormData) => {
      const response = await api.post('/contrats', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erreur lors de la création du contrat');
    },
  });

  const checkActiveContract = (userId: number): boolean => {
    return existingContrats.some(
      (c) => (c.user_id === userId || (c as any).employe_id === userId) && (c.statut === 'actif' || c.etat === 'actif')
    );
  };

  const onSubmit = (data: ContratFormData) => {
    if (checkActiveContract(data.user_id)) {
      setError('Cet employé a déjà un contrat actif. Veuillez le résilier ou terminer avant d\'en créer un nouveau.');
      return;
    }

    if (type === 'cdi' || type === 'freelance') {
      data.date_fin = undefined;
    }

    createMutation.mutate(data);
  };

  const isCDI = type === 'cdi' || type === 'freelance';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Contrat" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-red-600" size={18} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employé <span className="text-red-500">*</span>
          </label>
          <select
            {...register('user_id', { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sélectionner un employé</option>
            {employes.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.prenom} {emp.nom} - {emp.poste || 'Sans poste'}
              </option>
            ))}
          </select>
          {errors.user_id && <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>}
          {userId && checkActiveContract(userId) && (
            <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              Cet employé a déjà un contrat actif
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de contrat <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="freelance">Freelance</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('date_debut')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.date_debut && <p className="mt-1 text-sm text-red-600">{errors.date_debut.message}</p>}
          </div>

          {!isCDI && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date_fin')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.date_fin && <p className="mt-1 text-sm text-red-600">{errors.date_fin.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salaire brut mensuel (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('salaire_brut', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.salaire_brut && <p className="mt-1 text-sm text-red-600">{errors.salaire_brut.message}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 text-blue-600" size={18} />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Validation métier</p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Un seul contrat actif par employé</li>
                <li>• CDI et Freelance : pas de date de fin</li>
                <li>• CDD, Stage, Alternance : date de fin obligatoire</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isPending ? 'Création...' : 'Créer le contrat'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
