import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ClassRow, ScenarioRow, CategoryRow, supabaseClient } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { Plus, Pencil, ChevronDown, ChevronUp, Trash2, GripVertical, Image as ImageIcon, Video, Layout } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/quizzes")({
  component: QuizzesPage,
});

function QuizzesPage() {
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
    onSuccess: newCategory => {
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
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {lang === "fr" ? "Catégories & Parcours" : "المحاور والمسارات"}
          </h1>
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
      <div className={`h-1 ${isGlobal ? "bg-[#1E3A8A]" : isFork ? "bg-indigo-400" : "bg-slate-300"}`} />

      <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
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
            {isGlobal && (
              <Button size="sm" variant="ghost" disabled={panelOpen} onClick={onForkCategory}
                className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50">
                <Plus className="h-3.5 w-3.5 me-1" />
                {lang === "fr" ? "Créer ma version" : "إنشاء نسختي"}
              </Button>
            )}
            {isFork && (
              <>
                <Button size="sm" variant="ghost" disabled={panelOpen} onClick={onEditCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50">
                  <Pencil className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Modifier" : "تعديل"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onResetCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-amber-500 hover:text-amber-600 hover:bg-amber-50">
                  {lang === "fr" ? "↺ Réinitialiser" : "↺ إعادة تعيين"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onDeleteCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Supprimer" : "حذف"}
                </Button>
              </>
            )}
            {isCustom && (
              <>
                <Button size="sm" variant="ghost" disabled={panelOpen} onClick={onEditCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50">
                  <Pencil className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Modifier" : "تعديل"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onDeleteCategory}
                  className="h-8 px-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-3.5 w-3.5 me-1" />
                  {lang === "fr" ? "Supprimer" : "حذف"}
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => setExpanded(v => !v)}
              className="h-8 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50">
              {expanded
                ? <><ChevronUp className="h-3.5 w-3.5 me-1" />{lang === "fr" ? "Masquer" : "إخفاء"}</>
                : <><ChevronDown className="h-3.5 w-3.5 me-1" />{lang === "fr" ? "Gérer les parcours" : "إدارة المسارات"}</>
              }
            </Button>
          </div>
        </div>

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

      {expanded && (
        <div className="border-t border-slate-100 px-6 pb-6 pt-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === "fr" ? "Parcours dans cette catégorie" : "المسارات في هذا المحور"}
            </p>
            {!isGlobal && (
              <Button size="sm" variant="outline" disabled={panelOpen} onClick={onAddScenario}
                className="h-8 px-3 rounded-xl text-xs font-bold border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50">
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
                  <div key={scenario.id} className="bg-slate-50 rounded-2xl border border-slate-100">
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
                      {isOwn && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" disabled={panelOpen} onClick={() => onEditScenario(scenario)}
                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => { if (confirm(lang === "fr" ? "Supprimer ce parcours ?" : "حذف هذا المسار؟")) onDeleteScenario(scenario.id); }}
                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
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
            <Input value={name.fr} onChange={e => setName({ ...name, fr: e.target.value })}
              placeholder="Ex: Sécurité mobile" className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "fr" ? "Nom (AR)" : "الاسم (AR)"}
            </Label>
            <Input value={name.ar} onChange={e => setName({ ...name, ar: e.target.value })}
              placeholder="مثال: أمان الهاتف" className="h-12 rounded-xl bg-slate-50 text-right font-bold" dir="rtl" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button onClick={() => save.mutate()} disabled={!name.fr.trim() || !name.ar.trim() || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95">
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
          <Button onClick={() => save.mutate()} disabled={!name.fr.trim() || !name.ar.trim() || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95">
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
    mutationFn: async () => {
      const session = await api.getSession();
      if (!session) throw new Error("Not authenticated");
      if (!categoryId) throw new Error("No category selected");
      return api.createScenario({ teacher_id: session.id, category_id: categoryId, title, description: desc, questions });
    },
    onSuccess: () => { toast.success(t("syncDone")); onSuccess(); },
  });

  return (
    <Card className="border-none shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
      <div className="h-2 bg-[#1E3A8A]" />
      <CardHeader className="p-10 pb-6">
        <CardTitle className="text-3xl font-black text-[#1E3A8A]">{t("createScenario")}</CardTitle>
        <CardDescription>
          {lang === "fr" ? "Concevoir une simulation personnalisée pour vos cohortes." : "تصميم محاكاة مخصصة لأفواجك."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-10 pt-0 space-y-10">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === "fr" ? "Catégorie" : "المحور"}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
              <SelectValue placeholder={lang === "fr" ? "Choisir une catégorie..." : "اختر محوراً..."} />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map(c => (
                <SelectItem key={c.id} value={c.id}>{translate(c.name)}</SelectItem>
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
              <QuestionEditor key={q.id} q={q} idx={idx}
                onUpdate={data => updateQuestion(idx, data)}
                onRemove={() => removeQuestion(idx)}
                onReorder={(from, to) => {
                  const next = [...questions];
                  const [removed] = next.splice(from, 1);
                  next.splice(to, 0, removed);
                  setQuestions(next);
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button onClick={() => save.mutate()} disabled={!categoryId || questions.length === 0 || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95">
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

  const updateQuestion = (idx: number, data: any) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...data };
    setQuestions(next);
  };

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
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{lang === "fr" ? "Catégorie" : "المحور"}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{translate(c.name)}</SelectItem>
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
            <Button size="sm" variant="outline"
              onClick={() => setQuestions([...questions, { id: crypto.randomUUID(), prompt: { fr: "", ar: "" }, choices: { fr: ["", "", ""], ar: ["", "", ""] }, correctIndex: 0, explanation: { fr: "", ar: "" }, media_url: "" }])}
              className="rounded-xl border-[#1E3A8A] text-[#1E3A8A] font-bold hover:bg-blue-50">
              <Plus className="h-4 w-4 me-2" />
              {t("addQuestion")}
            </Button>
          </div>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <QuestionEditor key={q.id} q={q} idx={idx}
                onUpdate={data => updateQuestion(idx, data)}
                onRemove={() => setQuestions(questions.filter((_, i) => i !== idx))}
                onReorder={(from, to) => {
                  const next = [...questions];
                  const [removed] = next.splice(from, 1);
                  next.splice(to, 0, removed);
                  setQuestions(next);
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button variant="ghost" onClick={onCancel} className="rounded-xl font-bold px-8 h-12 text-slate-500">
            {lang === "fr" ? "Annuler" : "إلغاء"}
          </Button>
          <Button onClick={() => save.mutate()} disabled={!categoryId || save.isPending}
            className="rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black px-10 h-12 shadow-xl shadow-blue-900/10 transition-all active:scale-95">
            {lang === "fr" ? "Enregistrer" : "حفظ"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionEditor({ q, idx, onUpdate, onRemove, onReorder }: {
  q: any;
  idx: number;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onReorder: (from: number, to: number) => void;
}) {
  const { t } = useLang();
  return (
    <Card className="bg-slate-50/50 border-none shadow-sm rounded-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between"
          draggable
          onDragStart={e => e.dataTransfer.setData("text/plain", idx.toString())}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            const from = parseInt(e.dataTransfer.getData("text/plain"));
            if (from !== idx) onReorder(from, idx);
          }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-[#1E3A8A] cursor-move shadow-sm">
            <GripVertical className="h-4 w-4" />Q{idx + 1}
          </span>
          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">{t("question")} (FR)</Label>
            <Input value={q.prompt.fr} onChange={e => onUpdate({ prompt: { ...q.prompt, fr: e.target.value } })} className="bg-white rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">{t("question")} (AR)</Label>
            <Input value={q.prompt.ar} onChange={e => onUpdate({ prompt: { ...q.prompt, ar: e.target.value } })} className="bg-white rounded-xl text-right font-bold" dir="rtl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">{t("mediaUrl")}</Label>
          <div className="flex gap-2">
            <Input placeholder="https://..." value={q.media_url ?? ""} onChange={e => onUpdate({ media_url: e.target.value })} className="bg-white rounded-xl h-11" />
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
                <input type="radio" checked={q.correctIndex === ci} onChange={() => onUpdate({ correctIndex: ci })} className="h-5 w-5 accent-[#1E3A8A]" />
                <Input value={c} onChange={e => {
                  const next = [...q.choices.fr]; next[ci] = e.target.value;
                  onUpdate({ choices: { ...q.choices, fr: next } });
                }} className="bg-white rounded-xl h-10 text-sm" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400">الاختيارات (AR)</Label>
            {q.choices.ar.map((c: string, ci: number) => (
              <div key={ci} className="flex gap-3 items-center">
                <Input value={c} onChange={e => {
                  const next = [...q.choices.ar]; next[ci] = e.target.value;
                  onUpdate({ choices: { ...q.choices, ar: next } });
                }} className="bg-white rounded-xl h-10 text-sm text-right font-medium" dir="rtl" />
                <input type="radio" checked={q.correctIndex === ci} onChange={() => onUpdate({ correctIndex: ci })} className="h-5 w-5 accent-[#1E3A8A]" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
