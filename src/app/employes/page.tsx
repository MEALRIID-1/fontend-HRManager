"use client";
import React, { useEffect, useState } from "react";

import { UserPlus, Download } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui";
import AddEmployeeModal from "@/components/employes/AddEmployeeModal";
import ViewEmployeeModal from "@/components/employes/ViewEmployeeModal";
import EditEmployeeModal from "@/components/employes/EditEmployeeModal";
import DeleteEmployeeModal from "@/components/employes/DeleteEmployeeModal";
import { EmployeesTable } from "@/components/employes/EmployeesTable";
import { ToastsUI } from "@/components/employes/ToastsUI";
import { STATUT_EMPLOYE_LABELS, TYPE_CONTRAT_LABELS } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { useToastStore } from "@/store/toast.store";
import "@/styles/employees-liquid-glass.css";
import "@/styles/liquid-glass.css";
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
  
  const { openEmployeeModal } = useUIStore();
  const { addToast } = useToastStore();

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [filtered, setFiltered] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [contratFilter, setContratFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employe | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setEmployes(MOCK_EMPLOYES); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleAddEmployee = async (data: Partial<Employe>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEmployee: Employe = {
        ...data,
        id: `e${employes.length + 1}`,
        matricule: `EMP${String(employes.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Employe;
      setEmployes([...employes, newEmployee]);
      addToast("add");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  // ── Handlers for employee modals ────────────────────────────────────────────
  const handleViewEmployee = (emp: Employe) => {
    setSelectedEmployee(emp);
    openEmployeeModal("view", emp.id);
    addToast("view");
  };

  const handleEditEmployee = (emp: Employe) => {
    setSelectedEmployee(emp);
    openEmployeeModal("edit", emp.id);
  };

  const handleDeleteEmployee = (emp: Employe) => {
    setSelectedEmployee(emp);
    openEmployeeModal("delete", emp.id);
  };

  const handleEditSubmit = async (data: Partial<Employe>) => {
    if (!selectedEmployee) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedEmployes = employes.map(emp =>
        emp.id === selectedEmployee.id
          ? { ...emp, ...data, updatedAt: new Date().toISOString() }
          : emp
      );
      setEmployes(updatedEmployes);
      addToast("edit");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      addToast("error");
    }
  };

  const handleConfirmDelete = async (employeeId: string) => {
    try {
      setDeletingId(employeeId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedEmployes = employes.filter(emp => emp.id !== employeeId);
      setEmployes(updatedEmployes);
      setDeletingId(null);
      addToast("delete");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeletingId(null);
      addToast("error");
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
    <>
      {/* Aurora Background */}
      <div className="aurora-background">
        <div className="blob-1 animate-aurora-blob-1" />
        <div className="blob-2 animate-aurora-blob-2" />
        <div className="blob-3 animate-aurora-blob-3" />
        <div className="blob-4 animate-aurora-blob-4" />
      </div>

      {/* Main Content */}
      <DashboardLayout
        title="Employés"
        subtitle={`${employes.length} employé(s) enregistrés`}
        actions={
          <Button icon={<UserPlus size={16} />} onClick={() => setShowAddModal(true)}>
            Nouvel employé
          </Button>
        }
      >
        {/* Search & Filters */}
        <div className="glass-container p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="uppercase-label text-gray-400 mb-2 block">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, matricule, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                }}
                className="glass-input"
              />
            </div>
            <div className="w-48">
              <label className="uppercase-label text-gray-400 mb-2 block">Statut</label>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                }}
                className="glass-input"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUT_EMPLOYE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="uppercase-label text-gray-400 mb-2 block">Contrat</label>
              <select
                value={contratFilter}
                onChange={(e) => setContratFilter(e.target.value)}
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                }}
                className="glass-input"
              >
                <option value="">Tous les contrats</option>
                {Object.entries(TYPE_CONTRAT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" icon={<Download size={14} />}>Exporter</Button>
          </div>
        </div>

        {/* Employees Table */}
        {loading ? (
          <div className="glass-container p-12">
            <div className="animate-pulse text-center text-gray-400">
              Chargement des employés...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-container p-12">
            <div className="text-center text-gray-400">
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
              <p>Aucun employé trouvé</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>Essayez de modifier vos critères de recherche</p>
            </div>
          </div>
        ) : (
          <EmployeesTable
            employees={filtered}
            onView={handleViewEmployee}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            deletingId={deletingId}
          />
        )}
      </DashboardLayout>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
      />
      <ViewEmployeeModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      <EditEmployeeModal employee={selectedEmployee} onSubmit={handleEditSubmit} onClose={() => setSelectedEmployee(null)} />
      <DeleteEmployeeModal employee={selectedEmployee} onConfirm={handleConfirmDelete} />

      {/* Toasts */}
      <ToastsUI />
    </>
  );
}
