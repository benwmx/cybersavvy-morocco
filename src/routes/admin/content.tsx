import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import type { CategoryRow, ScenarioRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Layers, BookOpen, ChevronRight } from "lucide-react";
import type { Json } from "@/lib/database.types";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

function parseBilingual(json: Json): { fr: string; ar: string } {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return {
      fr: String((json as Record<string, unknown>).fr ?? ""),
      ar: String((json as Record<string, unknown>).ar ?? ""),
    };
  }
  const s = String(json ?? "");
  return { fr: s, ar: s };
}

const QUESTION_TEMPLATE = JSON.stringify(
  [
    {
      id: "q1",
      prompt: { fr: "Question ?", ar: "سؤال؟" },
      choices: {
        fr: ["Option A", "Option B", "Option C"],
        ar: ["خيار أ", "خيار ب", "خيار ج"],
      },
      correctIndex: 0,
      explanation: { fr: "Explication.", ar: "شرح." },
    },
  ],
  null,
  2
);

// ─── Category form ────────────────────────────────────────────────────────────

interface CategoryFormData {
  fr: string;
  ar: string;
  color_code: string;
}

function CategoryDialog({
  open,
  initial,
  onClose,
  onSave,
  saving,
  lang,
}: {
  open: boolean;
  initial: CategoryFormData;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  saving: boolean;
  lang: string;
}) {
  const [fr, setFr] = useState(initial.fr);
  const [ar, setAr] = useState(initial.ar);
  const [color, setColor] = useState(initial.color_code || "#3B82F6");

  // reset when dialog opens with new initial values
  const stableKey = open ? initial.fr + initial.ar : "";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl" key={stableKey}>
        <DialogHeader>
          <DialogTitle className="text-[#1E3A8A] font-black">
            {lang === "fr"
              ? initial.fr
                ? "Modifier la catégorie"
                : "Nouvelle catégorie"
              : initial.fr
              ? "تعديل الفئة"
              : "فئة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Nom (Français)" : "الاسم (الفرنسية)"}
            </Label>
            <Input
              value={fr}
              onChange={e => setFr(e.target.value)}
              placeholder="ex: Hameçonnage"
              className="rounded-xl"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Nom (Arabe)" : "الاسم (العربية)"}
            </Label>
            <Input
              value={ar}
              onChange={e => setAr(e.target.value)}
              placeholder="مثال: التصيد الاحتيالي"
              className="rounded-xl text-right"
              dir="rtl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Couleur" : "اللون"}
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="h-10 w-14 rounded-xl border border-slate-200 cursor-pointer"
              />
              <Input
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="#3B82F6"
                className="rounded-xl font-mono flex-1"
                maxLength={7}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button
            onClick={() => onSave({ fr, ar, color_code: color })}
            disabled={!fr.trim() || !ar.trim() || saving}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black"
          >
            {lang === "fr" ? "Enregistrer" : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Scenario form ────────────────────────────────────────────────────────────

interface ScenarioFormData {
  title_fr: string;
  title_ar: string;
  desc_fr: string;
  desc_ar: string;
  questionsJson: string;
}

function ScenarioDialog({
  open,
  initial,
  onClose,
  onSave,
  saving,
  lang,
}: {
  open: boolean;
  initial: ScenarioFormData;
  onClose: () => void;
  onSave: (data: ScenarioFormData) => void;
  saving: boolean;
  lang: string;
}) {
  const [titleFr, setTitleFr] = useState(initial.title_fr);
  const [titleAr, setTitleAr] = useState(initial.title_ar);
  const [descFr, setDescFr] = useState(initial.desc_fr);
  const [descAr, setDescAr] = useState(initial.desc_ar);
  const [questions, setQuestions] = useState(initial.questionsJson || QUESTION_TEMPLATE);
  const [jsonError, setJsonError] = useState("");

  const handleSave = () => {
    try {
      JSON.parse(questions);
      setJsonError("");
    } catch {
      setJsonError(lang === "fr" ? "JSON invalide" : "JSON غير صالح");
      return;
    }
    onSave({ title_fr: titleFr, title_ar: titleAr, desc_fr: descFr, desc_ar: descAr, questionsJson: questions });
  };

  const stableKey = open ? initial.title_fr + initial.title_ar : "";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl" key={stableKey}>
        <DialogHeader>
          <DialogTitle className="text-[#1E3A8A] font-black">
            {lang === "fr"
              ? initial.title_fr
                ? "Modifier le scénario"
                : "Nouveau scénario"
              : initial.title_fr
              ? "تعديل السيناريو"
              : "سيناريو جديد"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pe-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                {lang === "fr" ? "Titre (FR)" : "العنوان (FR)"}
              </Label>
              <Input
                value={titleFr}
                onChange={e => setTitleFr(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                {lang === "fr" ? "Titre (AR)" : "العنوان (AR)"}
              </Label>
              <Input
                value={titleAr}
                onChange={e => setTitleAr(e.target.value)}
                className="rounded-xl text-right"
                dir="rtl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                {lang === "fr" ? "Description (FR)" : "الوصف (FR)"}
              </Label>
              <Input
                value={descFr}
                onChange={e => setDescFr(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                {lang === "fr" ? "Description (AR)" : "الوصف (AR)"}
              </Label>
              <Input
                value={descAr}
                onChange={e => setDescAr(e.target.value)}
                className="rounded-xl text-right"
                dir="rtl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Questions (JSON)" : "الأسئلة (JSON)"}
            </Label>
            <textarea
              value={questions}
              onChange={e => { setQuestions(e.target.value); setJsonError(""); }}
              rows={10}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 resize-none"
              spellCheck={false}
            />
            {jsonError && (
              <p className="text-xs text-rose-600 font-semibold">{jsonError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!titleFr.trim() || !titleAr.trim() || saving}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black"
          >
            {lang === "fr" ? "Enregistrer" : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ContentPage() {
  const { lang } = useLang();
  const qc = useQueryClient();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [catDialog, setCatDialog] = useState<{ open: boolean; row?: CategoryRow }>({ open: false });
  const [scenDialog, setScenDialog] = useState<{ open: boolean; row?: ScenarioRow }>({ open: false });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["admin-global-categories"],
    queryFn: () => api.adminListGlobalCategories(),
    onSuccess: (cats: CategoryRow[]) => {
      if (cats.length > 0 && !selectedCatId) setSelectedCatId(cats[0].id);
    },
  } as any);

  const { data: scenarios = [], isLoading: scenLoading } = useQuery({
    queryKey: ["admin-global-scenarios", selectedCatId],
    queryFn: () => api.adminListGlobalScenarios(selectedCatId ?? undefined),
    enabled: !!selectedCatId,
  });

  const catMutation = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: Partial<CategoryRow> }) =>
      id ? api.updateCategory(id, data) : api.createCategory(data as CategoryRow),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-categories"] });
      setCatDialog({ open: false });
      toast.success(lang === "fr" ? "Catégorie sauvegardée" : "تم حفظ الفئة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const catDelete = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin-global-categories"] });
      if (selectedCatId === id) setSelectedCatId(null);
      toast.success(lang === "fr" ? "Catégorie supprimée" : "تم حذف الفئة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scenMutation = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: Partial<ScenarioRow> }) =>
      id ? api.updateScenario(id, data) : api.createScenario(data as ScenarioRow),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-scenarios", selectedCatId] });
      setScenDialog({ open: false });
      toast.success(lang === "fr" ? "Scénario sauvegardé" : "تم حفظ السيناريو");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const scenDelete = useMutation({
    mutationFn: (id: string) => api.deleteScenario(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-scenarios", selectedCatId] });
      toast.success(lang === "fr" ? "Scénario supprimé" : "تم حذف السيناريو");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSaveCategory = (data: CategoryFormData, id?: string) => {
    catMutation.mutate({
      id,
      data: {
        name: { fr: data.fr, ar: data.ar } as unknown as Json,
        color_code: data.color_code,
        teacher_id: null,
      },
    });
  };

  const handleSaveScenario = (form: ScenarioFormData, id?: string) => {
    scenMutation.mutate({
      id,
      data: {
        title: { fr: form.title_fr, ar: form.title_ar } as unknown as Json,
        description: { fr: form.desc_fr, ar: form.desc_ar } as unknown as Json,
        questions: JSON.parse(form.questionsJson) as unknown as Json,
        category_id: selectedCatId!,
        teacher_id: null,
        is_public: true,
      },
    });
  };

  const selectedCat = categories.find((c: CategoryRow) => c.id === selectedCatId);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {lang === "fr" ? "Contenu global" : "المحتوى العام"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {lang === "fr"
              ? "Catégories et scénarios partagés avec tous les enseignants"
              : "الفئات والسيناريوهات المشتركة مع جميع المعلمين"}
          </p>
        </div>
      </div>

      <div className="flex gap-6 min-h-[70vh]">
        {/* Categories panel */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Catégories" : "الفئات"}
            </span>
            <Button
              size="sm"
              onClick={() => setCatDialog({ open: true })}
              className="h-7 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs font-black"
            >
              <Plus className="h-3 w-3 me-1" />
              {lang === "fr" ? "Ajouter" : "إضافة"}
            </Button>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-2xl overflow-hidden flex-1">
            <div className="h-1.5 bg-[#1E3A8A]" />
            <CardContent className="p-2">
              {catsLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8 font-medium italic">
                  {lang === "fr" ? "Aucune catégorie." : "لا توجد فئات."}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {categories.map((cat: CategoryRow) => {
                    const name = parseBilingual(cat.name);
                    const active = cat.id === selectedCatId;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCatId(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-all ${
                          active
                            ? "bg-[#1E3A8A] text-white"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color_code || "#94a3b8" }}
                        />
                        <span className="text-sm font-semibold flex-1 truncate">
                          {lang === "fr" ? name.fr : name.ar}
                        </span>
                        {active && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                        {!active && (
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              onClick={e => { e.stopPropagation(); setCatDialog({ open: true, row: cat }); }}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-[#1E3A8A]"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (confirm(lang === "fr" ? "Supprimer cette catégorie ?" : "حذف هذه الفئة؟")) {
                                  catDelete.mutate(cat.id);
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scenarios panel */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {selectedCat
                ? parseBilingual(selectedCat.name)[lang === "fr" ? "fr" : "ar"]
                : lang === "fr"
                ? "Scénarios"
                : "السيناريوهات"}
            </span>
            <Button
              size="sm"
              onClick={() => setScenDialog({ open: true })}
              disabled={!selectedCatId}
              className="h-7 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs font-black disabled:opacity-40"
            >
              <Plus className="h-3 w-3 me-1" />
              {lang === "fr" ? "Ajouter" : "إضافة"}
            </Button>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-2xl overflow-hidden flex-1">
            <div className="h-1.5 bg-emerald-500" />
            <CardContent className="p-0">
              {!selectedCatId ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                  <BookOpen className="h-10 w-10 opacity-30" />
                  <p className="font-medium text-sm">
                    {lang === "fr"
                      ? "Sélectionnez une catégorie"
                      : "اختر فئة لعرض سيناريوهاتها"}
                  </p>
                </div>
              ) : scenLoading ? (
                <div className="divide-y divide-slate-50">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex-1 h-4 bg-slate-100 rounded animate-pulse" />
                      <div className="w-16 h-4 bg-slate-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : scenarios.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-bold italic text-sm">
                  {lang === "fr"
                    ? "Aucun scénario dans cette catégorie."
                    : "لا توجد سيناريوهات في هذه الفئة."}
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[calc(70vh-60px)] overflow-y-auto">
                  {(scenarios as ScenarioRow[]).map((scen) => {
                    const title = parseBilingual(scen.title);
                    const desc = parseBilingual(scen.description);
                    const qCount = Array.isArray(scen.questions) ? scen.questions.length : 0;
                    return (
                      <div
                        key={scen.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {lang === "fr" ? title.fr : title.ar}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {lang === "fr" ? desc.fr : desc.ar}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-400 shrink-0">
                          {qCount} {lang === "fr" ? "Q" : "س"}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => setScenDialog({ open: true, row: scen })}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#1E3A8A] transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(lang === "fr" ? "Supprimer ce scénario ?" : "حذف هذا السيناريو؟")) {
                                scenDelete.mutate(scen.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category dialog */}
      <CategoryDialog
        open={catDialog.open}
        initial={
          catDialog.row
            ? { ...parseBilingual(catDialog.row.name), color_code: catDialog.row.color_code || "#3B82F6" }
            : { fr: "", ar: "", color_code: "#3B82F6" }
        }
        onClose={() => setCatDialog({ open: false })}
        onSave={data => handleSaveCategory(data, catDialog.row?.id)}
        saving={catMutation.isPending}
        lang={lang}
      />

      {/* Scenario dialog */}
      <ScenarioDialog
        open={scenDialog.open}
        initial={
          scenDialog.row
            ? {
                title_fr: parseBilingual(scenDialog.row.title).fr,
                title_ar: parseBilingual(scenDialog.row.title).ar,
                desc_fr: parseBilingual(scenDialog.row.description).fr,
                desc_ar: parseBilingual(scenDialog.row.description).ar,
                questionsJson: JSON.stringify(scenDialog.row.questions, null, 2),
              }
            : { title_fr: "", title_ar: "", desc_fr: "", desc_ar: "", questionsJson: QUESTION_TEMPLATE }
        }
        onClose={() => setScenDialog({ open: false })}
        onSave={form => handleSaveScenario(form, scenDialog.row?.id)}
        saving={scenMutation.isPending}
        lang={lang}
      />
    </div>
  );
}
