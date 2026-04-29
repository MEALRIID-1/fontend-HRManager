"use client";

import { useEffect, useState, useRef } from "react";
import { User, Mail, Building2, Calendar, Key, Camera, Eye, EyeOff, Lock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Input, Badge, Avatar } from "@/components/ui";
import { cn, formatDate, ROLE_LABELS, initials } from "@/lib/utils";
import { employeeService } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import type { Employe } from "@/types";
import toast from "react-hot-toast";

// Types pour les modals
interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeProfilPage() {
  const { user: authUser } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [employe, setEmploye] = useState<Employe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chargement du profil
  useEffect(() => {
    const loadProfil = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const response = await employeeService.getMe();
        if (response.success) {
          setEmploye(response.data);
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
        setIsError(true);
        toast.error("Impossible de charger votre profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfil();
  }, []);

  // Upload photo avec preview immédiate + rollback
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2MB");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format accepté : JPEG, PNG, WebP");
      return;
    }

    // Preview immédiate avant upload
    const localUrl = URL.createObjectURL(file);
    const previousAvatar = employe?.avatar || authUser?.avatar;
    setEmploye(prev => prev ? { ...prev, avatar: localUrl } : prev);
    updateUser({ avatar: localUrl });

    try {
      setIsUploading(true);
      const response = await employeeService.uploadPhoto(file);

      if (response.success) {
        const finalUrl = response.data.photo_url;
        // Remplacer URL locale par URL API
        setEmploye(prev => prev ? { ...prev, avatar: finalUrl } : prev);
        updateUser({ avatar: finalUrl });
        toast.success("Photo de profil mise à jour");
        URL.revokeObjectURL(localUrl);
      } else {
        throw new Error((response as any).message || "Échec upload");
      }
    } catch (error: any) {
      // Rollback vers l'ancienne photo
      setEmploye(prev => prev ? { ...prev, avatar: previousAvatar } : prev);
      updateUser({ avatar: previousAvatar });
      URL.revokeObjectURL(localUrl);
      toast.error(error?.response?.data?.message || error?.message || "Échec de l'upload de la photo");
    } finally {
      setIsUploading(false);
      // Reset input pour permettre re-sélection du même fichier
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Masquer l'IBAN (format: FR76 **** **** **** **** **** 123)
  const maskIBAN = (iban?: string) => {
    if (!iban || iban.length < 8) return "Non renseigné";
    return iban.slice(0, 4) + " **** **** **** **** **** " + iban.slice(-3);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mon Profil">
        <div className="max-w-3xl mx-auto">
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Mon Profil">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Erreur de chargement
          </h3>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mon Profil" subtitle="Gérez vos informations personnelles">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Photo de profil */}
        <Card>
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar 
                  nom={employe?.nom} 
                  prenom={employe?.prenom} 
                  src={employe?.avatar || authUser?.avatar}
                  size="xl" 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "absolute -bottom-2 -right-2 p-2 rounded-full",
                    "bg-primary-500 text-white hover:bg-primary-600",
                    "transition-colors shadow-lg",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Formats acceptés : JPEG, PNG, WebP
                </p>
                <p className="text-sm text-slate-500">
                  Taille maximale : 2MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Modifier la photo
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm text-slate-500">Nom</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <User size={18} className="text-slate-400" />
                  <span className="font-medium">{employe?.nom}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-500">Prénom</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <User size={18} className="text-slate-400" />
                  <span className="font-medium">{employe?.prenom}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-500">Email</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <Mail size={18} className="text-slate-400" />
                  <span className="font-medium">{employe?.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-500">Département</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <Building2 size={18} className="text-slate-400" />
                  <span className="font-medium">{employe?.departement?.nom || "Non assigné"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-500">Date d'embauche</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <Calendar size={18} className="text-slate-400" />
                  <span className="font-medium">
                    {employe?.dateEmbauche ? formatDate(employe.dateEmbauche) : "Non renseigné"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-500">Rôle</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <Badge variant="blue" size="sm">
                    {ROLE_LABELS[authUser?.role || "EMPLOYE"]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Informations bancaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations bancaires</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="space-y-1">
              <label className="text-sm text-slate-500">IBAN</label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl font-mono text-sm">
                <Lock size={18} className="text-slate-400" />
                <span>{maskIBAN(employe?.rib)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Pour modifier vos coordonnées bancaires, contactez la RH.
              </p>
            </div>
          </div>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Key size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">Mot de passe</p>
                  <p className="text-sm text-slate-500">Dernière modification il y a 3 mois</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
              >
                Changer
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal changement mot de passe */}
      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </DashboardLayout>
  );
}

// Modal changement mot de passe
function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const [formData, setFormData] = useState({
    mot_de_passe_actuel: "",
    nouveau_mot_de_passe: "",
    confirmation: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    actuel: false,
    nouveau: false,
    confirmation: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mot_de_passe_actuel) {
      newErrors.mot_de_passe_actuel = "Mot de passe actuel requis";
    }

    if (!formData.nouveau_mot_de_passe) {
      newErrors.nouveau_mot_de_passe = "Nouveau mot de passe requis";
    } else if (formData.nouveau_mot_de_passe.length < 8) {
      newErrors.nouveau_mot_de_passe = "Minimum 8 caractères";
    } else if (!/[A-Z]/.test(formData.nouveau_mot_de_passe)) {
      newErrors.nouveau_mot_de_passe = "Doit contenir une majuscule";
    } else if (!/[0-9]/.test(formData.nouveau_mot_de_passe)) {
      newErrors.nouveau_mot_de_passe = "Doit contenir un chiffre";
    }

    if (formData.nouveau_mot_de_passe !== formData.confirmation) {
      newErrors.confirmation = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await employeeService.changePassword(formData);
      
      if (response.success) {
        toast.success("Mot de passe modifié avec succès");
        onClose();
        setFormData({ mot_de_passe_actuel: "", nouveau_mot_de_passe: "", confirmation: "" });
      } else {
        toast.error(response.message || "Échec de la modification");
      }
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      toast.error("Échec de la modification du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Changer mon mot de passe</h2>
          <p className="text-sm text-slate-500 mt-1">
            Min. 8 caractères, 1 majuscule, 1 chiffre
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <Input
              label="Mot de passe actuel"
              type={showPasswords.actuel ? "text" : "password"}
              value={formData.mot_de_passe_actuel}
              onChange={(e) => setFormData({ ...formData, mot_de_passe_actuel: e.target.value })}
              error={errors.mot_de_passe_actuel}
              icon={<Lock size={18} />}
              iconRight={
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, actuel: !showPasswords.actuel })}>
                  {showPasswords.actuel ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <div className="relative">
            <Input
              label="Nouveau mot de passe"
              type={showPasswords.nouveau ? "text" : "password"}
              value={formData.nouveau_mot_de_passe}
              onChange={(e) => setFormData({ ...formData, nouveau_mot_de_passe: e.target.value })}
              error={errors.nouveau_mot_de_passe}
              icon={<Lock size={18} />}
              iconRight={
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, nouveau: !showPasswords.nouveau })}>
                  {showPasswords.nouveau ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <div className="relative">
            <Input
              label="Confirmation"
              type={showPasswords.confirmation ? "text" : "password"}
              value={formData.confirmation}
              onChange={(e) => setFormData({ ...formData, confirmation: e.target.value })}
              error={errors.confirmation}
              icon={<Lock size={18} />}
              iconRight={
                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirmation: !showPasswords.confirmation })}>
                  {showPasswords.confirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Modifier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
