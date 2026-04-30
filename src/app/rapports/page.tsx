"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Download, FileText, TrendingUp, Users, CalendarDays, FileBarChart2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Select, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { rapportService } from "@/lib/services";
import toast from "react-hot-toast";

const RAPPORTS_DISPONIBLES = [
  { id: "effectifs",    icon: <Users size={20} />,      label: "Rapport Effectifs",    desc: "Entrées, sorties, évolution mensuelle",      color: "text-primary-600 bg-primary-50" },
  { id: "conges",       icon: <CalendarDays size={20} />, label: "Rapport Congés",    desc: "Statistiques par type, département, période", color: "text-emerald-600 bg-emerald-50" },
  { id: "contrats",     icon: <FileText size={20} />,   label: "Rapport Contrats",    desc: "État des contrats, expirations à venir",       color: "text-amber-600 bg-amber-50" },
  { id: "absenteisme",  icon: <TrendingUp size={20} />, label: "Rapport Absentéisme", desc: "Taux et tendances d'absentéisme",               color: "text-red-500 bg-red-50" },
];

type Period = "6m" | "1y" | "ytd";

interface EvolutionData {
  name: string;
  employes: number;
  embauches: number;
  departs: number;
}

interface CongeTypeData {
  name: string;
  value: number;
  color: string;
}

interface AbsenteismeData {
  mois: string;
  taux: number;
}

interface ContratTypeData {
  type: string;
  count: number;
}

export default function RapportsPage() {
  const [period, setPeriod] = useState<Period>("6m");
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [congesData, setCongesData] = useState<CongeTypeData[]>([]);
  const [absenteismeData, setAbsenteismeData] = useState<AbsenteismeData[]>([]);
  const [contratsData, setContratsData] = useState<ContratTypeData[]>([]);
  const [kpis, setKpis] = useState({
    retention: "94.6%",
    turnover: "5.4%",
    joursConges: "14.2",
    tauxAbsentéisme: "3.3%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRapports = async () => {
      try {
        setLoading(true);
        const response = await rapportService.getChartData();
        if (response.success && response.data) {
          setEvolutionData(response.data.evolution || []);
          setCongesData(response.data.departments?.map((d: any) => ({ name: d.name, value: d.value, color: d.color })) || []);
        }
        // TODO: Ajouter les endpoints pour absenteisme et contrats par type
      } catch (error) {
        console.error("Erreur chargement rapports:", error);
        toast.error("Erreur lors du chargement des rapports");
      } finally {
        setLoading(false);
      }
    };
    loadRapports();
  }, [period]);

  return (
    <DashboardLayout
      title="Rapports"
      subtitle="Analyse et indicateurs RH"
      actions={
        <Button icon={<Download size={16} />} variant="outline">
          Exporter tout
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Period selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted font-medium">Période :</span>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {(["6m","1y","ytd"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg font-medium transition-all",
                  period === p
                    ? "bg-primary-600 text-white shadow-blue"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {{ "6m": "6 mois", "1y": "1 an", "ytd": "Depuis janv." }[p]}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="text-center p-4">
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </Card>
            ))
          ) : (
            [
              { label: "Taux de rétention",     value: kpis.retention,  change: "+1.2%",  up: true },
              { label: "Turnover annuel",        value: kpis.turnover,   change: "-0.8%",  up: false },
              { label: "Jours congés / employé", value: kpis.joursConges, change: "+0.5",   up: true },
              { label: "Taux d'absentéisme",     value: kpis.tauxAbsentéisme, change: "-0.2%",  up: false },
            ].map((kpi) => (
              <Card key={kpi.label} className="text-center">
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                <p className="text-xs text-muted mt-1">{kpi.label}</p>
                <p className={cn(
                  "text-xs font-medium mt-1",
                  kpi.up ? "text-emerald-600" : "text-red-500"
                )}>
                  {kpi.change} vs. mois préc.
                </p>
              </Card>
            ))
          )}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Évolution effectifs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution des effectifs</CardTitle>
              <Button variant="outline" size="xs" icon={<Download size={12} />}>CSV</Button>
            </CardHeader>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[120, 160]} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </Card>

          {/* Congés par type */}
          <Card>
            <CardHeader>
              <CardTitle>Congés par type</CardTitle>
            </CardHeader>
            {loading ? (
              <Skeleton className="h-[160px] w-full" />
            ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={congesData} cx="50%" cy="50%" outerRadius={70} innerRadius={45} paddingAngle={3} dataKey="value">
                  {congesData.map((entry, i) => (
                    <Cell key={i} fill={entry.color || "#3b82f6"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            )}
            <div className="space-y-1.5 mt-2">
              {congesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Taux absentéisme */}
          <Card>
            <CardHeader>
              <CardTitle>Taux d'absentéisme (%)</CardTitle>
              <Button variant="outline" size="xs" icon={<Download size={12} />}>Export</Button>
            </CardHeader>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={absenteismeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 6]} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Taux"]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="taux" name="Absentéisme" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </Card>

          {/* Contrats par type */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des contrats</CardTitle>
            </CardHeader>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contratsData} barSize={32} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="count" name="Nombre" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Available reports */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports disponibles</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RAPPORTS_DISPONIBLES.map((rapport) => (
              <div key={rapport.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer group">
                <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl", rapport.color)}>
                  {rapport.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-primary-700 transition-colors">
                    {rapport.label}
                  </p>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{rapport.desc}</p>
                  <div className="flex gap-1.5 mt-2">
                    <button className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-0.5">
                      <FileBarChart2 size={11} /> PDF
                    </button>
                    <span className="text-slate-200">|</span>
                    <button className="text-xs text-primary-600 hover:underline font-medium">Excel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
