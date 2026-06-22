import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { getAIConfig } from "@/lib/ai";
import {
  BarChart3, TrendingUp, AlertCircle, Layout, Users, BookOpen,
  Loader2, Sparkles, Settings, Bookmark, BookmarkCheck, ChevronDown,
  Download, TrendingDown, Minus, Activity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

// ── Markdown renderer for AI output ──────────────────────────────────────────

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
    if (!trimmed) { flushList(); return; }
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2)); return;
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

// ── Status helpers ────────────────────────────────────────────────────────────

type StudentStatus = "not_started" | "good" | "ok" | "struggling";

function getStatus(avg: number, attempts: number): StudentStatus {
  if (attempts === 0) return "not_started";
  if (avg >= 70) return "good";
  if (avg >= 45) return "ok";
  return "struggling";
}

function StatusBadge({ status, t }: { status: StudentStatus; t: (k: string) => string }) {
  const map: Record<StudentStatus, { label: string; cls: string }> = {
    good:        { label: t("statusGood"),       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    ok:          { label: t("statusOk"),          cls: "bg-blue-50 text-blue-700 border-blue-200" },
    struggling:  { label: t("statusStruggling"), cls: "bg-rose-50 text-rose-700 border-rose-200" },
    not_started: { label: t("notStarted"),       cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "students" | "trends";

function AnalyticsPage() {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sortCol, setSortCol] = useState<"name" | "avg" | "attempts" | "completed">("avg");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: session } = useQuery({ queryKey: ["session"], queryFn: () => api.getSession() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: results = [], isLoading } = useQuery({ queryKey: ["results-teacher"], queryFn: () => api.listResultsForTeacher() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => api.listCategories() });

  const classIdForQuery = selectedClassId === "all" ? null : selectedClassId;

  const { data: studentsInClass = [] } = useQuery({
    queryKey: ["students-in-class", classIdForQuery],
    queryFn: () => api.listStudentsInClass(classIdForQuery!),
    enabled: !!classIdForQuery,
  });
  const { data: resultsWithStudents = [] } = useQuery({
    queryKey: ["results-with-students", classIdForQuery],
    queryFn: () => api.listResultsWithStudents(classIdForQuery!),
    enabled: !!classIdForQuery,
  });

  // ── Derived: overview stats ───────────────────────────────────────────────

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

    let totalScore = 0, totalMax = 0;
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
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, count]) => ({ fr: questionTextMap[id]?.fr ?? id, ar: questionTextMap[id]?.ar ?? id, count }));

    const scenarioChartData = Object.values(scenarioStats)
      .sort((a, b) => b.attempts - a.attempts).slice(0, 10)
      .map(s => ({
        name: s.name.length > 22 ? s.name.substring(0, 20) + "…" : s.name,
        score: Math.round((s.score / s.max) * 100),
      }));

    return {
      average: (totalScore / totalMax) * 100,
      totalAttempts: filteredResults.length,
      uniqueStudents: new Set(filteredResults.map(r => r.student_id)).size,
      uniqueScenarios: new Set(filteredResults.map(r => r.scenario_id)).size,
      categoryStats: Object.values(categoryStats),
      commonMistakes,
      scenarioChartData,
    };
  }, [filteredResults, scenarios, categories, translate, questionTextMap]);

  // ── Derived: student stats ────────────────────────────────────────────────

  const studentStats = useMemo(() => {
    if (!classIdForQuery || studentsInClass.length === 0) return null;

    const resultsByStudent: Record<string, typeof resultsWithStudents> = {};
    resultsWithStudents.forEach(r => {
      if (!resultsByStudent[r.student_id]) resultsByStudent[r.student_id] = [];
      resultsByStudent[r.student_id].push(r);
    });

    const rows = studentsInClass.map(student => {
      const sResults = resultsByStudent[student.id] ?? [];
      const totalScore = sResults.reduce((s, r) => s + r.score, 0);
      const totalMax = sResults.reduce((s, r) => s + r.max_score, 0);
      const avg = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
      const completed = new Set(sResults.map(r => r.scenario_id)).size;
      return {
        id: student.id,
        name: lang === "ar" ? student.name_ar : student.name_fr,
        avg,
        attempts: sResults.length,
        completed,
        status: getStatus(avg, sResults.length),
      };
    });

    return rows.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortCol === "name")      { va = a.name;      vb = b.name; }
      else if (sortCol === "avg")  { va = a.avg;       vb = b.avg; }
      else if (sortCol === "attempts") { va = a.attempts; vb = b.attempts; }
      else                         { va = a.completed; vb = b.completed; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [studentsInClass, resultsWithStudents, classIdForQuery, lang, sortCol, sortDir]);

  // ── Derived: trends data ──────────────────────────────────────────────────

  const trendsData = useMemo(() => {
    if (filteredResults.length === 0) return [];

    const weekMap: Record<string, { totalScore: number; totalMax: number; count: number; label: string }> = {};

    filteredResults.forEach(r => {
      const d = new Date(r.created_at);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d); mon.setDate(diff); mon.setHours(0, 0, 0, 0);
      const key = mon.toISOString().split("T")[0];
      const label = mon.toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "short" });
      if (!weekMap[key]) weekMap[key] = { totalScore: 0, totalMax: 0, count: 0, label };
      weekMap[key].totalScore += r.score;
      weekMap[key].totalMax += r.max_score;
      weekMap[key].count += 1;
    });

    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, d]) => ({
        week: d.label,
        score: Math.round((d.totalScore / d.totalMax) * 100),
        attempts: d.count,
      }));
  }, [filteredResults, lang]);

  // ── CSV export ────────────────────────────────────────────────────────────

  const exportCsv = () => {
    if (!studentStats) return;
    const className = classes.find(c => c.id === classIdForQuery)?.name ?? "classe";
    const header = lang === "ar"
      ? ["التلميذ", "المعدل (%)", "المحاولات", "المسارات المكتملة", "الحالة"]
      : ["Élève", "Moyenne (%)", "Tentatives", "Parcours complétés", "Statut"];
    const statusLabel: Record<StudentStatus, string> = {
      good:        lang === "ar" ? "جيد" : "Bon",
      ok:          lang === "ar" ? "متوسط" : "Moyen",
      struggling:  lang === "ar" ? "في صعوبة" : "En difficulté",
      not_started: lang === "ar" ? "لم يبدأ" : "Non commencé",
    };
    const rows = studentStats.map(s => [
      `"${s.name}"`,
      Math.round(s.avg),
      s.attempts,
      s.completed,
      statusLabel[s.status],
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytiques-${className}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── AI section ────────────────────────────────────────────────────────────

  const selectedClassName = classIdForQuery ? (classes.find(c => c.id === classIdForQuery)?.name ?? null) : null;
  const aiConfig = session?.id ? getAIConfig(session.id) : null;
  const aiMutation = useAIRecommendations(aiConfig, stats, lang, selectedClassName);

  const { data: savedRecs } = useQuery({
    queryKey: ["recommendations", classIdForQuery],
    queryFn: () => api.getRecommendations(classIdForQuery),
  });
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const saveMutation = useMutation({
    mutationFn: () => api.saveRecommendation(classIdForQuery, selectedClassName, aiMutation.data!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations", classIdForQuery] }),
  });

  // ── Sort helper ───────────────────────────────────────────────────────────

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) => {
    if (sortCol !== col) return <Minus className="h-3 w-3 text-slate-300 inline ms-1" />;
    return sortDir === "desc"
      ? <TrendingDown className="h-3 w-3 text-[#1E3A8A] inline ms-1" />
      : <TrendingUp className="h-3 w-3 text-[#1E3A8A] inline ms-1" />;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="py-20 flex flex-col items-center gap-3">
      <Loader2 className="h-5 w-5 text-[#1E3A8A] animate-spin" />
      <p className="text-xs text-slate-500">{t("syncing")}</p>
    </div>
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview",  label: t("overview") },
    { id: "students",  label: t("studentsLabel") },
    { id: "trends",    label: t("tabTrends") },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
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
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary chips */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <Chip icon={<Users className="h-3.5 w-3.5 text-[#1E3A8A]" />} value={stats.uniqueStudents} label={t("studentsLabel")} color="blue" />
          <Chip icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />} value={stats.totalAttempts} label={t("attempts")} color="emerald" />
          <Chip icon={<BookOpen className="h-3.5 w-3.5 text-violet-600" />} value={stats.uniqueScenarios} label={t("tracksCovered")} color="violet" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ── */}
      {activeTab === "overview" && (
        !stats ? (
          <EmptyState t={t} />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {/* Average */}
              <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <CardIcon icon={<TrendingUp className="h-4 w-4" />} color="blue" label={t("avgGeneral")} />
                  <div className="space-y-2">
                    <p className="text-3xl font-mono font-semibold text-[#1E3A8A]">{Math.round(stats.average)}%</p>
                    <Progress value={stats.average} className="h-1.5 bg-slate-100" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4">{t("basedOnAttempts").replace("{n}", stats.totalAttempts.toString())}</p>
              </Card>

              {/* Performance by category */}
              <Card className="lg:col-span-2 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
                <CardIcon icon={<Layout className="h-4 w-4" />} color="emerald" label={t("perfByCategory")} />
                <div className="grid sm:grid-cols-2 gap-5 mt-5">
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

              {/* Common mistakes */}
              <Card className="md:col-span-2 lg:col-span-3 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
                <CardIcon icon={<AlertCircle className="h-4 w-4" />} color="rose" label={t("vigilancePoints")} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                  {stats.commonMistakes.length === 0 ? (
                    <p className="text-slate-400 text-sm">{t("noFrequentErrors")}</p>
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

            {/* Scenario bar chart */}
            {stats.scenarioChartData.length > 1 && (
              <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
                <CardIcon icon={<BarChart3 className="h-4 w-4" />} color="blue" label={t("perfByTrack")} />
                <div className="mt-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.scenarioChartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={(value: number) => [`${value}%`, t("average")]} contentStyle={{ borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "none", fontSize: 12, fontWeight: 500 }} cursor={{ fill: "#f1f5f9" }} />
                      <Bar dataKey="score" fill="#1E3A8A" radius={[2, 2, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        )
      )}

      {/* ── TAB: Students ── */}
      {activeTab === "students" && (
        !classIdForQuery ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs">{t("selectClassForStudents")}</p>
          </div>
        ) : !studentStats ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-[#1E3A8A] animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* Export button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                className="h-8 px-3 text-xs rounded border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 me-1.5" />
                {t("exportCsv")}
              </Button>
            </div>

            {/* Student table */}
            <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <SortTh label={t("studentName")} col="name" active={sortCol} dir={sortDir} onClick={() => handleSort("name")} />
                      <SortTh label={t("average")} col="avg" active={sortCol} dir={sortDir} onClick={() => handleSort("avg")} />
                      <SortTh label={t("attempts")} col="attempts" active={sortCol} dir={sortDir} onClick={() => handleSort("attempts")} />
                      <SortTh label={t("scenariosCompleted")} col="completed" active={sortCol} dir={sortDir} onClick={() => handleSort("completed")} />
                      <th className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500">{t("statusLabel")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentStats.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-[#1E3A8A] w-10 shrink-0">{s.attempts > 0 ? Math.round(s.avg) + "%" : "—"}</span>
                            {s.attempts > 0 && (
                              <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#1E3A8A] rounded-full" style={{ width: `${s.avg}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.attempts}</td>
                        <td className="px-4 py-3 text-slate-600">{s.completed}</td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} t={t} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Not started students */}
            {(() => {
              const notStarted = studentStats.filter(s => s.status === "not_started");
              if (notStarted.length === 0) return (
                <p className="text-xs text-emerald-600 font-medium text-center py-2">{t("allStudentsActive")}</p>
              );
              return (
                <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
                  <CardIcon icon={<Users className="h-4 w-4" />} color="slate" label={`${t("studentsNotStarted")} (${notStarted.length})`} />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {notStarted.map(s => (
                      <span key={s.id} className="inline-flex items-center px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })()}
          </div>
        )
      )}

      {/* ── TAB: Trends ── */}
      {activeTab === "trends" && (
        trendsData.length < 2 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs">{t("noTrendsData")}</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Score evolution */}
            <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
              <CardIcon icon={<TrendingUp className="h-4 w-4" />} color="blue" label={t("scoreEvolution")} />
              <div className="mt-5">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => [`${v}%`, t("average")]} contentStyle={{ borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "none", fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="#1E3A8A" strokeWidth={2} dot={{ r: 3, fill: "#1E3A8A" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Weekly attempt count */}
            <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden p-5">
              <CardIcon icon={<Activity className="h-4 w-4" />} color="emerald" label={t("weeklyActivity")} />
              <div className="mt-5">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={trendsData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip formatter={(v: number) => [v, t("attempts")]} contentStyle={{ borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "none", fontSize: 12 }} />
                    <Bar dataKey="attempts" fill="#059669" radius={[2, 2, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )
      )}

      {/* ── AI Recommendations (always visible) ── */}
      <Card className="border border-violet-200 shadow-none bg-violet-50/20 rounded-sm overflow-hidden">
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
                <Button onClick={() => aiMutation.mutate()} className="h-8 px-4 rounded bg-violet-600 hover:bg-violet-700 text-sm font-medium">
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 italic">{t("aiDisclaimer")}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {saveMutation.isSuccess ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <BookmarkCheck className="h-3.5 w-3.5" />{t("saved")}
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-7 px-3 text-xs rounded border-violet-200 text-violet-700 hover:bg-violet-50">
                          {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bookmark className="h-3.5 w-3.5 me-1" />}
                          {t("saveRecommendation")}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => aiMutation.mutate()} disabled={aiMutation.isPending} className="h-7 px-3 text-xs text-violet-600 hover:bg-violet-50 rounded">
                        {t("regenerate")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {!aiMutation.data && savedRecs && savedRecs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500">{t("recHistory")}</p>
                  <div className="space-y-2">
                    {savedRecs.map((rec, i) => {
                      const isOpen = expandedRecId === null ? i === 0 : expandedRecId === rec.id;
                      const dateLabel = new Date(rec.created_at).toLocaleDateString(
                        lang === "ar" ? "ar-MA" : "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" },
                      );
                      return (
                        <div key={rec.id} className="rounded border border-slate-100 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedRecId(isOpen ? "__none__" : rec.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-start"
                          >
                            <span className="text-xs text-slate-500">{t("lastSaved")} {dateLabel}</span>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isOpen && <div className="p-4 bg-white"><GeminiMarkdown text={rec.content} /></div>}
                        </div>
                      );
                    })}
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

// ── Small shared UI pieces ────────────────────────────────────────────────────

function EmptyState({ t }: { t: (k: string) => string }) {
  return (
    <Card className="border border-dashed border-slate-200 bg-transparent py-20 text-center rounded-sm">
      <div className="mx-auto h-12 w-12 rounded-sm bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
        <BarChart3 className="h-6 w-6" />
      </div>
      <p className="text-slate-400 text-sm">{t("noData")}</p>
    </Card>
  );
}

type ChipColor = "blue" | "emerald" | "violet";
function Chip({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: ChipColor }) {
  const cls: Record<ChipColor, string> = {
    blue:    "border-blue-100 bg-blue-50",
    emerald: "border-emerald-100 bg-emerald-50",
    violet:  "border-violet-100 bg-violet-50",
  };
  const valCls: Record<ChipColor, string> = {
    blue:    "text-[#1E3A8A]",
    emerald: "text-emerald-700",
    violet:  "text-violet-700",
  };
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${cls[color]}`}>
      {icon}
      <span className={`text-xs font-semibold ${valCls[color]}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

type CardIconColor = "blue" | "emerald" | "rose" | "violet" | "slate";
function CardIcon({ icon, color, label }: { icon: React.ReactNode; color: CardIconColor; label: string }) {
  const bg: Record<CardIconColor, string> = {
    blue:    "bg-blue-50 text-[#1E3A8A]",
    emerald: "bg-emerald-50 text-emerald-600",
    rose:    "bg-rose-50 text-rose-600",
    violet:  "bg-violet-50 text-violet-600",
    slate:   "bg-slate-100 text-slate-500",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`h-7 w-7 rounded-sm flex items-center justify-center ${bg[color]}`}>{icon}</div>
      <h3 className="text-xs font-medium text-slate-600">{label}</h3>
    </div>
  );
}

function SortTh({
  label, col, active, dir, onClick,
}: {
  label: string;
  col: string;
  active: string;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const isActive = active === col;
  return (
    <th
      onClick={onClick}
      className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700 whitespace-nowrap"
    >
      {label}
      {isActive
        ? (dir === "desc" ? <TrendingDown className="h-3 w-3 text-[#1E3A8A] inline ms-1" /> : <TrendingUp className="h-3 w-3 text-[#1E3A8A] inline ms-1" />)
        : <Minus className="h-3 w-3 text-slate-300 inline ms-1" />}
    </th>
  );
}
