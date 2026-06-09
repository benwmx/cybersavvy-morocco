import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api, StudentRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Users, Trash2, Layout, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [newStudent, setNewStudent] = useState({ massar: "", nameFr: "", nameAr: "" });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
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
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
          {lang === "fr" ? "Élèves" : "التلاميذ"}
        </h1>
        <p className="text-slate-500 font-medium">
          {lang === "fr" ? "Registre et gestion des apprenants." : "سجل وإدارة المتعلمين."}
        </p>
      </div>

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
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("className")}</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder={t("chooseTrack")} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
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
                    onChange={e => setNewStudent({ ...newStudent, massar: e.target.value.toUpperCase() })}
                    placeholder="G123456789"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("studentNameFr")}</Label>
                  <Input
                    value={newStudent.nameFr}
                    onChange={e => setNewStudent({ ...newStudent, nameFr: e.target.value })}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("studentNameAr")}</Label>
                  <Input
                    value={newStudent.nameAr}
                    onChange={e => setNewStudent({ ...newStudent, nameAr: e.target.value })}
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
            <CardDescription>
              {lang === "fr" ? "Registre complet des apprenants par cohorte." : "سجل المتعلمين الكامل حسب الفوج."}
            </CardDescription>
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
                    <div className="w-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  {students.map(s => (
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
    </div>
  );
}
