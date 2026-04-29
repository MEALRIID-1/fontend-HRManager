"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { contractService } from "@/lib/services";
import toast from "react-hot-toast";
import type { Contrat } from "@/types";

function formatXAF(value?: number) {
  if (!value && value !== 0) return "-";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF";
}

export default function RhContratsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres
  const [filtreEtat, setFiltreEtat] = useState<string>('');
  const [filtreType, setFiltreType] = useState<string>('');
  const [filtreDepartement, setFiltreDepartement] = useState<string>('');
  const [showArchives, setShowArchives] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Contrats expirants
  const [expiringSoon, setExpiringSoon] = useState<Contrat[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Charger les contrats avec filtres
        const filters: any = {};
        if (showArchives) filters.inclure_archives = true;
        if (filtreEtat) filters.etat = filtreEtat;
        if (filtreType) filters.type = filtreType;
        if (filtreDepartement) filters.departement = filtreDepartement;
        
        const res = await contractService.getAll(filters);
        const data = (res && (res as any).data) ? (res as any).data : (res as any).items || [];
        if (mounted) setContracts(Array.isArray(data) ? data : []);
        
        // Charger les contrats expirants
        const expRes = await contractService.getExpiring();
        const expData = (expRes && (expRes as any).data) ? (expRes as any).data : (expRes as any).items || [];
        if (mounted) setExpiringSoon(Array.isArray(expData) ? expData : []);
      } catch (err: any) {
        setError(err?.message || "Erreur lors du chargement des contrats");
        console.error("Erreur chargement contrats:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [showArchives, filtreEtat, filtreType, filtreDepartement]);

  // Filtrer les contrats par recherche
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const query = searchQuery.toLowerCase();
    return contracts.filter(c => {
      const employe = (c as any).employe;
      const employeName = employe ? `${employe.prenom || ''} ${employe.nom || ''}`.toLowerCase() : '';
      return (
        c.id?.toLowerCase().includes(query) ||
        c.reference?.toLowerCase().includes(query) ||
        employeName.includes(query) ||
        c.type?.toLowerCase().includes(query)
      );
    });
  }, [contracts, searchQuery]);

  const handleView = (id: string) => {
    router.push(`/rh/contrats/${id}`);
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archiver ce contrat ? Cette action est réversible depuis la corbeille.")) return;
    try {
      await contractService.delete(id);
      setContracts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contrat archivé");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Échec de l'archivage");
    }
  };

  return (
    <DashboardLayout title="Contrats" subtitle="Gestion des contrats RH">
      <div className="space-y-6">
        {/* Alerte contrats expirants */}
        {expiringSoon.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-amber-800">
                  {expiringSoon.length} contrat{expiringSoon.length > 1 ? 's' : ''} expire{expiringSoon.length === 1 ? '' : 'nt'} dans moins de 30 jours
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Action requise : renouveler ou résilier ces contrats avant expiration.
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="p-4">
          <CardHeader className="p-0 flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Contrats</CardTitle>
              <p className="text-sm text-slate-500">Liste des contrats actifs et archivés. Utilisez les filtres ci-dessous.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={() => router.push('/rh/contrats/nouveau')}>Nouveau contrat</Button>
              <Button size="sm" variant={showArchives ? "primary" : "ghost"} onClick={() => setShowArchives(!showArchives)}>
                {showArchives ? 'Masquer archives' : 'Afficher archives'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => router.push('/rh/contrats/corbeille')}>Corbeille 🗑️</Button>
            </div>
          </CardHeader>

          {/* Filtres */}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les types</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="STAGE">Stage</option>
              </select>
              <select
                value={filtreEtat}
                onChange={(e) => setFiltreEtat(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les états</option>
                <option value="ACTIF">Actif</option>
                <option value="EN_COURS">En cours</option>
                <option value="EXPIRE">Expiré</option>
                <option value="RESILIE">Résilié</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
              </div>
            ) : error ? (
              <div className="rounded p-4 bg-red-50 text-red-700">{error}</div>
            ) : filteredContracts.length === 0 ? (
              <div className="rounded p-6 text-center border border-dashed border-slate-200">
                <p className="text-slate-600">
                  {searchQuery ? 'Aucun contrat ne correspond à votre recherche.' : 'Aucun contrat trouvé.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500">
                      <th className="px-3 py-2">Référence</th>
                      <th className="px-3 py-2">Employé</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Période</th>
                      <th className="px-3 py-2">État</th>
                      <th className="px-3 py-2">Salaire</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="px-3 py-3">{c.reference || c.id}</td>
                        <td className="px-3 py-3">{(c as any).employe ? `${(c as any).employe.prenom || ''} ${(c as any).employe.nom || ''}` : c.employeId || '-'}</td>
                        <td className="px-3 py-3">{c.type || '-'}</td>
                        <td className="px-3 py-3">{c.dateDebut ? `${format(new Date(c.dateDebut), 'dd/MM/yyyy')} – ${c.dateFin ? format(new Date(c.dateFin), 'dd/MM/yyyy') : '...'}` : '-'}</td>
                        <td className="px-3 py-3">
                          <Badge variant={(c.statut === 'SIGNE' || c.statut === 'EN_COURS') ? 'green' : c.statut === 'EXPIRE' ? 'yellow' : 'gray'}>
                            {c.statut}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">{formatXAF((c as any).salaireBase)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => handleView(c.id)}>Voir</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleArchive(c.id)}>Archiver</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
