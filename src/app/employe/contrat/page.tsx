"use client";

import { useEffect, useState } from "react";
import { Briefcase, Calendar, DollarSign, FileText, AlertTriangle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import {
  cn, formatDate, formatCurrency, nbJoursEntre,
  TYPE_CONTRAT_LABELS, getStatutContratVariant,
} from "@/lib/utils";
import { employeeService } from "@/lib/services";
import type { Contrat } from "@/types";
import toast from "react-hot-toast";

// Types
interface ContratActifData {
  id: string;
  type: string;
  etat: string;
  date_debut: string;
  date_fin?: string;
  salaire_base: number;
}

export default function EmployeContratPage() {
  const [contratActif, setContratActif] = useState<ContratActifData | null>(null);
  const [contratsHistorique, setContratsHistorique] = useState<Contrat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Chargement des données
  useEffect(() => {
    const loadContrats = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Appels parallèles
        const [actifRes, historiqueRes] = await Promise.all([
          employeeService.getContratActif().catch(() => null),
          employeeService.getMesContrats().catch(() => null),
        ]);

        if (actifRes?.success) {
          setContratActif(actifRes.data);
        }

        if (historiqueRes?.success) {
          setContratsHistorique(historiqueRes.data?.data || []);
          setTotalPages(historiqueRes.data?.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Erreur chargement contrats:", error);
        setIsError(true);
        toast.error("Impossible de charger vos contrats");
      } finally {
        setIsLoading(false);
      }
    };

    loadContrats();
  }, [currentPage]);

  // Calculer la durée restante
  const getDureeRestante = () => {
    if (!contratActif?.date_fin) return { text: "Illimité", jours: Infinity };
    const joursRestants = nbJoursEntre(new Date().toISOString(), contratActif.date_fin);
    if (joursRestants > 365) {
      return { text: `${Math.floor(joursRestants / 365)} ans`, jours: joursRestants };
    }
    if (joursRestants > 30) {
      return { text: `${Math.floor(joursRestants / 30)} mois`, jours: joursRestants };
    }
    return { text: `${joursRestants} jours`, jours: joursRestants };
  };

  // Vérifier si expiration imminente (< 30 jours)
  const isExpiringSoon = () => {
    const duree = getDureeRestante();
    return duree.jours <= 30 && duree.jours !== Infinity;
  };

  // Déterminer le statut avec couleur
  const getStatutDisplay = () => {
    if (!contratActif) return { label: "Aucun contrat", variant: "gray" as const };
    
    switch (contratActif.etat.toLowerCase()) {
      case "actif":
      case "en_cours":
        return { label: "Actif", variant: "green" as const };
      case "periode_essai":
        return { label: "Période d'essai", variant: "yellow" as const };
      case "suspendu":
        return { label: "Suspendu", variant: "red" as const };
      default:
        return { label: contratActif.etat, variant: "gray" as const };
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mon Contrat">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="h-64 animate-pulse bg-slate-100" />
          <Card className="h-80 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Mon Contrat">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Erreur de chargement
          </h3>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statut = getStatutDisplay();
  const duree = getDureeRestante();

  return (
    <DashboardLayout title="Mon Contrat" subtitle="Votre contrat de travail et historique">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Alerte expiration */}
        {isExpiringSoon() && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-warning flex-shrink-0" size={24} />
            <div>
              <p className="font-medium text-warning-dark">
                Votre contrat expire bientôt
              </p>
              <p className="text-sm text-warning-dark/80">
                Il reste {duree.text}. Contactez rapidement la RH pour le renouvellement.
              </p>
            </div>
          </div>
        )}

        {/* Contrat actif */}
        <Card className={cn(isExpiringSoon() && "border-warning/30")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Briefcase className="text-primary-600" size={24} />
                </div>
                <div>
                  <CardTitle>Contrat actif</CardTitle>
                  <p className="text-sm text-slate-500">
                    Réf: {contratActif?.id || "N/A"}
                  </p>
                </div>
              </div>
              <Badge variant={statut.variant} size="md">
                {statut.label}
              </Badge>
            </div>
          </CardHeader>

          <div className="px-6 pb-6">
            {contratActif ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <FileText size={16} />
                    <span className="text-sm">Type de contrat</span>
                  </div>
                  <p className="font-semibold text-lg">
                    {TYPE_CONTRAT_LABELS[contratActif.type as keyof typeof TYPE_CONTRAT_LABELS] || contratActif.type}
                  </p>
                </div>

                {/* Période */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={16} />
                    <span className="text-sm">Période</span>
                  </div>
                  <p className="font-medium">
                    {formatDate(contratActif.date_debut)}
                  </p>
                  <p className="text-sm text-slate-500">
                    → {contratActif.date_fin ? formatDate(contratActif.date_fin) : "Illimité"}
                  </p>
                </div>

                {/* Durée restante */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={16} />
                    <span className="text-sm">Durée restante</span>
                  </div>
                  <p className={cn(
                    "font-semibold text-lg",
                    isExpiringSoon() ? "text-warning" : "text-slate-800"
                  )}>
                    {duree.text}
                  </p>
                </div>

                {/* Salaire */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <DollarSign size={16} />
                    <span className="text-sm">Salaire de base</span>
                  </div>
                  <p className="font-semibold text-lg text-slate-800">
                    {formatCurrency(contratActif.salaire_base)}
                  </p>
                  <p className="text-xs text-slate-400">brut annuel</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Aucun contrat actif trouvé</p>
                <p className="text-sm text-slate-400 mt-1">
                  Contactez la RH pour plus d'informations
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Historique des contrats */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des contrats</CardTitle>
          </CardHeader>

          <div className="px-6 pb-6">
            {contratsHistorique.length > 0 ? (
              <div className="space-y-3">
                {contratsHistorique.map((contrat) => (
                  <div
                    key={contrat.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
                      contrat.statut === "EN_COURS" ? "bg-emerald-100 text-emerald-600" :
                      contrat.statut === "EXPIRE" ? "bg-slate-100 text-slate-600" :
                      contrat.statut === "RESILIE" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      <FileText size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-800">
                          {TYPE_CONTRAT_LABELS[contrat.type]}
                        </p>
                        <Badge 
                          variant={getStatutContratVariant(contrat.statut)} 
                          size="sm"
                        >
                          {contrat.statut === "EN_COURS" ? "Actif" : contrat.statut}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(contrat.dateDebut)}
                        {contrat.dateFin && ` → ${formatDate(contrat.dateFin)}`}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-slate-800">
                        {formatCurrency(contrat.salaireBase)}
                      </p>
                      <p className="text-xs text-slate-400">salaire de base</p>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ChevronLeft size={16} />}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-slate-500">
                      Page {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      iconRight={<ChevronRight size={16} />}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Aucun historique de contrat</p>
              </div>
            )}
          </div>
        </Card>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded-lg flex-shrink-0">
            <FileText className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-blue-800">
              Gestion des contrats
            </p>
            <p className="text-sm text-blue-700/80 mt-1">
              La création, modification et résiliation des contrats sont gérées exclusivement par le service RH. 
              Pour toute question concernant votre contrat, veuillez contacter votre responsable RH.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
