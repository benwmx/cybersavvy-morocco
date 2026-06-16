import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DocArticleRow, type DocSectionRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { DocMarkdown } from "@/components/DocMarkdown";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Loader2, GripVertical, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/admin/docs")({
  component: AdminDocsPage,
});

// ── Types ────────────────────────────────────────────────────────────────────

type SectionForm = { id?: string; key: string; label_fr: string; label_ar: string };
type ArticleForm = {
  id?: string;
  section_key: string;
  title_fr: string; title_ar: string;
  content_fr: string; content_ar: string;
  sort_order: number;
  is_published: boolean;
};

const emptySectionForm = (): SectionForm => ({ key: "", label_fr: "", label_ar: "" });
const emptyArticleForm = (sectionKey: string, nextOrder: number): ArticleForm => ({
  section_key: sectionKey, title_fr: "", title_ar: "",
  content_fr: "", content_ar: "", sort_order: nextOrder, is_published: true,
});

function toArticleForm(a: DocArticleRow): ArticleForm {
  return {
    id: a.id,
    section_key: a.section_key,
    title_fr: (a.title as any)?.fr ?? "",
    title_ar: (a.title as any)?.ar ?? "",
    content_fr: (a.content as any)?.fr ?? "",
    content_ar: (a.content as any)?.ar ?? "",
    sort_order: a.sort_order,
    is_published: a.is_published,
  };
}

function toSectionForm(s: DocSectionRow): SectionForm {
  return { id: s.id, key: s.key, label_fr: s.label_fr, label_ar: s.label_ar };
}

// ── Main component ────────────────────────────────────────────────────────────

function AdminDocsPage() {
  const { t, lang } = useLang();
  const qc = useQueryClient();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleForm | null>(null);
  const [deleteSection, setDeleteSection] = useState<DocSectionRow | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<"fr" | "ar">("fr");
  const [showPreview, setShowPreview] = useState(false);

  // Section drag state
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  // Article drag state
  const [draggedArticleId, setDraggedArticleId] = useState<string | null>(null);
  const [dragOverArticleId, setDragOverArticleId] = useState<string | null>(null);

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["admin_doc_sections"],
    queryFn: () => api.adminListDocSections(),
  });

  const { data: allArticles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["admin_doc_articles"],
    queryFn: () => api.adminListDocArticles(),
  });

  const selectedSection = sections.find(s => s.key === selectedKey) ?? null;
  const sectionArticles = useMemo(
    () => allArticles
      .filter(a => a.section_key === selectedKey)
      .sort((a, b) => a.sort_order - b.sort_order),
    [allArticles, selectedKey]
  );

  // ── Mutations ────────────────────────────────────────────────────────────────

  const saveSectionMutation = useMutation({
    mutationFn: (f: SectionForm) =>
      api.adminSaveSection({
        id: f.id,
        key: f.key.trim(),
        label_fr: f.label_fr.trim(),
        label_ar: f.label_ar.trim(),
        sort_order: f.id
          ? (sections.find(s => s.id === f.id)?.sort_order ?? sections.length + 1)
          : sections.length + 1,
      }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["admin_doc_sections"] });
      qc.invalidateQueries({ queryKey: ["doc_sections"] });
      setSectionForm(null);
      if (!sectionForm?.id) setSelectedKey(row.key);
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteSection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_sections"] });
      qc.invalidateQueries({ queryKey: ["doc_sections"] });
      if (deleteSection?.key === selectedKey) setSelectedKey(null);
      setDeleteSection(null);
    },
  });

  const saveArticleMutation = useMutation({
    mutationFn: (f: ArticleForm) => {
      const sec = sections.find(s => s.key === f.section_key);
      return api.adminSaveDocArticle({
        id: f.id,
        section_key: f.section_key,
        section_label: { fr: sec?.label_fr ?? "", ar: sec?.label_ar ?? "" },
        title: { fr: f.title_fr.trim(), ar: f.title_ar.trim() },
        content: { fr: f.content_fr, ar: f.content_ar },
        sort_order: f.sort_order,
        is_published: f.is_published,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_articles"] });
      qc.invalidateQueries({ queryKey: ["doc_articles"] });
      setArticleForm(null);
      setShowPreview(false);
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteDocArticle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_articles"] });
      qc.invalidateQueries({ queryKey: ["doc_articles"] });
      setDeleteArticleId(null);
    },
  });

  const reorderSectionsMutation = useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) =>
      api.adminUpdateSectionOrders(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_sections"] });
      qc.invalidateQueries({ queryKey: ["doc_sections"] });
    },
  });

  const reorderArticlesMutation = useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) =>
      api.adminUpdateSortOrders(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_articles"] });
      qc.invalidateQueries({ queryKey: ["doc_articles"] });
    },
  });

  const togglePublish = (a: DocArticleRow) =>
    api.adminSaveDocArticle({ id: a.id, is_published: !a.is_published } as any)
      .then(() => qc.invalidateQueries({ queryKey: ["admin_doc_articles"] }));

  // ── Section drag handlers ────────────────────────────────────────────────────

  const onSectionDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSectionId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onSectionDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragOverSectionId) setDragOverSectionId(id);
  };
  const onSectionDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetId) {
      setDraggedSectionId(null); setDragOverSectionId(null); return;
    }
    const items = [...sections];
    const fromIdx = items.findIndex(s => s.id === draggedSectionId);
    const toIdx = items.findIndex(s => s.id === targetId);
    items.splice(fromIdx, 1);
    items.splice(toIdx, 0, sections[fromIdx]);
    reorderSectionsMutation.mutate(items.map((s, i) => ({ id: s.id, sort_order: i + 1 })));
    setDraggedSectionId(null); setDragOverSectionId(null);
  };
  const onSectionDragEnd = () => { setDraggedSectionId(null); setDragOverSectionId(null); };

  // ── Article drag handlers ────────────────────────────────────────────────────

  const onArticleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedArticleId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onArticleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragOverArticleId) setDragOverArticleId(id);
  };
  const onArticleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedArticleId || draggedArticleId === targetId) {
      setDraggedArticleId(null); setDragOverArticleId(null); return;
    }
    const items = [...sectionArticles];
    const fromIdx = items.findIndex(a => a.id === draggedArticleId);
    const toIdx = items.findIndex(a => a.id === targetId);
    const moved = items.splice(fromIdx, 1)[0];
    items.splice(toIdx, 0, moved);
    reorderArticlesMutation.mutate(items.map((a, i) => ({ id: a.id, sort_order: i + 1 })));
    setDraggedArticleId(null); setDragOverArticleId(null);
  };
  const onArticleDragEnd = () => { setDraggedArticleId(null); setDragOverArticleId(null); };

  const setF = (k: keyof ArticleForm, v: ArticleForm[keyof ArticleForm]) =>
    setArticleForm(f => f ? { ...f, [k]: v } : f);
  const setSF = (k: keyof SectionForm, v: string) =>
    setSectionForm(f => f ? { ...f, [k]: v } : f);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{t("adminDocs")}</h1>
        <p className="text-sm text-slate-500">{t("adminDocsDesc")}</p>
      </div>

      <div className="flex gap-0 border border-slate-200 rounded-sm overflow-hidden min-h-[500px]">

        {/* ── Left panel: sections ────────────────────────────────────────── */}
        <div className="w-56 shrink-0 flex flex-col border-e border-slate-200 bg-slate-50">
          <div className="px-3 py-2.5 border-b border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === "ar" ? "الأقسام" : "Sections"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {sectionsLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />
              </div>
            ) : sections.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                {lang === "ar" ? "لا أقسام بعد" : "Aucune section"}
              </p>
            ) : (
              sections.map(s => {
                const isSelected = selectedKey === s.key;
                const isDragging = draggedSectionId === s.id;
                const isOver = dragOverSectionId === s.id && draggedSectionId !== s.id;
                const count = allArticles.filter(a => a.section_key === s.key).length;
                const label = lang === "ar" ? (s.label_ar || s.label_fr) : s.label_fr;

                return (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={e => onSectionDragStart(e, s.id)}
                    onDragOver={e => onSectionDragOver(e, s.id)}
                    onDrop={e => onSectionDrop(e, s.id)}
                    onDragEnd={onSectionDragEnd}
                    onClick={() => setSelectedKey(s.key)}
                    className={`group flex items-center gap-1.5 px-2 py-2 cursor-pointer transition-colors ${
                      isSelected ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
                        : "hover:bg-white text-slate-600"
                    } ${isDragging ? "opacity-40" : ""} ${isOver ? "border-t-2 border-[#1E3A8A]" : ""}`}
                  >
                    <GripVertical
                      className="h-3.5 w-3.5 text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="flex-1 text-xs font-medium truncate">{label}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{count}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setSectionForm(toSectionForm(s)); }}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-400 shrink-0"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-slate-200">
            <button
              onClick={() => setSectionForm(emptySectionForm())}
              className="w-full flex items-center justify-center gap-1.5 h-7 rounded text-xs font-medium text-slate-500 hover:bg-white hover:text-slate-800 transition-colors border border-dashed border-slate-300 hover:border-slate-400"
            >
              <Plus className="h-3 w-3" />
              {lang === "ar" ? "قسم جديد" : "Nouveau section"}
            </button>
          </div>
        </div>

        {/* ── Right panel: articles ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedSection ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-300 py-20">
              <FolderOpen className="h-8 w-8" />
              <p className="text-sm">{lang === "ar" ? "اختر قسماً من اليسار" : "Sélectionnez une section"}</p>
            </div>
          ) : (
            <>
              {/* Articles panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {lang === "ar" ? (selectedSection.label_ar || selectedSection.label_fr) : selectedSection.label_fr}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{selectedSection.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteSection(selectedSection)}
                    className="h-7 px-2.5 text-xs text-rose-500 hover:bg-rose-50 rounded transition-colors"
                    title={lang === "ar" ? "حذف القسم" : "Supprimer la section"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const next = sectionArticles.length + 1;
                      setArticleForm(emptyArticleForm(selectedKey!, next));
                      setShowPreview(false);
                    }}
                    className="flex items-center gap-1.5 h-7 px-3 bg-[#1E3A8A] text-white text-xs font-medium rounded-sm hover:bg-[#1e40af] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {t("newArticle")}
                  </button>
                </div>
              </div>

              {/* Articles list */}
              <div className="flex-1 overflow-y-auto">
                {articlesLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />
                  </div>
                ) : sectionArticles.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-300">
                    {lang === "ar" ? "لا مقالات في هذا القسم" : "Aucun article dans cette section"}
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {sectionArticles.map(a => {
                        const isDragging = draggedArticleId === a.id;
                        const isOver = dragOverArticleId === a.id && draggedArticleId !== a.id;
                        return (
                          <tr
                            key={a.id}
                            draggable
                            onDragStart={e => onArticleDragStart(e, a.id)}
                            onDragOver={e => onArticleDragOver(e, a.id)}
                            onDrop={e => onArticleDrop(e, a.id)}
                            onDragEnd={onArticleDragEnd}
                            className={`transition-colors ${isDragging ? "opacity-40 bg-slate-50" : isOver ? "bg-blue-50 border-t-2 border-[#1E3A8A]" : "hover:bg-slate-50"}`}
                          >
                            <td className="w-8 px-3 py-3">
                              <GripVertical className="h-4 w-4 text-slate-300 cursor-grab active:cursor-grabbing" />
                            </td>
                            <td className="px-3 py-3 flex-1">
                              <div className="font-medium text-slate-800 text-sm">{(a.title as any)?.fr}</div>
                              <div className="text-slate-400 text-xs mt-0.5">{(a.title as any)?.ar}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                onClick={() => togglePublish(a)}
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                  a.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {a.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                {a.is_published ? t("published") : "Draft"}
                              </button>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => { setArticleForm(toArticleForm(a)); setShowPreview(false); }}
                                  className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteArticleId(a.id)}
                                  className="h-7 w-7 flex items-center justify-center rounded hover:bg-rose-50 text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Section modal ──────────────────────────────────────────────────── */}
      {sectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">
                {sectionForm.id ? (lang === "ar" ? "تعديل القسم" : "Modifier la section") : (lang === "ar" ? "قسم جديد" : "Nouvelle section")}
              </h2>
              <button onClick={() => setSectionForm(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {!sectionForm.id && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("sectionKey")}</label>
                  <input
                    className="h-8 w-full rounded border border-slate-200 px-3 text-sm font-mono"
                    value={sectionForm.key}
                    onChange={e => setSF("key", e.target.value)}
                    placeholder="getting_started"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t("sectionLabel")} (FR)</label>
                <input
                  className="h-8 w-full rounded border border-slate-200 px-3 text-sm"
                  value={sectionForm.label_fr}
                  onChange={e => setSF("label_fr", e.target.value)}
                  placeholder="Démarrage"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t("sectionLabel")} (AR)</label>
                <input
                  dir="rtl"
                  className="h-8 w-full rounded border border-slate-200 px-3 text-sm"
                  value={sectionForm.label_ar}
                  onChange={e => setSF("label_ar", e.target.value)}
                  placeholder="البدء"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setSectionForm(null)} className="h-8 px-4 text-sm text-slate-600 rounded hover:bg-slate-100">
                {t("adminCancel")}
              </button>
              <button
                disabled={saveSectionMutation.isPending}
                onClick={() => saveSectionMutation.mutate(sectionForm)}
                className="h-8 px-4 text-sm bg-[#1E3A8A] text-white rounded-sm font-medium flex items-center gap-1.5 hover:bg-[#1e40af] disabled:opacity-60"
              >
                {saveSectionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Article modal ──────────────────────────────────────────────────── */}
      {articleForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-4xl my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">
                {articleForm.id ? t("editArticle") : t("newArticle")}
              </h2>
              <button onClick={() => setArticleForm(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">{lang === "ar" ? "القسم" : "Section"}</label>
                  <select
                    className="h-8 w-full rounded border border-slate-200 px-3 text-sm bg-white"
                    value={articleForm.section_key}
                    onChange={e => setF("section_key", e.target.value)}
                  >
                    {sections.map(s => (
                      <option key={s.key} value={s.key}>
                        {s.label_fr} / {s.label_ar}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("sortOrder")}</label>
                  <input
                    type="number"
                    className="h-8 w-full rounded border border-slate-200 px-3 text-sm"
                    value={articleForm.sort_order}
                    onChange={e => setF("sort_order", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("articleTitle")} (FR)</label>
                  <input className="h-8 w-full rounded border border-slate-200 px-3 text-sm" value={articleForm.title_fr} onChange={e => setF("title_fr", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("articleTitle")} (AR)</label>
                  <input dir="rtl" className="h-8 w-full rounded border border-slate-200 px-3 text-sm" value={articleForm.title_ar} onChange={e => setF("title_ar", e.target.value)} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600">{t("articleContent")}</label>
                  <button
                    onClick={() => setShowPreview(p => !p)}
                    className={`h-6 px-2.5 text-xs rounded transition-colors ${showPreview ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {showPreview ? "Masquer" : "Aperçu"}
                  </button>
                </div>
                <div className={showPreview ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block mb-1">FR</span>
                    <textarea rows={10} className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y" value={articleForm.content_fr} onChange={e => setF("content_fr", e.target.value)} placeholder={"# Titre\n\n- Point 1"} />
                  </div>
                  {!showPreview && (
                    <div>
                      <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                      <textarea rows={10} dir="rtl" className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y" value={articleForm.content_ar} onChange={e => setF("content_ar", e.target.value)} placeholder="# العنوان" />
                    </div>
                  )}
                  {showPreview && (
                    <div className="rounded border border-slate-200 overflow-hidden">
                      <div className="flex border-b border-slate-100">
                        {(["fr", "ar"] as const).map(l => (
                          <button key={l} onClick={() => setPreviewLang(l)} className={`flex-1 py-1.5 text-xs font-medium transition-colors ${previewLang === l ? "bg-white text-slate-900 border-b-2 border-[#1E3A8A]" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}>
                            {l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div className={`p-3 h-64 overflow-y-auto ${previewLang === "ar" ? "rtl" : ""}`}>
                        {(previewLang === "fr" ? articleForm.content_fr : articleForm.content_ar)
                          ? <DocMarkdown text={previewLang === "fr" ? articleForm.content_fr : articleForm.content_ar} />
                          : <p className="text-slate-300 text-xs italic">Aucun contenu</p>
                        }
                      </div>
                    </div>
                  )}
                </div>
                {showPreview && (
                  <div className="mt-3">
                    <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                    <textarea rows={6} dir="rtl" className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y" value={articleForm.content_ar} onChange={e => setF("content_ar", e.target.value)} placeholder="# العنوان" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="pub" checked={articleForm.is_published} onChange={e => setF("is_published", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                <label htmlFor="pub" className="text-sm text-slate-700">{t("published")}</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setArticleForm(null)} className="h-8 px-4 text-sm text-slate-600 rounded hover:bg-slate-100">{t("adminCancel")}</button>
              <button
                disabled={saveArticleMutation.isPending}
                onClick={() => saveArticleMutation.mutate(articleForm)}
                className="h-8 px-4 text-sm bg-[#1E3A8A] text-white rounded-sm font-medium flex items-center gap-1.5 hover:bg-[#1e40af] disabled:opacity-60"
              >
                {saveArticleMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete section confirm ─────────────────────────────────────────── */}
      {deleteSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-sm space-y-4">
            {allArticles.filter(a => a.section_key === deleteSection.key).length > 0 ? (
              <>
                <p className="text-sm text-slate-700">
                  {lang === "ar"
                    ? "لا يمكن حذف قسم يحتوي على مقالات. احذف المقالات أولاً."
                    : "Impossible de supprimer une section qui contient des articles. Supprimez d'abord les articles."}
                </p>
                <div className="flex justify-end">
                  <button onClick={() => setDeleteSection(null)} className="h-8 px-4 text-sm rounded bg-slate-100 hover:bg-slate-200">{t("adminCancel")}</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-700">
                  {lang === "ar" ? `حذف قسم "${deleteSection.label_ar || deleteSection.label_fr}"؟` : `Supprimer la section "${deleteSection.label_fr}" ?`}
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeleteSection(null)} className="h-8 px-4 text-sm rounded hover:bg-slate-100">{t("adminCancel")}</button>
                  <button
                    disabled={deleteSectionMutation.isPending}
                    onClick={() => deleteSectionMutation.mutate(deleteSection.id)}
                    className="h-8 px-4 text-sm bg-rose-600 text-white rounded font-medium hover:bg-rose-700 disabled:opacity-60"
                  >
                    {t("delete")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete article confirm ─────────────────────────────────────────── */}
      {deleteArticleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-sm space-y-4">
            <p className="text-sm text-slate-700">{t("adminDeleteDocConfirm")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteArticleId(null)} className="h-8 px-4 text-sm rounded hover:bg-slate-100">{t("adminCancel")}</button>
              <button
                disabled={deleteArticleMutation.isPending}
                onClick={() => deleteArticleMutation.mutate(deleteArticleId)}
                className="h-8 px-4 text-sm bg-rose-600 text-white rounded font-medium hover:bg-rose-700 disabled:opacity-60"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
