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
    <div className="py-20 flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 text-[#1E3A8A] animate-spin" />
      <p className="font-bold text-[#1E3A8A] uppercase tracking-widest text-xs">{t("syncing")}</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">{t("analytics")}</h1>
          <p className="text-slate-500 font-medium">
            {lang === "fr" ? "Performance globale des cohortes." : "الأداء العام للأفواج."}
          </p>
        </div>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-full sm:w-64 h-12 rounded-xl border-slate-200 bg-white shadow-sm font-bold">
            <SelectValue placeholder={lang === "fr" ? "Toutes les classes" : "جميع الأقسام"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === "fr" ? "Toutes les classes" : "جميع الأقسام"}</SelectItem>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary chips */}
      {stats && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
            <Users className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider">{stats.uniqueStudents}</span>
            <span className="text-xs font-medium text-slate-500">{lang === "fr" ? "élèves" : "تلاميذ"}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">{stats.totalAttempts}</span>
            <span className="text-xs font-medium text-slate-500">{lang === "fr" ? "tentatives" : "محاولات"}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100">
            <BookOpen className="h-4 w-4 text-violet-600" />
            <span className="text-xs font-black text-violet-700 uppercase tracking-wider">{stats.uniqueScenarios}</span>
            <span className="text-xs font-medium text-slate-500">{lang === "fr" ? "parcours couverts" : "مسارات مغطاة"}</span>
          </div>
        </div>
      )}

      {!stats ? (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent py-20 text-center rounded-[2.5rem]">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
            <BarChart3 className="h-10 w-10" />
          </div>
          <p className="text-slate-400 font-bold italic text-lg">{t("noData")}</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">
                    {lang === "fr" ? "Moyenne Globale" : "المعدل العام"}
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-6xl font-black text-[#1E3A8A]">{Math.round(stats.average)}%</p>
                  <Progress value={stats.average} className="h-3 bg-slate-100" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-6">
                {lang === "fr" ? `Basé sur ${stats.totalAttempts} tentatives complétées.` : `بناءً على ${stats.totalAttempts} محاولة مكتملة.`}
              </p>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">
                  {lang === "fr" ? "Performance par Catégorie" : "الأداء حسب المحور"}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                {stats.categoryStats.map((cat, i) => {
                  const perc = (cat.score / cat.max) * 100;
                  return (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="font-bold text-slate-700">{cat.name}</p>
                        <p className="text-lg font-black text-[#1E3A8A]">{Math.round(perc)}%</p>
                      </div>
                      <Progress value={perc} className="h-2 bg-slate-100" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">
                  {lang === "fr" ? "Points de Vigilance" : "نقاط اليقظة"}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.commonMistakes.length === 0 ? (
                  <p className="text-slate-400 italic font-medium">
                    {lang === "fr" ? "Aucune erreur fréquente identifiée." : "لا توجد أخطاء شائعة محددة."}
                  </p>
                ) : (
                  stats.commonMistakes.map(([mistakeId, count], i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-rose-600 uppercase tracking-widest">
                          Question ID: {mistakeId.substring(0, 8)}
                        </p>
                        <p className="font-bold text-slate-700">
                          {count} {lang === "fr" ? "élèves ont échoué" : "تلاميذ تعثروا"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {stats.scenarioChartData.length > 1 && (
            <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">
                  {lang === "fr" ? "Performance par Parcours" : "الأداء حسب المسار"}
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.scenarioChartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, lang === "fr" ? "Moyenne" : "المعدل"]}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px #1e3a8a18", fontSize: 13, fontWeight: 700 }}
                    cursor={{ fill: "#e0e7ff", radius: 8 }}
                  />
                  <Bar dataKey="score" fill="#1E3A8A" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
