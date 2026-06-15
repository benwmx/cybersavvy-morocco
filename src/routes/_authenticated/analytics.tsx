import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { getAIConfig } from "@/lib/ai";
import { BarChart3, TrendingUp, AlertCircle, Layout, Users, BookOpen, Loader2, Sparkles, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function GeminiMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside space-y-1 ms-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm text-slate-700">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (s: string) => {
    const parts = s.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900">{p}</strong> : p
    );
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList();
    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-3">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-sm font-semibold text-slate-800 mt-4">{trimmed.replace(/^#{1,2} /, "")}</h2>);
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(<p key={i} className="text-sm font-semibold text-violet-700 mt-3">{trimmed.slice(2, -2)}</p>);
    } else {
      elements.push(<p key={i} className="text-sm text-slate-700">{renderInline(trimmed)}</p>);
    }
  });
  flushList();

  return <div className="space-y-1.5">{elements}</div>;
}

function AnalyticsPage() {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const { data: session } = useQuery({ queryKey: ["session"], queryFn: () => api.getSession() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: results = [], isLoading } = useQuery({ queryKey: ["results-teacher"], queryFn: () => api.listResultsForTeacher() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => api.listCategories() });

  const filteredResults = useMemo(() => {
    if (selectedClassId === "all") return results;
    return results.filter(r => r.class_id === selectedClassId);
  }, [results, selectedClassId]);

  const questionTextMap = useMemo(() => {
    const map: Record<string, { fr: string; ar: string }> = {};
    scenarios.forEach(s => {
      const qs = s.questions as any[];
      if (Array.isArray(qs)) {
        qs.forEach(q => {
          if (q?.id && q?.prompt?.fr) map[q.id] = { fr: q.prompt.fr, ar: q.prompt.ar ?? q.prompt.fr };
        });
      }
    });
    return map;
  }, [scenarios]);

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

    const commonMistakes = Object.entries(mistakeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        fr: questionTextMap[id]?.fr ?? id,
        ar: questionTextMap[id]?.ar ?? id,
        count,
      }));

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

  const aiConfig = session?.id ? getAIConfig(session.id) : null;
  const selectedClassName = selectedClassId === "all"
    ? null
    : (classes.find(c => c.id === selectedClassId)?.name ?? null);
  const aiMutation = useAIRecommendations(aiConfig, stats, lang, selectedClassName);

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
                  stats.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 p-3 rounded border border-rose-100 bg-rose-50/30">
                      <p className="text-sm text-slate-700 leading-snug">{lang === "ar" ? m.ar : m.fr}</p>
                      <span className="text-xs font-semibold text-rose-600 shrink-0">{m.count}×</span>
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

      {/* AI Recommendations */}
      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-violet-500" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-sm bg-violet-50 text-violet-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-medium text-slate-600">{t("aiRecommendations")}</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 ms-9">{t("aiRecommendationsDesc")}</p>

          {!aiConfig ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded border border-violet-100 bg-violet-50/50">
              <div>
                <p className="text-sm font-medium text-slate-700">{t("noApiKeyTitle")}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t("noApiKeyDesc")}</p>
              </div>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded border-violet-200 text-violet-700 hover:bg-violet-50 shrink-0">
                  <Settings className="h-3 w-3 me-1.5" />
                  {t("goToSettings")}
                </Button>
              </Link>
            </div>
          ) : !stats ? (
            <p className="text-xs text-slate-400 p-3 rounded border border-dashed border-slate-200">{t("noDataForAI")}</p>
          ) : (
            <div className="space-y-4">
              {!aiMutation.data && !aiMutation.isPending && (
                <Button
                  onClick={() => aiMutation.mutate()}
                  className="h-8 px-4 rounded bg-violet-600 hover:bg-violet-700 text-sm font-medium"
                >
                  <Sparkles className="h-3.5 w-3.5 me-1.5" />
                  {t("generateRecommendations")}
                </Button>
              )}

              {aiMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("generating")}
                </div>
              )}

              {aiMutation.isError && (
                <p className="text-xs text-rose-500 p-3 rounded border border-rose-100 bg-rose-50">
                  {(aiMutation.error as Error)?.message}
                </p>
              )}

              {aiMutation.data && (
                <div className="space-y-4">
                  <div className="p-4 rounded border border-violet-100 bg-violet-50/30">
                    <GeminiMarkdown text={aiMutation.data} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 italic">{t("aiDisclaimer")}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => aiMutation.mutate()}
                      disabled={aiMutation.isPending}
                      className="h-7 px-3 text-xs text-violet-600 hover:bg-violet-50 rounded"
                    >
                      {t("regenerate")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
