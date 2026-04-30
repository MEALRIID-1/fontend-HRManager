"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, User, Mail, Phone, Building2, Briefcase,
  CalendarDays, CheckCircle, XCircle, Clock, UserCheck
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import type { Employe } from "@/types";
import toast from "react-hot-toast";
import { managerService } from "@/lib/services";

interface CongeHistorique {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  statut: string;
}

interface EmployeDetail {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  telephone?: string;
  genre?: string;
  statut: string;
  dateEmbauche?: string;
  dateNaissance?: string;
  nationalite?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
  departementId?: string;
  posteId?: string;
  typeContrat?: string;
  contratActif?: {
    type: string;
    dateDebut: string;
    dateFin?: string;
    etat: string;
  } | null;
  conges?: CongeHistorique[];
  presentAujourdhui?: boolean;
}

export default function ManagerEmployeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeId = params.id as string;

  const [employe, setEmploye] = useState<EmployeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Chargement des données employé
  const loadEmploye = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const res = await managerService.getMembreDetail(employeId);

      if (res.success) {
        const data = res.data;
        // Mapping API → EmployeDetail
        const membre: EmployeDetail = {
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          matricule: data.matricule || '',
          telephone: data.telephone,
          statut: data.statut,
          dateEmbauche: (data as any).date_embauche,
          dateNaissance: (data as any).date_naissance,
          departementId: data.departement?.id || '',
          typeContrat: (data as any).contrat_actif?.type,
          presentAujourdhui: data.statut === 'ACTIF',
          contratActif: (data as any).contrat_actif ? {
            type: (data as any).contrat_actif.type,
            dateDebut: (data as any).contrat_actif.date_debut,
            dateFin: (data as any).contrat_actif.date_fin,
            etat: (data as any).contrat_actif.etat,
          } : undefined,
          conges: ((data as any).conges || []).map((c: any) => ({
            id: c.id,
            type: c.type,
            dateDebut: c.date_debut,
            dateFin: c.date_fin,
            nombreJours: c.nombre_jours,
            statut: c.statut,
          })),
        };
        setEmploye(membre);
      } else {
        throw new Error('Erreur lors du chargement des données');
      }
    } catch (error: any) {
      console.error("Erreur chargement employé:", error);
      setIsError(true);
      toast.error(error?.message || "Impossible de charger les données de l'employé");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeId) {
      loadEmploye();
    }
  }, [employeId]);

  if (isLoading) {
    return (
      <DashboardLayout title="Détail Employé">
        <div className="space-y-4">
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <Card className="h-96 animate-pulse bg-slate-100" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !employe) {
    return (
      <DashboardLayout title="Détail Employé">
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="text-danger mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Erreur de chargement</h3>
          <p className="text-slate-500 mb-4">Impossible de charger les données de l&apos;employé</p>
          <div className="flex gap-2">
            <Button onClick={loadEmploye}>Réessayer</Button>
            <Button variant="outline" onClick={() => router.push("/manager/equipe")}>
              Retour à l&apos;équipe
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`${employe.prenom} ${employe.nom}`}
      subtitle={`Matricule: ${employe.matricule}`}
    >
      <div className="space-y-6">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/manager/equipe")}
          className="text-slate-500"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour à l&apos;équipe
        </Button>

        {/* En-tête avec photo et présence */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Avatar 
              nom={employe.nom} 
              prenom={employe.prenom} 
              size="lg"
              className="w-20 h-20 text-2xl"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-800">
                  {employe.prenom} {employe.nom}
                </h1>
                {employe.presentAujourdhui ? (
                  <Badge variant="green" size="sm">
                    <UserCheck size={12} className="mr-1" />
                    Présent aujourd&apos;hui
                  </Badge>
                ) : (
                  <Badge variant="red" size="sm">
                    <Clock size={12} className="mr-1" />
                    Absent aujourd&apos;hui
                  </Badge>
                )}
              </div>
              <p className="text-slate-500">{employe.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={employe.statut === "ACTIF" ? "green" : "gray"}>
                  {employe.statut}
                </Badge>
                {employe.typeContrat && (
                  <Badge variant="blue">{employe.typeContrat}</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Informations personnelles */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User size={20} className="text-primary-500" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Email professionnel</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  {employe.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Téléphone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  {employe.telephone || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date de naissance</p>
                <p className="font-medium">
                  {employe.dateNaissance ? formatDate(employe.dateNaissance) : "Non renseignée"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Adresse</p>
                <p className="font-medium flex items-start gap-2">
                  <Building2 size={14} className="text-slate-400 mt-1" />
                  {employe.adresse?.rue && (
                    <span>
                      {employe.adresse.rue}<br />
                      {employe.adresse.codePostal} {employe.adresse.ville}<br />
                      {employe.adresse.pays}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Nationalité</p>
                <p className="font-medium">{employe.nationalite || "Non renseignée"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contrat actif - sans salaire */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase size={20} className="text-primary-500" />
              Contrat actif
            </CardTitle>
          </CardHeader>
          
          {employe.contratActif ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Type de contrat</span>
                <Badge variant={employe.contratActif.type === "CDI" ? "green" : "blue"}>
                  {employe.contratActif.type}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Date de début</span>
                <span className="font-medium">{formatDate(employe.contratActif.dateDebut)}</span>
              </div>
              {employe.contratActif.dateFin && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Date de fin</span>
                  <span className="font-medium">{formatDate(employe.contratActif.dateFin)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500">État</span>
                <Badge variant={employe.contratActif.etat === "ACTIF" ? "green" : "yellow"}>
                  {employe.contratActif.etat}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic">Aucun contrat actif</p>
          )}
        </Card>

        {/* Historique des congés */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays size={20} className="text-primary-500" />
              Historique des congés
            </CardTitle>
          </CardHeader>
          
          {employe.conges && employe.conges.length > 0 ? (
            <div className="space-y-3">
              {employe.conges.map((conge) => (
                <div 
                  key={conge.id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      conge.statut === "APPROUVE" ? "bg-green-100" :
                      conge.statut === "EN_ATTENTE" ? "bg-yellow-100" :
                      conge.statut === "REFUSE" ? "bg-red-100" : "bg-slate-100"
                    )}>
                      <CalendarDays size={18} className={cn(
                        conge.statut === "APPROUVE" ? "text-green-600" :
                        conge.statut === "EN_ATTENTE" ? "text-yellow-600" :
                        conge.statut === "REFUSE" ? "text-red-600" : "text-slate-600"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{conge.type}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)} ({conge.nombreJours} jours)
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      conge.statut === "APPROUVE" ? "green" :
                      conge.statut === "EN_ATTENTE" ? "yellow" :
                      conge.statut === "REFUSE" ? "red" : "gray"
                    }
                    size="sm"
                  >
                    {conge.statut}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">Aucun congé enregistré</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
