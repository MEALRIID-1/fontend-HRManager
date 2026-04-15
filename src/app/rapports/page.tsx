"use client";
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Download, FileText, TrendingUp, Users, CalendarDays, FileBarChart2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Button, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

// ── Mock data ─────────────────────────────────────────────────────────────────
const EVOLUTION_EFFECTIFS = [
  { mois: "Jan", total: 130, entrees: 5, sorties: 2 },
  { mois: "Fév", total: 133, entrees: 4, sorties: 1 },
  { mois: "Mar", total: 136, entrees: 5, sorties: 2 },
  { mois: "Avr", total: 138, entrees: 3, sorties: 1 },
  { mois: "Mai", total: 141, entrees: 4, sorties: 1 },
  { mois: "Jun", total: 148, entrees: 8, sorties: 1 },
];

const CONGES_PAR_TYPE = [
  { name: "Annuel",       value: 68, color: "#3b82f6" },
  { name: "Maladie",      value: 24, color: "#10b981" },
  { name: "Exceptionnel", value: 12, color: "#f59e0b" },
  { name: "Formation",    value: 8,  color: "#8b5cf6" },
  { name: "Sans solde",   value: 4,  color: "#94a3b8" },
];

const ABSENTEISME = [
  { mois: "Jan", taux: 3.2 },
  { mois: "Fév", taux: 2.8 },
  { mois: "Mar", taux: 4.1 },
  { mois: "Avr", taux: 3.5 },
  { mois: "Mai", taux: 2.9 },
  { mois: "Jun", taux: 3.1 },
];

const CONTRATS_PAR_TYPE = [
  { type: "CDI", count: 98 },
  { type: "CDD", count: 32 },
  { type: "Stage", count: 12 },
  { type: "Freelance", count: 4 },
  { type: "Apprentissage", count: 2 },
];

const RAPPORTS_DISPONIBLES = [
  { id: "effectifs",    icon: <Users size={20} />,      label: "Rapport Effectifs",    desc: "Entrées, sorties, évolution mensuelle",      color: "text-primary-600 bg-primary-50" },
  { id: "conges",       icon: <CalendarDays size={20} />, label: "Rapport Congés",    desc: "Statistiques par type, département, période", color: "text-emerald-600 bg-emerald-50" },
  { id: "contrats",     icon: <FileText size={20} />,   label: "Rapport Contrats",    desc: "État des contrats, expirations à venir",       color: "text-amber-600 bg-amber-50" },
  { id: "absenteisme",  icon: <TrendingUp size={20} />, label: "Rapport Absentéisme", desc: "Taux et tendances d'absentéisme",               color: "text-red-500 bg-red-50" },
];

type Period = "6m" | "1y" | "ytd";

export default function RapportsPage() {
  const [period, setPeriod] = useState<Period>("6m");

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
          {[
            { label: "Taux de rétention",     value: "94.6%",  change: "+1.2%",  up: true },
            { label: "Turnover annuel",        value: "5.4%",   change: "-0.8%",  up: false },
            { label: "Jours congés / employé", value: "14.2",   change: "+0.5",   up: true },
            { label: "Taux d'absentéisme",     value: "3.3%",   change: "-0.2%",  up: false },
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
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Évolution effectifs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution des effectifs</CardTitle>
              <Button variant="outline" size="xs" icon={<Download size={12} />}>CSV</Button>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={EVOLUTION_EFFECTIFS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[120, 160]} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Congés par type */}
          <Card>
            <CardHeader>
              <CardTitle>Congés par type</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={CONGES_PAR_TYPE} cx="50%" cy="50%" outerRadius={70} innerRadius={45} paddingAngle={3} dataKey="value">
                  {CONGES_PAR_TYPE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {CONGES_PAR_TYPE.map((item) => (
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
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ABSENTEISME} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 6]} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Taux"]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="taux" name="Absentéisme" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Contrats par type */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des contrats</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={CONTRATS_PAR_TYPE} barSize={32} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="count" name="Nombre" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
