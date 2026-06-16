import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DocArticleRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { DocMarkdown } from "@/components/DocMarkdown";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Loader2, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/docs")({
  component: AdminDocsPage,
});

type ArticleForm = {
  id?: string;
  section_key: string;
  section_label_fr: string;
  section_label_ar: string;
  title_fr: string;
  title_ar: string;
  content_fr: string;
  content_ar: string;
  sort_order: number;
  is_published: boolean;
};

const emptyForm = (): ArticleForm => ({
  section_key: "",
  section_label_fr: "",
  section_label_ar: "",
  title_fr: "",
  title_ar: "",
  content_fr: "",
  content_ar: "",
  sort_order: 0,
  is_published: true,
});

function toForm(a: DocArticleRow): ArticleForm {
  return {
    id: a.id,
    section_key: a.section_key,
    section_label_fr: (a.section_label as any)?.fr ?? "",
    section_label_ar: (a.section_label as any)?.ar ?? "",
    title_fr: (a.title as any)?.fr ?? "",
    title_ar: (a.title as any)?.ar ?? "",
    content_fr: (a.content as any)?.fr ?? "",
    content_ar: (a.content as any)?.ar ?? "",
    sort_order: a.sort_order,
    is_published: a.is_published,
  };
}

function toPayload(f: ArticleForm) {
  return {
    id: f.id,
    section_key: f.section_key.trim(),
    section_label: { fr: f.section_label_fr.trim(), ar: f.section_label_ar.trim() },
    title: { fr: f.title_fr.trim(), ar: f.title_ar.trim() },
    content: { fr: f.content_fr, ar: f.content_ar },
    sort_order: f.sort_order,
    is_published: f.is_published,
  };
}

function AdminDocsPage() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<"fr" | "ar">("fr");
  const [showPreview, setShowPreview] = useState(false);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin_doc_articles"],
    queryFn: () => api.adminListDocArticles(),
  });

  // Group articles by section for display and drag-within-section logic
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: DocArticleRow[] }>();
    const sorted = [...articles].sort((a, b) => {
      const sk = a.section_key.localeCompare(b.section_key);
      return sk !== 0 ? sk : a.sort_order - b.sort_order;
    });
    for (const a of sorted) {
      const label = lang === "ar"
        ? (a.section_label as any)?.ar ?? (a.section_label as any)?.fr ?? a.section_key
        : (a.section_label as any)?.fr ?? a.section_key;
      if (!map.has(a.section_key)) map.set(a.section_key, { label, items: [] });
      map.get(a.section_key)!.items.push(a);
    }
    return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }));
  }, [articles, lang]);

  const saveMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof toPayload>) => api.adminSaveDocArticle(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_articles"] });
      qc.invalidateQueries({ queryKey: ["doc_articles"] });
      setForm(null);
      setShowPreview(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteDocArticle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_doc_articles"] });
      qc.invalidateQueries({ queryKey: ["doc_articles"] });
      setDeleteId(null);
    },
  });

  const reorderMutation = useMutation({
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

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragOverId) setDragOverId(id);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }

    const dragged = articles.find(a => a.id === draggedId);
    const target = articles.find(a => a.id === targetId);
    if (!dragged || !target || dragged.section_key !== target.section_key) {
      setDraggedId(null); setDragOverId(null); return;
    }

    const section = grouped.find(g => g.key === dragged.section_key);
    if (!section) return;

    const items = [...section.items];
    const fromIdx = items.findIndex(a => a.id === draggedId);
    const toIdx = items.findIndex(a => a.id === targetId);
    items.splice(fromIdx, 1);
    items.splice(toIdx, 0, dragged);

    const updates = items.map((a, i) => ({ id: a.id, sort_order: i + 1 }));
    reorderMutation.mutate(updates);

    setDraggedId(null);
    setDragOverId(null);
  };

  const onDragEnd = () => { setDraggedId(null); setDragOverId(null); };

  const set = (k: keyof ArticleForm, v: ArticleForm[keyof ArticleForm]) =>
    setForm(f => f ? { ...f, [k]: v } : f);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("adminDocs")}</h1>
          <p className="text-sm text-slate-500">{t("adminDocsDesc")}</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm()); setShowPreview(false); }}
          className="flex items-center gap-2 h-8 px-3 bg-[#1E3A8A] text-white text-sm font-medium rounded-sm hover:bg-[#1e40af] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("newArticle")}
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-5 w-5 text-[#1E3A8A] animate-spin" /></div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-400">{t("noArticles")}</div>
      ) : (
        <div className="border border-slate-200 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="w-8 px-3 py-2.5" />
                <th className="px-4 py-2.5 text-start font-medium">{t("articleTitle")}</th>
                <th className="px-4 py-2.5 text-start font-medium">{t("published")}</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ key, label, items }) => (
                <>
                  {/* Section header row */}
                  <tr key={`section-${key}`} className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {label}
                      <span className="ms-2 text-slate-300 font-normal normal-case tracking-normal">
                        ({items.length})
                      </span>
                    </td>
                  </tr>

                  {/* Article rows */}
                  {items.map(a => {
                    const isDragging = draggedId === a.id;
                    const isOver = dragOverId === a.id && draggedId !== a.id;
                    const sameSection = draggedId
                      ? articles.find(x => x.id === draggedId)?.section_key === a.section_key
                      : true;

                    return (
                      <tr
                        key={a.id}
                        draggable
                        onDragStart={e => onDragStart(e, a.id)}
                        onDragOver={e => onDragOver(e, a.id)}
                        onDrop={e => onDrop(e, a.id)}
                        onDragEnd={onDragEnd}
                        className={`border-t border-slate-100 transition-colors ${
                          isDragging
                            ? "opacity-40 bg-slate-50"
                            : isOver && sameSection
                            ? "bg-blue-50 border-t-2 border-[#1E3A8A]"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Drag handle */}
                        <td className="w-8 px-3 py-3">
                          <GripVertical className="h-4 w-4 text-slate-300 cursor-grab active:cursor-grabbing" />
                        </td>

                        <td className="px-4 py-3 text-slate-800">
                          <div className="font-medium">{(a.title as any)?.fr}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{(a.title as any)?.ar}</div>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => togglePublish(a)}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              a.is_published
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {a.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {a.is_published ? t("published") : "Draft"}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => { setForm(toForm(a)); setShowPreview(false); }}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(a.id)}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-rose-50 text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-4xl my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">
                {form.id ? t("editArticle") : t("newArticle")}
              </h2>
              <button onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("sectionKey")}</label>
                  <input
                    className="h-8 w-full rounded border border-slate-200 px-3 text-sm font-mono"
                    value={form.section_key}
                    onChange={e => set("section_key", e.target.value)}
                    placeholder="getting_started"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("sortOrder")}</label>
                  <input
                    type="number"
                    className="h-8 w-full rounded border border-slate-200 px-3 text-sm"
                    value={form.sort_order}
                    onChange={e => set("sort_order", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("sectionLabel")} (FR)</label>
                  <input className="h-8 w-full rounded border border-slate-200 px-3 text-sm" value={form.section_label_fr} onChange={e => set("section_label_fr", e.target.value)} placeholder="Premiers pas" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("sectionLabel")} (AR)</label>
                  <input dir="rtl" className="h-8 w-full rounded border border-slate-200 px-3 text-sm" value={form.section_label_ar} onChange={e => set("section_label_ar", e.target.value)} placeholder="البدء" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("articleTitle")} (FR)</label>
                  <input className="h-8 w-full rounded border border-slate-200 px-3 text-sm" value={form.title_fr} onChange={e => set("title_fr", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t("articleTitle")} (AR)</label>
                  <input dir="rtl" className="h-8 w-full rounded border border-slate-200 px-3 text-sm" value={form.title_ar} onChange={e => set("title_ar", e.target.value)} />
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
                    <textarea
                      rows={10}
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y"
                      value={form.content_fr}
                      onChange={e => set("content_fr", e.target.value)}
                      placeholder={"# Titre\n\nContenu en markdown.\n\n- Point 1\n- Point 2"}
                    />
                  </div>

                  {!showPreview && (
                    <div>
                      <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                      <textarea
                        rows={10}
                        dir="rtl"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y"
                        value={form.content_ar}
                        onChange={e => set("content_ar", e.target.value)}
                        placeholder="# العنوان"
                      />
                    </div>
                  )}

                  {showPreview && (
                    <div className="rounded border border-slate-200 overflow-hidden">
                      <div className="flex border-b border-slate-100">
                        {(["fr", "ar"] as const).map(l => (
                          <button
                            key={l}
                            onClick={() => setPreviewLang(l)}
                            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${previewLang === l ? "bg-white text-slate-900 border-b-2 border-[#1E3A8A]" : "bg-slate-50 text-slate-400 hover:text-slate-600"}`}
                          >
                            {l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div className={`p-3 h-64 overflow-y-auto ${previewLang === "ar" ? "rtl" : ""}`}>
                        {(previewLang === "fr" ? form.content_fr : form.content_ar)
                          ? <DocMarkdown text={previewLang === "fr" ? form.content_fr : form.content_ar} />
                          : <p className="text-slate-300 text-xs italic">Aucun contenu</p>
                        }
                      </div>
                    </div>
                  )}
                </div>

                {showPreview && (
                  <div className="mt-3">
                    <span className="text-xs text-slate-400 font-medium block mb-1">AR</span>
                    <textarea
                      rows={6}
                      dir="rtl"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-xs font-mono resize-y"
                      value={form.content_ar}
                      onChange={e => set("content_ar", e.target.value)}
                      placeholder="# العنوان"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={form.is_published}
                  onChange={e => set("is_published", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="pub" className="text-sm text-slate-700">{t("published")}</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setForm(null)} className="h-8 px-4 text-sm text-slate-600 rounded hover:bg-slate-100">
                {t("adminCancel")}
              </button>
              <button
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate(toPayload(form))}
                className="h-8 px-4 text-sm bg-[#1E3A8A] text-white rounded-sm font-medium flex items-center gap-1.5 hover:bg-[#1e40af] disabled:opacity-60"
              >
                {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-sm space-y-4">
            <p className="text-sm text-slate-700">{t("adminDeleteDocConfirm")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="h-8 px-4 text-sm rounded hover:bg-slate-100">
                {t("adminCancel")}
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteId)}
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
