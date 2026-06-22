import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type DocArticleRow, type DocSectionRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { BookOpen, FileText, Loader2, ChevronRight, Search } from "lucide-react";
import { DocMarkdown } from "@/components/DocMarkdown";

export const Route = createFileRoute("/_authenticated/docs")({
  component: DocsPage,
});

// ── Main page ────────────────────────────────────────────────────────────────

function DocsPage() {
  const { t, lang } = useLang();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(224);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: sidebarWidth };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = (lang === "ar" ? -1 : 1) * (ev.clientX - dragRef.current.startX);
      setSidebarWidth(Math.min(400, Math.max(160, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const { data: sections = [] } = useQuery({
    queryKey: ["doc_sections"],
    queryFn: () => api.listDocSections(),
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["doc_articles"],
    queryFn: () => api.listDocArticles(),
  });

  const sectionOrder = useMemo(() => {
    const map = new Map<string, number>();
    sections.forEach((s: DocSectionRow) => map.set(s.key, s.sort_order));
    return map;
  }, [sections]);

  const filtered = useMemo<DocArticleRow[]>(() => {
    if (!query.trim()) return articles;
    const q = query.toLowerCase();
    return articles.filter(a => {
      const title = lang === "ar" ? (a.title as any)?.ar : (a.title as any)?.fr;
      const content = lang === "ar" ? (a.content as any)?.ar : (a.content as any)?.fr;
      return title?.toLowerCase().includes(q) || content?.toLowerCase().includes(q);
    });
  }, [articles, query, lang]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, { label: string; order: number; items: DocArticleRow[] }>();
    filtered.forEach(a => {
      const sec = sections.find((s: DocSectionRow) => s.key === a.section_key);
      const label = sec
        ? (lang === "ar" ? sec.label_ar || sec.label_fr : sec.label_fr)
        : lang === "ar"
          ? (a.section_label as any)?.ar ?? (a.section_label as any)?.fr ?? a.section_key
          : (a.section_label as any)?.fr ?? a.section_key;
      const order = sectionOrder.get(a.section_key) ?? 999;
      if (!map.has(a.section_key)) map.set(a.section_key, { label, order, items: [] });
      map.get(a.section_key)!.items.push(a);
    });
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [filtered, lang, sections, sectionOrder]);

  const selected = articles.find(a => a.id === selectedId)
    ?? (filtered.length > 0 ? filtered[0] : null);

  const title = (a: DocArticleRow) =>
    lang === "ar" ? (a.title as any)?.ar ?? (a.title as any)?.fr : (a.title as any)?.fr;

  const content = (a: DocArticleRow) =>
    lang === "ar"
      ? (a.content as any)?.ar ?? (a.content as any)?.fr ?? ""
      : (a.content as any)?.fr ?? "";

  const sectionLabel = (a: DocArticleRow) =>
    lang === "ar"
      ? (a.section_label as any)?.ar ?? (a.section_label as any)?.fr
      : (a.section_label as any)?.fr;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold text-slate-900">{t("docs")}</h1>
          <p className="text-sm text-slate-500">{t("docsDesc")}</p>
        </div>
        <div className="relative w-56 shrink-0">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedId(null); }}
            placeholder={t("searchPlaceholder")}
            className="w-full h-8 rounded border border-slate-200 bg-white text-sm ps-8 pe-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-5 w-5 text-[#1E3A8A] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-slate-400">
          <BookOpen className="h-8 w-8" />
          <p className="text-sm">{query ? t("noResults") : t("noArticles")}</p>
        </div>
      ) : (
        <div className="flex items-start">
          {/* Desktop nav */}
          <aside
            className="hidden md:block shrink-0 sticky top-4"
            style={{ width: sidebarWidth }}
          >
            <nav className="space-y-5">
              {groupedSections.map(section => (
                <div key={section.label}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5 px-2">
                    {section.label}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map(a => {
                      const isActive = selected?.id === a.id;
                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => setSelectedId(a.id)}
                            className={`w-full text-start flex items-start gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                              isActive
                                ? "bg-blue-50 text-[#1E3A8A] font-medium"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <FileText className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isActive ? "text-[#1E3A8A]" : "text-slate-300"}`} />
                            <span className="leading-snug line-clamp-2 break-words">{title(a)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            className="hidden md:flex w-4 self-stretch cursor-col-resize items-center justify-center shrink-0 group mx-1"
          >
            <div className="w-px h-full bg-slate-200 group-hover:bg-[#1E3A8A]/30 transition-colors" />
          </div>

          {/* Mobile picker */}
          <div className="md:hidden w-full mb-4">
            <select
              className="w-full h-9 rounded border border-slate-200 bg-white text-sm px-3 text-slate-700"
              value={selected?.id ?? ""}
              onChange={e => setSelectedId(e.target.value)}
            >
              {groupedSections.map(section => (
                <optgroup key={section.label} label={section.label}>
                  {section.items.map(a => (
                    <option key={a.id} value={a.id}>{title(a)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Content panel */}
          {selected && (
            <article className="flex-1 min-w-0 border border-slate-200 rounded-sm bg-white">
              {/* Article header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-medium text-slate-500">{sectionLabel(selected)}</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-slate-700 font-semibold truncate">{title(selected)}</span>
              </div>
              {/* Article body */}
              <div className="px-6 py-5">
                <DocMarkdown text={content(selected)} />
              </div>
              {/* Navigation footer */}
              <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {(() => {
                  const idx = filtered.findIndex(a => a.id === selected.id);
                  const prev = filtered[idx - 1];
                  const next = filtered[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <button
                          onClick={() => setSelectedId(prev.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1E3A8A] transition-colors"
                        >
                          <ChevronRight className="h-3 w-3 rotate-180" />
                          <span className="truncate max-w-[160px]">{title(prev)}</span>
                        </button>
                      ) : <span />}
                      {next ? (
                        <button
                          onClick={() => setSelectedId(next.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1E3A8A] transition-colors ms-auto"
                        >
                          <span className="truncate max-w-[160px]">{title(next)}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ) : <span />}
                    </>
                  );
                })()}
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
