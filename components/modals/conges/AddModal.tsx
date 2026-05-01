'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { congeSchema, CongeFormData } from '@/lib/validations';
import { useCreateConge } from '@/hooks/useConges';
import Modal from '@/components/shared/Modal';

interface AddCongeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCongeModal({ isOpen, onClose }: AddCongeModalProps) {
  const createConge = useCreateConge();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CongeFormData>({
    resolver: zodResolver(congeSchema),
  });

  const onSubmit = async (data: CongeFormData) => {
    await createConge.mutateAsync(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Demander un congé" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de congé *</label>
          <select 
            {...register('type')} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionnez un type</option>
            <option value="conge_paye">Congé payé</option>
            <option value="conge_sans_solde">Congé sans solde</option>
            <option value="rtt">RTT</option>
            <option value="maladie">Maladie</option>
            <option value="formation">Formation</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de début *</label>
            <input 
              type="date" 
              {...register('date_debut')} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date_debut && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date_debut.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de fin *</label>
            <input 
              type="date" 
              {...register('date_fin')} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date_fin && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date_fin.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Commentaire</label>
          <textarea 
            {...register('commentaire')} 
            rows={3} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Motif du congé..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={createConge.isPending} 
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {createConge.isPending ? 'Envoi...' : 'Demander'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
