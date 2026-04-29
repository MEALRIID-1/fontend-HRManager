"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Eye, Trash2, AlertCircle, RefreshCw, ArrowLeft,
  Calendar, Filter, Briefcase, Clock, X, User
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Input, Avatar } from "@/components/ui";
import { TrashView } from "@/components/shared";
import { cn, formatDate } from "@/lib/utils";
import type { Contrat, Employe } from "@/types";
import toast from "react-hot-toast";
import { contractService } from "@/lib/services";

type TabType = "actifs" | "archives";

interface ContratAvecEmploye extends Contrat {
  employe?: Employe;
  joursRestants?: number;
}

export default function ManagerContratsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("actifs");
  const [contrats, setContrats] = useState<ContratAvecEmploye[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEtat, setFilterEtat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContrat, setSelectedContrat] = useState<ContratAvecEmploye | null>(null);

  const loadContrats = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const res = await contractService.getAll({ statut: "EN_COURS" });
      if (res.success) {
        const list = ((res.data as any)?.data ?? []).map((c: any) => ({
          ...c,
          joursRestants: c.date_fin
            ? Math.max(0, Math.ceil((new Date(c.date_fin).getTime() - Date.now()) / 86400000))
            : undefined,
        })) as ContratAvecEmploye[];
        setContrats(list);
      } else {
        throw new Error((res as any).message || "Erreur chargement contrats");
      }
    } catch (error: any) {
      console.error("Erreur chargement contrats:", error);
      setIsError(true);
      toast.error(error?.response?.data?.message || error?.message || "Impossible de charger les contrats");
    } finally {
      setIsLoading(false);
    }
  };

  const loadArchives = async (): Promise<ContratAvecEmploye[]> => {
    const res = await contractService.getTrashed();
    if (res.success) return (res.data as any)?.data ?? [];
    return [];
  };

  useEffect(() => {
    loadContrats();
  }, []);

  const filteredContrats = contrats.filter((c) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.employe?.nom.toLowerCase().includes(query) ||
        c.employe?.prenom.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
      );
    }
    if (filterEtat !== "all") {
      return c.statut === filterEtat;
    }
    return true;
  });

  const handleRestore = async (id: string) => {
    try {
      toast.success("Contrat restauré");
      loadContrats();
    } catch (error) {
      toast.error("Échec de la restauration");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Contrats Équipe">
        <div className="space-y-4">
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Contrats Équipe">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-danger mb-4" size={48} />
          <Button onClick={loadContrats}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (activeTab === "archives") {
    return (
      <DashboardLayout title="Contrats Équipe">
        <div className="max-w-4xl mx-auto">
          <TrashView
            entityLabel="Contrat"
            entityLabelPlural="Contrats"
            columns={[
              {
                key: "employe",
                header: "Employé",
                render: (item) => (
                  <div className="flex items-center gap-2">
                    <Avatar nom={item.employe?.nom} prenom={item.employe?.prenom} size="sm" />
                    <span>{item.employe?.prenom} {item.employe?.nom}</span>
                  </div>
                ),
              },
              {
                key: "type",
                header: "Type",
                render: (item) => <Badge variant="blue" size="sm">{item.type}</Badge>,
              },
              {
                key: "dates",
                header: "Période",
                render: (item) => (
                  <span className="text-sm">
                    {new Date(item.dateDebut).toLocaleDateString("fr-FR")}
                    {item.dateFin && ` → ${new Date(item.dateFin).toLocaleDateString("fr-FR")}`}
                  </span>
                ),
              },
            ]}
            fetchArchives={loadArchives}
            restoreItem={handleRestore}
            onRestoreSuccess={() => loadContrats()}
            onClose={() => setActiveTab("actifs")}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Contrats Équipe"
      subtitle={`${filteredContrats.length} contrat${filteredContrats.length > 1 ? "s" : ""}`}
    >
      <Card>
        <div className="p-4 border-b border-slate-100 space-y-3">
          {/* Rangée 1 : titre + corbeille */}
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} className="text-primary-500" />
              Liste des contrats
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("archives")}
              className="text-slate-500 hover:text-amber-600 flex items-center gap-1.5"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Corbeille</span>
            </Button>
          </div>
          {/* Rangée 2 : recherche + filtres */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <Input
                placeholder="Rechercher par employé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[110px] bg-white"
            >
              <option value="all">Tous les types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="STAGE">Stage</option>
            </select>
            <select
              value={filterEtat}
              onChange={(e) => setFilterEtat(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[130px] bg-white"
            >
              <option value="all">Tous les états</option>
              <option value="EN_COURS">En cours</option>
              <option value="EXPIRE">Expiré</option>
              <option value="RESILIE">Échilié</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date début</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date fin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">État</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContrats.length > 0 ? (
                filteredContrats.map((contrat) => (
                  <tr key={contrat.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nom={contrat.employe?.nom} prenom={contrat.employe?.prenom} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {contrat.employe?.prenom} {contrat.employe?.nom}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={contrat.type === "CDI" ? "green" : "blue"} size="sm">
                        {contrat.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(contrat.dateDebut).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {contrat.dateFin ? (
                        <span className={cn(
                          contrat.joursRestants && contrat.joursRestants < 30 && "text-danger font-medium"
                        )}>
                          {new Date(contrat.dateFin).toLocaleDateString("fr-FR")}
                          {contrat.joursRestants && (
                            <span className="text-xs text-slate-400 ml-1">
                              ({contrat.joursRestants}j)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          contrat.statut === "EN_COURS" || contrat.statut === "SIGNE"
                            ? "green"
                            : contrat.statut === "BROUILLON"
                            ? "blue"
                            : "gray"
                        }
                        size="sm"
                      >
                        {contrat.statut.replace("_", " ")}
                      </Badge>
                      {contrat.joursRestants && contrat.joursRestants < 30 && (
                        <Badge variant="red" size="sm" className="ml-2">Expire bientôt</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Eye size={16} />}
                        onClick={() => setSelectedContrat(contrat)}
                      >
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500">Aucun contrat trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal visualisation contrat - Manager ne voit pas les salaires */}
      {selectedContrat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FileText className="text-primary-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Contrat {selectedContrat.reference}</h2>
                  <p className="text-sm text-slate-500">Aperçu en lecture seule</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedContrat(null)} 
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Employé */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-2">Employé</p>
                <div className="flex items-center gap-3">
                  <Avatar 
                    nom={selectedContrat.employe?.nom} 
                    prenom={selectedContrat.employe?.prenom}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedContrat.employe?.prenom} {selectedContrat.employe?.nom}
                    </p>
                    <p className="text-sm text-slate-500">{selectedContrat.employeId}</p>
                  </div>
                </div>
              </div>

              {/* Détails contrat */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Briefcase size={18} className="text-primary-500" />
                  Informations contrat
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Type</p>
                    <Badge variant={selectedContrat.type === "CDI" ? "green" : "blue"}>
                      {selectedContrat.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Statut</p>
                    <Badge 
                      variant={
                        selectedContrat.statut === "EN_COURS" ? "green" :
                        selectedContrat.statut === "SIGNE" ? "blue" :
                        selectedContrat.statut === "EXPIRE" ? "yellow" :
                        selectedContrat.statut === "RESILIE" ? "red" : "gray"
                      }
                    >
                      {selectedContrat.statut.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date de début</p>
                    <p className="font-medium">{formatDate(selectedContrat.dateDebut)}</p>
                  </div>
                  {selectedContrat.dateFin && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date de fin</p>
                      <p className="font-medium">{formatDate(selectedContrat.dateFin)}</p>
                    </div>
                  )}
                </div>

                {/* Note: Le manager ne voit PAS le salaire */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note :</strong> Les informations de rémunération ne sont pas affichées dans cet aperçu. Contactez le service RH pour plus de détails.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedContrat(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
