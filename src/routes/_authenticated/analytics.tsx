import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { BarChart3, TrendingUp, AlertCircle, Layout, Users, BookOpen, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: results = [], isLoading } = useQuery({ queryKey: ["results-teacher"], queryFn: () => api.listResultsForTeacher() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => api.listCategories() });

  const filteredResults = useMemo(() => {
    if (selectedClassId === "all") return results;
    return results.filter(r => r.class_id === selectedClassId);
  }, [results, selectedClassId]);

  const stats = useMemo(() => {
    if (filteredResults.length === 0) return null;

    let totalScore = 0;
    let totalMax = 0;
    const categoryStats: Record<string, { score: number; max: number; name: string }> = {};
    const scenarioStats: Record<string, { score: number; max: number; attempts: number; name: string }> = {};
    const mistakeCounts: Record<string, number> = {};

    filteredResults.forEach(r => {
      totalScore += r.score;
      totalMax += r.max_score;

      const scenario = scenarios.find(s => s.id === r.scenario_id);
      if (scenario) {
        const catId = scenario.category_id;
        if (!categoryStats[catId]) {
          const catObj = categories.find(c => c.id === catId);
          categoryStats[catId] = { score: 0, max: 0, name: catObj ? translate(catObj.name) : `Cat ${catId.substring(0, 4)}` };
        }
        categoryStats[catId].score += r.score;
        categoryStats[catId].max += r.max_score;

        if (!scenarioStats[r.scenario_id]) {
          scenarioStats[r.scenario_id] = { score: 0, max: 0, attempts: 0, name: translate(scenario.title) };
        }
        scenarioStats[r.scenario_id].score += r.score;
        scenarioStats[r.scenario_id].max += r.max_score;
        scenarioStats[r.scenario_id].attempts += 1;
      }

      if (r.mistakes) {
        r.mistakes.forEach(m => { mistakeCounts[m] = (mistakeCounts[m] || 0) + 1; });
      }
    });

    const commonMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const scenarioChartData = Object.values(scenarioStats)
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10)
      .map(s => ({
        name: s.name.length > 22 ? s.name.substring(0, 20) + "…" : s.name,
        score: Math.round((s.score / s.max) * 100),
      }));

    const uniqueStudents = new Set(filteredResults.map(r => r.student_id)).size;
    const uniqueScenarios = new Set(filteredResults.map(r => r.scenario_id)).size;

    return {
      average: (totalScore / totalMax) * 100,
      totalAttempts: filteredResults.length,
      uniqueStudents,
      uniqueScenarios,
      categoryStats: Object.values(categoryStats),
      commonMistakes,
      scenarioChartData,
    };
  }, [filteredResults, scenarios, categories, translate]);

  if (isLoading) return (
    <div className="py-20 flex flex-col items-center gap-3">
      <Loader2 className="h-5 w-5 text-[#1E3A8A] animate-spin" />
      <p className="text-xs text-slate-500">{t("syncing")}</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold text-slate-900">{t("analytics")}</h1>
          <p className="text-sm text-slate-500">{t("analyticsSubtitle")}</p>
        </div>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-full sm:w-56 h-8 rounded border-slate-200 bg-white text-sm font-medium">
            <SelectValue placeholder={t("allClasses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allClasses")}</SelectItem>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary chips */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-blue-100 bg-blue-50">
            <Users className="h-3.5 w-3.5 text-[#1E3A8A]" />
            <span className="text-xs font-semibold text-[#1E3A8A]">{stats.uniqueStudents}</span>
            <span className="text-xs text-slate-500">{t("studentsLabel")}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-100 bg-emerald-50">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">{stats.totalAttempts}</span>
            <span className="text-xs text-slate-500">{t("attempts")}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-violet-100 bg-violet-50">
            <BookOpen className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700">{stats.uniqueScenarios}</span>
            <span className="text-xs text-slate-500">{t("tracksCovered")}</span>
          </div>
        </div>
      )}

      {!stats ? (
        <Card className="border border-dashed border-slate-200 bg-transparent py-20 text-center rounded-sm">
          <div className="mx-auto h-12 w-12 rounded-sm bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-slate-400 text-sm">{t("noData")}</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-sm bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-medium text-slate-600">
                    {t("avgGeneral")}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-mono font-semibold text-[#1E3A8A]">{Math.round(stats.average)}%</p>
                  <Progress value={stats.average} className="h-1.5 bg-slate-100" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                {t("basedOnAttempts").replace("{n}", stats.totalAttempts.toString())}
              </p>
            </Card>

            <Card className="lg:col-span-2 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layout className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-medium text-slate-600">
                  {t("perfByCategory")}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {stats.categoryStats.map((cat, i) => {
                  const perc = (cat.score / cat.max) * 100;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-medium text-slate-700">{cat.name}</p>
                        <p className="text-sm font-mono font-semibold text-[#1E3A8A]">{Math.round(perc)}%</p>
                      </div>
                      <Progress value={perc} className="h-1.5 bg-slate-100" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-medium text-slate-600">
                  {t("vigilancePoints")}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.commonMistakes.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    {t("noFrequentErrors")}
                  </p>
                ) : (
                  stats.commonMistakes.map(([mistakeId, count], i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded border border-rose-100 bg-rose-50/30">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-rose-600">
                          Question ID: {mistakeId.substring(0, 8)}
                        </p>
                        <p className="text-sm text-slate-700">
                          {count} {t("studentsFailed")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {stats.scenarioChartData.length > 1 && (
            <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-sm bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-medium text-slate-600">
                  {t("perfByTrack")}
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.scenarioChartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, t("average")]}
                    contentStyle={{ borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "none", fontSize: 12, fontWeight: 500 }}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar dataKey="score" fill="#1E3A8A" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
