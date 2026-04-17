"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  UserPlus, CalendarPlus, FileSignature, Download,
  ChevronRight, Clock, CheckCircle, XCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardStats, QuickAction } from "@/components/dashboard/StatsCards";
import { Card, CardHeader, CardTitle, Badge, Avatar, Button } from "@/components/ui";
import { cn, formatDate, STATUT_CONGE_LABELS, getStatutCongeVariant, TYPE_CONGE_LABELS, formatDateTime } from "@/lib/utils";
import type { StatsDashboard, DemandeConge } from "@/types";
import { X } from "lucide-react";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_STATS: StatsDashboard = {
  totalEmployes: 148,
  emploiesActifs: 141,
  nouveauxCeMois: 5,
  departements: 8,
  congesEnAttente: 12,
  congesApprouves: 34,
  contratExpirantBientot: 3,
  tauxPresence: 94,
};

const CONGES_MENSUEL = [
  { mois: "Jan", annuel: 8, maladie: 3 },
  { mois: "Fév", annuel: 5, maladie: 2 },
  { mois: "Mar", annuel: 12, maladie: 5 },
  { mois: "Avr", annuel: 7, maladie: 4 },
  { mois: "Mai", annuel: 15, maladie: 2 },
  { mois: "Jun", annuel: 20, maladie: 1 },
];

const REPARTITION_DEPT = [
  { name: "Informatique", value: 32, color: "#3b82f6" },
  { name: "RH",           value: 12, color: "#10b981" },
  { name: "Finance",      value: 18, color: "#f59e0b" },
  { name: "Commercial",   value: 28, color: "#8b5cf6" },
  { name: "Logistique",   value: 22, color: "#06b6d4" },
  { name: "Direction",    value: 8,  color: "#ec4899" },
];

const RECENT_CONGES: DemandeConge[] = [
  {
    id: "c1", employeId: "e1",
    employe: { id: "e1", nom: "Dupont", prenom: "Jean", email: "", telephone: "", genre: "MASCULIN", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 0, congesRestants: { annuels: 18, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP001" },
    type: "ANNUEL", statut: "EN_ATTENTE_N1",
    dateDebut: "2024-07-20", dateFin: "2024-07-25", nombreJours: 6,
    motif: "Vacances d'été", workflow: { niveauActuel: 1, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), updatedAt: "",
  },
  {
    id: "c2", employeId: "e2",
    employe: { id: "e2", nom: "Martin", prenom: "Marie", email: "", telephone: "", genre: "FEMININ", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 0, congesRestants: { annuels: 12, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP002" },
    type: "MALADIE", statut: "APPROUVE_N2",
    dateDebut: "2024-07-15", dateFin: "2024-07-17", nombreJours: 3,
    motif: "Arrêt médical", workflow: { niveauActuel: 2, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), updatedAt: "",
  },
  {
    id: "c3", employeId: "e3",
    employe: { id: "e3", nom: "Bernard", prenom: "Paul", email: "", telephone: "", genre: "MASCULIN", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 0, congesRestants: { annuels: 20, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP003" },
    type: "ANNUEL", statut: "APPROUVE_N3",
    dateDebut: "2024-08-01", dateFin: "2024-08-10", nombreJours: 10,
    motif: "Congés d'été", workflow: { niveauActuel: 3, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), updatedAt: "",
  },
  {
    id: "c4", employeId: "e4",
    employe: { id: "e4", nom: "Leroy", prenom: "Sophie", email: "", telephone: "", genre: "FEMININ", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDD", salaireBase: 0, congesRestants: { annuels: 5, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP004" },
    type: "EXCEPTIONNEL", statut: "REFUSE_N1",
    dateDebut: "2024-07-18", dateFin: "2024-07-18", nombreJours: 1,
    motif: "Motif personnel", workflow: { niveauActuel: 1, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), updatedAt: "",
  },
];

// ── Activity Log Types & Mock Data ────────────────────────────────────────
interface ActivityLog {
  id: string;
  user: { nom: string; prenom: string };
  action: string;
  module: string;
  timestamp: string;
  details: string;
  icon?: React.ReactNode;
}

const ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act1",
    user: { nom: "Martin", prenom: "Admin" },
    action: "Approbation de congé",
    module: "Congés",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    details: "Congé annuel de Dupont Jean approuvé pour 2024-07-20 à 2024-07-25",
    icon: "✓",
  },
  {
    id: "act2",
    user: { nom: "Dupont", prenom: "Jean" },
    action: "Création de demande",
    module: "Congés",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    details: "Nouvelle demande de congé maladie créée - 3 jours",
    icon: "📋",
  },
  {
    id: "act3",
    user: { nom: "RH", prenom: "Manager" },
    action: "Création de contrat",
    module: "Contrats",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    details: "Nouveau contrat CDI créé pour Leroy Sophie - Poste: Commercial",
    icon: "📄",
  },
  {
    id: "act4",
    user: { nom: "Bernard", prenom: "Admin" },
    action: "Modification employé",
    module: "Employés",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    details: "Informations de Martin Marie mises à jour - Département: RH",
    icon: "✏️",
  },
  {
    id: "act5",
    user: { nom: "Finance", prenom: "Manager" },
    action: "Génération rapport",
    module: "Rapports",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    details: "Rapport mensuel de paie généré pour juillet 2024",
    icon: "📊",
  },
  {
    id: "act6",
    user: { nom: "Leroy", prenom: "Sophie" },
    action: "Refus de congé",
    module: "Congés",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    details: "Demande de congé exceptionnel refusée - Motif: Effectif insuffisant",
    icon: "✗",
  },
  {
    id: "act7",
    user: { nom: "Direction", prenom: "Manager" },
    action: "Approbation contrat",
    module: "Contrats",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    details: "Contrat CDD de Bernard Paul approuvé - Fin: 2024-12-31",
    icon: "✓",
  },
  {
    id: "act8",
    user: { nom: "Admin", prenom: "System" },
    action: "Archivage employé",
    module: "Employés",
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    details: "Profil de Leroy Sophie archivé - Raison: Départ de l'entreprise",
    icon: "📦",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout
      title="Tableau de bord"
      subtitle="Vue d'ensemble des ressources humaines"
    >
      <div className="space-y-6">
        {/* Stats */}
        <DashboardStats stats={stats ?? undefined} loading={loading} />

        {/* Quick actions + Activity History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Actions rapides
            </h2>
            <QuickAction
              label="Ajouter un employé"
              description="Créer un nouveau dossier"
              icon={<UserPlus size={22} className="text-primary-600" />}
              color="bg-primary-50"
              onClick={() => router.push("/employes/nouveau")}
            />
            <QuickAction
              label="Nouvelle demande de congé"
              description="Soumettre pour validation"
              icon={<CalendarPlus size={22} className="text-emerald-600" />}
              color="bg-emerald-50"
              onClick={() => router.push("/conges/nouveau")}
            />
            <QuickAction
              label="Nouveau contrat"
              description="Générer un contrat de travail"
              icon={<FileSignature size={22} className="text-amber-600" />}
              color="bg-amber-50"
              onClick={() => router.push("/contrats/nouveau")}
            />
            <QuickAction
              label="Exporter un rapport"
              description="PDF, Excel, CSV"
              icon={<Download size={22} className="text-indigo-600" />}
              color="bg-indigo-50"
              onClick={() => router.push("/rapports")}
            />
          </div>

          {/* Activity History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Historique des activités</CardTitle>
              </CardHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ACTIVITY_LOGS.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium flex-shrink-0 text-slate-600">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <p className="text-sm font-medium text-slate-800">
                            {activity.user.prenom} {activity.user.nom}
                          </p>
                          <span className="text-xs text-muted">•</span>
                          <p className="text-sm text-muted">{activity.action}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="gray"
                            size="sm"
                            className="bg-slate-100 text-slate-700 border-0"
                          >
                            {activity.module}
                          </Badge>
                          <p className="text-xs text-muted">
                            {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                        <p className="text-xs text-muted mt-1 line-clamp-1">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActivityModal(true)}
                  className="text-primary-600 hover:bg-primary-50"
                >
                  Voir plus →
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent congés */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de congés récentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              iconRight={<ChevronRight size={14} />}
              onClick={() => router.push("/conges")}
            >
              Voir tout
            </Button>
          </CardHeader>
          <div className="space-y-3">
            {RECENT_CONGES.map((conge) => (
              <div
                key={conge.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/conges/${conge.id}`)}
              >
                <Avatar nom={conge.employe?.nom} prenom={conge.employe?.prenom} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {conge.employe?.prenom} {conge.employe?.nom}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {TYPE_CONGE_LABELS[conge.type]} · {conge.nombreJours} jour(s) ·{" "}
                    {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {conge.statut.includes("APPROUVE") && <CheckCircle size={14} className="text-emerald-500" />}
                  {conge.statut.includes("REFUSE")   && <XCircle    size={14} className="text-red-400" />}
                  {conge.statut.includes("EN_ATTENTE") && <Clock    size={14} className="text-amber-500" />}
                  <Badge variant={getStatutCongeVariant(conge.statut)} size="sm">
                    {STATUT_CONGE_LABELS[conge.statut]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bar chart congés */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Évolution des congés (6 mois)</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CONGES_MENSUEL} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  cursor={{ fill: "#f8faff" }}
                />
                <Bar dataKey="annuel"  name="Annuels" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="maladie" name="Maladie" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary-500 flex-shrink-0" /> Annuels
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 flex-shrink-0" /> Maladie
              </span>
            </div>
          </Card>

          {/* Pie chart répartition */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Répartition par département</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={REPARTITION_DEPT}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {REPARTITION_DEPT.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {REPARTITION_DEPT.map((dept) => (
                <div key={dept.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                  <span className="text-xs text-slate-500 truncate">{dept.name}</span>
                  <span className="text-xs font-medium text-slate-700 ml-auto">{dept.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Historique complet des activités</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-3" style={{ maxHeight: "calc(90vh - 80px)" }}>
              {ACTIVITY_LOGS.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium flex-shrink-0 text-slate-600">
                      {activity.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-slate-800">
                          {activity.user.prenom} {activity.user.nom}
                        </p>
                        <span className="text-sm text-muted">•</span>
                        <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Badge
                          variant="blue"
                          size="sm"
                          className="bg-blue-100 text-blue-700 border-blue-200"
                        >
                          {activity.module}
                        </Badge>
                        <p className="text-sm text-muted">
                          {formatDateTime(activity.timestamp)}
                        </p>
                      </div>

                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700">
                          <strong>Détails :</strong> {activity.details}
                        </p>
                      </div>
                    </div>

                    {/* Index */}
                    <div className="text-xs text-muted opacity-50 flex-shrink-0">
                      #{idx + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setShowActivityModal(false)}
              >
                Fermer
              </Button>
              <Button
                className="bg-primary-600 hover:bg-primary-700 text-white"
                onClick={() => router.push("/rapports")}
              >
                Exporter le rapport
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
