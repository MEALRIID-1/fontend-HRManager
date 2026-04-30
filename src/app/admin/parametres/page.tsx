"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Settings,
  Building2,
  Bell,
  Shield,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface ParametresEntreprise {
  nom: string;
  adresse: string;
  siret: string;
  emailContact: string;
  telephone: string;
}

interface ParametresNotifications {
  emailConges: boolean;
  emailContrats: boolean;
  emailPaiement: boolean;
  pushEnabled: boolean;
}

interface ParametresSecurite {
  mfaEnabled: boolean;
  sessionDuration: number;
  passwordMinLength: number;
}

// ─── TABS CONFIG ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "entreprise", label: "Entreprise", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "securite", label: "Sécurité", icon: Shield },
  { id: "donnees", label: "Données", icon: Database },
  { id: "avance", label: "Avancé", icon: Settings },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function ParametresAdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("entreprise");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // États des formulaires
  const [entreprise, setEntreprise] = useState<ParametresEntreprise>({
    nom: "HR Manager",
    adresse: "123 Avenue des Champs-Élysées, 75008 Paris",
    siret: "123 456 789 00012",
    emailContact: "contact@hrmanager.fr",
    telephone: "+33 1 23 45 67 89",
  });

  const [notifications, setNotifications] = useState<ParametresNotifications>({
    emailConges: true,
    emailContrats: true,
    emailPaiement: true,
    pushEnabled: false,
  });

  const [securite, setSecurite] = useState<ParametresSecurite>({
    mfaEnabled: true,
    sessionDuration: 8,
    passwordMinLength: 12,
  });

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    // Simulation API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Paramètres sauvegardés avec succès");
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleReset = () => {
    // Reset logic selon l'onglet actif
    toast.success("Paramètres réinitialisés");
    setHasChanges(false);
  };

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────

  const renderEntrepriseTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nom de l&apos;entreprise
          </label>
          <Input
            value={entreprise.nom}
            onChange={(e) => {
              setEntreprise({ ...entreprise, nom: e.target.value });
              setHasChanges(true);
            }}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">SIRET</label>
          <Input
            value={entreprise.siret}
            onChange={(e) => {
              setEntreprise({ ...entreprise, siret: e.target.value });
              setHasChanges(true);
            }}
            className="w-full"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Adresse</label>
          <Input
            value={entreprise.adresse}
            onChange={(e) => {
              setEntreprise({ ...entreprise, adresse: e.target.value });
              setHasChanges(true);
            }}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email de contact
          </label>
          <Input
            type="email"
            value={entreprise.emailContact}
            onChange={(e) => {
              setEntreprise({ ...entreprise, emailContact: e.target.value });
              setHasChanges(true);
            }}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <Input
            type="tel"
            value={entreprise.telephone}
            onChange={(e) => {
              setEntreprise({ ...entreprise, telephone: e.target.value });
              setHasChanges(true);
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Notifications par email
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "emailConges",
              label: "Demandes de congés",
              desc: "Recevoir une notification lors d'une nouvelle demande",
            },
            {
              key: "emailContrats",
              label: "Contrats expirants",
              desc: "Alertes pour les contrats qui expirent bientôt",
            },
            {
              key: "emailPaiement",
              label: "Fiches de paie",
              desc: "Notification lors de la génération des fiches",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={notifications[item.key as keyof ParametresNotifications]}
                onChange={(e) => {
                  setNotifications({
                    ...notifications,
                    [item.key]: e.target.checked,
                  });
                  setHasChanges(true);
                }}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Notifications push
        </h3>
        <label className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={notifications.pushEnabled}
            onChange={(e) => {
              setNotifications({
                ...notifications,
                pushEnabled: e.target.checked,
              });
              setHasChanges(true);
            }}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-gray-700">Activer les notifications push</span>
        </label>
      </Card>
    </div>
  );

  const renderSecuriteTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Authentification
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={securite.mfaEnabled}
              onChange={(e) => {
                setSecurite({ ...securite, mfaEnabled: e.target.checked });
                setHasChanges(true);
              }}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-800">
                Authentification multi-facteurs (MFA)
              </span>
              <p className="text-sm text-gray-500">
                Obligatoire pour tous les utilisateurs
              </p>
            </div>
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Politique de mots de passe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Longueur minimale
            </label>
            <Input
              type="number"
              min={8}
              max={32}
              value={securite.passwordMinLength}
              onChange={(e) => {
                setSecurite({
                  ...securite,
                  passwordMinLength: parseInt(e.target.value),
                });
                setHasChanges(true);
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Durée de session (heures)
            </label>
            <Input
              type="number"
              min={1}
              max={24}
              value={securite.sessionDuration}
              onChange={(e) => {
                setSecurite({
                  ...securite,
                  sessionDuration: parseInt(e.target.value),
                });
                setHasChanges(true);
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDonneesTab = () => (
    <div className="space-y-6">
      <Card className="p-6 border-amber-200 bg-amber-50/30">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Export des données
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Exportez toutes les données de l&apos;application pour backup.
            </p>
            <Button variant="outline" className="mt-4" icon={<Database className="w-4 h-4" />}>
              Exporter toutes les données
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-red-200 bg-red-50/30">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Zone de danger
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Ces actions sont irréversibles. Soyez prudent.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50">
                Purger les archives
              </Button>
              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50">
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAvanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Configuration système
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Mode maintenance</p>
              <p className="text-sm text-gray-500">
                Désactiver l&apos;accès pour tous sauf les admins
              </p>
            </div>
            <Badge variant="yellow">Désactivé</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Logs détaillés</p>
              <p className="text-sm text-gray-500">
                Activer le logging avancé pour debug
              </p>
            </div>
            <Badge variant="green">Actif</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Cache API</p>
              <p className="text-sm text-gray-500">
                Durée: 5 minutes
              </p>
            </div>
            <Button size="sm" variant="secondary">
              Vider le cache
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "entreprise":
        return renderEntrepriseTab();
      case "notifications":
        return renderNotificationsTab();
      case "securite":
        return renderSecuriteTab();
      case "donnees":
        return renderDonneesTab();
      case "avance":
        return renderAvanceTab();
      default:
        return null;
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      title="Paramètres"
      subtitle="Configuration de l&apos;application"
      actions={
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="yellow" dot>
              Modifications non sauvegardées
            </Badge>
          )}
          <Button
            variant="secondary"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleReset}
          >
            Réinitialiser
          </Button>
          <Button
            variant="primary"
            icon={isSaving ? undefined : <Save className="w-4 h-4" />}
            loading={isSaving}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation tabs */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && "text-white")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <Card className="min-h-[400px]">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const tab = TABS.find((t) => t.id === activeTab);
                const Icon = tab?.icon || Settings;
                return (
                  <>
                    <Icon className="w-5 h-5 text-blue-600" />
                    {tab?.label}
                  </>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <div className="p-6">{renderTabContent()}</div>
        </Card>

        {/* Footer info */}
        <div className="flex items-center justify-between text-sm text-gray-500 px-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Dernière sauvegarde: il y a 2 heures</span>
          </div>
          <span>Version 2.4.1</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
