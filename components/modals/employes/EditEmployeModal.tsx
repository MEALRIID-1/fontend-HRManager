'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types';
import Modal from '@/components/shared/Modal';
import { Upload, Check } from 'lucide-react';
import { Role } from '@/types';

const employeSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  departement: z.string().min(1, 'Le département est requis'),
  date_embauche: z.string().min(1, 'La date d\'embauche est requise'),
  iban: z.string().optional(),
  role_id: z.string().min(1, 'Le rôle est requis'),
});

type EmployeFormData = z.infer<typeof employeSchema>;

interface EditEmployeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employe: User | null;
}

export default function EditEmployeModal({ isOpen, onClose, employe }: EditEmployeModalProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      role_id: '',
    },
  });

  // ✅ URL corrigée : /roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: Role[] }>('/roles');
        return response.data.data || [];
      } catch (error) {
        console.error('Erreur chargement rôles:', error);
        return [
          { id: 1, nom: 'Admin', slug: 'admin' },
          { id: 2, nom: 'RH', slug: 'rh' },
          { id: 3, nom: 'Manager', slug: 'manager' },
          { id: 4, nom: 'Employé', slug: 'employe' },
        ];
      }
    },
    enabled: isOpen,
  });

  // Pré-remplir le formulaire avec les données de l'employé
  useEffect(() => {
    if (employe && isOpen) {
      setValue('nom', employe.nom || '');
      setValue('prenom', employe.prenom || '');
      setValue('email', employe.email || '');
      setValue('departement', employe.departement || '');
      setValue('date_embauche', employe.date_embauche || '');
      setValue('iban', employe.iban || '');
      // ✅ Utilise role_id au lieu de role_slug
      const roleId = employe.roles?.[0]?.id ? String(employe.roles[0].id) : '';
      setValue('role_id', roleId);
    }
  }, [employe, isOpen, setValue]);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setPhotoPreview(null);
    }
  }, [isOpen]);

  const queryClient = useQueryClient();

  const updateEmploye = useMutation({
    mutationFn: async (data: EmployeFormData) => {
      const payload = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        departement: data.departement,
        date_embauche: data.date_embauche,
        iban: data.iban || null,
        role_ids: data.role_id ? [parseInt(data.role_id)] : [],
      };

      const response = await api.put(`/employes/${employe?.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      setSuccessMessage('Employé modifié avec succès.');
      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        setPhotoPreview(null);
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 
                     error?.response?.data?.errors?.role_ids?.[0] || 
                     error?.response?.data?.errors?.email?.[0] || 
                     'Impossible de modifier l\'employé';
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: EmployeFormData) => {
    setErrorMessage(null);
    updateEmploye.mutate(data);
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

  if (!employe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'Employé" size="lg">
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
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {employe.prenom?.[0]}{employe.nom?.[0]}
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload size={18} />
                <span>Modifier la photo</span>
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
                {...register('role_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={rolesLoading}
              >
                <option value="">Sélectionner un rôle</option>
                {!rolesLoading && roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nom}
                  </option>
                ))}
              </select>
              {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id.message}</p>}
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
              disabled={updateEmploye.isPending}
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              {updateEmploye.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}