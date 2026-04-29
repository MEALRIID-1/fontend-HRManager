"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, XCircle, Clock, Eye, Trash2, X, User, Building2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { TrashView } from "@/components/shared";
import { leaveService } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";
import type { DemandeConge } from "@/types";
import toast from "react-hot-toast";

type TabType = "a-valider" | "tous" | "archives";

export default function RHCongesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("a-valider");
  const [conges, setConges] = useState<DemandeConge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedConge, setSelectedConge] = useState<DemandeConge | null>(null);

  // States pour modals approve/refus
  const [approveConge, setApproveConge] = useState<DemandeConge | null>(null);
  const [refuseConge, setRefuseConge] = useState<DemandeConge | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadConges = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const response = await leaveService.getAll();
      if (response.success) {
        const data = (response.data as any)?.data ?? response.data ?? [];
        setConges(Array.isArray(data) ? data : []);
      } else {
        throw new Error((response as any).message || "Erreur chargement");
      }
    } catch (error: any) {
      setIsError(true);
      toast.error(error?.response?.data?.message || error?.message || "Impossible de charger les congés");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadConges(); }, []);

  // Approuver avec optimistic update
  const handleApprove = async () => {
    if (!approveConge) return;
    const prev = conges;
    setConges(c => c.map(x => x.id === approveConge.id ? { ...x, statut: "APPROUVE_N2" as any } : x));
    setApproveConge(null);
    setCommentaire("");
    try {
      setIsSubmitting(true);
      const res = await leaveService.approve(approveConge.id);
      if (!res.success) throw new Error((res as any).message);
      toast.success("Congé approuvé (N2)");
      loadConges();
    } catch (e: any) {
      setConges(prev);
      toast.error(e?.response?.data?.message || e?.message || "Échec de l'approbation");
    } finally { setIsSubmitting(false); }
  };

  // Refuser avec optimistic update
  const handleRefuse = async () => {
    if (!refuseConge || !motifRefus.trim()) {
      toast.error("Le motif est obligatoire");
      return;
    }
    const prev = conges;
    const savedMotif = motifRefus;
    setConges(c => c.map(x => x.id === refuseConge.id ? { ...x, statut: "REFUSE_N2" as any } : x));
    setRefuseConge(null);
    setMotifRefus("");
    setCommentaire("");
    try {
      setIsSubmitting(true);
      const res = await leaveService.reject(refuseConge.id, savedMotif);
      if (!res.success) throw new Error((res as any).message);
      toast.success("Congé refusé");
      loadConges();
    } catch (e: any) {
      setConges(prev);
      toast.error(e?.response?.data?.message || e?.message || "Échec du refus");
    } finally { setIsSubmitting(false); }
  };

  const loadArchives = async (): Promise<any[]> => {
    try {
      const res = await leaveService.getTrashed();
      if (res.success) {
        return (res.data?.data || []);
      }
      toast.error(res.message || "Erreur lors du chargement de la corbeille");
      return [];
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors du chargement de la corbeille");
      return [];
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await leaveService.restore(id);
      if (res.success) {
        toast.success("Congé restauré avec succès");
      } else {
        throw new Error(res.message || "Erreur lors de la restauration");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la restauration");
      throw e;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Gestion des Congés">
        <Card className="h-96 animate-pulse bg-slate-100" />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Gestion des Congés">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-danger mb-4" size={48} />
          <Button onClick={loadConges}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (activeTab === "archives") {
    return (
      <DashboardLayout title="Gestion des Congés">
        <div className="max-w-4xl mx-auto">
          <TrashView entityLabel="Congé" entityLabelPlural="Congés" columns={[{ key: "employe", header: "Employé", render: (item) => <div className="flex items-center gap-2"><Avatar nom={item.employe?.nom} prenom={item.employe?.prenom} size="sm" /><span>{item.employe?.prenom} {item.employe?.nom}</span></div> }, { key: "type", header: "Type", render: (item) => <Badge variant="blue">{item.type}</Badge> }, { key: "periode", header: "Période", render: (item) => <span>{new Date(item.dateDebut).toLocaleDateString("fr-FR")} → {new Date(item.dateFin).toLocaleDateString("fr-FR")}</span> }]} fetchArchives={loadArchives} restoreItem={handleRestore} onClose={() => setActiveTab("tous")} />
        </div>
      </DashboardLayout>
    );
  }

  const filtered = activeTab === "a-valider" ? conges.filter(c => c.statut === "EN_ATTENTE_N2") : conges;

  return (
    <DashboardLayout title="Gestion des Congés" subtitle={`${filtered.length} demandes`}>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2 flex-1">
            <Button variant={activeTab === "a-valider" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("a-valider")} className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-0 justify-center sm:justify-start"><Clock size={16} /><span className="hidden sm:inline">À valider N2</span><span className="sm:hidden">N2</span>{conges.filter(c => c.statut === "EN_ATTENTE_N2").length > 0 && <Badge variant="red" size="sm">{conges.filter(c => c.statut === "EN_ATTENTE_N2").length}</Badge>}</Button>
            <Button variant={activeTab === "tous" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("tous")} className="flex-1 sm:flex-0 justify-center sm:justify-start"><span className="hidden sm:inline">Tous les congés</span><span className="sm:hidden">Tous</span></Button>
          </div>
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => setActiveTab("archives")} className="text-slate-500 hover:text-amber-600 flex-shrink-0"><span className="hidden sm:inline">Corbeille</span></Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-44">Employé</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-24">Type</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Période</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-32">Statut</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-44">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((conge) => (
                <tr key={conge.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar nom={conge.employe?.nom} prenom={conge.employe?.prenom} size="sm" /><div><p className="font-medium text-slate-800 truncate max-w-[120px]">{conge.employe?.prenom} {conge.employe?.nom}</p></div></div></td>
                  <td className="px-4 py-3"><Badge variant="blue" size="sm" className="whitespace-nowrap">{conge.type}</Badge></td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(conge.dateDebut).toLocaleDateString("fr-FR")} → {new Date(conge.dateFin).toLocaleDateString("fr-FR")} <span className="text-slate-400">({conge.nombreJours}j)</span></td>
                  <td className="px-4 py-3"><Badge variant={conge.statut.includes("APPROUVE") ? "green" : conge.statut.includes("REFUSE") || conge.statut === "ANNULE" ? "red" : "yellow"} size="sm" className="whitespace-nowrap">{conge.statut.replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
                    {activeTab === "a-valider" ? (
                      <>
                        <Button size="xs" variant="secondary" icon={<CheckCircle size={14} />} onClick={() => setApproveConge(conge)}>Approuver</Button>
                        <Button size="xs" variant="outline" icon={<XCircle size={14} />} className="text-danger hover:bg-danger/10" onClick={() => setRefuseConge(conge)}>Refuser</Button>
                      </>
                    ) : <Button variant="ghost" size="xs" icon={<Eye size={14} />} onClick={() => setSelectedConge(conge)}>Voir</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Approuver */}
      {approveConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-success" size={20} />Approuver le congé (N2)
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="font-medium">{approveConge.employe?.prenom} {approveConge.employe?.nom}</p>
              <p className="text-sm text-slate-500">{approveConge.type} · {approveConge.nombreJours} jours</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Commentaire (optionnel)</label>
              <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success min-h-[80px]"
                placeholder="Ajouter un commentaire..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setApproveConge(null)}>Annuler</Button>
              <Button className="flex-1 bg-success hover:bg-green-600" loading={isSubmitting} onClick={handleApprove}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Refuser */}
      {refuseConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <XCircle className="text-danger" size={20} />Refuser le congé (N2)
            </h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="font-medium">{refuseConge.employe?.prenom} {refuseConge.employe?.nom}</p>
              <p className="text-sm text-slate-500">{refuseConge.type} · {refuseConge.nombreJours} jours</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Motif du refus <span className="text-danger">*</span></label>
              <input type="text" value={motifRefus} onChange={e => setMotifRefus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger"
                placeholder="Raison du refus..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRefuseConge(null)}>Annuler</Button>
              <Button variant="danger" className="flex-1" loading={isSubmitting} onClick={handleRefuse} disabled={!motifRefus.trim()}>
                Confirmer le refus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail congé - vue RH complète avec workflow */}
      {selectedConge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <CalendarDays className="text-primary-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Détail de la demande</h2>
                  <p className="text-sm text-slate-500">Vue complète RH</p>
                </div>
              </div>
              <button onClick={() => setSelectedConge(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Employé */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                <Avatar nom={selectedConge.employe?.nom} prenom={selectedConge.employe?.prenom} size="md" />
                <div>
                  <p className="font-semibold text-slate-800 text-lg">
                    {selectedConge.employe?.prenom} {selectedConge.employe?.nom}
                  </p>
                  {(selectedConge.employe as any)?.departement && (
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Building2 size={14} />{(selectedConge.employe as any).departement}
                    </p>
                  )}
                </div>
              </div>

              {/* Informations de la demande */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary-500" />
                  Informations de la demande
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Type</p>
                    <Badge variant="blue">{selectedConge.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">État actuel</p>
                    <Badge variant={selectedConge.statut.includes("APPROUVE") ? "green" : selectedConge.statut.includes("REFUSE") || selectedConge.statut === "ANNULE" ? "red" : "yellow"}>
                      {selectedConge.statut.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Période</p>
                    <p className="font-medium">{formatDate(selectedConge.dateDebut)} → {formatDate(selectedConge.dateFin)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Nombre de jours</p>
                    <p className="font-medium">{selectedConge.nombreJours} jours</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date de soumission</p>
                    <p className="font-medium">{formatDate(selectedConge.createdAt)}</p>
                  </div>
                  {selectedConge.motif && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Motif</p>
                      <p className="font-medium">{selectedConge.motif}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Motif de refus */}
              {selectedConge.statut.includes("REFUSE") && (selectedConge as any).motifRefus && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                    <XCircle size={16} /> Motif du refus
                  </p>
                  <p className="text-red-700">{(selectedConge as any).motifRefus}</p>
                </div>
              )}

              {/* Historique workflow */}
              {selectedConge.workflow?.etapes && selectedConge.workflow.etapes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <CheckCircle size={18} className="text-primary-500" />
                    Historique des validations
                  </h3>
                  <div className="space-y-2">
                    {selectedConge.workflow.etapes.map((etape: any, i: number) => (
                      <div key={i} className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border",
                        etape.decision === "APPROUVE" ? "bg-green-50 border-green-200" :
                        etape.decision === "REFUSE" ? "bg-red-50 border-red-200" :
                        "bg-slate-50 border-slate-200"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                          etape.decision === "APPROUVE" ? "bg-green-500 text-white" :
                          etape.decision === "REFUSE" ? "bg-red-500 text-white" :
                          "bg-slate-300 text-slate-600"
                        )}>
                          N{etape.niveau || i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-slate-800">
                              {etape.validateur ? `${etape.validateur.prenom || ""} ${etape.validateur.nom || ""}`.trim() : `Niveau ${etape.niveau || i + 1}`}
                            </p>
                            <Badge
                              variant={etape.decision === "APPROUVE" ? "green" : etape.decision === "REFUSE" ? "red" : "yellow"}
                              size="sm"
                            >
                              {etape.decision || "EN ATTENTE"}
                            </Badge>
                          </div>
                          {etape.commentaire && (
                            <p className="text-sm text-slate-600 mt-1">{etape.commentaire}</p>
                          )}
                          {etape.dateValidation && (
                            <p className="text-xs text-slate-400 mt-1">{formatDate(etape.dateValidation)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedConge(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
