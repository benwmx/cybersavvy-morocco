import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, supabaseClient } from "@/lib/supabase/api";
import type { CategoryRow, TutorialRow, ClassRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, BookOpen, Save, Loader2 } from "lucide-react";
import type { Json } from "@/lib/database.types";
import { ImageUpload } from "@/components/ImageUpload";
import { DocMarkdown } from "@/components/DocMarkdown";

export const Route = createFileRoute("/_authenticated/tutorials")({
  component: TutorialsPage,
});

function parseBilingual(val: Json): { fr: string; ar: string } {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    return { fr: String(v.fr ?? ""), ar: String(v.ar ?? "") };
  }
  return { fr: "", ar: "" };
}

interface TutorialFormState {
  titleFr: string; titleAr: string;
  contentFr: string; contentAr: string;
  imageUrl: string | null;
}
const EMPTY_FORM: TutorialFormState = { titleFr: "", titleAr: "", contentFr: "", contentAr: "", imageUrl: null };

function TutorialsPage() {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const qc = useQueryClient();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTut, setEditingTut] = useState<TutorialRow | null>(null);
  const [form, setForm] = useState<TutorialFormState>(EMPTY_FORM);
  const [readerTut, setReaderTut] = useState<TutorialRow | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<"fr" | "ar">("fr");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => api.getSession(),
  });

  const { data: classes = [] } = useQuery<ClassRow[]>({
    queryKey: ["classes"],
    queryFn: () => api.listMyClasses(),
    enabled: !!session,
  });

  const { data: rawCategories = [] } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: () => api.listCategories(),
  });

  // Only show global categories in the sidebar — teacher forks share the same name
  // and tutorials are assigned per category_id, so we use the canonical global ones
  const categories = rawCategories.filter(c => c.teacher_id === null);

  const { data: tutorials = [] } = useQuery<TutorialRow[]>({
    queryKey: ["tutorials", selectedCatId, session?.id],
    queryFn: () => api.listTutorials(selectedCatId ?? undefined),
    enabled: !!selectedCatId,
  });

  // Load all class-tutorial visibility rows at once (same pattern as scenario visibility)
  const { data: visibility = [] } = useQuery<{ class_id: string; tutorial_id: string; is_visible: boolean }[]>({
    queryKey: ["tutorial-visibility-status"],
    queryFn: async () => {
      const { data } = await supabaseClient.from("class_tutorial_status").select("*");
      return data || [];
    },
    enabled: !!session,
  });

  const toggleVisibility = useMutation({
    mutationFn: ({ classId, tutorialId, isVisible }: { classId: string; tutorialId: string; isVisible: boolean }) =>
      api.setTutorialVisibility(classId, tutorialId, isVisible),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tutorial-visibility-status"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Not authenticated");
      const payload = {
        title: { fr: form.titleFr, ar: form.titleAr } as unknown as Json,
        content: { fr: form.contentFr, ar: form.contentAr } as unknown as Json,
        image_url: form.imageUrl,
        category_id: selectedCatId!,
        teacher_id: session.id,
      };
      if (editingTut) return api.updateTutorial(editingTut.id, payload);
      return api.createTutorial(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tutorials", selectedCatId] });
      closeDialog();
      toast.success(editingTut ? t("tutorialUpdated") : t("tutorialCreated"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTutorial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tutorials", selectedCatId] });
      toast.success(t("tutorialDeleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyMutation = useMutation({
    mutationFn: (id: string) => api.copyTutorial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tutorials", selectedCatId] });
      toast.success(t("tutorialCopied"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditingTut(null);
    setForm(EMPTY_FORM);
    setShowPreview(false);
    setDialogOpen(true);
  };

  const openEdit = (tut: TutorialRow) => {
    setEditingTut(tut);
    const title = parseBilingual(tut.title);
    const content = parseBilingual(tut.content);
    setForm({ titleFr: title.fr, titleAr: title.ar, contentFr: content.fr, contentAr: content.ar, imageUrl: tut.image_url });
    setShowPreview(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTut(null);
    setForm(EMPTY_FORM);
    setShowPreview(false);
  };

  const setF = <K extends keyof TutorialFormState>(key: K, val: TutorialFormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const selectedCat = categories.find(c => c.id === selectedCatId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">{t("tutorialsLabel")}</h1>
          </div>
          <p className="text-sm text-slate-500 ps-[34px]">{t("tutorialsPageDesc")}</p>
        </div>
        {selectedCatId && (
          <Button onClick={openCreate}
            className="h-8 px-4 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium">
            <Plus className="h-3.5 w-3.5 me-1.5" /> {t("createTutorial")}
          </Button>
        )}
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Category list */}
        <Card className="w-52 shrink-0 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden flex flex-col">
          <div className="h-0.5 bg-[#1E3A8A]" />
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("adminCategories")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {categories.map(cat => {
              const active = cat.id === selectedCatId;
              return (
                <button key={cat.id} onClick={() => setSelectedCatId(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-blue-50 text-[#1E3A8A] font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color_code || "#94a3b8" }} />
                  <span className="truncate">{translate(cat.name)}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Tutorial grid — single flat list, public + private mixed */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {!selectedCatId && (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-slate-400">{t("adminPickCategory")}</p>
            </div>
          )}

          {selectedCatId && tutorials.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-slate-400">{t("noTutorialsAvailable")}</p>
            </div>
          )}

          {selectedCatId && tutorials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tutorials.map(tut => {
                const isPublic = tut.teacher_id === null;
                return (
                  <TutorialCard
                    key={tut.id} tut={tut} lang={lang}
                    classes={classes}
                    visibility={visibility}
                    isPublic={isPublic}
                    onCopy={isPublic ? () => copyMutation.mutate(tut.id) : undefined}
                    onToggle={(classId, vis) => toggleVisibility.mutate({ classId, tutorialId: tut.id, isVisible: vis })}
                    onEdit={!isPublic ? () => openEdit(tut) : undefined}
                    onDelete={!isPublic ? () => { if (confirm(t("confirmDeleteTutorial"))) deleteMutation.mutate(tut.id); } : undefined}
                    onRead={() => setReaderTut(tut)}
                    t={t}
                  />
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-2xl rounded-sm p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-slate-800 font-semibold">
              {editingTut ? t("adminEditTutorial") : t("createTutorial")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">{t("tutorialTitleFr")}</Label>
                <Input value={form.titleFr} onChange={e => setF("titleFr", e.target.value)} className="rounded" autoFocus />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">{t("tutorialTitleAr")}</Label>
                <Input value={form.titleAr} onChange={e => setF("titleAr", e.target.value)} className="rounded text-right" dir="rtl" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-slate-500">{t("tutorialContentFr")}</Label>
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className={`h-6 px-2.5 text-xs rounded transition-colors ${showPreview ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {showPreview ? t("hidePreview") : t("showPreview")}
                </button>
              </div>

              <div className={showPreview ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1">FR</span>
                  <textarea value={form.contentFr} onChange={e => setF("contentFr", e.target.value)}
                    rows={8} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    placeholder={"# Titre\n\n- Point 1\n\n**Mot important**"} />
                </div>
                {showPreview ? (
                  <div className="rounded border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      {(["fr", "ar"] as const).map(l => (
                        <button key={l} onClick={() => setPreviewLang(l)}
                          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${previewLang === l ? "bg-white text-slate-900 border-b-2 border-[#1E3A8A]" : "bg-slate-50 text-slate-600 hover:text-slate-900"}`}>
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className={`p-3 h-48 overflow-y-auto ${previewLang === "ar" ? "rtl" : ""}`}>
                      {(previewLang === "fr" ? form.contentFr : form.contentAr)
                        ? <DocMarkdown text={previewLang === "fr" ? form.contentFr : form.contentAr} />
                        : <p className="text-slate-300 text-xs italic">{t("noTutorialsAvailable")}</p>
                      }
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                    <textarea value={form.contentAr} onChange={e => setF("contentAr", e.target.value)}
                      rows={8} dir="rtl" className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs font-mono resize-y text-right focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                      placeholder="# العنوان" />
                  </div>
                )}
              </div>
              {showPreview && (
                <div className="mt-3">
                  <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                  <textarea value={form.contentAr} onChange={e => setF("contentAr", e.target.value)}
                    rows={5} dir="rtl" className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs font-mono resize-y text-right focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    placeholder="# العنوان" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-500">{t("tutorialCoverImage")}</Label>
              <ImageUpload value={form.imageUrl} onChange={url => setF("imageUrl", url)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
            <Button variant="ghost" onClick={closeDialog} className="h-8 px-4 text-sm rounded">
              {t("adminCancel")}
            </Button>
            <Button
              disabled={!form.titleFr.trim() || !form.titleAr.trim() || !form.contentFr.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="h-8 px-4 text-sm bg-[#1E3A8A] text-white rounded-sm font-medium flex items-center gap-1.5 hover:bg-[#1e40af] disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {t("save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reader modal */}
      {readerTut && (
        <TutorialReader tut={readerTut} lang={lang} t={t} onClose={() => setReaderTut(null)} />
      )}
    </div>
  );
}

function TutorialCard({
  tut, lang, classes, visibility, isPublic,
  onCopy, onToggle, onEdit, onDelete, onRead, t,
}: {
  tut: TutorialRow;
  lang: string;
  classes: ClassRow[];
  visibility: { class_id: string; tutorial_id: string; is_visible: boolean }[];
  isPublic: boolean;
  onCopy?: () => void;
  onToggle: (classId: string, v: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRead: () => void;
  t: (k: string) => string;
}) {
  const title = parseBilingual(tut.title);
  const content = parseBilingual(tut.content);
  const displayTitle = lang === "fr" ? title.fr : title.ar;
  const displayContent = lang === "fr" ? content.fr : content.ar;

  const getClassState = (classId: string) =>
    visibility.find(v => v.class_id === classId && v.tutorial_id === tut.id)?.is_visible ?? false;

  return (
    <div className={`bg-white rounded-sm border flex flex-col ${isPublic ? "border-slate-200" : "border-indigo-200"}`}>
      {tut.image_url && (
        <div className="h-28 overflow-hidden rounded-t-sm">
          <img src={tut.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm font-semibold text-slate-800 leading-snug">{displayTitle}</p>
          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            isPublic ? "bg-slate-100 text-slate-700" : "bg-indigo-50 text-indigo-700"
          }`}>
            {isPublic ? t("tutorialGlobalBadge") : t("tutorialPrivateBadge")}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{displayContent}</p>

        {/* Action row */}
        <div className="flex items-center gap-2 pt-1">
          <button onClick={onRead} className="text-[11px] font-medium text-[#1E3A8A] hover:underline shrink-0">
            {t("readTutorial")}
          </button>
          <div className="flex-1" />
          {/* Public: copy to create own version */}
          {isPublic && onCopy && (
            <button onClick={onCopy}
              className="flex items-center gap-1 h-6 px-2 rounded text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-[#1E3A8A] transition-colors">
              <Plus className="h-3 w-3" />
              {t("createMyVersion")}
            </button>
          )}
          {/* Teacher's own: edit + delete */}
          {!isPublic && (
            <div className="flex gap-1">
              {onEdit && (
                <button onClick={onEdit} className="p-1 rounded text-slate-400 hover:text-[#1E3A8A]">
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="p-1 rounded text-slate-400 hover:text-rose-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Per-class visibility toggles */}
        {classes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
            {classes.map(cls => {
              const visible = getClassState(cls.id);
              return (
                <button
                  key={cls.id}
                  onClick={() => onToggle(cls.id, !visible)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    visible
                      ? "bg-[#1E3A8A] text-white"
                      : "border border-slate-200 text-slate-400 bg-white hover:text-[#1E3A8A] hover:border-[#1E3A8A]"
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TutorialReader({ tut, lang, t, onClose }: { tut: TutorialRow; lang: string; t: (k: string) => string; onClose: () => void }) {
  const title = parseBilingual(tut.title);
  const content = parseBilingual(tut.content);
  const displayTitle = lang === "fr" ? title.fr : title.ar;
  const displayContent = lang === "fr" ? content.fr : content.ar;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        {tut.image_url && (
          <div className="h-40 overflow-hidden">
            <img src={tut.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 space-y-4" dir={dir}>
          <h2 className="text-lg font-bold text-slate-900">{displayTitle}</h2>
          <DocMarkdown text={displayContent} />
        </div>
        <div className="px-6 pb-4 flex justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded text-sm">{t("adminCancel")}</Button>
        </div>
      </div>
    </div>
  );
}
