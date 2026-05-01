'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { User, Lock, Upload, Camera, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  departement: z.string().optional(),
  iban: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
  new_password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const fetchDepartements = async () => {
  const response = await api.get<{ data: any[] }>('/departements');
  return response.data.data;
};

const updateProfile = async (data: ProfileFormData) => {
  const response = await api.put('/parametres/profil', data);
  return response.data;
};

const changePassword = async (data: PasswordFormData) => {
  const response = await api.put('/parametres/change-password', data);
  return response.data;
};

const uploadPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await api.post('/parametres/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default function MonProfilTab() {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const queryClient = useQueryClient();

  const { data: departements = [] } = useQuery({
    queryKey: ['departements'],
    queryFn: fetchDepartements,
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      departement: user?.departement && typeof user.departement === 'object' ? String(user.departement.id) : String(user?.departement || ''),
      iban: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      resetPassword();
      setShowPasswordSection(false);
    },
  });

  const photoMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await photoMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    passwordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Photo Profile */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
            {user?.photo_profil ? (
              <img
                src={user.photo_profil}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <User size={32} className="text-gray-500" />
              </div>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera size={20} className="text-white" />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-full">
              <Loader2 size={20} className="animate-spin text-blue-600" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user?.prenom} {user?.nom}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">{user?.roles?.[0]?.nom || 'Utilisateur'}</p>
        </div>
      </div>

      {/* Formulaire Profil */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                {...registerProfile('nom')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              {profileErrors.nom && <p className="mt-1 text-sm text-red-600">{profileErrors.nom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input
                {...registerProfile('prenom')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              {profileErrors.prenom && <p className="mt-1 text-sm text-red-600">{profileErrors.prenom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
              <select
                {...registerProfile('departement')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">Sélectionner</option>
                {departements.map((dep: any) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
              <input
                {...registerProfile('iban')}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {profileMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <User size={18} />}
              {profileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>

      {/* Section Sécurité */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock size={20} className="text-purple-600" />
            Sécurité
          </h3>
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            {showPasswordSection ? 'Annuler' : 'Changer le mot de passe'}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                {...registerPassword('current_password')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              {passwordErrors.current_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                {...registerPassword('new_password')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              {passwordErrors.new_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                {...registerPassword('confirm_password')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              {passwordErrors.confirm_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password.message}</p>}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {passwordMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {passwordMutation.isPending ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
