import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ClassRow, StudentRow, ScenarioRow, ResultRow, supabaseClient } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { getTracks } from "@/content/scenarios";
import { Copy, Check, Plus, GraduationCap, Users, BookOpen, Trash2, GripVertical, Image as ImageIcon, Video, Layout, BarChart3, TrendingUp, AlertCircle, Loader2, BadgeInfo } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

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

    // Aggregates
    let totalScore = 0;
    let totalMax = 0;
    const categoryStats: Record<string, { score: number; max: number; name: string }> = {};
    const mistakeCounts: Record<string, number> = {};

    filteredResults.forEach(r => {
      totalScore += r.score;
      totalMax += r.max_score;

      // Find scenario for category
      const scenario = scenarios.find(s => s.id === r.scenario_id);
      if (scenario) {
        const catId = scenario.category_id;
        if (!categoryStats[catId]) {
          const catObj = categories.find(c => c.id === catId);
          categoryStats[catId] = { 
            score: 0, 
            max: 0, 
            name: catObj ? translate(catObj.name) : `Category ${catId.substring(0, 4)}` 
          };
        }
        categoryStats[catId].score += r.score;
        categoryStats[catId].max += r.max_score;
      }

      // Mistakes
      if (r.mistakes) {
        r.mistakes.forEach(m => {
          mistakeCounts[m] = (mistakeCounts[m] || 0) + 1;
        });
      }
    });

    const commonMistakes = Object.entries(mistakeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      average: (totalScore / totalMax) * 100,
      totalAttempts: filteredResults.length,
      categoryStats: Object.values(categoryStats),
      commonMistakes
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#1E3A8A]">{lang === 'fr' ? 'Vue d\'ensemble' : 'نظرة عامة'}</h2>
          <p className="text-slate-500 font-medium">Performance globale des cohortes.</p>
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

      {!stats ? (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent py-20 text-center rounded-[2.5rem]">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
            <BarChart3 className="h-10 w-10" />
          </div>
          <p className="text-slate-400 font-bold italic text-lg">{t("noData")}</p>
        </Card>
      ) : (
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

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.listMyClasses(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students", selectedClassId],
    queryFn: () => api.listStudentsInClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  const addStudent = useMutation({
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

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-black text-[#1E3A8A]">{t("addStudent")}</CardTitle>
          <CardDescription>Inscrire un nouvel apprenant au registre.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("className")}</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue placeholder={t("chooseTrack")} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            disabled={!selectedClassId || !newStudent.massar || addStudent.isPending}
            onClick={() =>
              addStudent.mutate({
                class_id: selectedClassId,
                massar_code: newStudent.massar,
                name_fr: newStudent.nameFr,
                name_ar: newStudent.nameAr,
              })
            }
          >
            {t("addStudent")}
          </Button>
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
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const qc = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });
  
  // Fetch visibility status for all teacher's classes and scenarios
  const { data: visibility = [] } = useQuery({
    queryKey: ["visibility-status"],
    queryFn: async () => {
      const { data } = await supabaseClient.from("class_scenario_status").select("*");
      return data || [];
    }
  });

  const toggleScenario = useMutation({
    mutationFn: async ({ classId, scenarioId, active }: { classId: string; scenarioId: string; active: boolean }) => {
      const { error } = await supabaseClient
        .from("class_scenario_status")
        .upsert({ class_id: classId, scenario_id: scenarioId, is_visible: active }, { onConflict: 'class_id,scenario_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visibility-status"] }),
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#1E3A8A]">{t("assignScenarios")}</h2>
          <p className="text-slate-500 font-medium">Définir les parcours accessibles par cohorte.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating} className="h-14 px-8 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black shadow-lg active:scale-95 transition-all">
          <Plus className="h-5 w-5 me-2" />
          {t("createScenario")}
        </Button>
      </div>

      {isCreating && (
        <ScenarioCreator onCancel={() => setIsCreating(false)} onSuccess={() => {
          setIsCreating(false);
          qc.invalidateQueries({ queryKey: ["scenarios"] });
        }} />
      )}

      <div className="grid gap-10">
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ps-2">{t("systemScenarios")}</h3>
          <div className="grid gap-4">
            {scenarios.filter(s => s.teacher_id === null).map((track) => (
              <Card key={track.id} className="border-none shadow-lg shadow-slate-100 bg-white rounded-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#1E3A8A]">
                       <Layout className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{translate(track.title)}</p>
                      <p className="text-sm text-slate-500 font-medium">{translate(track.description)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => {
                      const isActive = visibility.find(v => v.class_id === cls.id && v.scenario_id === track.id)?.is_visible ?? false;
                      return (
                        <Button
                          key={cls.id}
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          className={`rounded-xl font-bold h-10 px-4 transition-all ${isActive ? 'bg-[#1E3A8A] shadow-md hover:bg-[#1E3A8A]/90' : 'border-slate-200 text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50'}`}
                          onClick={() => toggleScenario.mutate({ classId: cls.id, scenarioId: track.id, active: !isActive })}
                        >
                          {cls.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1E3A8A] ps-2">{t("myScenarios")}</h3>
          {scenarios.filter(s => s.teacher_id !== null).length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 bg-transparent py-16 text-center rounded-[2rem]">
              <p className="text-slate-400 font-bold italic">{t("noData")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {scenarios.filter(s => s.teacher_id !== null).map((track) => (
                <Card key={track.id} className="border-none shadow-lg shadow-slate-100 bg-white rounded-2xl overflow-hidden group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#1E3A8A]/5 text-[#1E3A8A] flex items-center justify-center">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{translate(track.title)}</p>
                        <p className="text-sm text-slate-500 font-medium">{translate(track.description)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls) => {
                        const isActive = visibility.find(v => v.class_id === cls.id && v.scenario_id === track.id)?.is_visible ?? false;
                        return (
                          <Button
                            key={cls.id}
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            className={`rounded-xl font-bold h-10 px-4 transition-all ${isActive ? 'bg-[#1E3A8A] shadow-md hover:bg-[#1E3A8A]/90' : 'border-slate-200 text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50'}`}
                            onClick={() => toggleScenario.mutate({ classId: cls.id, scenarioId: track.id, active: !isActive })}
                          >
                            {cls.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioCreator({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const { t, lang } = useLang();
  const [title, setTitle] = useState({ fr: "", ar: "" });
  const [desc, setDesc] = useState({ fr: "", ar: "" });
  const [questions, setQuestions] = useState<any[]>([]);

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
      // Find a category ID or use a default one for now
      const { data: cats } = await supabaseClient.from("categories").select("id").limit(1).single();
      return api.createScenario({
        teacher_id: session.id,
        category_id: cats?.id || "00000000-0000-0000-0000-000000000000",
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
            disabled={questions.length === 0 || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95"
          >
            {t("saveScenario")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
