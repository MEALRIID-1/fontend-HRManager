"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays, CheckCircle, XCircle, Clock, Eye,
  Archive, AlertCircle, RefreshCw, ArrowLeft, Trash2,
  ChevronRight, Calendar, Filter
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Input, Avatar } from "@/components/ui";
import { TrashView } from "@/components/shared";
import { cn, fromNow } from "@/lib/utils";
import { managerService } from "@/lib/services";
import type { DemandeConge } from "@/types";
import toast from "react-hot-toast";

type TabType = "a-valider" | "historique" | "archives";

export default function ManagerCongesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("a-valider");
  const [conges, setConges] = useState<DemandeConge[]>([]);
  const [archives, setArchives] = useState<DemandeConge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedConge, setSelectedConge] = useState<DemandeConge | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chargement des congés depuis l'API
  const loadConges = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const response = await managerService.getConges();
      if (response.success) {
        const data = (response.data as any)?.data ?? response.data ?? [];
        setConges(Array.isArray(data) ? data : []);
      } else {
        throw new Error((response as any).message || "Erreur chargement congés");
      }
    } catch (error: any) {
      console.error("Erreur chargement congés:", error);
      setIsError(true);
      toast.error(error?.message || "Impossible de charger les congés");
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement des archives - Manager ne voit pas les archives
  const loadArchives = async (): Promise<any[]> => {
    return [];
  };

  useEffect(() => {
    loadConges();
  }, []);

  // Filtrage
  const filteredConges = conges.filter((c) => {
    if (activeTab === "a-valider") {
      return c.statut === "EN_ATTENTE_N1";
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.employe?.nom.toLowerCase().includes(query) ||
        c.employe?.prenom.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Actions avec optimistic updates
  const handleValidate = async () => {
    if (!selectedConge) return;

    // Optimistic update : badge vert + retire de l'onglet "à valider"
    const previousConges = conges;
    setConges(prev =>
      prev.map(c => c.id === selectedConge.id ? { ...c, statut: "APPROUVE_N1" as any } : c)
    );
    setShowValidateModal(false);
    const savedCommentaire = commentaire;
    setCommentaire("");
    setSelectedConge(null);

    try {
      setIsSubmitting(true);
      const response = await managerService.approuverConge(selectedConge.id, commentaire);
      if (!response.success) throw new Error((response as any).message || "Erreur validation");
      toast.success("Congé validé avec succès");
      // Rafraîchir pour avoir les données exactes de l'API
      loadConges();
    } catch (error: any) {
      // Rollback
      setConges(previousConges);
      toast.error(error?.response?.data?.message || error?.message || "Échec de la validation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefuse = async () => {
    if (!selectedConge || !motifRefus.trim()) {
      toast.error("Le motif de refus est obligatoire");
      return;
    }

    // Optimistic update : badge rouge + retire de l'onglet "à valider"
    const previousConges = conges;
    setConges(prev =>
      prev.map(c => c.id === selectedConge.id ? { ...c, statut: "REFUSE_N1" as any } : c)
    );
    setShowRefuseModal(false);
    const savedMotif = motifRefus;
    setMotifRefus("");
    setCommentaire("");
    setSelectedConge(null);

    try {
      setIsSubmitting(true);
      const response = await managerService.refuserConge(selectedConge.id, savedMotif);
      if (!response.success) throw new Error((response as any).message || "Erreur refus");
      toast.success("Congé refusé");
      loadConges();
    } catch (error: any) {
      // Rollback
      setConges(previousConges);
      toast.error(error?.response?.data?.message || error?.message || "Échec du refus");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (id: string) => {
    toast.error("Contactez votre RH pour restaurer un congé archivé");
    throw new Error("Contactez votre RH pour restaurer un congé archivé");
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Congés Équipe">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Congés Équipe">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-danger mb-4" size={48} />
          <Button onClick={loadConges}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Vue Archives (Corbeille)
  if (activeTab === "archives") {
    return (
      <DashboardLayout title="Congés Équipe">
        <div className="max-w-4xl mx-auto">
          <TrashView
            entityLabel="Congé"
            entityLabelPlural="Congés"
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
                key: "periode",
                header: "Période",
                render: (item) => (
                  <span className="text-sm">
                    {new Date(item.dateDebut).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(item.dateFin).toLocaleDateString("fr-FR")}
                  </span>
                ),
              },
            ]}
            fetchArchives={loadArchives}
            restoreItem={handleRestore}
            onRestoreSuccess={() => loadConges()}
            onClose={() => setActiveTab("historique")}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Congés Équipe"
      subtitle={`${filteredConges.length} demande${filteredConges.length > 1 ? "s" : ""}`}
    >
      <Card>
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("a-valider")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 flex-1 sm:flex-0 justify-center sm:justify-start",
                activeTab === "a-valider"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Clock size={16} />
              <span className="hidden sm:inline">À valider</span>
              <span className="sm:hidden">À valider</span>
              {conges.filter((c) => c.statut === "EN_ATTENTE_N1").length > 0 && (
                <Badge variant="red" size="sm">
                  {conges.filter((c) => c.statut === "EN_ATTENTE_N1").length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab("historique")}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 flex-1 sm:flex-0 justify-center sm:justify-start",
                activeTab === "historique"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">Historique</span>
            </button>
          </div>

          {/* Bouton Corbeille */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => setActiveTab("archives")}
            className="text-slate-500 hover:text-amber-600 flex-shrink-0"
          >
            <span className="hidden sm:inline">Corbeille</span>
          </Button>
        </div>

        {/* Filtres (uniquement historique) */}
        {activeTab === "historique" && (
          <div className="p-4 border-b border-slate-100 flex gap-2">
            <div className="relative flex-1 max-w-full sm:max-w-xs">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Rechercher un employé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Période</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Jours</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConges.length > 0 ? (
                filteredConges.map((conge) => (
                  <tr key={conge.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nom={conge.employe?.nom} prenom={conge.employe?.prenom} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {conge.employe?.prenom} {conge.employe?.nom}
                          </p>
                          <p className="text-xs text-slate-500">{fromNow(conge.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="blue" size="sm">{conge.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(conge.dateDebut).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(conge.dateFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{conge.nombreJours}j</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          conge.statut === "APPROUVE_N1" || conge.statut === "APPROUVE_N2" || conge.statut === "APPROUVE_N3"
                            ? "green"
                            : conge.statut === "REFUSE_N1" || conge.statut === "REFUSE_N2" || conge.statut === "REFUSE_N3" || conge.statut === "ANNULE"
                            ? "red"
                            : "yellow"
                        }
                        size="sm"
                      >
                        {conge.statut.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {activeTab === "a-valider" ? (
                        <div className="flex items-center gap-2 justify-end">
                          {/* Badge urgence si > 48h */}
                          {new Date(conge.createdAt).getTime() < Date.now() - 48 * 60 * 60 * 1000 && (
                            <Badge variant="red" size="sm">Urgent</Badge>
                          )}
                          <Button
                            size="xs"
                            variant="secondary"
                            icon={<CheckCircle size={14} />}
                            onClick={() => {
                              setSelectedConge(conge);
                              setShowValidateModal(true);
                            }}
                          >
                            Valider
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            icon={<XCircle size={14} />}
                            onClick={() => {
                              setSelectedConge(conge);
                              setShowRefuseModal(true);
                            }}
                            className="text-danger hover:bg-danger/10"
                          >
                            Refuser
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" icon={<Eye size={16} />}>
                          Voir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <CalendarDays className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500">
                      {activeTab === "a-valider"
                        ? "Aucune demande en attente de validation"
                        : "Aucune demande dans l'historique"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Validation */}
      {showValidateModal && selectedConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-success" size={20} />
              Valider le congé
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="font-medium">{selectedConge.employe?.prenom} {selectedConge.employe?.nom}</p>
              <p className="text-sm text-slate-500">
                {selectedConge.type} · {selectedConge.nombreJours} jours
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success min-h-[80px]"
                placeholder="Ajouter un commentaire..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowValidateModal(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1 bg-success hover:bg-green-600"
                loading={isSubmitting}
                onClick={handleValidate}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Refus */}
      {showRefuseModal && selectedConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <XCircle className="text-danger" size={20} />
              Refuser le congé
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="font-medium">{selectedConge.employe?.prenom} {selectedConge.employe?.nom}</p>
              <p className="text-sm text-slate-500">
                {selectedConge.type} · {selectedConge.nombreJours} jours
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motif du refus <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger"
                placeholder="Raison du refus..."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger min-h-[80px]"
                placeholder="Ajouter un commentaire..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRefuseModal(false)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={isSubmitting}
                onClick={handleRefuse}
                disabled={!motifRefus.trim()}
              >
                Confirmer le refus
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
