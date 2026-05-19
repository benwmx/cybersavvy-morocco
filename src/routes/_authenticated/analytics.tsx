import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { TRACKS } from "@/content/scenarios";
import { Target, TrendingUp, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { t, lang } = useLang();
  const { data: results = [] } = useQuery({
    queryKey: ["results"],
    queryFn: () => api.listResultsForTeacher(),
  });

  const chartData = useMemo(() => {
    const byScenario: Record<string, { total: number; pct: number[] }> = {};
    for (const r of results) {
      const pct = r.max_score > 0 ? (r.score / r.max_score) * 100 : 0;
      if (!byScenario[r.scenario_id]) byScenario[r.scenario_id] = { total: 0, pct: [] };
      byScenario[r.scenario_id].total++;
      byScenario[r.scenario_id].pct.push(pct);
    }
    return TRACKS.map((tr) => {
      const d = byScenario[tr.id];
      const avg = d ? Math.round(d.pct.reduce((a, b) => a + b, 0) / d.pct.length) : 0;
      return { id: tr.id, name: tr.title[lang], avg, attempts: d?.total ?? 0 };
    });
  }, [results, lang]);

  const gaps = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of results) {
      for (const m of r.mistakes ?? []) counts[m] = (counts[m] ?? 0) + 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return entries.map(([qid, count]) => {
      // resolve label
      for (const tr of TRACKS) {
        const q = tr.questions.find((q) => q.id === qid);
        if (q) return { qid, count, track: tr.title[lang], label: q.prompt[lang] };
      }
      return { qid, count, track: "?", label: qid };
    });
  }, [results, lang]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">{t("analytics")}</h1>
        <p className="text-slate-500 font-medium">Performance globale et identification des zones de risque.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-[#1E3A8A]" />
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#1E3A8A]">
              <TrendingUp className="h-6 w-6" />
              {t("avgScore")}
            </CardTitle>
            <CardDescription className="text-base">Moyenne de réussite par module thématique.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 h-96">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <BarChart3 className="h-12 w-12 opacity-20" />
                <p className="font-bold italic">{t("noData")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    unit="%" 
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      background: "white",
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      padding: "12px 16px"
                    }}
                  />
                  <Bar dataKey="avg" fill="#1E3A8A" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-amber-500" />
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-amber-600">
              <Target className="h-6 w-6" />
              {t("targetGaps")}
            </CardTitle>
            <CardDescription className="text-base">{t("targetGapsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {gaps.length === 0 ? (
              <div className="py-12 text-center text-slate-300">
                <p className="font-bold italic">{t("noData")}</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {gaps.map((g, idx) => (
                  <li key={g.qid} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-amber-200 animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">{g.track}</p>
                      <p className="text-sm font-bold text-slate-700 leading-snug">{g.label}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center justify-center rounded-xl bg-amber-500 text-white text-xs font-black h-8 min-w-[32px] px-2 shadow-lg shadow-amber-500/20">
                      {g.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
