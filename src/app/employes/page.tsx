"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Search, Filter, Download, MoreVertical,
  Mail, Phone, Edit, Trash2, Eye,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card, Badge, Avatar, Button, Input, Select, Skeleton, EmptyState,
} from "@/components/ui";
import AddEmployeeModal from "@/components/employes/AddEmployeeModal";
import {
  cn, formatDate, STATUT_EMPLOYE_LABELS, getStatutEmployeVariant,
  TYPE_CONTRAT_LABELS,
} from "@/lib/utils";
import type { Employe, StatutEmploye, TypeContrat } from "@/types";

// ── Mock employees ────────────────────────────────────────────────────────────
const MOCK_EMPLOYES: Employe[] = Array.from({ length: 12 }, (_, i) => ({
  id: `e${i + 1}`,
  matricule: `EMP${String(i + 1).padStart(3, "0")}`,
  nom: ["Dupont","Martin","Bernard","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","Durand","Petit","Robert"][i],
  prenom: ["Jean","Marie","Paul","Sophie","Alice","Lucas","Emma","Thomas","Léa","Nicolas","Julie","Antoine"][i],
  email: `employe${i + 1}@rh.cm`,
  emailPro: `employe${i + 1}@entreprise.cm`,
  telephone: `+237 6${(i + 1).toString().padStart(2, "0")}${(500000 + i * 80000).toString().padStart(7, "0")}`,
  genre: i % 3 === 0 ? "FEMININ" : "MASCULIN",
  dateNaissance: "1990-01-01",
  nationalite: "Camerounaise",
  adresse: { rue: "Rue principale", ville: "Yaoundé", codePostal: "BP 000", pays: "Cameroun" },
  statut: (["ACTIF","ACTIF","ACTIF","INACTIF","ACTIF","ACTIF","SUSPENDU","ACTIF","ACTIF","ACTIF","ACTIF","ACTIF"] as StatutEmploye[])[i],
  dateEmbauche: `202${Math.floor(i / 4)}-${String((i % 12) + 1).padStart(2, "0")}-15`,
  posteId: "p1",
  poste: { id: "p1", intitule: ["Développeur","RH","Comptable","Commercial","Logisticien","Directeur","Designer","Analyste","Chef de projet","Ingénieur","Juriste","Assistant"][i], code: "P001", departementId: "d1", niveauHierarchique: 2 },
  departementId: "d1",
  departement: { id: "d1", nom: ["Informatique","Ressources Humaines","Finance","Commercial","Logistique","Direction","Marketing","Production"][i % 8], code: "D001", responsableId: "e1", nombreEmployes: 12 + i, createdAt: "" },
  typeContrat: (["CDI","CDD","CDI","STAGE","CDI","CDI","CDI","CDD","CDI","CDI","APPRENTISSAGE","CDI"] as TypeContrat[])[i],
  salaireBase: 200000 + i * 50000,
  congesRestants: { annuels: 18 - i % 5, maladie: 5, exceptionnels: 2 },
  createdAt: "2024-01-01",
  updatedAt: "2024-06-01",
}));

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmployesPage() {
  const router = useRouter();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [filtered, setFiltered] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [contratFilter, setContratFilter] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setEmployes(MOCK_EMPLOYES); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleAddEmployee = async (data: Partial<Employe>) => {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEmployee: Employe = {
        ...data,
        id: `e${employes.length + 1}`,
        matricule: `EMP${String(employes.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Employe;
      
      setEmployes([...employes, newEmployee]);
      console.log("Employé créé avec succès:", newEmployee);
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
    }
  };

  useEffect(() => {
    let res = employes;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        (e) =>
          e.nom.toLowerCase().includes(q) ||
          e.prenom.toLowerCase().includes(q) ||
          e.matricule.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    if (statutFilter) res = res.filter((e) => e.statut === statutFilter);
    if (contratFilter) res = res.filter((e) => e.typeContrat === contratFilter);
    setFiltered(res);
  }, [employes, search, statutFilter, contratFilter]);

  return (
    <DashboardLayout
      title="Employés"
      subtitle={`${employes.length} employé(s) au total`}
      actions={
        <Button icon={<UserPlus size={16} />} onClick={() => setShowAddModal(true)}>
          Nouvel employé
        </Button>
      }
    >
      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher par nom, matricule…"
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              options={Object.entries(STATUT_EMPLOYE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Tous les statuts"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              options={Object.entries(TYPE_CONTRAT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Tous contrats"
              value={contratFilter}
              onChange={(e) => setContratFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" icon={<Filter size={14} />}>Filtrer</Button>
          <Button variant="outline" icon={<Download size={14} />}>Exporter</Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employé","Matricule","Poste","Département","Contrat","Statut","Embauché le",""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={<Search size={24} />}
                        title="Aucun employé trouvé"
                        description="Essayez de modifier vos critères de recherche"
                      />
                    </td>
                  </tr>
                )
                : filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar nom={emp.nom} prenom={emp.prenom} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">{emp.prenom} {emp.nom}</p>
                          <p className="text-xs text-muted flex items-center gap-1">
                            <Mail size={11} />{emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {emp.matricule}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{emp.poste?.intitule}</td>
                    <td className="px-5 py-3.5 text-slate-600">{emp.departement?.nom}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="blue" size="sm">{TYPE_CONTRAT_LABELS[emp.typeContrat]}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={getStatutEmployeVariant(emp.statut)} size="sm" dot>
                        {STATUT_EMPLOYE_LABELS[emp.statut]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(emp.dateEmbauche)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/employes/${emp.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Voir"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => router.push(`/employes/${emp.id}/modifier`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger-light transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-muted">
              Affichage de <span className="font-medium text-slate-700">{filtered.length}</span> employé(s)
            </p>
            <div className="flex gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                    page === 1
                      ? "bg-primary-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modale d'ajout d'employé */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
      />
    </DashboardLayout>
  );
}
