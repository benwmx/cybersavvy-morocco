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
import { Copy, Check, Plus, GraduationCap, Users, BookOpen, Trash2, GripVertical, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useLang();
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
      </div>

      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            {t("classes")}
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {t("manageQuizzes")}
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            {t("manageStudents")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <ClassesPanel />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <QuizzesPanel />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("createClass")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) create.mutate(name.trim());
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="className" className="sr-only">
                {t("className")}
              </Label>
              <Input
                id="className"
                placeholder="Classe 9ème B"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={create.isPending}>
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-10 text-center text-muted-foreground">
              {t("noClasses")}
            </CardContent>
          </Card>
        )}
        {classes.map((c) => (
          <ClassCard key={c.id} cls={c} />
        ))}
      </div>
    </>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
        <CardTitle className="mt-2">{cls.name}</CardTitle>
        <CardDescription>{t("accessCode")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-lg tracking-widest text-center">
            {cls.access_code}
          </code>
          <Button size="icon" variant="outline" onClick={copy} aria-label={t("copy")}>
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
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

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{t("addStudent")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("className")}</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
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
            <Label>{t("massarCode")}</Label>
            <Input
              value={newStudent.massar}
              onChange={(e) => setNewStudent({ ...newStudent, massar: e.target.value.toUpperCase() })}
              placeholder="G123456789"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("studentNameFr")}</Label>
            <Input
              value={newStudent.nameFr}
              onChange={(e) => setNewStudent({ ...newStudent, nameFr: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("studentNameAr")}</Label>
            <Input
              value={newStudent.nameAr}
              onChange={(e) => setNewStudent({ ...newStudent, nameAr: e.target.value })}
              className="text-right"
              dir="rtl"
            />
          </div>
          <Button
            className="w-full"
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

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("studentList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedClassId ? (
            <p className="text-center py-8 text-muted-foreground">{t("chooseTrack")}</p>
          ) : students.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t("noStudents")}</p>
          ) : (
            <div className="divide-y">
              {students.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lang === "fr" ? s.name_fr : s.name_ar}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.massar_code}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{lang === "fr" ? s.name_ar : s.name_fr}</p>
                  </div>
                </div>
              ))}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("assignScenarios")}</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t("createScenario")}
        </Button>
      </div>

      {isCreating && (
        <ScenarioCreator onCancel={() => setIsCreating(false)} onSuccess={() => {
          setIsCreating(false);
          qc.invalidateQueries({ queryKey: ["scenarios"] });
        }} />
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("systemScenarios")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {systemTracks.map((track) => (
                <div key={track.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{track.title[lang]}</p>
                    <p className="text-sm text-muted-foreground">{track.description[lang]}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => {
                      const isActive = cls.assigned_scenarios.includes(track.id);
                      return (
                        <Button
                          key={cls.id}
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => toggleScenario.mutate({ classId: cls.id, scenarioId: track.id, active: !isActive })}
                        >
                          {cls.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("myScenarios")}</CardTitle>
          </CardHeader>
          <CardContent>
            {scenarios.filter(s => s.teacher_id !== null).length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">{t("noData")}</p>
            ) : (
              <div className="divide-y">
                {scenarios.filter(s => s.teacher_id !== null).map((track) => (
                  <div key={track.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{track.title[lang]}</p>
                      <p className="text-sm text-muted-foreground">{track.description[lang]}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls) => {
                        const isActive = cls.assigned_scenarios.includes(track.id);
                        return (
                          <Button
                            key={cls.id}
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() => toggleScenario.mutate({ classId: cls.id, scenarioId: track.id, active: !isActive })}
                          >
                            {cls.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>{t("createScenario")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("scenarioTitleFr")}</Label>
            <Input value={title.fr} onChange={e => setTitle({ ...title, fr: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("scenarioTitleAr")}</Label>
            <Input value={title.ar} onChange={e => setTitle({ ...title, ar: e.target.value })} className="text-right" dir="rtl" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Description (FR)</Label>
            <Input value={desc.fr} onChange={e => setDesc({ ...desc, fr: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description (AR)</Label>
            <Input value={desc.ar} onChange={e => setDesc({ ...desc, ar: e.target.value })} className="text-right" dir="rtl" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t("question")}s</h3>
            <Button size="sm" variant="outline" onClick={addQuestion}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("addQuestion")}
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-muted/30">
                <CardContent className="p-4 space-y-4">
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
                    <span className="text-sm font-bold flex items-center gap-2 cursor-move">
                      <GripVertical className="h-4 w-4" />
                      # {idx + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeQuestion(idx)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("question")} (FR)</Label>
                      <Input value={q.prompt.fr} onChange={e => {
                        const next = { ...q.prompt, fr: e.target.value };
                        updateQuestion(idx, { prompt: next });
                      }} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("question")} (AR)</Label>
                      <Input value={q.prompt.ar} onChange={e => {
                        const next = { ...q.prompt, ar: e.target.value };
                        updateQuestion(idx, { prompt: next });
                      }} className="text-right" dir="rtl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("mediaUrl")}</Label>
                    <div className="flex gap-2">
                      <Input placeholder="https://..." value={q.media_url} onChange={e => updateQuestion(idx, { media_url: e.target.value })} />
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="outline" className="h-10 w-10"><ImageIcon className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-10 w-10"><Video className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Choices (FR)</Label>
                      {q.choices.fr.map((c: string, ci: number) => (
                        <div key={ci} className="flex gap-2 items-center">
                          <input type="radio" checked={q.correctIndex === ci} onChange={() => updateQuestion(idx, { correctIndex: ci })} />
                          <Input value={c} onChange={e => {
                            const next = [...q.choices.fr];
                            next[ci] = e.target.value;
                            updateQuestion(idx, { choices: { ...q.choices, fr: next } });
                          }} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Choices (AR)</Label>
                      {q.choices.ar.map((c: string, ci: number) => (
                        <div key={ci} className="flex gap-2 items-center">
                          <Input value={c} onChange={e => {
                            const next = [...q.choices.ar];
                            next[ci] = e.target.value;
                            updateQuestion(idx, { choices: { ...q.choices, ar: next } });
                          }} className="text-right" dir="rtl" />
                          <input type="radio" checked={q.correctIndex === ci} onChange={() => updateQuestion(idx, { correctIndex: ci })} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>{lang === "fr" ? "Annuler" : "إلغاء"}</Button>
          <Button onClick={() => save.mutate()} disabled={questions.length === 0 || save.isPending}>{t("saveScenario")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
