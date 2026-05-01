'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { congeSchema, CongeFormData } from '@/lib/validations';
import { Conge } from '@/types';
import Modal from '@/components/shared/Modal';
import { useEffect } from 'react';

interface EditCongeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conge: Conge | null;
}

export default function EditCongeModal({ isOpen, onClose, conge }: EditCongeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CongeFormData>({
    resolver: zodResolver(congeSchema),
    defaultValues: {
      type: conge?.type || 'conge_paye',
      date_debut: conge?.date_debut || '',
      date_fin: conge?.date_fin || '',
      commentaire: conge?.commentaire || '',
    },
  });

  useEffect(() => {
    if (conge) {
      reset({
        type: conge.type,
        date_debut: conge.date_debut,
        date_fin: conge.date_fin,
        commentaire: conge.commentaire || '',
      });
    }
  }, [conge, reset]);

  const onSubmit = async (data: CongeFormData) => {
    // TODO: Implement update conge
    console.log('Update conge:', data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le congé" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de fin</label>
          <input type="date" {...register('date_fin')} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Commentaire</label>
          <textarea {...register('commentaire')} rows={3} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Annuler</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Mettre à jour</button>
        </div>
      </form>
    </Modal>
  );
}
