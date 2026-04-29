"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle, XCircle, Clock, Eye, Trash2, Zap, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { TrashView, SuperValidationModal } from "@/components/shared";
import { leaveService, rhCongeService } from "@/lib/services";
import type { DemandeConge } from "@/types";
import toast from "react-hot-toast";

type TabType = "a-valider" | "super" | "vue-globale" | "archives";

export default function DirecteurCongesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("a-valider");
  const [conges, setConges] = useState<DemandeConge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [superValidationConge, setSuperValidationConge] = useState<DemandeConge | null>(null);

  // States pour modals N3 Approuver/Refuser
  const [approveConge, setApproveConge] = useState<DemandeConge | null>(null);
  const [refuseConge, setRefuseConge] = useState<DemandeConge | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "super") setActiveTab("super");
  }, [searchParams]);

  const loadConges = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const response = await leaveService.getAll();
      if (response.success) {
        const data = (response.data as any)?.data ?? response.data ?? [];
        setConges(Array.isArray(data) ? data : []);
      } else {
        throw new Error((response as any).message || "Erreur");
      }
    } catch (error: any) {
      setIsError(true);
      toast.error(error?.response?.data?.message || error?.message || "Impossible de charger les congés");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadConges(); }, []);

  const loadArchives = async (): Promise<any[]> => {
    try {
      const res = await leaveService.getTrashed();
      if (res.success) return (res.data?.data || []);
      toast.error(res.message || "Erreur lors du chargement de la corbeille");
      return [];
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors du chargement de la corbeille");
      return [];
    }
  };

  // Approuver N3 avec optimistic update
  const handleApproveN3 = async () => {
    if (!approveConge) return;
    const prev = conges;
    setConges(c => c.map(x => x.id === approveConge.id ? { ...x, statut: "APPROUVE_N3" as any } : x));
    setApproveConge(null);
    setCommentaire("");
    try {
      setIsSubmitting(true);
      const res = await leaveService.approve(approveConge.id);
      if (!res.success) throw new Error((res as any).message);
      toast.success("Congé approuvé (N3)");
      loadConges();
    } catch (e: any) {
      setConges(prev);
      toast.error(e?.response?.data?.message || e?.message || "Échec de l'approbation");
    } finally { setIsSubmitting(false); }
  };

  // Refuser N3 avec optimistic update
  const handleRefuseN3 = async () => {
    if (!refuseConge || !motifRefus.trim()) { toast.error("Le motif est obligatoire"); return; }
    const prev = conges;
    const savedMotif = motifRefus;
    setConges(c => c.map(x => x.id === refuseConge.id ? { ...x, statut: "REFUSE_N3" as any } : x));
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

  // Super validation avec optimistic update
  const handleSuperValidate = async (decision: "approuve" | "refuse", commentaireText: string) => {
    if (!superValidationConge) return;
    const prev = conges;
    const newStatut = decision === "approuve" ? "APPROUVE_N3" : "REFUSE_N3";
    setConges(c => c.map(x => x.id === superValidationConge.id ? { ...x, statut: newStatut as any } : x));
    setSuperValidationConge(null);
    try {
      const res = await rhCongeService.superValider(superValidationConge.id, {
        decision,
        commentaire: commentaireText,
      });
      if (!res.success) throw new Error((res as any).message);
      toast.success(`Super validation: ${decision === "approuve" ? "Approuvé ✅" : "Refusé ❌"}`);
      loadConges();
    } catch (e: any) {
      setConges(prev);
      toast.error(e?.response?.data?.message || e?.message || "Échec de la super-validation");
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
      <DashboardLayout title="Congés - Vue Directeur">
        <Card className="h-96 animate-pulse bg-slate-100" />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Congés - Vue Directeur">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="text-danger mb-4" size={48} />
          <Button onClick={loadConges}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (activeTab === "archives") {
    return (
      <DashboardLayout title="Congés - Vue Directeur">
        <div className="max-w-4xl mx-auto">
          <TrashView entityLabel="Congé" entityLabelPlural="Congés" columns={[{ key: "employe", header: "Employé", render: (item) => <div className="flex items-center gap-2"><Avatar nom={item.employe?.nom} prenom={item.employe?.prenom} size="sm" /><span>{item.employe?.prenom} {item.employe?.nom}</span></div> }, { key: "type", header: "Type", render: (item) => <Badge variant="blue">{item.type}</Badge> }, { key: "periode", header: "Période", render: (item) => <span>{new Date(item.dateDebut).toLocaleDateString("fr-FR")} → {new Date(item.dateFin).toLocaleDateString("fr-FR")}</span> }]} fetchArchives={loadArchives} restoreItem={handleRestore} onClose={() => setActiveTab("vue-globale")} />
        </div>
      </DashboardLayout>
    );
  }

  // Workflow simultané : le directeur voit tous les congés en attente (N1, N2, N3)
  const enAttenteAll = conges.filter(c =>
    c.statut === "EN_ATTENTE_N1" || c.statut === "EN_ATTENTE_N2" || c.statut === "EN_ATTENTE_N3"
  );
  const filtered = activeTab === "a-valider" ? enAttenteAll :
                   activeTab === "super" ? enAttenteAll :
                   conges;

  return (
    <DashboardLayout title="Congés - Vue Directeur" subtitle={`${filtered.length} demandes`}>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2 flex-1">
            <Button variant={activeTab === "a-valider" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("a-valider")} className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-0 justify-center sm:justify-start"><Clock size={16} /><span className="hidden sm:inline">À valider N3</span><span className="sm:hidden">N3</span>{conges.filter(c => c.statut === "EN_ATTENTE_N3").length > 0 && <Badge variant="red" size="sm">{conges.filter(c => c.statut === "EN_ATTENTE_N3").length}</Badge>}</Button>
            <Button variant={activeTab === "super" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("super")} className="flex items-center gap-1 sm:gap-2 text-amber-600 flex-1 sm:flex-0 justify-center sm:justify-start"><Zap size={16} /><span className="hidden sm:inline">Super Validation</span><span className="sm:hidden">Super</span> ⚡ {conges.filter(c => c.statut === "EN_ATTENTE_N1" || c.statut === "EN_ATTENTE_N2").length > 0 && <Badge variant="red" size="sm">{conges.filter(c => c.statut === "EN_ATTENTE_N1" || c.statut === "EN_ATTENTE_N2").length}</Badge>}</Button>
            <Button variant={activeTab === "vue-globale" ? "primary" : "ghost"} size="sm" onClick={() => setActiveTab("vue-globale")} className="flex-1 sm:flex-0 justify-center sm:justify-start"><span className="hidden sm:inline">Vue globale</span><span className="sm:hidden">Global</span></Button>
          </div>
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => setActiveTab("archives")} className="text-slate-500 hover:text-amber-600 flex-shrink-0"><span className="hidden sm:inline">Corbeille</span></Button>
        </div>

        {activeTab === "super" && (
          <div className="bg-amber-50 border-b border-amber-100 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={18} />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Mode Super Validation</p>
                <p>Vous pouvez approuver/refuser directement en court-circuitant le workflow normal.</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-48">Employé</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-24">Type</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Période</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-36">Statut</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-44">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((conge) => (
                <tr key={conge.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar nom={conge.employe?.nom} prenom={conge.employe?.prenom} size="sm" /><div><p className="font-medium text-slate-800 truncate max-w-[140px]">{conge.employe?.prenom} {conge.employe?.nom}</p></div></div></td>
                  <td className="px-4 py-3"><Badge variant="blue" size="sm" className="whitespace-nowrap">{conge.type}</Badge></td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(conge.dateDebut).toLocaleDateString("fr-FR")} → {new Date(conge.dateFin).toLocaleDateString("fr-FR")} <span className="text-slate-400">({conge.nombreJours}j)</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Badge variant={conge.statut.includes("APPROUVE") ? "green" : conge.statut.includes("REFUSE") || conge.statut === "ANNULE" ? "red" : "yellow"} size="sm" className="whitespace-nowrap">{conge.statut.replace(/_/g, " ")}</Badge>{activeTab === "super" && <Badge variant="red" size="sm" className="whitespace-nowrap">⚡ Super</Badge>}</div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
                      {activeTab === "a-valider" ? (
                        <>
                          <Button size="xs" variant="secondary" icon={<CheckCircle size={14} />} onClick={() => setApproveConge(conge)}>Approuver</Button>
                          <Button size="xs" variant="outline" icon={<XCircle size={14} />} className="text-danger hover:bg-danger/10" onClick={() => setRefuseConge(conge)}>Refuser</Button>
                        </>
                      ) : activeTab === "super" ? (
                        <Button size="xs" variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap" icon={<Zap size={14} />} onClick={() => setSuperValidationConge(conge)}>Super Valider</Button>
                      ) : <Button variant="ghost" size="xs" icon={<Eye size={14} />}>Voir</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Approuver N3 */}
      {approveConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-success" size={20} />Approuver le congé (N3 Directeur)
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
              <Button className="flex-1 bg-success hover:bg-green-600" loading={isSubmitting} onClick={handleApproveN3}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Refuser N3 */}
      {refuseConge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <XCircle className="text-danger" size={20} />Refuser le congé (N3 Directeur)
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
              <Button variant="danger" className="flex-1" loading={isSubmitting} onClick={handleRefuseN3} disabled={!motifRefus.trim()}>
                Confirmer le refus
              </Button>
            </div>
          </div>
        </div>
      )}

      {superValidationConge && (
        <SuperValidationModal
          conge={superValidationConge}
          etapesManquantes={["N1 Manager", "N2 RH"]}
          onValidate={handleSuperValidate}
          onClose={() => setSuperValidationConge(null)}
        />
      )}
    </DashboardLayout>
  );
}
