import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, ClassRow, StudentRow, ScenarioRow, CategoryRow, ResultRow, supabaseClient } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { Copy, Check, Plus, Pencil, ChevronDown, ChevronUp, GraduationCap, Users, BookOpen, Trash2, GripVertical, Image as ImageIcon, Video, Layout, BarChart3, TrendingUp, AlertCircle, Loader2, BadgeInfo, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useLang();
  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">{t("dashboard")}</h1>
        <p className="text-slate-500 font-medium">Gestion et supervision des cohortes institutionnelles.</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xl shadow-slate-200/50 border border-slate-100">
          <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-bold transition-all gap-2 h-full">
            <BarChart3 className="h-5 w-5" />
            {t("analytics")}
          </TabsTrigger>
          <TabsTrigger value="classes" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-bold transition-all gap-2 h-full">
            <GraduationCap className="h-5 w-5" />
            {t("classes")}
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-bold transition-all gap-2 h-full">
            <BookOpen className="h-5 w-5" />
            {t("manageQuizzes")}
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-bold transition-all gap-2 h-full">
            <Users className="h-5 w-5" />
            {t("manageStudents")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsPanel />
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <ClassesPanel />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-6">
          <QuizzesPanel />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsPanel() {
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1E3A8A]">{lang === 'fr' ? 'Vue d\'ensemble' : 'نظرة عامة'}</h2>
            <p className="text-slate-500 font-medium">{lang === 'fr' ? 'Performance globale des cohortes.' : 'الأداء العام للأفواج.'}</p>
          </div>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full sm:w-64 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold">
              <SelectValue placeholder={t("chooseTrack")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'fr' ? 'Toutes les classes' : 'جميع الأقسام'}</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {stats && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
              <Users className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider">{stats.uniqueStudents}</span>
              <span className="text-xs font-medium text-slate-500">{lang === 'fr' ? 'élèves' : 'تلاميذ'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">{stats.totalAttempts}</span>
              <span className="text-xs font-medium text-slate-500">{lang === 'fr' ? 'tentatives' : 'محاولات'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100">
              <BookOpen className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-black text-violet-700 uppercase tracking-wider">{stats.uniqueScenarios}</span>
              <span className="text-xs font-medium text-slate-500">{lang === 'fr' ? 'parcours couverts' : 'مسارات مغطاة'}</span>
            </div>
          </div>
        )}
      </div>

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
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{lang === 'fr' ? 'Moyenne Globale' : 'المعدل العام'}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-6xl font-black text-[#1E3A8A]">{Math.round(stats.average)}%</p>
                <Progress value={stats.average} className="h-3 bg-slate-100" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-6">Basé sur {stats.totalAttempts} tentatives complétées.</p>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{lang === 'fr' ? 'Performance par Catégorie' : 'الأداء حسب المحور'}</h3>
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
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{lang === 'fr' ? 'Points de Vigilance' : 'نقاط اليقظة'}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.commonMistakes.length === 0 ? (
                <p className="text-slate-400 italic font-medium">{lang === 'fr' ? 'Aucune erreur fréquente identifiée.' : 'لا توجد أخطاء شائعة محددة.'}</p>
              ) : (
                stats.commonMistakes.map(([mistakeId, count], i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Question ID: {mistakeId.substring(0, 8)}</p>
                      <p className="font-bold text-slate-700">{count} {lang === 'fr' ? 'élèves ont échoué' : 'تلاميذ تعثروا'}</p>
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
                {lang === 'fr' ? 'Performance par Parcours' : 'الأداء حسب المسار'}
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
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, lang === 'fr' ? 'Moyenne' : 'المعدل']}
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

function ClassesPanel() {
  const { t } = useLang();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.listMyClasses(),
  });

  const create = useMutation({
    mutationFn: (n: string) => api.createClass(n),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      setName("");
      toast.success(t("create") + " ✓");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error creating class");
    }
  });

  const deleteClass = useMutation({
    mutationFn: (id: string) => api.deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success(t("delete") + " ✓");
    },
    onError: (err: any) => {
      console.error("Mutation error:", err);
    }
  });

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#1E3A8A]">
            <Plus className="h-7 w-7" />
            {t("createClass")}
          </CardTitle>
          <CardDescription className="text-base font-medium">Initialiser un nouveau groupe de suivi.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) create.mutate(name.trim());
            }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <Input
                id="className"
                placeholder="Ex: Classe de 3ème - Année 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 text-lg font-medium focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
              />
            </div>
            <Button type="submit" disabled={create.isPending} className="h-14 px-10 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-lg font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all">
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 py-20 text-center space-y-4">
             <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                <BadgeInfo className="h-10 w-10" />
             </div>
             <p className="text-slate-400 font-bold italic text-lg">{t("noClasses")}</p>
          </div>
        )}
        {classes.map((c) => (
          <ClassCard 
            key={c.id} 
            cls={c} 
            onDelete={() => deleteClass.mutate(c.id)} 
            isDeleting={deleteClass.isPending && deleteClass.variables === c.id}
          />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ cls, onDelete, isDeleting }: { cls: ClassRow, onDelete: () => void, isDeleting: boolean }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cls.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <Card className="border-none shadow-lg shadow-slate-200 bg-white rounded-[1.5rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="h-1.5 bg-[#1E3A8A] opacity-50 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] group-hover:scale-110 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90"
              onClick={() => {
                if (confirm(t("deleteConfirm"))) {
                  onDelete();
                }
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-xl font-extrabold text-slate-900 line-clamp-1">{cls.name}</CardTitle>
        <CardDescription className="font-bold text-[#1E3A8A]/60 text-xs uppercase tracking-widest">{t("accessCode")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3">
          <code className="flex-1 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 font-mono text-xl font-black tracking-[0.3em] text-center text-[#1E3A8A]">
            {cls.access_code}
          </code>
          <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl text-[#1E3A8A] hover:bg-blue-50 active:scale-90 transition-all" onClick={copy} aria-label={t("copy")}>
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentsPanel() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [newStudent, setNewStudent] = useState({ massar: "", nameFr: "", nameAr: "" });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.listMyClasses(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students", selectedClassId],
    queryFn: () => api.listStudentsInClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  const addStudentMutation = useMutation({
    mutationFn: (s: Omit<StudentRow, "id">) => api.addStudent(s),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
      setNewStudent({ massar: "", nameFr: "", nameAr: "" });
      toast.success(t("studentAdded"));
    },
    onError: () => toast.error(t("alreadyExists")),
  });

  const removeStudent = useMutation({
    mutationFn: (id: string) => api.removeStudent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
      toast.success(lang === "fr" ? "Élève retiré" : "تم حذف التلميذ");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const parsedBulkRows = useMemo(() => {
    return bulkText
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length < 3 || !parts[0]) return { valid: false as const, raw: line };
        return { valid: true as const, massar: parts[0].toUpperCase(), nameFr: parts[1] ?? "", nameAr: parts[2] ?? "" };
      });
  }, [bulkText]);

  const validRows = parsedBulkRows.filter(r => r.valid);
  const invalidRows = parsedBulkRows.filter(r => !r.valid);

  const runBulkImport = async () => {
    if (!selectedClassId || validRows.length === 0) return;
    setBulkProgress({ done: 0, total: validRows.length });
    let succeeded = 0;
    let failed = 0;
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      if (!row.valid) continue;
      try {
        await api.addStudent({ class_id: selectedClassId, massar_code: row.massar, name_fr: row.nameFr, name_ar: row.nameAr });
        succeeded++;
      } catch {
        failed++;
      }
      setBulkProgress({ done: i + 1, total: validRows.length });
    }
    qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
    setBulkProgress(null);
    setBulkText("");
    if (failed === 0) {
      toast.success(lang === "fr" ? `${succeeded} élèves ajoutés` : `تمت إضافة ${succeeded} تلاميذ`);
    } else {
      toast.success(lang === "fr" ? `${succeeded} ajoutés, ${failed} échoués` : `${succeeded} مضاف، ${failed} فشل`);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black text-[#1E3A8A]">{t("addStudent")}</CardTitle>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setBulkMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${!bulkMode ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {lang === "fr" ? "Individuel" : "فردي"}
              </button>
              <button
                onClick={() => setBulkMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${bulkMode ? "bg-white text-[#1E3A8A] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {lang === "fr" ? "Bulk" : "جماعي"}
              </button>
            </div>
          </div>
          <CardDescription className="mt-2">
            {bulkMode
              ? (lang === "fr" ? "Importer plusieurs élèves à la fois via CSV." : "استيراد عدة تلاميذ دفعة واحدة.")
              : (lang === "fr" ? "Inscrire un nouvel apprenant au registre." : "تسجيل متعلم جديد في السجل.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          {/* Class selector — shared between modes */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("className")}</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue placeholder={t("chooseTrack")} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!bulkMode ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("massarCode")}</Label>
                <Input
                  value={newStudent.massar}
                  onChange={(e) => setNewStudent({ ...newStudent, massar: e.target.value.toUpperCase() })}
                  placeholder="G123456789"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("studentNameFr")}</Label>
                <Input
                  value={newStudent.nameFr}
                  onChange={(e) => setNewStudent({ ...newStudent, nameFr: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("studentNameAr")}</Label>
                <Input
                  value={newStudent.nameAr}
                  onChange={(e) => setNewStudent({ ...newStudent, nameAr: e.target.value })}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-right"
                  dir="rtl"
                />
              </div>
              <Button
                className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-bold shadow-lg shadow-blue-900/10 active:scale-95 transition-all"
                disabled={!selectedClassId || !newStudent.massar || addStudentMutation.isPending}
                onClick={() =>
                  addStudentMutation.mutate({
                    class_id: selectedClassId,
                    massar_code: newStudent.massar,
                    name_fr: newStudent.nameFr,
                    name_ar: newStudent.nameAr,
                  })
                }
              >
                {t("addStudent")}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === "fr" ? "Format : CODE_MASSAR, Nom FR, الاسم بالعربية" : "الصيغة: رمز_مسار، الاسم بالفرنسية، الاسم بالعربية"}
                </Label>
                <Textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  rows={8}
                  placeholder={"G123456789,Ahmed Benali,أحمد بن علي\nG987654321,Fatima Zahra,فاطمة زهراء"}
                  className="rounded-xl border-slate-200 bg-slate-50/50 font-mono text-xs resize-none"
                  disabled={!!bulkProgress}
                />
                {bulkText.trim() && (
                  <div className="flex items-center gap-3 text-xs font-bold pt-1">
                    <span className="text-emerald-600">{validRows.length} {lang === "fr" ? "valides" : "صحيح"}</span>
                    {invalidRows.length > 0 && (
                      <span className="text-rose-500">{invalidRows.length} {lang === "fr" ? "invalides" : "خطأ"}</span>
                    )}
                  </div>
                )}
              </div>

              {bulkProgress ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>{lang === "fr" ? "Importation en cours…" : "جارٍ الاستيراد…"}</span>
                    <span>{bulkProgress.done}/{bulkProgress.total}</span>
                  </div>
                  <Progress value={(bulkProgress.done / bulkProgress.total) * 100} className="h-2 bg-slate-100" />
                </div>
              ) : (
                <Button
                  className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-bold shadow-lg shadow-blue-900/10 active:scale-95 transition-all gap-2"
                  disabled={!selectedClassId || validRows.length === 0}
                  onClick={runBulkImport}
                >
                  <Upload className="h-4 w-4" />
                  {lang === "fr" ? `Importer ${validRows.length} élève${validRows.length !== 1 ? "s" : ""}` : `استيراد ${validRows.length} تلاميذ`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]/50" />
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-black text-[#1E3A8A]">{t("studentList")}</CardTitle>
          <CardDescription>Registre complet des apprenants par cohorte.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {!selectedClassId ? (
            <div className="py-20 text-center space-y-4">
               <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                  <Layout className="h-8 w-8" />
               </div>
               <p className="text-slate-400 font-bold italic">{t("chooseTrack")}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                  <Users className="h-8 w-8" />
               </div>
               <p className="text-slate-400 font-bold italic">{t("noStudents")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex-1">
                  {lang === "fr" ? "Identité & Code Massar" : "الهوية ورمز مسار"}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block w-40">
                    {lang === "fr" ? "Prénom & Nom (AR)" : "الاسم العائلي والشخصي (FR)"}
                  </div>
                  <div className="w-10"></div>
                </div>
              </div>
              <div className="space-y-2">
                {students.map((s) => (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-all rounded-2xl border border-transparent hover:border-slate-100">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg leading-tight">{lang === "fr" ? s.name_fr : s.name_ar}</p>
                    <p className="text-xs font-black text-[#1E3A8A] mt-1 font-mono tracking-wider">{s.massar_code}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm font-medium text-slate-400 hidden sm:block w-40">
                      <p>{lang === "fr" ? s.name_ar : s.name_fr}</p>
                    </div>
                    <div className="w-10 flex justify-center">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-10 w-10 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                        onClick={() => {
                          if (confirm(lang === "fr" ? "Voulez-vous vraiment retirer cet élève ?" : "هل تريد حقاً حذف هذا التلميذ؟")) {
                            removeStudent.mutate(s.id);
                          }
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizzesPanel() {
  const { lang } = useLang();
  const qc = useQueryClient();

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [creatingInCategory, setCreatingInCategory] = useState<string | null>(null);
  const [editingScenario, setEditingScenario] = useState<ScenarioRow | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });
  const { data: rawCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => api.listCategories() });

  const categories = useMemo(
    () => [...rawCategories].sort((a, b) => (a.teacher_id === null ? 1 : 0) - (b.teacher_id === null ? 1 : 0)),
    [rawCategories]
  );
  const { data: visibility = [] } = useQuery({
    queryKey: ["visibility-status"],
    queryFn: async () => {
      const { data } = await supabaseClient.from("class_scenario_status").select("*");
      return data || [];
    },
  });

  const toggleAllInCategory = useMutation({
    mutationFn: async ({ categoryId, classId, active }: { categoryId: string; classId: string; active: boolean }) => {
      const ids = scenarios.filter(s => s.category_id === categoryId).map(s => s.id);
      await Promise.all(
        ids.map(scenarioId =>
          supabaseClient.from("class_scenario_status")
            .upsert({ class_id: classId, scenario_id: scenarioId, is_visible: active }, { onConflict: "class_id,scenario_id" })
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visibility-status"] }),
  });

  const deleteScenario = useMutation({
    mutationFn: (id: string) => api.deleteScenario(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success(lang === "fr" ? "Parcours supprimé" : "تم حذف المسار");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const forkCategory = useMutation({
    mutationFn: (globalCategoryId: string) => api.forkCategory(globalCategoryId),
    onSuccess: (newCategory) => {
      setNewCategoryId(newCategory.id);
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success(lang === "fr" ? "Catégorie personnalisée créée" : "تم إنشاء نسخة مخصصة");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetCategory = useMutation({
    mutationFn: (privateCategoryId: string) => api.resetCategoryToDefault(privateCategoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success(lang === "fr" ? "Parcours réinitialisés" : "تمت إعادة التعيين");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success(lang === "fr" ? "Catégorie supprimée" : "تم حذف المحور");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const panelOpen = creatingCategory || !!editingCategory || !!creatingInCategory || !!editingScenario;
  const closePanel = () => {
    setCreatingCategory(false);
    setEditingCategory(null);
    setCreatingInCategory(null);
    setEditingScenario(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#1E3A8A]">
            {lang === "fr" ? "Catégories & Parcours" : "المحاور والمسارات"}
          </h2>
          <p className="text-slate-500 font-medium">
            {lang === "fr" ? "Gérez les contenus et assignez-les par cohorte." : "أدر المحتوى وخصصه لكل فوج."}
          </p>
        </div>
        <Button
          disabled={panelOpen}
          onClick={() => { closePanel(); setCreatingCategory(true); }}
          className="h-14 px-8 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black shadow-lg active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5 me-2" />
          {lang === "fr" ? "Nouvelle catégorie" : "محور جديد"}
        </Button>
      </div>

      {/* Active panels */}
      {creatingCategory && (
        <CategoryCreator
          onCancel={closePanel}
          onSuccess={() => { closePanel(); qc.invalidateQueries({ queryKey: ["categories"] }); }}
        />
      )}
      {editingCategory && (
        <CategoryEditor
          category={editingCategory}
          onCancel={closePanel}
          onSuccess={() => { closePanel(); qc.invalidateQueries({ queryKey: ["categories"] }); }}
        />
      )}
      {creatingInCategory && (
        <ScenarioCreator
          defaultCategoryId={creatingInCategory}
          onCancel={closePanel}
          onSuccess={() => { closePanel(); qc.invalidateQueries({ queryKey: ["scenarios"] }); }}
        />
      )}
      {editingScenario && (
        <ScenarioEditor
          scenario={editingScenario}
          categories={categories}
          onCancel={closePanel}
          onSuccess={() => { closePanel(); qc.invalidateQueries({ queryKey: ["scenarios"] }); }}
        />
      )}

      {/* Category cards */}
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          scenarios={scenarios.filter(s => s.category_id === category.id)}
          classes={classes}
          visibility={visibility}
          panelOpen={panelOpen}
          isNew={newCategoryId === category.id}
          onNewSeen={() => setNewCategoryId(null)}
          onToggleClass={(classId, active) =>
            toggleAllInCategory.mutate({ categoryId: category.id, classId, active })
          }
          onForkCategory={() => forkCategory.mutate(category.id)}
          onEditCategory={() => { closePanel(); setEditingCategory(category); }}
          onResetCategory={() => {
            if (confirm(lang === "fr"
              ? "Réinitialiser les parcours de cette catégorie aux contenus d'origine ?"
              : "إعادة تعيين مسارات هذا المحور إلى المحتوى الأصلي؟"
            )) resetCategory.mutate(category.id);
          }}
          onDeleteCategory={() => {
            if (confirm(lang === "fr"
              ? "Supprimer cette catégorie et tous ses parcours ?"
              : "حذف هذا المحور وجميع مساراته؟"
            )) deleteCategory.mutate(category.id);
          }}
          onAddScenario={() => { closePanel(); setCreatingInCategory(category.id); }}
          onEditScenario={s => { closePanel(); setEditingScenario(s); }}
          onDeleteScenario={id => deleteScenario.mutate(id)}
        />
      ))}
    </div>
  );
}

function CategoryCard({
  category, scenarios, classes, visibility, panelOpen, isNew, onNewSeen,
  onToggleClass, onForkCategory, onEditCategory, onResetCategory, onDeleteCategory,
  onAddScenario, onEditScenario, onDeleteScenario,
}: {
  category: CategoryRow;
  scenarios: ScenarioRow[];
  classes: ClassRow[];
  visibility: { class_id: string; scenario_id: string; is_visible: boolean }[];
  panelOpen: boolean;
  isNew: boolean;
  onNewSeen: () => void;
  onToggleClass: (classId: string, active: boolean) => void;
  onForkCategory: () => void;
  onEditCategory: () => void;
  onResetCategory: () => void;
  onDeleteCategory: () => void;
  onAddScenario: () => void;
  onEditScenario: (s: ScenarioRow) => void;
  onDeleteScenario: (id: string) => void;
}) {
  const { lang } = useLang();
  const { translate } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNew || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(onNewSeen, 2500);
    return () => clearTimeout(timer);
  }, [isNew, onNewSeen]);

  const isGlobal = category.teacher_id === null;
  const isFork = category.teacher_id !== null && category.source_category_id !== null;
  const isCustom = category.teacher_id !== null && category.source_category_id === null;

  const getClassState = (classId: string): "all" | "some" | "none" => {
    if (scenarios.length === 0) return "none";
    const active = scenarios.filter(s => visibility.find(v => v.class_id === classId && v.scenario_id === s.id)?.is_visible);
    if (active.length === scenarios.length) return "all";
    if (active.length > 0) return "some";
    return "none";
  };

  return (
    <Card
      ref={cardRef}
      className={`border-none shadow-xl bg-white rounded-[2rem] overflow-hidden transition-shadow duration-700 ${
        isNew ? "shadow-indigo-300 ring-2 ring-indigo-400 ring-offset-2" : "shadow-slate-200"
      }`}
    >
      {/* Top accent: blue for global, indigo for fork, slate for custom */}
      <div className={`h-1 ${isGlobal ? "bg-[#1E3A8A]" : isFork ? "bg-indigo-400" : "bg-slate-300"}`} />

      {/* Main row */}
      <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
        {/* Left: category info + action buttons */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${isGlobal ? "bg-blue-50 text-[#1E3A8A]" : "bg-slate-100 text-slate-500"}`}>
              <Layout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{translate(category.name)}</h3>
                {isGlobal && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded-full shrink-0">
                    {lang === "fr" ? "Global" : "عام"}
                  </span>
                )}
                {isFork && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">
                    {lang === "fr" ? "Ma version" : "نسختي"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {scenarios.length} {lang === "fr" ? "parcours" : "مسار"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap ms-14">
            {/* Global: offer fork */}
            {isGlobal && (
              <Button
                size="sm"
                variant="ghost"
                disabled={panelOpen}
                onClick={onForkCategory}
                className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5 me-1" />
                {lang === "fr" ? "Créer ma version" : "إنشاء نسختي"}
              </Button>
            )}

            {/* Fork: Modifier + Réinitialiser + Supprimer */}
            {isFork && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={panelOpen}
                  onClick={onEditCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Modifier" : "تعديل"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onResetCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                >
                  {lang === "fr" ? "↺ Réinitialiser" : "↺ إعادة تعيين"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDeleteCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Supprimer" : "حذف"}
                </Button>
              </>
            )}

            {/* Custom (pure teacher-created): Modifier + Supprimer */}
            {isCustom && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={panelOpen}
                  onClick={onEditCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Modifier" : "تعديل"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDeleteCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Supprimer" : "حذف"}
                </Button>
              </>
            )}

            {/* Expand toggle — always visible */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(v => !v)}
              className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50"
            >
              {expanded
                ? <><ChevronUp className="h-3.5 w-3.5 me-1" />{lang === "fr" ? "Masquer" : "إخفاء"}</>
                : <><ChevronDown className="h-3.5 w-3.5 me-1" />{lang === "fr" ? "Gérer les parcours" : "إدارة المسارات"}</>
              }
            </Button>
          </div>
        </div>

        {/* Right: bulk class-assignment toggles */}
        {classes.length > 0 && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {classes.map(cls => {
              const state = getClassState(cls.id);
              return (
                <Button
                  key={cls.id}
                  size="sm"
                  onClick={() => onToggleClass(cls.id, state !== "all")}
                  className={`rounded-xl font-bold h-9 px-4 text-xs transition-all ${
                    state === "all"
                      ? "bg-[#1E3A8A] text-white shadow hover:bg-[#1E3A8A]/90"
                      : state === "some"
                      ? "border border-[#1E3A8A] text-[#1E3A8A] bg-blue-50 hover:bg-blue-100"
                      : "border border-slate-200 text-slate-400 bg-white hover:text-[#1E3A8A] hover:bg-blue-50"
                  }`}
                >
                  {cls.name}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded scenario list */}
      {expanded && (
        <div className="border-t border-slate-100 px-6 pb-6 pt-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Parcours dans cette catégorie" : "المسارات في هذا المحور"}
            </p>
            {/* Only non-global categories can have scenarios added */}
            {!isGlobal && (
              <Button
                size="sm"
                variant="outline"
                disabled={panelOpen}
                onClick={onAddScenario}
                className="h-8 px-3 rounded-xl text-xs font-bold border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5 me-1" />
                {lang === "fr" ? "Ajouter" : "إضافة"}
              </Button>
            )}
          </div>

          {scenarios.length === 0 ? (
            <p className="text-slate-400 italic text-sm text-center py-6">
              {lang === "fr" ? "Aucun parcours dans cette catégorie." : "لا توجد مسارات في هذا المحور."}
            </p>
          ) : (
            <div className="space-y-2">
              {scenarios.map(scenario => {
                const isOwn = scenario.teacher_id !== null;
                const questions = Array.isArray(scenario.questions) ? (scenario.questions as any[]) : [];
                return (
                  <div
                    key={scenario.id}
                    className="bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="shrink-0 h-12 w-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-lg font-black text-[#1E3A8A] leading-none">{questions.length}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
                            {lang === "fr" ? "Q." : "سؤال"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-600">{translate(scenario.description)}</p>
                        </div>
                      </div>

                      {/* Edit/Delete — only for teacher-owned scenarios */}
                      {isOwn && (
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={panelOpen}
                            onClick={() => onEditScenario(scenario)}
                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(lang === "fr" ? "Supprimer ce parcours ?" : "حذف هذا المسار؟")) {
                                onDeleteScenario(scenario.id);
                              }
                            }}
                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Questions list */}
                    {questions.length > 0 && (
                      <div className="border-t border-slate-100 px-4 pb-4 pt-3 ms-16 space-y-2">
                        {questions.map((q: any, qi: number) => (
                          <div key={q.id ?? qi} className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 h-4 w-4 rounded bg-white border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-400 mt-0.5">
                              {qi + 1}
                            </span>
                            <span className="text-slate-600 leading-relaxed">
                              {lang === "fr" ? q.prompt?.fr : q.prompt?.ar}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function CategoryCreator({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const { lang } = useLang();
  const [name, setName] = useState({ fr: "", ar: "" });

  const save = useMutation({
    mutationFn: async () => {
      const session = await api.getSession();
      if (!session) throw new Error("Not authenticated");
      return api.createCategory({ teacher_id: session.id, name });
    },
    onSuccess: () => { toast.success(lang === "fr" ? "Catégorie créée" : "تم إنشاء المحور"); onSuccess(); },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card className="border-none shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
      <div className="h-2 bg-[#1E3A8A]" />
      <CardHeader className="p-10 pb-6">
        <CardTitle className="text-3xl font-black text-[#1E3A8A]">
          {lang === "fr" ? "Nouvelle catégorie" : "محور جديد"}
        </CardTitle>
        <CardDescription>
          {lang === "fr" ? "Créer un thème pour regrouper vos parcours." : "أنشئ محوراً لتجميع مساراتك."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "fr" ? "Nom (FR)" : "الاسم (FR)"}
            </Label>
            <Input
              value={name.fr}
              onChange={e => setName({ ...name, fr: e.target.value })}
              placeholder="Ex: Sécurité mobile"
              className="h-12 rounded-xl bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "fr" ? "Nom (AR)" : "الاسم (AR)"}
            </Label>
            <Input
              value={name.ar}
              onChange={e => setName({ ...name, ar: e.target.value })}
              placeholder="مثال: أمان الهاتف"
              className="h-12 rounded-xl bg-slate-50 text-right font-bold"
              dir="rtl"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!name.fr.trim() || !name.ar.trim() || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95"
          >
            {lang === "fr" ? "Créer" : "إنشاء"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryEditor({ category, onCancel, onSuccess }: { category: CategoryRow; onCancel: () => void; onSuccess: () => void }) {
  const { lang } = useLang();
  const [name, setName] = useState(category.name as { fr: string; ar: string });

  const save = useMutation({
    mutationFn: () => api.updateCategory(category.id, { name }),
    onSuccess: () => { toast.success(lang === "fr" ? "Catégorie mise à jour" : "تم تحديث المحور"); onSuccess(); },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card className="border-none shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
      <div className="h-2 bg-[#1E3A8A]/60" />
      <CardHeader className="p-10 pb-6">
        <CardTitle className="text-3xl font-black text-[#1E3A8A]">
          {lang === "fr" ? "Modifier la catégorie" : "تعديل المحور"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nom (FR)</Label>
            <Input value={name.fr} onChange={e => setName({ ...name, fr: e.target.value })} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nom (AR)</Label>
            <Input value={name.ar} onChange={e => setName({ ...name, ar: e.target.value })} className="h-12 rounded-xl bg-slate-50 text-right font-bold" dir="rtl" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!name.fr.trim() || !name.ar.trim() || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95"
          >
            {lang === "fr" ? "Enregistrer" : "حفظ"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioCreator({ defaultCategoryId, onCancel, onSuccess }: { defaultCategoryId?: string; onCancel: () => void; onSuccess: () => void }) {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const [title, setTitle] = useState({ fr: "", ar: "" });
  const [desc, setDesc] = useState({ fr: "", ar: "" });
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId ?? "");
  const [questions, setQuestions] = useState<any[]>([]);

  const { data: availableCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  const addQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      prompt: { fr: "", ar: "" },
      choices: { fr: ["", "", ""], ar: ["", "", ""] },
      correctIndex: 0,
      explanation: { fr: "", ar: "" },
      media_url: ""
    }]);
  };

  const updateQuestion = (idx: number, data: any) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...data };
    setQuestions(next);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const save = useMutation({
    mutationFn: async () => {
      const session = await api.getSession();
      if (!session) throw new Error("Not authenticated");
      if (!categoryId) throw new Error("No category selected");
      return api.createScenario({
        teacher_id: session.id,
        category_id: categoryId,
        title,
        description: desc,
        questions
      });
    },
    onSuccess: () => {
      toast.success(t("syncDone"));
      onSuccess();
    }
  });

  return (
    <Card className="border-none shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
      <div className="h-2 bg-[#1E3A8A]" />
      <CardHeader className="p-10 pb-6">
        <CardTitle className="text-3xl font-black text-[#1E3A8A]">{t("createScenario")}</CardTitle>
        <CardDescription>Concevoir une simulation personnalisée pour vos cohortes.</CardDescription>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-10">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === "fr" ? "Catégorie" : "المحور"}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
              <SelectValue placeholder={lang === "fr" ? "Choisir une catégorie..." : "اختر محوراً..."} />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {translate(c.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("scenarioTitleFr")}</Label>
            <Input value={title.fr} onChange={e => setTitle({ ...title, fr: e.target.value })} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("scenarioTitleAr")}</Label>
            <Input value={title.ar} onChange={e => setTitle({ ...title, ar: e.target.value })} className="h-12 rounded-xl bg-slate-50 text-right font-bold" dir="rtl" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description (FR)</Label>
            <Input value={desc.fr} onChange={e => setDesc({ ...desc, fr: e.target.value })} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description (AR)</Label>
            <Input value={desc.ar} onChange={e => setDesc({ ...desc, ar: e.target.value })} className="h-12 rounded-xl bg-slate-50 text-right font-medium" dir="rtl" />
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#1E3A8A]">{t("question")}s</h3>
            <Button size="sm" variant="outline" onClick={addQuestion} className="rounded-xl border-[#1E3A8A] text-[#1E3A8A] font-bold hover:bg-blue-50">
              <Plus className="h-4 w-4 me-2" />
              {t("addQuestion")}
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-slate-50/50 border-none shadow-sm rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between" 
                       draggable 
                       onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => {
                         const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
                         if (fromIdx !== idx) {
                           const next = [...questions];
                           const [removed] = next.splice(fromIdx, 1);
                           next.splice(idx, 0, removed);
                           setQuestions(next);
                         }
                       }}
                  >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-[#1E3A8A] cursor-move shadow-sm">
                      <GripVertical className="h-4 w-4" />
                      Q{idx + 1}
                    </span>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50" onClick={() => removeQuestion(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">{t("question")} (FR)</Label>
                      <Input value={q.prompt.fr} onChange={e => {
                        const next = { ...q.prompt, fr: e.target.value };
                        updateQuestion(idx, { prompt: next });
                      }} className="bg-white rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">{t("question")} (AR)</Label>
                      <Input value={q.prompt.ar} onChange={e => {
                        const next = { ...q.prompt, ar: e.target.value };
                        updateQuestion(idx, { prompt: next });
                      }} className="bg-white rounded-xl text-right font-bold" dir="rtl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">{t("mediaUrl")}</Label>
                    <div className="flex gap-2">
                      <Input placeholder="https://..." value={q.media_url} onChange={e => updateQuestion(idx, { media_url: e.target.value })} className="bg-white rounded-xl h-11" />
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl"><ImageIcon className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl"><Video className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Choix (FR)</Label>
                      {q.choices.fr.map((c: string, ci: number) => (
                        <div key={ci} className="flex gap-3 items-center">
                          <input 
                            type="radio" 
                            checked={q.correctIndex === ci} 
                            onChange={() => updateQuestion(idx, { correctIndex: ci })}
                            className="h-5 w-5 accent-[#1E3A8A]"
                          />
                          <Input value={c} onChange={e => {
                            const next = [...q.choices.fr];
                            next[ci] = e.target.value;
                            updateQuestion(idx, { choices: { ...q.choices, fr: next } });
                          }} className="bg-white rounded-xl h-10 text-sm" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400">الاختيارات (AR)</Label>
                      {q.choices.ar.map((c: string, ci: number) => (
                        <div key={ci} className="flex gap-3 items-center">
                          <Input value={c} onChange={e => {
                            const next = [...q.choices.ar];
                            next[ci] = e.target.value;
                            updateQuestion(idx, { choices: { ...q.choices, ar: next } });
                          }} className="bg-white rounded-xl h-10 text-sm text-right font-medium" dir="rtl" />
                          <input 
                            type="radio" 
                            checked={q.correctIndex === ci} 
                            onChange={() => updateQuestion(idx, { correctIndex: ci })}
                            className="h-5 w-5 accent-[#1E3A8A]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!categoryId || questions.length === 0 || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95"
          >
            {t("saveScenario")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioEditor({ scenario, categories, onCancel, onSuccess }: {
  scenario: ScenarioRow;
  categories: CategoryRow[];
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const [title, setTitle] = useState(scenario.title as { fr: string; ar: string });
  const [desc, setDesc] = useState(scenario.description as { fr: string; ar: string });
  const [categoryId, setCategoryId] = useState<string>(scenario.category_id);
  const [questions, setQuestions] = useState<any[]>(scenario.questions as any[]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      prompt: { fr: "", ar: "" },
      choices: { fr: ["", "", ""], ar: ["", "", ""] },
      correctIndex: 0,
      explanation: { fr: "", ar: "" },
      media_url: "",
    }]);
  };

  const updateQuestion = (idx: number, data: any) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...data };
    setQuestions(next);
  };

  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  const save = useMutation({
    mutationFn: () => api.updateScenario(scenario.id, { title, description: desc, category_id: categoryId, questions }),
    onSuccess: () => { toast.success(t("syncDone")); onSuccess(); },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card className="border-none shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
      <div className="h-2 bg-[#1E3A8A]/60" />
      <CardHeader className="p-10 pb-6">
        <CardTitle className="text-3xl font-black text-[#1E3A8A]">
          {lang === "fr" ? "Modifier le parcours" : "تعديل المسار"}
        </CardTitle>
        <CardDescription>{translate(scenario.title)}</CardDescription>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-10">
        {/* Category */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === "fr" ? "Catégorie" : "المحور"}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{translate(c.name)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("scenarioTitleFr")}</Label>
            <Input value={title.fr} onChange={e => setTitle({ ...title, fr: e.target.value })} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("scenarioTitleAr")}</Label>
            <Input value={title.ar} onChange={e => setTitle({ ...title, ar: e.target.value })} className="h-12 rounded-xl bg-slate-50 text-right font-bold" dir="rtl" />
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description (FR)</Label>
            <Input value={desc.fr} onChange={e => setDesc({ ...desc, fr: e.target.value })} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description (AR)</Label>
            <Input value={desc.ar} onChange={e => setDesc({ ...desc, ar: e.target.value })} className="h-12 rounded-xl bg-slate-50 text-right font-medium" dir="rtl" />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#1E3A8A]">{t("question")}s</h3>
            <Button size="sm" variant="outline" onClick={addQuestion} className="rounded-xl border-[#1E3A8A] text-[#1E3A8A] font-bold hover:bg-blue-50">
              <Plus className="h-4 w-4 me-2" />
              {t("addQuestion")}
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-slate-50/50 border-none shadow-sm rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between"
                    draggable
                    onDragStart={e => e.dataTransfer.setData("text/plain", idx.toString())}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      const from = parseInt(e.dataTransfer.getData("text/plain"));
                      if (from !== idx) {
                        const next = [...questions];
                        const [removed] = next.splice(from, 1);
                        next.splice(idx, 0, removed);
                        setQuestions(next);
                      }
                    }}
                  >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-[#1E3A8A] cursor-move shadow-sm">
                      <GripVertical className="h-4 w-4" />Q{idx + 1}
                    </span>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50" onClick={() => removeQuestion(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">{t("question")} (FR)</Label>
                      <Input value={q.prompt.fr} onChange={e => updateQuestion(idx, { prompt: { ...q.prompt, fr: e.target.value } })} className="bg-white rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">{t("question")} (AR)</Label>
                      <Input value={q.prompt.ar} onChange={e => updateQuestion(idx, { prompt: { ...q.prompt, ar: e.target.value } })} className="bg-white rounded-xl text-right font-bold" dir="rtl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">{t("mediaUrl")}</Label>
                    <div className="flex gap-2">
                      <Input placeholder="https://..." value={q.media_url ?? ""} onChange={e => updateQuestion(idx, { media_url: e.target.value })} className="bg-white rounded-xl h-11" />
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl"><ImageIcon className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl"><Video className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Choix (FR)</Label>
                      {q.choices.fr.map((c: string, ci: number) => (
                        <div key={ci} className="flex gap-3 items-center">
                          <input type="radio" checked={q.correctIndex === ci} onChange={() => updateQuestion(idx, { correctIndex: ci })} className="h-5 w-5 accent-[#1E3A8A]" />
                          <Input value={c} onChange={e => { const next = [...q.choices.fr]; next[ci] = e.target.value; updateQuestion(idx, { choices: { ...q.choices, fr: next } }); }} className="bg-white rounded-xl h-10 text-sm" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400">الاختيارات (AR)</Label>
                      {q.choices.ar.map((c: string, ci: number) => (
                        <div key={ci} className="flex gap-3 items-center">
                          <Input value={c} onChange={e => { const next = [...q.choices.ar]; next[ci] = e.target.value; updateQuestion(idx, { choices: { ...q.choices, ar: next } }); }} className="bg-white rounded-xl h-10 text-sm text-right font-medium" dir="rtl" />
                          <input type="radio" checked={q.correctIndex === ci} onChange={() => updateQuestion(idx, { correctIndex: ci })} className="h-5 w-5 accent-[#1E3A8A]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!categoryId || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95"
          >
            {lang === "fr" ? "Enregistrer" : "حفظ"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
