"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Archive, AlertTriangle, ChevronLeft, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { contractService } from "@/lib/services";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  photo_url?: string;
}

interface ContratArchive {
  id: string;
  employe?: Employe;
  type: string;
  date_debut: string;
  date_fin: string | null;
  etat: string;
  etat_avant_archivage?: string;
  salaire: number;
  date_archivage: string;
  is_archived: boolean;
}

function formatXAF(value?: number) {
  if (!value && value !== 0) return "-";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " XAF";
}

function getEtatLabel(etat: string): string {
  const labels: Record<string, string> = {
    'en_cours': 'En cours',
    'periode_essai': 'Période d\'essai',
    'suspendu': 'Suspendu',
    'termine': 'Terminé',
    'archive': 'Archivé',
  };
  return labels[etat] || etat;
}

export default function CorbeilleContratsPage() {
  const router = useRouter();
  const [contrats, setContrats] = useState<ContratArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedContrat, setSelectedContrat] = useState<ContratArchive | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCorbeille = async () => {
    setLoading(true);
    try {
      const res = await contractService.getTrashed();
      if (res.success) {
        const data = (res.data as any)?.data || [];
        setContrats(data);
      } else {
        throw new Error((res as any).message || "Erreur chargement");
      }
    } catch (err: any) {
      toast.error(err?.message || "Impossible de charger la corbeille");
      console.error("Erreur chargement corbeille:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorbeille();
  }, []);

  const handleRestoreClick = (contrat: ContratArchive) => {
    setSelectedContrat(contrat);
    setShowModal(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedContrat) return;
    
    setRestoringId(selectedContrat.id);
    try {
      const res = await contractService.restore(selectedContrat.id);
      if (res.success) {
        toast.success(
          `Contrat de ${selectedContrat.employe?.prenom || ''} ${selectedContrat.employe?.nom || ''} restauré avec succès`
        );
        setShowModal(false);
        setSelectedContrat(null);
        fetchCorbeille();
      } else {
        throw new Error((res as any).message || "Erreur de restauration");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Échec de la restauration");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <DashboardLayout title="Corbeille — Contrats" subtitle="Gestion des contrats archivés">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Archive className="text-slate-500" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Corbeille — Contrats</h1>
              <p className="text-sm text-slate-500">
                {contrats.length} contrat{contrats.length > 1 ? 's' : ''} archivé{contrats.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push('/rh/contrats')}>
            <ChevronLeft size={16} className="mr-1" />
            Retour aux contrats
          </Button>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    État à l&apos;archivage
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Salaire
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Archivé le
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Chargement...
                      </div>
                    </td>
                  </tr>
                ) : contrats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Archive size={40} className="text-slate-300" />
                        <p>Aucun contrat archivé</p>
                        <p className="text-xs text-slate-400">La corbeille est vide</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contrats.map((contrat) => (
                    <tr key={contrat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            nom={contrat.employe?.nom} 
                            prenom={contrat.employe?.prenom} 
                            size="sm" 
                          />
                          <div>
                            <p className="font-medium text-slate-800">
                              {contrat.employe?.prenom} {contrat.employe?.nom}
                            </p>
                            <p className="text-xs text-slate-500">{contrat.employe?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="blue">{contrat.type?.toUpperCase()}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {contrat.date_debut ? format(new Date(contrat.date_debut), 'dd/MM/yyyy', { locale: fr }) : '-'} 
                        {' — '}
                        {contrat.date_fin 
                          ? format(new Date(contrat.date_fin), 'dd/MM/yyyy', { locale: fr }) 
                          : '...'
                        }
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="gray">
                            {getEtatLabel(contrat.etat_avant_archivage || contrat.etat)}
                          </Badge>
                          <Badge variant="red" size="sm">Archivé</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {formatXAF(contrat.salaire)}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {contrat.date_archivage 
                          ? format(new Date(contrat.date_archivage), 'dd/MM/yyyy HH:mm', { locale: fr })
                          : '-'
                        }
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreClick(contrat)}
                          disabled={restoringId === contrat.id}
                          icon={restoringId === contrat.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        >
                          {restoringId === contrat.id ? 'Restauration...' : 'Restaurer'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info card */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">À propos de la corbeille</p>
          <p className="text-blue-700">
            Les contrats archivés conservent leur état original. Lors de la restauration, 
            le contrat retrouve automatiquement son état précédent (En cours, Période d&apos;essai, etc.).
          </p>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showModal && selectedContrat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Confirmer la restauration
            </h3>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Restaurer ce contrat ?
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Le contrat de <strong>{selectedContrat.employe?.prenom} {selectedContrat.employe?.nom}</strong> sera
                  restauré avec l&apos;état <strong>&quot;{getEtatLabel(selectedContrat.etat_avant_archivage || selectedContrat.etat)}&quot;</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => { setShowModal(false); setSelectedContrat(null); }}
                disabled={!!restoringId}
              >
                Annuler
              </Button>
              <Button
                loading={!!restoringId}
                disabled={!!restoringId}
                icon={<RotateCcw size={14} />}
                onClick={handleRestoreConfirm}
              >
                Confirmer la restauration
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
