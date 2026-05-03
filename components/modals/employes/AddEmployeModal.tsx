'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Modal from '@/components/shared/Modal';
import { UserPlus, Upload, Check, RefreshCw, Copy } from 'lucide-react';
import { Role } from '@/types';

const employeSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  departement: z.string().min(1, 'Le département est requis'),
  date_embauche: z.string().min(1, 'La date d\'embauche est requise'),
  iban: z.string().optional(),
  role_slug: z.string().min(1, 'Le rôle est requis'),
  mot_de_passe: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
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
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      role_slug: 'employe',
    },
  });

  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: Role[] }>('/roles');
        console.log('Roles récupérés:', response.data);
        return response.data.data || [];
      } catch (error) {
        console.error('Erreur chargement rôles:', error);
        // Fallback en cas d'erreur
        return [
          { id: 1, nom: 'Admin', slug: 'admin', niveau_hierarchique: 100 },
          { id: 2, nom: 'RH', slug: 'rh', niveau_hierarchique: 80 },
          { id: 3, nom: 'Manager', slug: 'manager', niveau_hierarchique: 60 },
          { id: 4, nom: 'Employé', slug: 'employe', niveau_hierarchique: 40 },
        ];
      }
    },
    enabled: isOpen,
  });

  const roleOptions = useMemo(() => {
    if (!roles || roles.length === 0) return [];
    return roles.filter((role) => ['admin', 'rh', 'manager', 'employe'].includes(role.slug));
  }, [roles]);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setPhotoPreview(null);
      setGeneratedPassword(null);
      reset({
        nom: '',
        prenom: '',
        email: '',
        departement: '',
        date_embauche: '',
        iban: '',
        role_slug: 'employe',
        mot_de_passe: '',
      });
    }
  }, [isOpen, reset]);

  const createEmploye = useMutation({
    mutationFn: async (data: EmployeFormData) => {
      const selectedRole = roles.find((role) => role.slug === data.role_slug);
      if (!selectedRole) {
        throw new Error('Rôle non trouvé');
      }
      
      const payload = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        departement: data.departement,
        date_embauche: data.date_embauche,
        iban: data.iban || null,
        role_ids: [selectedRole.id],
        mot_de_passe: data.mot_de_passe,
      };

      const response = await api.post('/employes', payload);
      return response.data;
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['employes'] });
      queryClient.invalidateQueries({ queryKey: ['employes-manager'] });
      setSuccessMessage('Employé créé avec succès.');
      reset({
        nom: '',
        prenom: '',
        email: '',
        departement: '',
        date_embauche: '',
        iban: '',
        role_slug: 'employe',
        mot_de_passe: '',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 
                     error?.response?.data?.errors?.role_ids?.[0] || 
                     error?.response?.data?.errors?.email?.[0] || 
                     'Impossible de créer l\'employé';
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

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    setValue('mot_de_passe', password);
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPhotoPreview(null);
    setGeneratedPassword(null);
    reset({
      nom: '',
      prenom: '',
      email: '',
      departement: '',
      date_embauche: '',
      iban: '',
      role_slug: 'employe',
      mot_de_passe: '',
    });
    onClose();
  };

  const departements = ['IT', 'RH', 'Ventes', 'Marketing', 'Finance', 'Opérations'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel Employé" size="lg">
      {successMessage ? (
        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900 text-center">{successMessage}</p>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
              Le mot de passe temporaire ci-dessous est enregistré dans la base de données et peut être utilisé pour la première connexion.
            </p>
          </div>

          {generatedPassword && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe temporaire</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900"
                />
                <button
                  type="button"
                  onClick={copyPassword}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Copier
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
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
                disabled={rolesLoading}
              >
                <option value="">Sélectionner un rôle</option>
                {!rolesLoading && roleOptions.map((role) => (
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  {...register('mot_de_passe')}
                  type="text"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Générer un mot de passe..."
                  readOnly
                />
                {generatedPassword && (
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    title="Copier"
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                title="Générer un mot de passe"
              >
                <RefreshCw size={16} />
                Générer
              </button>
            </div>
            {errors.mot_de_passe && <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
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