"use client";
import React, { useEffect, useState } from "react";

import { UserPlus, Search, Filter, Download, Eye, Edit, Trash2, Mail } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card, Badge, Avatar, Button, Input, Select, Skeleton, EmptyState,
} from "@/components/ui";
import AddEmployeeModal from "@/components/employes/AddEmployeeModal";
import EmployeeDetailsModal from "@/components/employes/EmployeeDetailsModal";
import EmployeeModal from "@/components/employes/AddEmployeeModal";
import { useToastStore } from "@/store/toast.store";
import { employeService } from "@/lib/services";
import {
  cn, formatDate, STATUT_EMPLOYE_LABELS, getStatutEmployeVariant,
  TYPE_CONTRAT_LABELS,
} from "@/lib/utils";
import type { Employe, StatutEmploye, TypeContrat } from "@/types";

// ── Component ──────────────────────────────────────────────────────────────
export default function EmployesPage() {
  const { addToast } = useToastStore();

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [filtered, setFiltered] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [contratFilter, setContratFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // ── États manquants (cause de l'erreur de compilation) ──────────────────
  const [selectedEmployee, setSelectedEmployee] = useState<Employe | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadEmployes = async () => {
      try {
        const response = await employeService.getAll();
        setEmployes(response.data?.data || []);
      } catch (error) {
        console.error("Erreur chargement employés :", error);
        setEmployes([]);
      } finally {
        setLoading(false);
      }
    };
    loadEmployes();
  }, []);

  const handleAddEmployee = async (data: Partial<Employe>) => {
    try {
      const response = await employeService.create(data);
      if (response.success && response.data) {
        setEmployes(prev => [...prev, response.data!]);
        addToast({ type: "success", message: "Employé ajouté avec succès" });
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      addToast({ type: "error", message: "Erreur lors de la création de l'employé" });
    }
  };

  // ── Handler de modification ────────────────────────────────────────────
  const handleEditEmployee = async (data: Partial<Employe>) => {
    if (!editingEmployee) return;
    try {
      const response = await employeService.update(editingEmployee.id, data);
      if (response.success && response.data) {
        setEmployes(prev =>
          prev.map(emp =>
            emp.id === editingEmployee.id ? response.data! : emp
          )
        );
      }
      setShowEditModal(false);
      setEditingEmployee(null);
      addToast({ type: "success", message: "Employé modifié avec succès" });
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      addToast({ type: "error", message: "Erreur lors de la modification" });
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployes(prev => prev.filter(emp => emp.id !== id));
    addToast({ type: "success", message: "Employé supprimé" });
  };

  const handleViewEmployee = (employee: Employe) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleEditEmployeeClick = (employee: Employe) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
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
                          onClick={() => handleViewEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Voir"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEditEmployeeClick(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
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

      {/* Modale d'ajout */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
      />

      {/* Modale de détails */}
      <EmployeeDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
      />

      {/* Modale de modification */}
      <EmployeeModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingEmployee(null); }}
        onSubmit={handleEditEmployee}
        employee={editingEmployee}
      />
    </DashboardLayout>
  );
}