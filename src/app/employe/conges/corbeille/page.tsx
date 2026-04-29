"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Eye, Trash2, CalendarDays, AlertTriangle, X
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  cn, formatDate, TYPE_CONGE_LABELS, nbJoursEntre,
} from "@/lib/utils";
import { employeeService, type CongeDetail } from "@/lib/services";
import toast from "react-hot-toast";

export default function EmployeCongesCorbeillePage() {
  const router = useRouter();
  
  const [congesAnnules, setCongesAnnules] = useState<CongeDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Modal détail
  const [showDetailModal, setShowDetailModal] = useState<CongeDetail | null>(null);

  // Chargement des congés annulés
  const loadCorbeille = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const response = await employeeService.getMesConges({ 
        annulees_seulement: true 
      });

      if (response.success) {
        setCongesAnnules(response.data);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Erreur chargement corbeille:", error);
      setIsError(true);
      toast.error("Impossible de charger la corbeille");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCorbeille();
  }, []);

  // Voir détail d'un congé (l'employé ne peut pas restaurer lui-même)
  const handleShowDetail = (conge: CongeDetail) => {
    setShowDetailModal(conge);
  };

  // Formater la date d'annulation (deleted_at)
  const formatDateAnnulation = (deletedAt?: string) => {
    if (!deletedAt) return "Date inconnue";
    return formatDate(deletedAt);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => router.push("/employe/conges")}
            className="mb-4"
          >
            Retour aux congés
          </Button>
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => router.push("/employe/conges")}
            className="mb-4"
          >
            Retour aux congés
          </Button>
          <div className="flex flex-col items-center justify-center py-20">
            <AlertTriangle className="text-danger mb-4" size={48} />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Erreur de chargement
            </h3>
            <Button onClick={loadCorbeille}>Réessayer</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => router.push("/employe/conges")}
          className="mb-4"
        >
          Retour aux congés
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trash2 className="text-slate-400" />
            Corbeille — Mes Congés
          </h1>
          <p className="text-slate-500 mt-1">
            Les demandes annulées peuvent être restaurées. Elles repasseront à l&apos;état &quot;brouillon&quot;.
          </p>
        </div>

        {/* Liste */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes annulées</CardTitle>
          </CardHeader>

          <div className="px-6 pb-6">
            {congesAnnules.length > 0 ? (
              <div className="space-y-3">
                {congesAnnules.map((conge) => (
                  <div
                    key={conge.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500 flex-shrink-0">
                      <Trash2 size={20} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800">
                          {TYPE_CONGE_LABELS[conge.type]}
                        </p>
                        <Badge variant="gray" size="sm">Annulée</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)} · {conge.nombreJours} jours
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Annulée le {formatDateAnnulation(conge.deleted_at)}
                      </p>
                    </div>

                    {/* Action */}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye size={16} />}
                      onClick={() => handleShowDetail(conge)}
                    >
                      Voir détail
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Trash2 className="text-slate-300" size={48} />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Votre corbeille est vide
                </h3>
                <p className="text-slate-500 mb-4">
                  Aucune demande de congé annulée
                </p>
                <Button
                  variant="outline"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => router.push("/employe/conges")}
                >
                  Retour aux congés
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal détail congé annulé */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Détail de la demande annulée</h2>
              <button 
                onClick={() => setShowDetailModal(null)} 
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-amber-800">
                    <strong>Information :</strong> Pour réactiver cette demande, contactez votre RH.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type :</span>
                  <span className="font-medium">{TYPE_CONGE_LABELS[showDetailModal.type] || showDetailModal.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Période :</span>
                  <span className="font-medium">{formatDate(showDetailModal.dateDebut)} → {formatDate(showDetailModal.dateFin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nombre de jours :</span>
                  <span className="font-medium">{showDetailModal.nombreJours} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date d'annulation :</span>
                  <span className="font-medium">{formatDateAnnulation(showDetailModal.deleted_at)}</span>
                </div>
                {showDetailModal.motif && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1">Motif :</span>
                    <span className="text-slate-700">{showDetailModal.motif}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailModal(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
