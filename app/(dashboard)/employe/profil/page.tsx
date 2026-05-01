'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, User as UserIcon, Mail, Phone, Building2, Briefcase, MapPin, Lock, Eye, EyeOff, CreditCard, FileText, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import PageHeader from '@/components/shared/PageHeader';

// Schéma de validation pour le changement de mot de passe
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
  new_password: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  new_password_confirmation: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['new_password_confirmation'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const fetchProfile = async (): Promise<User> => {
  const response = await api.get<{ data: User }>('/auth/me');
  return response.data.data;
};

export default function ProfilPage() {
  const { user, setUser } = useAuthStore();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showIban, setShowIban] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    initialData: user,
  });

  const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm({
    defaultValues: {
      nom: profile?.nom || '',
      prenom: profile?.prenom || '',
      email: profile?.email || '',
      telephone: profile?.telephone || '',
      departement: (profile?.departement && typeof profile.departement === 'object') ? profile.departement.nom : profile?.departement || '',
      poste: profile?.poste || '',
      adresse: profile?.adresse || '',
    },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updatePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.put<{ data: User }>(`/employes/${user?.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setUser(data);
      setPhotoPreview(null);
    },
  });

  const updateEmploye = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.put<{ data: User }>(`/employes/${user?.id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      setPasswordSuccess('Mot de passe changé avec succès !');
      setPasswordError(null);
      resetPassword();
      setTimeout(() => setPasswordSuccess(null), 3000);
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || 'Une erreur est survenue');
      setPasswordSuccess(null);
    },
  });

  const onSubmitProfile = (data: Partial<User>) => {
    updateEmploye.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      updatePhotoMutation.mutate(file);
    }
  };

  const maskIban = (iban?: string) => {
    if (!iban) return '-';
    return showIban ? iban : iban.slice(0, 4) + ' **** **** **** **** ****';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles et votre sécurité"
        icon={<UserIcon size={28} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Informations Personnelles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <UserIcon className="text-blue-600" size={24} />
            Informations Personnelles
          </h2>

          {/* Photo de profil */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : user?.photo_url ? (
                  <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{user?.prenom?.[0]}{user?.nom?.[0]}</>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-[#2563EB] text-white rounded-full hover:bg-[#1D4ED8] transition-colors shadow-lg"
                disabled={updatePhotoMutation.isPending}
                title="Modifier ma photo"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">Photo de profil</p>
              <p className="text-sm text-gray-500">Cliquez sur l'icône pour modifier</p>
              {updatePhotoMutation.isPending && <p className="text-sm text-blue-600">Upload en cours...</p>}
            </div>
          </div>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserIcon size={16} />
                  Nom
                </label>
                <input
                  {...registerProfile('nom')}
                  disabled
                  className="block w-full rounded-lg border-gray-300 bg-gray-100 p-2.5"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserIcon size={16} />
                  Prénom
                </label>
                <input
                  {...registerProfile('prenom')}
                  disabled
                  className="block w-full rounded-lg border-gray-300 bg-gray-100 p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} />
                Email
              </label>
              <input
                {...registerProfile('email')}
                disabled
                className="block w-full rounded-lg border-gray-300 bg-gray-100 p-2.5"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 size={16} />
                Département
              </label>
              <input
                {...registerProfile('departement')}
                disabled
                className="block w-full rounded-lg border-gray-300 bg-gray-100 p-2.5"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon size={16} />
                Date d'embauche
              </label>
              <input
                value={profile?.date_embauche ? new Date(profile.date_embauche).toLocaleDateString('fr-FR') : '-'}
                disabled
                className="block w-full rounded-lg border-gray-300 bg-gray-100 p-2.5"
              />
            </div>

            {/* IBAN avec masquage */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CreditCard size={16} />
                IBAN
              </label>
              <div className="relative">
                <input
                  value={maskIban(profile?.iban)}
                  disabled
                  className="block w-full rounded-lg border-gray-300 bg-gray-100 p-2.5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowIban(!showIban)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title={showIban ? 'Masquer' : 'Afficher'}
                >
                  {showIban ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updateEmploye.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
              >
                <Save size={18} />
                {updateEmploye.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </div>

        {/* Colonne droite : Contrat et Sécurité */}
        <div className="space-y-6">
          {/* Section Mon Contrat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-emerald-600" size={24} />
              Mon Contrat
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type de contrat</p>
                    <p className="font-semibold text-gray-900">CDI</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-semibold text-gray-900">
                      {profile?.date_embauche 
                        ? new Date(profile.date_embauche).toLocaleDateString('fr-FR') 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Poste</p>
                  <p className="font-medium text-gray-900">{profile?.poste || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Salaire de base</p>
                  <p className="font-medium text-gray-900">Confidentiel</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Date de fin (si CDD)</p>
                <p className="font-medium text-gray-900">-</p>
              </div>
            </div>
          </div>

          {/* Section Sécurité - Changement de mot de passe */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="text-purple-600" size={24} />
              Sécurité
            </h2>

            {/* Messages de succès/erreur */}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={20} />
                <p className="text-sm text-emerald-800">{passwordSuccess}</p>
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} />
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...registerPassword('current_password')}
                    className="block w-full rounded-lg border-gray-300 p-2.5 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.current_password.message}</p>
                )}
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} />
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...registerPassword('new_password')}
                    className="block w-full rounded-lg border-gray-300 p-2.5 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password.message}</p>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} />
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerPassword('new_password_confirmation')}
                    className="block w-full rounded-lg border-gray-300 p-2.5 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.new_password_confirmation && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password_confirmation.message}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
                >
                  <Lock size={18} />
                  {changePasswordMutation.isPending ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icône Calendar
function CalendarIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
