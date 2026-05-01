'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contratSchema, ContratFormData } from '@/lib/validations';
import { useCreateContrat } from '@/hooks/useContrats';
import Modal from '@/components/shared/Modal';

interface AddContratModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddContratModal({ isOpen, onClose }: AddContratModalProps) {
  const createContrat = useCreateContrat();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContratFormData>({
    resolver: zodResolver(contratSchema),
  });

  const type = watch('type');

  const onSubmit = async (data: ContratFormData) => {
    await createContrat.mutateAsync(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau contrat" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Employé</label>
          <input type="number" {...register('employe_id', { valueAsNumber: true })} className="mt-1 block w-full rounded border p-2" />
          {errors.employe_id && <p className="text-red-500 text-sm mt-1">{errors.employe_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type de contrat</label>
          <select {...register('type')} className="mt-1 block w-full rounded border p-2">
            <option value="cdi">CDI</option>
            <option value="cdd">CDD</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de début</label>
          <input type="date" {...register('date_debut')} className="mt-1 block w-full rounded border p-2" />
        </div>

        {type !== 'cdi' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de fin *</label>
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
          <button type="submit" disabled={createContrat.isPending} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {createContrat.isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
