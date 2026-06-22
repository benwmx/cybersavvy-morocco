import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import type { CategoryRow, TutorialRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, BookOpen, Globe, Save, Loader2 } from "lucide-react";
import type { Json } from "@/lib/database.types";
import { ImageUpload } from "@/components/ImageUpload";
import { useI18n } from "@/hooks/use-i18n";
import { DocMarkdown } from "@/components/DocMarkdown";

export const Route = createFileRoute("/admin/tutorials")({
  component: AdminTutorialsPage,
});

function parseBilingual(val: Json): { fr: string; ar: string } {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    return { fr: String(v.fr ?? ""), ar: String(v.ar ?? "") };
  }
  return { fr: "", ar: "" };
}

interface TutorialFormState {
  titleFr: string;
  titleAr: string;
  contentFr: string;
  contentAr: string;
  imageUrl: string | null;
}

const EMPTY_FORM: TutorialFormState = { titleFr: "", titleAr: "", contentFr: "", contentAr: "", imageUrl: null };

function AdminTutorialsPage() {
  const { t, lang } = useLang();
  const { translate } = useI18n();
  const qc = useQueryClient();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TutorialRow | null>(null);
  const [form, setForm] = useState<TutorialFormState>(EMPTY_FORM);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<"fr" | "ar">("fr");

  const { data: categories = [] } = useQuery<CategoryRow[]>({
    queryKey: ["admin-global-categories"],
    queryFn: () => api.adminListGlobalCategories(),
  });

  const { data: tutorials = [] } = useQuery<TutorialRow[]>({
    queryKey: ["admin-global-tutorials", selectedCatId],
    queryFn: () => api.adminListGlobalTutorials(selectedCatId ?? undefined),
    enabled: !!selectedCatId,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      api.adminSaveTutorial(
        editing ? editing.id : null,
        selectedCatId!,
        { fr: form.titleFr, ar: form.titleAr } as unknown as Json,
        { fr: form.contentFr, ar: form.contentAr } as unknown as Json,
        form.imageUrl,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-tutorials"] });
      closeDialog();
      toast.success(t("adminTutSaved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteTutorial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-global-tutorials"] });
      toast.success(t("adminTutDeleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowPreview(false);
    setDialogOpen(true);
  };

  const openEdit = (tut: TutorialRow) => {
    setEditing(tut);
    const title = parseBilingual(tut.title);
    const content = parseBilingual(tut.content);
    setForm({ titleFr: title.fr, titleAr: title.ar, contentFr: content.fr, contentAr: content.ar, imageUrl: tut.image_url });
    setShowPreview(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowPreview(false);
  };

  const setF = <K extends keyof TutorialFormState>(key: K, val: TutorialFormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const selectedCat = categories.find(c => c.id === selectedCatId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{t("adminTutorialsTitle")}</h1>
        </div>
        <p className="text-sm text-slate-500 ps-[34px]">{t("adminTutorialsSubtitle")}</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Category list */}
        <Card className="w-56 shrink-0 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden flex flex-col">
          <div className="h-0.5 bg-[#1E3A8A]" />
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("adminCategories")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {categories.length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-4">{t("adminNoCategories")}</p>
            )}
            {categories.map(cat => {
              const active = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-blue-50 text-[#1E3A8A] font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color_code || "#94a3b8" }} />
                  <span className="truncate">{translate(cat.name)}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Tutorial list */}
        <Card className="flex-1 border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden flex flex-col min-w-0">
          <div className="h-0.5 bg-[#1E3A8A]" />
          <CardHeader className="p-4 pb-3 flex-row items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-slate-800">
              {selectedCat ? translate(selectedCat.name) : t("adminTutorialsTitle")}
            </CardTitle>
            {selectedCatId && (
              <Button onClick={openNew}
                className="h-7 px-3 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs font-medium">
                <Plus className="h-3 w-3 me-1" /> {t("adminNewTutorial")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {!selectedCatId && (
              <div className="flex items-center justify-center h-32">
                <p className="text-sm text-slate-400">{t("adminPickCategory")}</p>
              </div>
            )}
            {selectedCatId && tutorials.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-sm text-slate-400">{t("adminNoTutorials")}</p>
              </div>
            )}

            <div className="divide-y divide-slate-50">
              {tutorials.map(tut => {
                const title = parseBilingual(tut.title);
                const content = parseBilingual(tut.content);
                return (
                  <div key={tut.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors group">
                    <div className="h-8 w-8 rounded bg-[#1E3A8A]/8 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="h-3.5 w-3.5 text-[#1E3A8A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{lang === "fr" ? title.fr : title.ar}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {lang === "fr" ? content.fr : content.ar}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(tut)}
                        className="h-7 w-7 rounded text-slate-400 hover:text-[#1E3A8A]">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost"
                        onClick={() => { if (confirm(t("adminDeleteTutConfirm"))) deleteMutation.mutate(tut.id); }}
                        className="h-7 w-7 rounded text-slate-400 hover:text-rose-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-3xl rounded-sm p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-slate-800 font-semibold text-base">
              {editing ? t("adminEditTutorial") : t("adminNewTutorial")}
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Titles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">{t("tutorialTitleFr")}</Label>
                <Input value={form.titleFr} onChange={e => setF("titleFr", e.target.value)} className="h-8 rounded text-sm" autoFocus />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">{t("tutorialTitleAr")}</Label>
                <Input value={form.titleAr} onChange={e => setF("titleAr", e.target.value)} className="h-8 rounded text-sm text-right" dir="rtl" />
              </div>
            </div>

            {/* Content with preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-slate-500">{t("adminTutorialsTitle")}</Label>
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className={`h-6 px-2.5 text-xs rounded transition-colors ${showPreview ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {showPreview ? t("hidePreview") : t("showPreview")}
                </button>
              </div>

              <div className={showPreview ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                {/* FR textarea */}
                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1">FR</span>
                  <textarea
                    rows={10}
                    className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    value={form.contentFr}
                    onChange={e => setF("contentFr", e.target.value)}
                    placeholder={"# Titre\n\n- Point 1\n\n**Mot important**"}
                  />
                </div>

                {/* Preview panel (when open) or AR textarea */}
                {showPreview ? (
                  <div className="rounded border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      {(["fr", "ar"] as const).map(l => (
                        <button key={l} onClick={() => setPreviewLang(l)}
                          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${previewLang === l ? "bg-white text-slate-900 border-b-2 border-[#1E3A8A]" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}>
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className={`p-3 h-64 overflow-y-auto ${previewLang === "ar" ? "rtl" : ""}`}>
                      {(previewLang === "fr" ? form.contentFr : form.contentAr)
                        ? <DocMarkdown text={previewLang === "fr" ? form.contentFr : form.contentAr} />
                        : <p className="text-slate-300 text-xs italic">{t("adminNoTutorials")}</p>
                      }
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                    <textarea
                      rows={10}
                      dir="rtl"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                      value={form.contentAr}
                      onChange={e => setF("contentAr", e.target.value)}
                      placeholder="# العنوان"
                    />
                  </div>
                )}
              </div>

              {/* AR textarea shown below preview when preview is open */}
              {showPreview && (
                <div className="mt-3">
                  <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                  <textarea
                    rows={6}
                    dir="rtl"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                    value={form.contentAr}
                    onChange={e => setF("contentAr", e.target.value)}
                    placeholder="# العنوان"
                  />
                </div>
              )}
            </div>

            {/* Cover image */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-500">{t("tutorialCoverImage")}</Label>
              <ImageUpload value={form.imageUrl} onChange={url => setF("imageUrl", url)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
            <Button variant="ghost" onClick={closeDialog} className="h-8 px-4 text-sm text-slate-600 rounded hover:bg-slate-100">
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
    </div>
  );
}
