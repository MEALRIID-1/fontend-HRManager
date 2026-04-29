"use client";

import { useState, useEffect } from "react";
import { BarChart3, Building2, CalendarDays, Download, FileText, Users } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { rapportService } from "@/lib/services";
import toast from "react-hot-toast";

function formatXAF(value: unknown): string {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-- XAF";
  }

  return `${numberValue.toLocaleString("fr-FR")} XAF`;
}

const initialReportCards = [
  { title: "Effectifs", value: "--", description: "Total par département et évolution mensuelle", icon: <Users size={20} /> },
  { title: "Congés", value: "--", description: "Répartition par type et soldes restants", icon: <CalendarDays size={20} /> },
  { title: "Absentéisme", value: "--", description: "Taux par département et période", icon: <Building2 size={20} /> },
  { title: "Masse salariale", value: "-- XAF", description: "Total par mois et par département", icon: <FileText size={20} /> },
];

export default function DirecteurRapportsPage() {
  const [activeReport, setActiveReport] = useState("effectifs");
  const [reportCards, setReportCards] = useState(initialReportCards);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const res = await rapportService.getDashboardStats();
        if (res && res.success) {
          const stats = res.data || {};
          setReportCards((cards) => cards.map((c) => ({
            ...c,
            value: (() => {
              switch (c.title) {
                case "Effectifs":
                  return String((stats as any).total_employes ?? (stats as any).totalEmployes ?? c.value);
                case "Congés":
                  return String((stats as any).conges_en_attente?.total ?? (stats as any).congesEnAttente ?? c.value);
                case "Absentéisme":
                  return `${String((stats as any).taux_absenteisme_mois ?? (stats as any).tauxAbsenteismeMois ?? c.value)} %`;
                case "Masse salariale":
                  return formatXAF((stats as any).masse_salariale_mois ?? (stats as any).masseSalarialeMois ?? c.value);
                default:
                  return c.value;
              }
            })(),
          })));
        } else {
          toast.error(res?.message || 'Erreur lors du chargement des statistiques');
        }
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.message || 'Erreur lors du chargement des statistiques';
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const loadReportDetails = async () => {
      try {
        setIsReportLoading(true);
        setReportData(null);

        const fmt = (d: string) => d;

        if (activeReport === 'conges') {
          const res = await rapportService.getRapportConges(startDate, endDate);
          if (res && res.success) setReportData(res.data);
        } else if (activeReport === 'effectifs') {
          const res = await rapportService.getRapportEffectifs(startDate, endDate);
          if (res && res.success) setReportData(res.data);
        } else {
          setReportData(null);
        }
      } catch (e: any) {
        setReportData(null);
        const errorMsg = e?.response?.data?.message || e?.message || 'Erreur lors du chargement du rapport';
        toast.error(errorMsg);
      } finally {
        setIsReportLoading(false);
      }
    };

    loadReportDetails();
  }, [activeReport, startDate, endDate]);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const type = activeReport === 'conges' ? 'leaves' : activeReport === 'effectifs' ? 'employees' : 'leaves';
      const blob = await rapportService.exporterRapport(type, format, { debut: startDate, fin: endDate });

      // download blob
      const url = window.URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Export failed', e);
      const errorMsg = e?.response?.data?.message || e?.message || 'Erreur lors de l\'export';
      toast.error(errorMsg);
    }
  };

  return (
    <DashboardLayout title="Rapports" subtitle="Vue consolidée des indicateurs RH">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {reportCards.map((card) => (
            <Card key={card.title} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-2">{card.description}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {card.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4 flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Rapports disponibles</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Données réelles depuis la base de données. Sélectionnez un rapport et une période.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Du:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Au:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={activeReport === "effectifs" ? "primary" : "outline"} size="sm" onClick={() => setActiveReport("effectifs")}>Effectifs</Button>
              <Button variant={activeReport === "conges" ? "primary" : "outline"} size="sm" onClick={() => setActiveReport("conges")}>Congés</Button>
              <Button variant={activeReport === "absenteisme" ? "primary" : "outline"} size="sm" onClick={() => setActiveReport("absenteisme")}>Absentéisme</Button>
              <Button variant={activeReport === "masse" ? "primary" : "outline"} size="sm" onClick={() => setActiveReport("masse")}>Masse salariale</Button>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 min-h-[280px] flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Aperçu du rapport</p>
                <h3 className="text-xl font-semibold text-slate-800 capitalize">{activeReport}</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Données en temps réel depuis la base de données. Sélectionnez une période pour filtrer les résultats.
                </p>
              </div>
              <div className="mt-6">
                {isReportLoading ? (
                  <div className="flex items-center justify-center p-10 text-slate-400">Chargement...</div>
                ) : reportData ? (
                  <div className="space-y-3">
                    {/* Congés report shape expected: totalDemandes, approuvees, refusees, enAttente, parType */}
                    {activeReport === 'conges' && (
                      <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-4 bg-slate-50 rounded-lg border">Total demandes: <strong>{reportData.totalDemandes ?? '--'}</strong></div>
                          <div className="p-4 bg-slate-50 rounded-lg border">Approuvées: <strong>{reportData.approuvees ?? '--'}</strong></div>
                          <div className="p-4 bg-slate-50 rounded-lg border">Refusées: <strong>{reportData.refusees ?? '--'}</strong></div>
                          <div className="p-4 bg-slate-50 rounded-lg border">En attente: <strong>{reportData.enAttente ?? '--'}</strong></div>
                        </div>
                                {reportData.parType && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Répartition par type</h4>
                            <div className="flex gap-3" style={{ height: 180 }}>
                              <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie data={Object.entries(reportData.parType).map(([k, v]) => ({ name: k, value: v }))} dataKey="value" nameKey="name" innerRadius={30} outerRadius={65} fill="#8884d8">
                                      {Object.keys(reportData.parType).map((k, i) => (
                                        <Cell key={k} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"][i % 4]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={Object.entries(reportData.parType).map(([k, v]) => ({ name: k, value: v }))}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" radius={[4,4,0,0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeReport === 'effectifs' && (
                      <div>
                        <p className="text-sm text-slate-600">Données effectifs (aperçu)</p>
                        <div className="w-full h-48 mt-3">
                          <ResponsiveContainer>
                            <LineChart data={(reportData.timeseries ?? []).map((d: any) => ({ date: d.date, value: d.count }))}>
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <pre className="text-xs bg-slate-50 p-3 rounded mt-3">{JSON.stringify(reportData.summary ?? reportData, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-10 text-slate-400">Aucune donnée disponible pour cette période</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 min-h-[280px]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Exports</p>
                  <h3 className="text-lg font-semibold text-slate-800">Téléchargement des rapports</h3>
                </div>
                <Badge variant="blue">Admin / Directeur</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="justify-start" onClick={() => handleExport('csv')}>
                  <Download size={16} className="mr-2" /> CSV
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleExport('xlsx')}>
                  <Download size={16} className="mr-2" /> Excel
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleExport('pdf')}>
                  <Download size={16} className="mr-2" /> PDF
                </Button>
              </div>

              <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                Les exports CSV, Excel et PDF sont disponibles. Les données sont extraites en temps réel depuis la base de données.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
