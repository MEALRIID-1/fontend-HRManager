"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus, Search, CheckCircle, XCircle, Clock,
  ChevronRight, Filter, ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Avatar, Button, Input, Select, EmptyState, Skeleton } from "@/components/ui";
import {
  formatDate, STATUT_CONGE_LABELS, TYPE_CONGE_LABELS,
  getStatutCongeVariant, getNiveauWorkflowLabel, cn,
} from "@/lib/utils";
import { rhCongeService } from "@/lib/services";
import type { DemandeConge, StatutConge, TypeConge } from "@/types";

// ── Workflow badge ─────────────────────────────────────────────────────────────
function WorkflowProgress({ workflow }: { workflow: DemandeConge["workflow"] }) {
  return (
    <div className="flex items-center gap-1">
      {workflow.etapes.map((etape, i) => (
        <React.Fragment key={etape.niveau}>
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border-2 transition-all",
              etape.statut === "APPROUVE"   && "bg-emerald-500 border-emerald-500 text-white",
              etape.statut === "REFUSE"     && "bg-red-400 border-red-400 text-white",
              etape.statut === "EN_ATTENTE" && "bg-white border-amber-400 text-amber-600",
              etape.statut === "SKIPPED"    && "bg-slate-100 border-slate-200 text-slate-300",
            )}
            title={`${getNiveauWorkflowLabel(etape.niveau)} — ${etape.statut}${etape.commentaire ? `: ${etape.commentaire}` : ""}`}
          >
            {etape.statut === "APPROUVE"   && <CheckCircle size={12} />}
            {etape.statut === "REFUSE"     && <XCircle     size={12} />}
            {etape.statut === "EN_ATTENTE" && etape.niveau}
            {etape.statut === "SKIPPED"    && "–"}
          </div>
          {i < workflow.etapes.length - 1 && (
            <div className={cn(
              "h-0.5 w-4 rounded-full",
              workflow.etapes[i + 1]?.statut === "APPROUVE" ? "bg-emerald-400" : "bg-slate-200"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CongesPage() {
  const router = useRouter();
  const [conges, setConges] = useState<DemandeConge[]>([]);
  const [filtered, setFiltered] = useState<DemandeConge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [refusMotif, setRefusMotif] = useState<Record<string, string>>({});
  const [expandedRefus, setExpandedRefus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadConges = async () => {
      try {
        const response = await rhCongeService.getAll();
        setConges(response.data?.data || []);
      } catch (error) {
        console.error("Erreur chargement congés :", error);
        setConges([]);
      } finally {
        setLoading(false);
      }
    };
    loadConges();
  }, []);

  useEffect(() => {
    let res = conges;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        (c) =>
          c.employe?.nom.toLowerCase().includes(q) ||
          c.employe?.prenom.toLowerCase().includes(q)
      );
    }
    if (statutFilter) res = res.filter((c) => c.statut === statutFilter);
    if (typeFilter)   res = res.filter((c) => c.type   === typeFilter);
    setFiltered(res);
  }, [conges, search, statutFilter, typeFilter]);

  const pendingCount = conges.filter((c) => c.statut.startsWith("EN_ATTENTE")).length;

  return (
    <DashboardLayout
      title="Congés"
      subtitle="Gestion des demandes et workflow de validation"
      actions={
        <Button icon={<CalendarPlus size={16} />} onClick={() => router.push("/conges/nouveau")}>
          Nouvelle demande
        </Button>
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "En attente", value: conges.filter(c => c.statut.startsWith("EN_ATTENTE")).length, color: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock size={18}/> },
          { label: "Approuvés", value: conges.filter(c => c.statut === "APPROUVE_N3").length, color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle size={18}/> },
          { label: "Refusés",   value: conges.filter(c => c.statut.includes("REFUSE")).length,   color: "bg-red-50 text-red-700 border-red-100",     icon: <XCircle size={18}/> },
          { label: "Total",     value: conges.length, color: "bg-primary-50 text-primary-700 border-primary-100", icon: <Filter size={18}/> },
        ].map((s) => (
          <div key={s.label} className={cn("flex items-center gap-3 rounded-2xl border p-4 bg-white shadow-card")}>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", s.color)}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher un employé…"
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-52">
            <Select
              options={Object.entries(STATUT_CONGE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Tous les statuts"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              options={Object.entries(TYPE_CONGE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Tous les types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          : filtered.length === 0
          ? (
            <Card>
              <EmptyState
                icon={<Search size={24} />}
                title="Aucune demande trouvée"
                description="Aucune demande ne correspond à vos critères"
              />
            </Card>
          )
          : filtered.map((conge) => (
            <div
              key={conge.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-card-md transition-all"
            >
              <div className="flex items-start gap-4">
                <Avatar nom={conge.employe?.nom} prenom={conge.employe?.prenom} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {conge.employe?.prenom} {conge.employe?.nom}
                      </p>
                      <p className="text-sm text-muted mt-0.5">{conge.motif}</p>
                    </div>
                    <Badge variant={getStatutCongeVariant(conge.statut)} size="sm" dot>
                      {STATUT_CONGE_LABELS[conge.statut]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span className="text-xs font-medium text-muted uppercase">{TYPE_CONGE_LABELS[conge.type]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span>{formatDate(conge.dateDebut)}</span>
                      <ArrowRight size={13} className="text-slate-300" />
                      <span>{formatDate(conge.dateFin)}</span>
                      <span className="text-xs text-muted">({conge.nombreJours} j)</span>
                    </div>

                    {/* Workflow progress */}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-muted">Workflow :</span>
                      <WorkflowProgress workflow={conge.workflow} />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle accept logic here
                          console.log('Accept', conge.id);
                        }}
                      >
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRefus(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(conge.id)) {
                              newSet.delete(conge.id);
                            } else {
                              newSet.add(conge.id);
                            }
                            return newSet;
                          });
                        }}
                      >
                        Refuser
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refus motif section */}
              {expandedRefus.has(conge.id) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    MOTIF DE REFUS REQUIS
                  </label>
                  <textarea
                    className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={3}
                    placeholder="Veuillez indiquer le motif du refus..."
                    value={refusMotif[conge.id] || ''}
                    onChange={(e) => setRefusMotif(prev => ({ ...prev, [conge.id]: e.target.value }))}
                  />
                  <div className="flex justify-center mt-3">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle refus submit logic here
                        console.log('Refus motif:', refusMotif[conge.id]);
                        setExpandedRefus(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(conge.id);
                          return newSet;
                        });
                      }}
                    >
                      Confirmer le refus définitif
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </DashboardLayout>
  );
}
