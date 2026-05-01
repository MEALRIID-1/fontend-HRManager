'use client';

import { useForm } from 'react-hook-form';
import { Contrat } from '@/types';
import Modal from '@/components/shared/Modal';
import { useEffect } from 'react';

interface EditContratModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrat: Contrat | null;
}

export default function EditContratModal({ isOpen, onClose, contrat }: EditContratModalProps) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      type: contrat?.type || 'CDI',
      date_debut: contrat?.date_debut || '',
      date_fin: contrat?.date_fin || '',
      poste: contrat?.poste || '',
      departement: contrat?.departement || '',
      salaire_base: contrat?.salaire_base || 0,
    },
  });

  const type = watch('type');

  useEffect(() => {
    if (contrat) {
      reset({
        type: contrat.type,
        date_debut: contrat.date_debut,
        date_fin: contrat.date_fin || '',
        poste: contrat.poste || '',
        departement: contrat.departement || '',
        salaire_base: contrat.salaire_base || 0,
      });
    }
  }, [contrat, reset]);

  const onSubmit = async (data: unknown) => {
    console.log('Update contrat:', data);
    onClose();
  };

  if (!contrat) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le contrat" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select {...register('type')} className="mt-1 block w-full rounded border p-2">
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Alternance">Alternance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de début</label>
          <input type="date" {...register('date_debut')} className="mt-1 block w-full rounded border p-2" />
        </div>

        {type !== 'CDI' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
            <input type="date" {...register('date_fin')} className="mt-1 block w-full rounded border p-2" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Poste</label>
          <input {...register('poste')} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Département</label>
          <input {...register('departement')} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Salaire de base (€)</label>
          <input type="number" step="0.01" {...register('salaire_base', { valueAsNumber: true })} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Annuler</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Mettre à jour</button>
        </div>
      </form>
    </Modal>
  );
}
