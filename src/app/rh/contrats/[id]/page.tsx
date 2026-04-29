"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowLeft, FileText, User, Calendar, DollarSign, 
  CheckCircle, AlertTriangle, Clock, Edit, Archive,
  Loader2, Download
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { contractService } from "@/lib/services";
import type { Contrat } from "@/types";
import toast from "react-hot-toast";

function formatXAF(value?: number) {
  if (!value && value !== 0) return "-";
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date?: string) {
  if (!date) return "-";
  try {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  } catch {
    return date;
  }
}

export default function ContratDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [contract, setContract] = useState<Contrat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const res = await contractService.getById(id);
        if (res.success) {
          setContract(res.data);
        } else {
          setError(res.message || "Erreur lors du chargement du contrat");
          toast.error(res.message || "Erreur lors du chargement");
        }
      } catch (err: any) {
        const msg = err?.message || "Erreur lors du chargement du contrat";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [id]);

  const handleArchive = async () => {
    if (!contract) return;
    if (!confirm("Archiver ce contrat ? Il sera déplacé vers la corbeille.")) return;
    
    try {
      setArchiving(true);
      const res = await contractService.delete(contract.id);
      if (res.success) {
        toast.success("Contrat archivé avec succès");
        router.push("/rh/contrats");
      } else {
        toast.error(res.message || "Erreur lors de l'archivage");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'archivage");
    } finally {
      setArchiving(false);
    }
  };

  const handleExport = () => {
    toast.success("Export PDF - Fonctionnalité à implémenter");
  };

  if (loading) {
    return (
      <DashboardLayout title="Détail du contrat">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-slate-600">Chargement...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout title="Détail du contrat">
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger mb-3" />
          <h3 className="text-lg font-semibold text-danger mb-2">Erreur</h3>
          <p className="text-slate-600 mb-4">{error || "Contrat non trouvé"}</p>
          <Button onClick={() => router.push("/rh/contrats")}>
            <ArrowLeft size={18} className="mr-2" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const employe = (contract as any).employe;
  const departement = (contract as any).departement;

  return (
    <DashboardLayout 
      title={`Contrat ${contract.reference || contract.id}`}
      subtitle="Visualisation détaillée du contrat"
    >
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => router.push("/rh/contrats")}>
            <ArrowLeft size={18} className="mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download size={18} className="mr-2" />
              Exporter PDF
            </Button>
            <Button variant="outline" onClick={() => router.push(`/rh/contrats/${id}/edit`)}>
              <Edit size={18} className="mr-2" />
              Modifier
            </Button>
            <Button 
              variant="danger" 
              onClick={handleArchive}
              loading={archiving}
            >
              <Archive size={18} className="mr-2" />
              Archiver
            </Button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Employé */}
          <Card className="p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <User size={18} className="text-primary-500" />
                Employé
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Nom complet</p>
                <p className="font-medium">
                  {employe ? `${employe.prenom || ''} ${employe.nom || ''}` : contract.employeId || '-'}
                </p>
              </div>
              {departement && (
                <div>
                  <p className="text-sm text-slate-500">Département</p>
                  <p className="font-medium">{departement.nom || departement}</p>
                </div>
              )}
              {(contract as any).poste && (
                <div>
                  <p className="text-sm text-slate-500">Poste</p>
                  <p className="font-medium">{(contract as any).poste}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Card Contrat */}
          <Card className="p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText size={18} className="text-primary-500" />
                Informations contrat
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Type</p>
                <p className="font-medium">{contract.type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Référence</p>
                <p className="font-medium">{contract.reference || contract.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Statut</p>
                <Badge 
                  variant={contract.statut?.toString() === 'ACTIF' ? 'green' : contract.statut?.toString() === 'EXPIRE' ? 'yellow' : 'gray'}
                >
                  {contract.statut}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Card Période & Salaire */}
          <Card className="p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar size={18} className="text-primary-500" />
                Période & Salaire
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Date de début</p>
                <p className="font-medium">{formatDate(contract.dateDebut)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date de fin</p>
                <p className="font-medium">{formatDate(contract.dateFin) || "CDI (pas de fin)"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Salaire</p>
                <p className="font-medium text-success">{formatXAF((contract as any).salaireBase)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline / Historique */}
        <Card className="p-5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={18} className="text-primary-500" />
              Historique
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                <CheckCircle size={16} className="text-success" />
              </div>
              <div>
                <p className="font-medium">Création du contrat</p>
                <p className="text-sm text-slate-500">{formatDate(contract.createdAt)}</p>
              </div>
            </div>
            {contract.dateFin && new Date(contract.dateFin) < new Date() && (
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10">
                  <AlertTriangle size={16} className="text-warning" />
                </div>
                <div>
                  <p className="font-medium">Contrat expiré</p>
                  <p className="text-sm text-slate-500">{formatDate(contract.dateFin)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Documents associés (placeholder) */}
        <Card className="p-5">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText size={18} className="text-primary-500" />
              Documents associés
            </CardTitle>
          </CardHeader>
          <div className="text-center py-8 text-slate-500">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p>Aucun document associé</p>
            <p className="text-sm mt-1">Fonctionnalité à implémenter</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
