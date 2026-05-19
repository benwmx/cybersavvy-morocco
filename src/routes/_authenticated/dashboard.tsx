import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ClassRow, StudentRow, ScenarioRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { getTracks } from "@/content/scenarios";
import { Copy, Check, Plus, GraduationCap, Users, BookOpen, Trash2, GripVertical, Image as ImageIcon, Video, Layout } from "lucide-react";
import { toast } from "sonner";

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

      <Tabs defaultValue="classes" className="space-y-8">
        <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xl shadow-slate-200/50 border border-slate-100">
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
                <GraduationCap className="h-10 w-10" />
             </div>
             <p className="text-slate-400 font-bold italic text-lg">{t("noClasses")}</p>
          </div>
        )}
        {classes.map((c) => (
          <ClassCard key={c.id} cls={c} />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ cls }: { cls: ClassRow }) {
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
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
  const qc = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });

  const toggleScenario = useMutation({
    mutationFn: ({ classId, scenarioId, active }: { classId: string; scenarioId: string; active: boolean }) => {
      const cls = classes.find((c) => c.id === classId);
      if (!cls) return Promise.resolve();
      const next = active
        ? [...cls.assigned_scenarios, scenarioId]
        : cls.assigned_scenarios.filter((id) => id !== scenarioId);
      return api.updateClassScenarios(classId, next);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });

  const systemTracks = getTracks();

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
            {systemTracks.map((track) => (
              <Card key={track.id} className="border-none shadow-lg shadow-slate-100 bg-white rounded-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center ${track.color || "text-[#1E3A8A]"}`}>
                       <Layout className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{track.title[lang]}</p>
                      <p className="text-sm text-slate-500 font-medium">{track.description[lang]}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => {
                      const isActive = cls.assigned_scenarios.includes(track.id);
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
                        <p className="font-bold text-slate-900 text-lg">{track.title[lang]}</p>
                        <p className="text-sm text-slate-500 font-medium">{track.description[lang]}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls) => {
                        const isActive = cls.assigned_scenarios.includes(track.id);
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
  const [category, setCategory] = useState("Privacy");
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
      return api.createScenario({
        teacher_id: session.id,
        category,
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
