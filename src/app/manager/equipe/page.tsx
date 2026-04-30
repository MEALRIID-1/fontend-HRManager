"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, Filter, ChevronRight, UserCheck, UserX,
  Briefcase, Building2, Eye, AlertCircle, Trash2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Input, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TrashView } from "@/components/shared";
import type { Employe } from "@/types";
import toast from "react-hot-toast";
import { managerService } from "@/lib/services";
import { useAuthStore } from "@/store/auth.store";

interface EmployeAvecPresence extends Employe {
  presentAujourdhui?: boolean;
  contratActif?: {
    type: string;
    dateFin?: string;
  };
}

type TabType = "equipe" | "archives";

export default function ManagerEquipePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("equipe");
  const [employes, setEmployes] = useState<EmployeAvecPresence[]>([]);
  const [filteredEmployes, setFilteredEmployes] = useState<EmployeAvecPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterPresence, setFilterPresence] = useState<string>("all");
  const [corbeilleCount, setCorbeilleCount] = useState(0);

  // Chargement du nombre d'archives
  const loadCorbeilleCount = async () => {
    try {
      // Pour le manager, on compte les employés archivés de son équipe
      // Note: Le manager ne peut pas voir les archives selon les specs, mais on affiche le badge
      setCorbeilleCount(0); // Par défaut 0 pour le manager
    } catch (e) {
      setCorbeilleCount(0);
    }
  };

  // Chargement des employés de l'équipe
  const loadEquipe = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const res = await managerService.getEquipe({
        search: searchQuery,
        per_page: 100,
      });

      if (res.success) {
        const list: EmployeAvecPresence[] = ((res.data as any)?.data ?? []).map((e: any) => ({
          ...e,
          presentAujourdhui: e.statut === "ACTIF",
          contratActif: e.contrat_actif ? { type: e.contrat_actif.type, dateFin: e.contrat_actif.date_fin } : undefined,
        }));
        setEmployes(list);
        setFilteredEmployes(list);
      } else {
        throw new Error((res as any).message || "Erreur chargement équipe");
      }
    } catch (error: any) {
      console.error("Erreur chargement équipe:", error);
      setIsError(true);
      toast.error(error?.message || "Impossible de charger l'équipe");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEquipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrage
  useEffect(() => {
    let filtered = employes;

    // Filtre recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.nom.toLowerCase().includes(query) ||
          e.prenom.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.matricule.toLowerCase().includes(query)
      );
    }

    // Filtre statut
    if (filterStatut !== "all") {
      filtered = filtered.filter((e) => e.statut === filterStatut);
    }

    // Filtre présence
    if (filterPresence !== "all") {
      const present = filterPresence === "present";
      filtered = filtered.filter((e) => e.presentAujourdhui === present);
    }

    setFilteredEmployes(filtered);
  }, [employes, searchQuery, filterStatut, filterPresence]);

  const handleViewEmploye = (id: string) => {
    router.push(`/manager/equipe/${id}`);
  };

  // Chargement des archives (manager ne peut pas restaurer, juste voir)
  const loadArchives = async (): Promise<any[]> => {
    // Le manager ne peut pas voir les employés archivés selon les specs
    // Il doit contacter le RH pour restaurer
    return [];
  };

  // Message informatif pour la corbeille
  const handleRestoreInfo = async () => {
    toast.success("Pour restaurer un employé, contactez votre RH.");
  };

  if (activeTab === "archives") {
    return (
      <DashboardLayout title="Mon Équipe - Corbeille">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-amber-800">Corbeille des employés</p>
                <p className="text-sm text-amber-700 mt-1">
                  Les employés archivés ne sont pas visibles ici. Pour restaurer un employé, veuillez contacter votre RH.
                </p>
              </div>
            </div>
          </div>
          <TrashView
            entityLabel="Employé"
            entityLabelPlural="Employés"
            columns={[
              { key: "employe", header: "Employé", render: (item) => <div className="flex items-center gap-2"><Avatar nom={item.nom} prenom={item.prenom} size="sm" /><span>{item.prenom} {item.nom}</span></div> },
              { key: "departement", header: "Département" },
              { key: "statut", header: "Statut contrat", render: (item) => <Badge variant="gray">{item.typeContrat || "-"}</Badge> },
              { key: "dateArchivage", header: "Date d'archivage", render: (item) => <span>{item.deletedAt ? new Date(item.deletedAt).toLocaleDateString("fr-FR") : "-"}</span> },
            ]}
            fetchArchives={loadArchives}
            restoreItem={handleRestoreInfo}
            onClose={() => setActiveTab("equipe")}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Mon Équipe">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Mon Équipe">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-danger mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
          <Button onClick={loadEquipe}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Mon Équipe"
      subtitle={`${filteredEmployes.length} membre${filteredEmployes.length > 1 ? "s" : ""}`}
    >
      <Card>
        {/* Header avec filtres */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          {/* Rangée 1 : titre + corbeille */}
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary-500" />
              Liste des employés
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("archives")}
                className="text-slate-500 hover:text-amber-600 flex items-center gap-1.5"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Corbeille</span>
                {corbeilleCount > 0 && (
                  <Badge variant="red" size="sm" className="min-w-[18px] h-[18px] text-xs flex items-center justify-center">
                    {corbeilleCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          {/* Rangée 2 : recherche + filtres */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[130px] bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="DEMISSIONNE">Démissionné</option>
            </select>
            <select
              value={filterPresence}
              onChange={(e) => setFilterPresence(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px] bg-white"
            >
              <option value="all">Présence aujourd'hui</option>
              <option value="present">Présents</option>
              <option value="absent">Absents</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Employé
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Département
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Contrat
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Présence
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployes.length > 0 ? (
                filteredEmployes.map((employe) => (
                  <tr
                    key={employe.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nom={employe.nom} prenom={employe.prenom} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {employe.prenom} {employe.nom}
                          </p>
                          <p className="text-xs text-slate-500">{employe.matricule}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700">{employe.email}</div>
                      <div className="text-xs text-slate-500">{employe.telephone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Building2 size={14} className="text-slate-400" />
                        {(employe as any).departement?.nom || 'Non assigné'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-slate-400" />
                        <Badge
                          variant={employe.contratActif?.type === "CDI" ? "green" : "blue"}
                          size="sm"
                        >
                          {employe.contratActif?.type}
                        </Badge>
                        {employe.contratActif?.dateFin && (
                          <span className="text-xs text-slate-400">
                            Fin: {new Date(employe.contratActif.dateFin).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {employe.presentAujourdhui ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-sm text-success">Présent</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-danger" />
                            <span className="text-sm text-danger">Absent</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          employe.statut === "ACTIF"
                            ? "green"
                            : employe.statut === "SUSPENDU"
                            ? "yellow"
                            : "gray"
                        }
                        size="sm"
                      >
                        {employe.statut}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={16} />}
                        onClick={() => handleViewEmploye(employe.id)}
                      >
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500">Aucun employé trouvé</p>
                    {(searchQuery || filterStatut !== "all" || filterPresence !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterStatut("all");
                          setFilterPresence("all");
                        }}
                        className="mt-2"
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
