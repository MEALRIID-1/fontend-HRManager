"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays, isBefore, addDays } from "date-fns";
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
  Briefcase
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge, Skeleton } from "@/components/ui";
import { contractService } from "@/lib/services";
import toast from "react-hot-toast";
import type { Contrat } from "@/types";

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────
function formatXAF(value?: number) {
  if (!value && value !== 0) return "-";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF";
}

function getTypeBadgeColor(type: string) {
  switch (type?.toUpperCase()) {
    case "CDI": return "bg-blue-100 text-blue-700 border-blue-200";
    case "CDD": return "bg-amber-100 text-amber-700 border-amber-200";
    case "STAGE": return "bg-purple-100 text-purple-700 border-purple-200";
    case "ALTERNANCE": return "bg-pink-100 text-pink-700 border-pink-200";
    case "INTERIM": return "bg-gray-100 text-gray-700 border-gray-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getEtatBadgeColor(etat?: string) {
  switch (etat?.toUpperCase()) {
    case "ACTIF":
    case "EN_COURS":
    case "SIGNE": return "bg-green-100 text-green-700 border-green-200";
    case "EXPIRE": return "bg-red-100 text-red-700 border-red-200";
    case "RESILIE": return "bg-gray-100 text-gray-700 border-gray-200";
    case "SUSPENDU": return "bg-orange-100 text-orange-700 border-orange-200";
    case "BROUILLON": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getJoursExpiration(dateFin?: string) {
  if (!dateFin) return null;
  const jours = differenceInDays(new Date(dateFin), new Date());
  return jours;
}

// ─── COMPOSANT ILLUSTRATION EMPTY STATE ───────────────────────────────────────
function EmptyStateIllustration() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="60" cy="60" r="50" fill="#F1F5F9" />
        <path d="M75 45H45C42.2386 45 40 47.2386 40 50V70C40 72.7614 42.2386 75 45 75H75C77.7614 75 80 72.7614 80 70V50C80 47.2386 77.7614 45 75 45Z" fill="white" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M48 55H72" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <path d="M48 62H72" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <path d="M48 69H60" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="35" r="15" fill="#3B82F6" />
        <path d="M80 35L83 38L90 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="text-lg font-medium text-slate-800 mb-2">Aucun contrat trouvé</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        Il n'y a pas de contrats correspondant à vos critères de recherche. Créez un nouveau contrat ou modifiez vos filtres.
      </p>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function RhContratsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres - ligne 1: search, ligne 2: filtres
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

  // Chargement initial
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Charger les contrats avec filtres
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
        
        // Charger les contrats expirants (30 jours)
        const expRes = await contractService.getExpiring();
        const expData = (expRes && (expRes as any).data) ? (expRes as any).data : (expRes as any).items || [];
        if (mounted) setExpiringSoon(Array.isArray(expData) ? expData : []);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || "Erreur lors du chargement des contrats";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Erreur chargement contrats:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [showArchives, filtreEtat, filtreType, filtreDepartement]);

  // Filtrer les contrats par recherche (client-side)
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const query = searchQuery.toLowerCase();
    return contracts.filter(c => {
      const employe = (c as any).employe;
      const employeName = employe ? `${employe.prenom || ""} ${employe.nom || ""}`.toLowerCase() : "";
      return (
        c.id?.toLowerCase().includes(query) ||
        c.reference?.toLowerCase().includes(query) ||
        employeName.includes(query) ||
        c.type?.toLowerCase().includes(query) ||
        ((c as any).fonction || "").toLowerCase().includes(query)
      );
    });
  }, [contracts, searchQuery]);

  // Pagination
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(start, start + itemsPerPage);
  }, [filteredContracts, currentPage]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  // Handlers
  const handleView = (id: string) => {
    router.push(`/rh/contrats/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/rh/contrats/${id}/modifier`);
  };

  const handleResilier = async (contrat: Contrat) => {
    const motif = prompt("Motif de résiliation (obligatoire) :");
    if (!motif || motif.trim().length < 5) {
      toast.error("Veuillez fournir un motif de résiliation (min. 5 caractères)");
      return;
    }
    
    if (!confirm(`Résilier le contrat ${contrat.reference || contrat.id} ?\n\nMotif : ${motif}\n\nCette action est irréversible.`)) return;
    
    try {
      await contractService.terminate(contrat.id, { motif: motif, date_fin: format(new Date(), "yyyy-MM-dd") });
      setContracts(prev => prev.map(c => c.id === contrat.id ? { ...c, statut: "RESILIE" as any, dateFin: format(new Date(), "yyyy-MM-dd") } : c));
      toast.success("Contrat résilié avec succès");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Échec de la résiliation";
      toast.error(errorMsg);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archiver ce contrat ? Il sera déplacé vers la corbeille et pourra être restauré.")) return;
    try {
      await contractService.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      toast.success("Contrat archivé avec succès");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Échec de l'archivage";
      toast.error(errorMsg);
    }
  };

  // Calculer les alertes par niveau (7, 15, 30 jours)
  const alertesExpiration = useMemo(() => {
    const alertes = { jours7: [] as Contrat[], jours15: [] as Contrat[], jours30: [] as Contrat[] };
    expiringSoon.forEach(c => {
      const jours = getJoursExpiration(c.dateFin);
      if (jours !== null && jours >= 0) {
        if (jours <= 7) alertes.jours7.push(c);
        else if (jours <= 15) alertes.jours15.push(c);
        else if (jours <= 30) alertes.jours30.push(c);
      }
    });
    return alertes;
  }, [expiringSoon]);

  // ─── RENDU ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Contrats" subtitle="Gestion des contrats de travail">
      <div className="space-y-6">
        
        {/* ─── ALERTES EXPIRATION ─────────────────────────────────────────────── */}
        {alertesExpiration.jours7.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-red-800">
                  {alertesExpiration.jours7.length} contrat{alertesExpiration.jours7.length > 1 ? "s" : ""} expire{alertesExpiration.jours7.length === 1 ? "" : "nt"} dans moins de 7 jours
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Action urgente requise : renouveler ou résilier immédiatement.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {alertesExpiration.jours15.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-orange-800">
                  {alertesExpiration.jours15.length} contrat{alertesExpiration.jours15.length > 1 ? "s" : ""} expire{alertesExpiration.jours15.length === 1 ? "" : "nt"} dans 8 à 15 jours
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Planifier le renouvellement ou la résiliation.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {alertesExpiration.jours30.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-amber-800">
                  {alertesExpiration.jours30.length} contrat{alertesExpiration.jours30.length > 1 ? "s" : ""} expire{alertesExpiration.jours30.length === 1 ? "" : "nt"} dans 16 à 30 jours
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Préparation recommandée pour les prochaines échéances.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── HEADER ───────────────────────────────────────────────────────── */}
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-blue-600" size={24} />
                Liste des contrats
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Gérez les contrats de travail, visualisez les échéances et accédez aux archives.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                size="md" 
                onClick={() => router.push("/rh/contrats/nouveau")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                icon={<Plus size={18} />}
              >
                Nouveau contrat
              </Button>
              <Button 
                size="md" 
                variant={showArchives ? "primary" : "outline"} 
                onClick={() => setShowArchives(!showArchives)}
                className="rounded-lg transition-all duration-200"
              >
                {showArchives ? "Masquer archives" : "Afficher archives"}
              </Button>
              <Button 
                size="md" 
                variant="ghost" 
                onClick={() => router.push("/rh/contrats/corbeille")}
                className="text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <Trash2 size={18} className="mr-2" />
                Corbeille
                {expiringSoon.length > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {expiringSoon.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* ─── FILTRES ──────────────────────────────────────────────────────── */}
          <div className="mt-6 space-y-4">
            {/* Ligne 1 : Search pleine largeur */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom d'employé, référence, type de contrat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Ligne 2 : Filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Tous les types</option>
                <option value="CDI">CDI - Contrat à durée indéterminée</option>
                <option value="CDD">CDD - Contrat à durée déterminée</option>
                <option value="STAGE">Stage</option>
                <option value="ALTERNANCE">Alternance</option>
                <option value="INTERIM">Intérim</option>
              </select>
              
              <select
                value={filtreEtat}
                onChange={(e) => setFiltreEtat(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Tous les états</option>
                <option value="ACTIF">Actif</option>
                <option value="EN_COURS">En cours</option>
                <option value="EXPIRE">Expiré</option>
                <option value="RESILIE">Résilié</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
              
              <select
                value={filtreDepartement}
                onChange={(e) => setFiltreDepartement(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Tous les départements</option>
                <option value="TECHNIQUE">Technique</option>
                <option value="RH">Ressources Humaines</option>
                <option value="FINANCE">Finance</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>
          </div>

          {/* ─── TABLEAU ──────────────────────────────────────────────────────── */}
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
              <div className="rounded-xl p-6 bg-red-50 border border-red-200 text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                <p className="text-red-700 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Réessayer
                </Button>
              </div>
            ) : filteredContracts.length === 0 ? (
              <EmptyStateIllustration />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employé</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Période</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">État</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Salaire</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedContracts.map((c) => {
                      const employe = (c as any).employe;
                      const joursRestants = getJoursExpiration(c.dateFin);
                      const isUrgent = joursRestants !== null && joursRestants <= 7;
                      
                      return (
                        <tr key={c.id} className={`hover:bg-slate-50 transition-colors duration-150 ${isUrgent ? "bg-red-50/50" : ""}`}>
                          {/* Employé avec avatar */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                {employe?.prenom?.[0] || employe?.nom?.[0] || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {employe ? `${employe.prenom || ""} ${employe.nom || ""}`.trim() : c.employeId || "Non attribué"}
                                </p>
                                <p className="text-xs text-slate-500">{c.reference || c.id}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Type */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(c.type)}`}>
                              {c.type || "-"}
                            </span>
                          </td>
                          
                          {/* Période */}
                          <td className="px-4 py-4">
                            <div className="text-slate-700">
                              {c.dateDebut ? (
                                <>
                                  <span className="font-medium">
                                    {format(new Date(c.dateDebut), "dd/MM/yyyy", { locale: fr })}
                                  </span>
                                  {c.dateFin && (
                                    <>
                                      {" → "}
                                      <span className={isUrgent ? "text-red-600 font-semibold" : ""}>
                                        {format(new Date(c.dateFin), "dd/MM/yyyy", { locale: fr })}
                                        {isUrgent && (
                                          <span className="ml-1 text-red-600 font-bold">
                                            ({joursRestants}j)
                                          </span>
                                        )}
                                      </span>
                                    </>
                                  )}
                                  {!c.dateFin && <span className="text-slate-400"> → ...</span>}
                                </>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </div>
                          </td>
                          
                          {/* État */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEtatBadgeColor(c.statut)}`}>
                              {c.statut || "-"}
                            </span>
                          </td>
                          
                          {/* Salaire */}
                          <td className="px-4 py-4">
                            <span className="font-medium text-slate-800">
                              {formatXAF((c as any).salaire || (c as any).salaireBase)}
                            </span>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleView(c.id)}
                                className="text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="Voir"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEdit(c.id)}
                                className="text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                title="Modifier"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleResilier(c)}
                                className="text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                                title="Résilier"
                              >
                                <XCircle size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleArchive(c.id)}
                                className="text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Archiver"
                              >
                                <Trash2 size={16} />
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

            {/* ─── PAGINATION ───────────────────────────────────────────────────── */}
            {!loading && !error && filteredContracts.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Affichage de <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredContracts.length)}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredContracts.length)}</span> sur <span className="font-medium">{filteredContracts.length}</span> contrats
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg transition-all duration-200"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm text-slate-600 px-2">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg transition-all duration-200"
                  >
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
