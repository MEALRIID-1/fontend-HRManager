"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSignature, Search, AlertCircle, Download, Eye, Edit,
  Calendar, ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Badge, Avatar, Button, Input, Select, EmptyState, Skeleton } from "@/components/ui";
import {
  formatDate, STATUT_CONTRAT_LABELS, getStatutContratVariant,
  TYPE_CONTRAT_LABELS, formatCurrency, isExpiringSoon, cn,
} from "@/lib/utils";
import type { Contrat, StatutContrat, TypeContrat } from "@/types";

// ── Mock contrats ─────────────────────────────────────────────────────────────
const MOCK_CONTRATS: Contrat[] = [
  {
    id: "ct1", reference: "CTR-2024-001", employeId: "e1",
    employe: { id: "e1", nom: "Dupont", prenom: "Jean", email: "", telephone: "", genre: "MASCULIN", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "2022-01-15", posteId: "", departementId: "", typeContrat: "CDI", salaireBase: 450000, congesRestants: { annuels: 18, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP001" },
    type: "CDI", statut: "SIGNE", dateDebut: "2022-01-15",
    posteId: "p1", poste: { id: "p1", intitule: "Développeur Senior", code: "P001", departementId: "d1", niveauHierarchique: 3 },
    departementId: "d1",
    salaireBase: 450000,
    avantages: ["Assurance maladie", "Transport", "Prime annuelle"],
    createdAt: "2022-01-10", updatedAt: "2022-01-15",
  },
  {
    id: "ct2", reference: "CTR-2024-002", employeId: "e2",
    employe: { id: "e2", nom: "Martin", prenom: "Marie", email: "", telephone: "", genre: "FEMININ", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "2023-06-01", posteId: "", departementId: "", typeContrat: "CDD", salaireBase: 280000, congesRestants: { annuels: 12, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP002" },
    type: "CDD", statut: "EN_COURS",
    dateDebut: "2023-06-01", dateFin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split("T")[0],
    posteId: "p2", poste: { id: "p2", intitule: "Responsable RH", code: "P002", departementId: "d2", niveauHierarchique: 4 },
    departementId: "d2",
    salaireBase: 280000,
    avantages: ["Assurance maladie"],
    createdAt: "2023-05-20", updatedAt: "2023-06-01",
  },
  {
    id: "ct3", reference: "CTR-2024-003", employeId: "e3",
    employe: { id: "e3", nom: "Bernard", prenom: "Paul", email: "", telephone: "", genre: "MASCULIN", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "ACTIF", dateEmbauche: "2024-01-10", posteId: "", departementId: "", typeContrat: "STAGE", salaireBase: 120000, congesRestants: { annuels: 5, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP003" },
    type: "STAGE", statut: "EN_COURS",
    dateDebut: "2024-01-10", dateFin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().split("T")[0],
    posteId: "p3", poste: { id: "p3", intitule: "Stagiaire Informatique", code: "P003", departementId: "d1", niveauHierarchique: 1 },
    departementId: "d1",
    salaireBase: 120000,
    avantages: ["Transport"],
    createdAt: "2024-01-05", updatedAt: "2024-01-10",
  },
  {
    id: "ct4", reference: "CTR-2023-045", employeId: "e4",
    employe: { id: "e4", nom: "Leroy", prenom: "Sophie", email: "", telephone: "", genre: "FEMININ", dateNaissance: "", nationalite: "", adresse: { rue: "", ville: "", codePostal: "", pays: "" }, statut: "INACTIF", dateEmbauche: "2021-03-01", posteId: "", departementId: "", typeContrat: "CDD", salaireBase: 200000, congesRestants: { annuels: 0, maladie: 0, exceptionnels: 0 }, createdAt: "", updatedAt: "", matricule: "EMP004" },
    type: "CDD", statut: "EXPIRE",
    dateDebut: "2021-03-01", dateFin: "2023-12-31",
    posteId: "p4", poste: { id: "p4", intitule: "Commerciale", code: "P004", departementId: "d3", niveauHierarchique: 2 },
    departementId: "d3",
    salaireBase: 200000,
    avantages: [],
    createdAt: "2021-02-20", updatedAt: "2023-12-31",
  },
];

export default function ContratsPage() {
  const router = useRouter();
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [filtered, setFiltered] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setContrats(MOCK_CONTRATS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let res = contrats;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        (c) =>
          c.reference.toLowerCase().includes(q) ||
          c.employe?.nom.toLowerCase().includes(q) ||
          c.employe?.prenom.toLowerCase().includes(q)
      );
    }
    if (statutFilter) res = res.filter((c) => c.statut === statutFilter);
    if (typeFilter)   res = res.filter((c) => c.type   === typeFilter);
    setFiltered(res);
  }, [contrats, search, statutFilter, typeFilter]);

  const expirantBientot = contrats.filter((c) => c.dateFin && isExpiringSoon(c.dateFin, 30));

  return (
    <DashboardLayout
      title="Contrats"
      subtitle="Gestion des contrats de travail"
      actions={
        <Button icon={<FileSignature size={16} />} onClick={() => router.push("/contrats/nouveau")}>
          Nouveau contrat
        </Button>
      }
    >
      {/* Alert expirant */}
      {expirantBientot.length > 0 && (
        <div className="flex items-start gap-3 mb-5 p-4 rounded-2xl bg-warning-light border border-yellow-200">
          <AlertCircle size={18} className="text-warning-dark mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning-dark">
              {expirantBientot.length} contrat(s) expirant dans les 30 prochains jours
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {expirantBientot.map((c) => `${c.employe?.prenom} ${c.employe?.nom}`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Réf., nom d'employé…"
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              options={Object.entries(STATUT_CONTRAT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Tous les statuts"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              options={Object.entries(TYPE_CONTRAT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Tous types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employé","Référence","Type","Poste","Période","Salaire","Statut",""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <Skeleton className="h-4 w-full max-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState icon={<FileSignature size={24} />} title="Aucun contrat trouvé" />
                    </td>
                  </tr>
                )
                : filtered.map((contrat) => {
                  const expiringSoon = contrat.dateFin && isExpiringSoon(contrat.dateFin, 30);
                  return (
                    <tr key={contrat.id} className={cn(
                      "border-b border-slate-50 transition-colors group",
                      expiringSoon ? "bg-warning-light/30 hover:bg-warning-light/50" : "hover:bg-slate-50/60"
                    )}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar nom={contrat.employe?.nom} prenom={contrat.employe?.prenom} size="sm" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {contrat.employe?.prenom} {contrat.employe?.nom}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {contrat.reference}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="blue" size="sm">{TYPE_CONTRAT_LABELS[contrat.type]}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{contrat.poste?.intitule}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar size={12} />
                          <span>{formatDate(contrat.dateDebut)}</span>
                          {contrat.dateFin && (
                            <>
                              <ArrowRight size={11} className="text-slate-300" />
                              <span className={cn(expiringSoon && "text-warning-dark font-medium")}>
                                {formatDate(contrat.dateFin)}
                              </span>
                              {expiringSoon && <AlertCircle size={12} className="text-warning" />}
                            </>
                          )}
                          {!contrat.dateFin && <span className="text-emerald-600 font-medium">Indéterminé</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {formatCurrency(contrat.salaireBase)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getStatutContratVariant(contrat.statut)} size="sm" dot>
                          {STATUT_CONTRAT_LABELS[contrat.statut]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/contrats/${contrat.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                            <Edit size={15} />
                          </button>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
