"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Edit2, 
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  RefreshCw,
  Archive
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge, Skeleton } from "@/components/ui";
import { contractService } from "@/lib/services";
import toast from "react-hot-toast";
import type { Contrat } from "@/types";

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────
function formatXAF(value?: number) {
  if (!value && value !== 0) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTypeBadgeColor(type: string) {
  switch (type?.toUpperCase()) {
    case "CDI": return "bg-blue-100 text-blue-700 border-blue-200";
    case "CDD": return "bg-amber-100 text-amber-700 border-amber-200";
    case "STAGE": return "bg-purple-100 text-purple-700 border-purple-200";
    case "ALTERNANCE": return "bg-pink-100 text-pink-700 border-pink-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getEtatBadgeColor(etat?: string) {
  switch (etat?.toUpperCase()) {
    case "ACTIF":
    case "EN_COURS": return "bg-green-100 text-green-700 border-green-200";
    case "EXPIRE": return "bg-red-100 text-red-700 border-red-200";
    case "RESILIE": return "bg-gray-100 text-gray-700 border-gray-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────
function EmptyStateIllustration() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-4">
        <circle cx="60" cy="60" r="50" fill="#F1F5F9" />
        <path d="M75 45H45C42.2 45 40 47.2 40 50V70C40 72.8 42.2 75 45 75H75C77.8 75 80 72.8 80 70V50C80 47.2 77.8 45 75 45Z" fill="white" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M48 55H72" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M48 62H72" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M48 69H60" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="85" cy="35" r="15" fill="#3B82F6" />
        <path d="M80 35L83 38L90 31" stroke="white" strokeWidth="2" />
      </svg>
      <h3 className="text-lg font-medium text-slate-800 mb-2">Aucun contrat trouvé</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        Aucun contrat ne correspond à vos critères de recherche.
      </p>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function DirecteurContratsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [filtreEtat, setFiltreEtat] = useState<string>("");
  const [filtreType, setFiltreType] = useState<string>("");
  const [filtreDepartement, setFiltreDepartement] = useState<string>("");
  const [showArchives, setShowArchives] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Contrats expirants
  const [expiringSoon, setExpiringSoon] = useState<Contrat[]>([]);

  // Chargement
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters: any = {};
        if (showArchives) filters.inclure_archives = true;
        if (filtreEtat) filters.etat = filtreEtat;
        if (filtreType) filters.type = filtreType;
        if (filtreDepartement) filters.departement = filtreDepartement;
        
        const res = await contractService.getAll(filters);
        const data = (res && (res as any).data) ? (res as any).data : (res as any).items || [];
        if (mounted) {
          setContracts(Array.isArray(data) ? data : []);
          setCurrentPage(1);
        }
        
        // Charger contrats expirants
        const expRes = await contractService.getExpiring();
        const expData = (expRes && (expRes as any).data) ? (expRes as any).data : [];
        if (mounted) setExpiringSoon(Array.isArray(expData) ? expData : []);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Erreur chargement";
        setError(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [showArchives, filtreEtat, filtreType, filtreDepartement]);

  // Filtrer par recherche
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const query = searchQuery.toLowerCase();
    return contracts.filter(c => {
      const employe = (c as any).employe;
      const name = employe ? `${employe.prenom || ""} ${employe.nom || ""}`.toLowerCase() : "";
      return c.id?.toLowerCase().includes(query) ||
             c.reference?.toLowerCase().includes(query) ||
             name.includes(query) ||
             c.type?.toLowerCase().includes(query);
    });
  }, [contracts, searchQuery]);

  // Pagination
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(start, start + itemsPerPage);
  }, [filteredContracts, currentPage]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  // Calculer alertes
  const alertes = useMemo(() => {
    const alertes = { jours7: [] as Contrat[], jours15: [] as Contrat[], jours30: [] as Contrat[] };
    expiringSoon.forEach(c => {
      const jours = c.dateFin ? differenceInDays(new Date(c.dateFin), new Date()) : null;
      if (jours !== null && jours >= 0) {
        if (jours <= 7) alertes.jours7.push(c);
        else if (jours <= 15) alertes.jours15.push(c);
        else if (jours <= 30) alertes.jours30.push(c);
      }
    });
    return alertes;
  }, [expiringSoon]);

  // Handlers
  const handleView = (id: string) => router.push(`/directeur/contrats/${id}`);
  const handleEdit = (id: string) => router.push(`/directeur/contrats/${id}/modifier`);
  
  const handleResilier = async (contrat: Contrat) => {
    const motif = prompt("Motif de résiliation (obligatoire) :");
    if (!motif || motif.trim().length < 5) {
      toast.error("Motif requis (min. 5 caractères)");
      return;
    }
    if (!confirm(`Résilier ${contrat.reference || contrat.id} ?\nMotif: ${motif}`)) return;
    
    try {
      await contractService.terminate(contrat.id, { motif, date_fin: format(new Date(), "yyyy-MM-dd") });
      setContracts(prev => prev.map(c => c.id === contrat.id ? { ...c, statut: "RESILIE" as any } : c));
      toast.success("Contrat résilié");
    } catch (err: any) {
      toast.error(err?.message || "Échec");
    }
  };

  const handleRenouveler = (contrat: Contrat) => {
    router.push(`/directeur/contrats/nouveau?renouvellement=${contrat.id}`);
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archiver ce contrat ?")) return;
    try {
      await contractService.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      toast.success("Archivé");
    } catch (err: any) {
      toast.error(err?.message || "Échec");
    }
  };

  // ─── RENDU ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Contrats" subtitle="Gestion des contrats - Vue Directeur">
      <div className="space-y-6">
        
        {/* Alertes */}
        {alertes.jours7.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-800">{alertes.jours7.length} contrat(s) expirent dans &lt; 7 jours</p>
                <p className="text-sm text-red-700">Action urgente requise.</p>
              </div>
            </div>
          </div>
        )}
        
        {alertes.jours15.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-orange-800">{alertes.jours15.length} contrat(s) expirent en 8-15 jours</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="text-blue-600" size={24} />
                Tous les contrats
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">Gestion complète des contrats de travail</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                size="md" 
                onClick={() => router.push("/directeur/contrats/nouveau")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={18} className="mr-2" />
                Nouveau contrat
              </Button>
              <Button 
                size="md" 
                variant={showArchives ? "primary" : "outline"} 
                onClick={() => setShowArchives(!showArchives)}
              >
                {showArchives ? "Masquer archives" : "Afficher archives"}
              </Button>
              <Button 
                size="md" 
                variant="ghost" 
                onClick={() => router.push("/directeur/contrats/corbeille")}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} className="mr-2" />
                Corbeille
              </Button>
            </div>
          </div>

          {/* Filtres */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par employé, référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)} className="flex-1 px-4 py-2.5 border rounded-lg bg-white">
                <option value="">Tous types</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="STAGE">Stage</option>
                <option value="ALTERNANCE">Alternance</option>
              </select>
              
              <select value={filtreEtat} onChange={(e) => setFiltreEtat(e.target.value)} className="flex-1 px-4 py-2.5 border rounded-lg bg-white">
                <option value="">Tous états</option>
                <option value="ACTIF">Actif</option>
                <option value="EN_COURS">En cours</option>
                <option value="EXPIRE">Expiré</option>
                <option value="RESILIE">Résilié</option>
              </select>
              
              <select value={filtreDepartement} onChange={(e) => setFiltreDepartement(e.target.value)} className="flex-1 px-4 py-2.5 border rounded-lg bg-white">
                <option value="">Tous départements</option>
                <option value="TECHNIQUE">Technique</option>
                <option value="RH">RH</option>
                <option value="FINANCE">Finance</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
          </div>

          {/* Tableau */}
          <div className="mt-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl p-6 bg-red-50 border text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                <p className="text-red-700">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
                  Réessayer
                </Button>
              </div>
            ) : filteredContracts.length === 0 ? (
              <EmptyStateIllustration />
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Employé</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Période</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">État</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Salaire</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedContracts.map((c) => {
                      const employe = (c as any).employe;
                      const joursRestants = c.dateFin ? differenceInDays(new Date(c.dateFin), new Date()) : null;
                      const isUrgent = joursRestants !== null && joursRestants <= 7;
                      
                      return (
                        <tr key={c.id} className={`hover:bg-slate-50 ${isUrgent ? "bg-red-50/50" : ""}`}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {employe?.prenom?.[0] || employe?.nom?.[0] || "?"}
                              </div>
                              <div>
                                <p className="font-medium">{employe ? `${employe.prenom || ""} ${employe.nom || ""}`.trim() : "-"}</p>
                                <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(c.type)}`}>
                              {c.type || "-"}
                            </span>
                          </td>
                          
                          <td className="px-4 py-4">
                            {c.dateDebut ? (
                              <>
                                <span>{format(new Date(c.dateDebut), "dd/MM/yyyy", { locale: fr })}</span>
                                {c.dateFin && (
                                  <>
                                    {" → "}
                                    <span className={isUrgent ? "text-red-600 font-bold" : ""}>
                                      {format(new Date(c.dateFin), "dd/MM/yyyy")}
                                      {isUrgent && <span className="ml-1">({joursRestants}j)</span>}
                                    </span>
                                  </>
                                )}
                              </>
                            ) : "-"}
                          </td>
                          
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEtatBadgeColor(c.statut)}`}>
                              {c.statut || "-"}
                            </span>
                          </td>
                          
                          <td className="px-4 py-4 font-medium">
                            {formatXAF((c as any).salaire || (c as any).salaireBase)}
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleView(c.id)} className="text-blue-600">
                                <Eye size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(c.id)} className="text-amber-600">
                                <Edit2 size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleResilier(c)} className="text-orange-600">
                                <XCircle size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleRenouveler(c)} className="text-green-600">
                                <RefreshCw size={16} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleArchive(c.id)} className="text-red-600">
                                <Archive size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredContracts.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-slate-600">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, filteredContracts.length)} - {Math.min(currentPage * itemsPerPage, filteredContracts.length)} sur {filteredContracts.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm">{currentPage} / {totalPages}</span>
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
