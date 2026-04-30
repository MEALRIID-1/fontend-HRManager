"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSignature, Search, AlertCircle, Download, Eye, Edit,
  Calendar, ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, Badge, Avatar, Button, Input, Select, EmptyState, Skeleton } from "@/components/ui";
import ContractPreviewModal from "@/components/contrats/ContractPreviewModal";
import ContractFormModal from "@/components/contrats/ContractFormModal";
import { employeService } from "@/lib/services";
import {
  formatDate, STATUT_CONTRAT_LABELS, getStatutContratVariant,
  TYPE_CONTRAT_LABELS, formatCurrency, isExpiringSoon, cn,
} from "@/lib/utils";
import type { Contrat, StatutContrat, TypeContrat, Employe } from "@/types";

import { contractService } from "@/lib/services";

export default function ContratsPage() {
  const router = useRouter();
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [filtered, setFiltered] = useState<Contrat[]>([]);
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contrat | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contratsRes, employeesRes] = await Promise.all([
          contractService.getAll(),
          employeService.getAll()
        ]);
        setContrats(contratsRes.data?.data || []);
        setEmployees(employeesRes.data?.data || []);
      } catch (error) {
        console.error("Erreur chargement données :", error);
        setContrats([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setFormMode("create");
    setSelectedContract(null);
    setShowFormModal(true);
  };

  const handleViewContract = (contrat: Contrat) => {
    setSelectedContract(contrat);
    setShowPreviewModal(true);
  };

  const handleEditContract = (contrat: Contrat) => {
    setSelectedContract(contrat);
    setFormMode("edit");
    setShowFormModal(true);
  };

  const handleCreateContract = async (data: Partial<Contrat>) => {
    try {
      const response = await contractService.create(data);
      if (response.success && response.data) {
        setContrats([...contrats, response.data]);
      }
    } catch (error) {
      console.error("Erreur création contrat :", error);
    }
  };

  const handleUpdateContract = async (data: Partial<Contrat>) => {
    if (!selectedContract) return;
    try {
      const response = await contractService.update(selectedContract.id, data);
      if (response.success && response.data) {
        setContrats(contrats.map((item) => (item.id === selectedContract.id ? response.data! : item)));
      }
    } catch (error) {
      console.error("Erreur mise à jour contrat :", error);
    }
    setSelectedContract(null);
  };

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
        <Button icon={<FileSignature size={16} />} onClick={handleOpenCreateModal}>
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
                            onClick={() => handleViewContract(contrat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEditContract(contrat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
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

      <ContractFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={formMode === "create" ? handleCreateContract : handleUpdateContract}
        contrat={formMode === "edit" ? selectedContract : null}
      />

      <ContractPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        contrat={selectedContract}
      />
    </DashboardLayout>
  );
}
