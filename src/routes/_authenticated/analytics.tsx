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
import { Target, TrendingUp } from "lucide-react";

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("analytics")}</h1>
        <p className="text-muted-foreground">{results.length} résultats</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("avgScore")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {results.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {t("noData")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="avg" fill="oklch(0.55 0.18 250)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600" />
            {t("targetGaps")}
          </CardTitle>
          <CardDescription>{t("targetGapsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noData")}</p>
          ) : (
            <ul className="space-y-3">
              {gaps.map((g) => (
                <li key={g.qid} className="flex items-start justify-between gap-4 rounded-lg border bg-card p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{g.track}</p>
                    <p className="text-sm mt-0.5">{g.label}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold h-7 min-w-7 px-2">
                    {g.count}×
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
