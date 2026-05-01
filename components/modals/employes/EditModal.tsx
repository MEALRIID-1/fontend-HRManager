'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeSchema, EmployeFormData } from '@/lib/validations';
import { useUpdateEmploye } from '@/hooks/useEmployes';
import { User } from '@/types';
import Modal from '@/components/shared/Modal';
import { useEffect } from 'react';

interface EditEmployeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employe: User | null;
}

export default function EditEmployeModal({ isOpen, onClose, employe }: EditEmployeModalProps) {
  const updateEmploye = useUpdateEmploye();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      nom: employe?.nom || '',
      prenom: employe?.prenom || '',
      email: employe?.email || '',
      departement: employe?.departement || '',
      poste: employe?.poste || '',
    },
  });

  useEffect(() => {
    if (employe) {
      reset({
        nom: employe.nom,
        prenom: employe.prenom,
        email: employe.email,
        departement: employe.departement || '',
        poste: employe.poste || '',
      });
    }
  }, [employe, reset]);

  const onSubmit = async (data: EmployeFormData) => {
    if (employe?.id) {
      await updateEmploye.mutateAsync({ id: employe.id, data });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier l'employé"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input {...register('nom')} className="mt-1 block w-full rounded border p-2" />
          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input {...register('prenom')} className="mt-1 block w-full rounded border p-2" />
          {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input {...register('email')} type="email" className="mt-1 block w-full rounded border p-2" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Département</label>
          <input {...register('departement')} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Poste</label>
          <input {...register('poste')} className="mt-1 block w-full rounded border p-2" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Annuler</button>
          <button type="submit" disabled={updateEmploye.isPending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {updateEmploye.isPending ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
