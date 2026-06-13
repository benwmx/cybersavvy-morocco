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
      toast.success(t("studentRemoved"));
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
      toast.success(t("studentsAddedMsg").replace("{n}", succeeded.toString()));
    } else {
      toast.success(t("bulkPartialMsg").replace("{s}", succeeded.toString()).replace("{f}", failed.toString()));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold text-slate-900">{t("studentsTitle")}</h1>
        <p className="text-sm text-slate-500">{t("studentsSubtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
          <div className="h-0.5 bg-[#1E3A8A]" />
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">{t("addStudent")}</CardTitle>
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${!bulkMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {t("individual")}
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${bulkMode ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {t("bulkImportLabel")}
                </button>
              </div>
            </div>
            <CardDescription className="mt-1 text-xs">
              {bulkMode ? t("bulkImportDesc") : t("singleImportDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{t("className")}</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm">
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
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("massarCode")}</Label>
                  <Input
                    value={newStudent.massar}
                    onChange={e => setNewStudent({ ...newStudent, massar: e.target.value.toUpperCase() })}
                    placeholder="G123456789"
                    className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("studentNameFr")}</Label>
                  <Input
                    value={newStudent.nameFr}
                    onChange={e => setNewStudent({ ...newStudent, nameFr: e.target.value })}
                    className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("studentNameAr")}</Label>
                  <Input
                    value={newStudent.nameAr}
                    onChange={e => setNewStudent({ ...newStudent, nameAr: e.target.value })}
                    className="h-8 rounded border-slate-200 bg-slate-50/50 text-sm text-right"
                    dir="rtl"
                  />
                </div>
                <Button
                  className="w-full h-8 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium"
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
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">{t("bulkFormat")}</Label>
                  <Textarea
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    rows={7}
                    placeholder={"G123456789,Ahmed Benali,أحمد بن علي\nG987654321,Fatima Zahra,فاطمة زهراء"}
                    className="rounded border-slate-200 bg-slate-50/50 font-mono text-xs resize-none"
                    disabled={!!bulkProgress}
                  />
                  {bulkText.trim() && (
                    <div className="flex items-center gap-3 text-xs pt-0.5">
                      <span className="text-emerald-600 font-medium">{validRows.length} {t("validRows")}</span>
                      {invalidRows.length > 0 && (
                        <span className="text-rose-500 font-medium">{invalidRows.length} {t("invalidRows")}</span>
                      )}
                    </div>
                  )}
                </div>

                {bulkProgress ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{t("importing")}</span>
                      <span>{bulkProgress.done}/{bulkProgress.total}</span>
                    </div>
                    <Progress value={(bulkProgress.done / bulkProgress.total) * 100} className="h-1.5 bg-slate-100" />
                  </div>
                ) : (
                  <Button
                    className="w-full h-8 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium gap-2"
                    disabled={!selectedClassId || validRows.length === 0}
                    onClick={runBulkImport}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {t("importBtn")} {validRows.length}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
          <div className="h-0.5 bg-[#1E3A8A]/50" />
          <CardHeader className="p-5">
            <CardTitle className="text-base font-semibold text-slate-800">{t("studentList")}</CardTitle>
            <CardDescription className="text-xs">{t("studentsRegister")}</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {!selectedClassId ? (
              <div className="py-16 text-center space-y-3">
                <div className="mx-auto h-10 w-10 rounded-sm bg-slate-50 flex items-center justify-center text-slate-300">
                  <Layout className="h-5 w-5" />
                </div>
                <p className="text-slate-400 text-sm">{t("chooseTrack")}</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="mx-auto h-10 w-10 rounded-sm bg-slate-50 flex items-center justify-center text-slate-300">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-slate-400 text-sm">{t("noStudents")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded text-xs font-medium text-slate-500">
                  <div className="flex-1">{t("studentIdentity")}</div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block w-36">{t("studentNameColOther")}</div>
                    <div className="w-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  {students.map(s => (
                    <div key={s.id} className="px-4 py-2.5 flex items-center justify-between group hover:bg-slate-50 transition-colors rounded border border-transparent hover:border-slate-100">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm leading-tight">{lang === "fr" ? s.name_fr : s.name_ar}</p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{s.massar_code}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right text-xs text-slate-400 hidden sm:block w-36">
                          <p>{lang === "fr" ? s.name_ar : s.name_fr}</p>
                        </div>
                        <div className="w-8 flex justify-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => {
                              if (confirm(t("deleteStudentConfirm"))) {
                                removeStudent.mutate(s.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
