'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Modal from '@/components/shared/Modal';
import { UserPlus, Upload, Check } from 'lucide-react';
import { Role } from '@/types';

const employeSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  departement: z.string().min(1, 'Le département est requis'),
  date_embauche: z.string().min(1, 'La date d\'embauche est requise'),
  iban: z.string().optional(),
  role_slug: z.enum(['rh', 'manager', 'employe', 'admin']),
});

type EmployeFormData = z.infer<typeof employeSchema>;

interface AddEmployeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEmployeModal({ isOpen, onClose }: AddEmployeModalProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      role_slug: 'employe',
    },
  });

  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get<{ data: Role[] }>('/parametres/roles');
      return response.data.data;
    },
    enabled: isOpen,
  });

  const roleOptions = useMemo(() => {
    return roles.filter((role) => ['admin', 'rh', 'manager', 'employe'].includes(role.slug));
  }, [roles]);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setPhotoPreview(null);
    }
  }, [isOpen]);

  const createEmploye = useMutation({
    mutationFn: async (data: EmployeFormData) => {
      const selectedRole = roles.find((role) => role.slug === data.role_slug);
      const payload = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        departement: data.departement,
        date_embauche: data.date_embauche,
        iban: data.iban || null,
        role_ids: selectedRole ? [selectedRole.id] : [],
      };

      const response = await api.post('/employes', payload);
      return response.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      setSuccessMessage('Employé créé. Mot de passe temporaire envoyé par email.');
      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        setPhotoPreview(null);
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.response?.data?.errors?.role_ids?.[0] || error?.response?.data?.errors?.email?.[0] || 'Impossible de créer l\'employé';
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: EmployeFormData) => {
    setErrorMessage(null);
    createEmploye.mutate(data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const departements = ['IT', 'RH', 'Ventes', 'Marketing', 'Finance', 'Opérations'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel Employé" size="lg">
      {successMessage ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 text-center">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Photo upload */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload size={18} />
                <span>Photo de profil</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG (max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dupont"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                {...register('prenom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jean"
              />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="jean.dupont@entreprise.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département <span className="text-red-500">*</span>
              </label>
              <select
                {...register('departement')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                {departements.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.departement && <p className="text-red-500 text-xs mt-1">{errors.departement.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d&apos;embauche <span className="text-red-500">*</span>
              </label>
              <input
                {...register('date_embauche')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.date_embauche && <p className="text-red-500 text-xs mt-1">{errors.date_embauche.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role_slug')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.slug}>
                    {role.nom}
                  </option>
                ))}
              </select>
              {errors.role_slug && <p className="text-red-500 text-xs mt-1">{errors.role_slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IBAN (optionnel)
              </label>
              <input
                {...register('iban')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="FR76..."
              />
            </div>
          </div>

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
              disabled={createEmploye.isPending}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              {createEmploye.isPending ? 'Création...' : 'Créer l\'employé'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
