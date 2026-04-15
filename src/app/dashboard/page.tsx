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
import { cn, formatDate, STATUT_CONGE_LABELS, getStatutCongeVariant, TYPE_CONGE_LABELS } from "@/lib/utils";
import type { StatsDashboard, DemandeConge } from "@/types";

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
    employe: { nom: "Dupont", prenom: "Jean", email: "", telephone: "", genre: "MASCULIN", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 0, congesRestants: { annuels: 18, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP001" },
    type: "ANNUEL", statut: "EN_ATTENTE_N1",
    dateDebut: "2024-07-20", dateFin: "2024-07-25", nombreJours: 6,
    motif: "Vacances d'été", workflow: { niveauActuel: 1, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), updatedAt: "",
  },
  {
    id: "c2", employeId: "e2",
    employe: { nom: "Martin", prenom: "Marie", email: "", telephone: "", genre: "FEMININ", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 0, congesRestants: { annuels: 12, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP002" },
    type: "MALADIE", statut: "APPROUVE_N2",
    dateDebut: "2024-07-15", dateFin: "2024-07-17", nombreJours: 3,
    motif: "Arrêt médical", workflow: { niveauActuel: 2, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), updatedAt: "",
  },
  {
    id: "c3", employeId: "e3",
    employe: { nom: "Bernard", prenom: "Paul", email: "", telephone: "", genre: "MASCULIN", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 0, congesRestants: { annuels: 20, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP003" },
    type: "ANNUEL", statut: "APPROUVE_N3",
    dateDebut: "2024-08-01", dateFin: "2024-08-10", nombreJours: 10,
    motif: "Congés d'été", workflow: { niveauActuel: 3, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), updatedAt: "",
  },
  {
    id: "c4", employeId: "e4",
    employe: { nom: "Leroy", prenom: "Sophie", email: "", telephone: "", genre: "FEMININ", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "", posteId: "", departementId: "", typeContrat: "CDD", salaireBase: 0, congesRestants: { annuels: 5, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP004" },
    type: "EXCEPTIONNEL", statut: "REFUSE_N1",
    dateDebut: "2024-07-18", dateFin: "2024-07-18", nombreJours: 1,
    motif: "Motif personnel", workflow: { niveauActuel: 1, etapes: [] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), updatedAt: "",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

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

        {/* Quick actions + Recent congés */}
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

          {/* Recent congés */}
          <div className="lg:col-span-2">
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
          </div>
        </div>

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
    </DashboardLayout>
  );
}
