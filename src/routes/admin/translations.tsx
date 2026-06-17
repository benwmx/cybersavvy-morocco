import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import type { TKey } from "@/lib/i18n/translations";
import { TRANSLATION_GROUPS } from "@/lib/i18n/translationGroups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Search, Type, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { getDB } from "@/lib/offline/db";
import type { LocalTranslation } from "@/lib/offline/db";

export const Route = createFileRoute("/admin/translations")({
  component: TranslationsPage,
});

type MergedEntry = {
  key: string;
  fr: string;
  ar: string;
  isCustom: boolean;
};

function TranslationsPage() {
  const { t } = useLang();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editFr, setEditFr] = useState("");
  const [editAr, setEditAr] = useState("");
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newFr, setNewFr] = useState("");
  const [newAr, setNewAr] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const { data: supabaseRows = [] } = useQuery({
    queryKey: ["translations-admin"],
    queryFn: () => api.listTranslations(),
  });

  const allDefaultKeys = Object.keys(translations.fr) as TKey[];

  const merged: MergedEntry[] = useMemo(() => {
    const supabaseMap = new Map(supabaseRows.map(r => [r.key, r]));
    const defaultEntries: MergedEntry[] = allDefaultKeys.map(key => {
      const override = supabaseMap.get(key);
      return {
        key,
        fr: override?.fr ?? translations.fr[key],
        ar: override?.ar ?? (translations.ar as Record<string, string>)[key] ?? "",
        isCustom: supabaseMap.has(key),
      };
    });
    const extraEntries: MergedEntry[] = supabaseRows
      .filter(r => !allDefaultKeys.includes(r.key as TKey))
      .map(r => ({ key: r.key, fr: r.fr, ar: r.ar, isCustom: true }));
    return [...defaultEntries, ...extraEntries];
  }, [supabaseRows, allDefaultKeys]);

  // Flat filtered list — used when search is active
  const filtered = useMemo(() => {
    if (!search.trim()) return merged;
    const q = search.toLowerCase();
    return merged.filter(
      e => e.key.toLowerCase().includes(q) || e.fr.toLowerCase().includes(q) || e.ar.includes(q)
    );
  }, [merged, search]);

  // Grouped view — used when no search
  const groups = useMemo(() => {
    const mergedMap = new Map(merged.map(e => [e.key, e]));
    const assigned = new Set<string>();

    const result = TRANSLATION_GROUPS.map(g => {
      const entries = g.keys
        .map(k => mergedMap.get(k))
        .filter((e): e is MergedEntry => e !== undefined);
      entries.forEach(e => assigned.add(e.key));
      return { label: g.label, entries };
    }).filter(g => g.entries.length > 0);

    // Catch-all for keys not in any group
    const ungrouped = merged.filter(e => !assigned.has(e.key));
    if (ungrouped.length > 0) result.push({ label: "Divers", entries: ungrouped });

    return result;
  }, [merged]);

  const syncDexie = async (key: string, fr: string, ar: string) => {
    const db = getDB();
    if (db) await db.translations.put({ key, fr, ar } as LocalTranslation).catch(() => {});
  };

  const removeDexie = async (key: string) => {
    const db = getDB();
    if (db) await db.translations.delete(key).catch(() => {});
  };

  const upsert = useMutation({
    mutationFn: ({ key, fr, ar }: { key: string; fr: string; ar: string }) =>
      api.upsertTranslation(key, fr, ar),
    onSuccess: async (row) => {
      await syncDexie(row.key, row.fr, row.ar);
      qc.invalidateQueries({ queryKey: ["translations-admin"] });
      setEditingKey(null);
      setAdding(false);
      setNewKey(""); setNewFr(""); setNewAr("");
      toast.success(t("adminSaved"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const del = useMutation({
    mutationFn: (key: string) => api.deleteTranslation(key),
    onSuccess: async (_, key) => {
      await removeDexie(key);
      qc.invalidateQueries({ queryKey: ["translations-admin"] });
      toast.success(t("adminDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startEdit = (entry: MergedEntry) => {
    setAdding(false);
    setEditingKey(entry.key);
    setEditFr(entry.fr);
    setEditAr(entry.ar);
  };

  const toggleCollapse = (label: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const customCount = merged.filter(e => e.isCustom).length;
  const isSearching = search.trim().length > 0;

  const ColHeader = () => (
    <div className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-5 py-2.5 bg-slate-50 border-y border-slate-100 text-xs font-medium text-slate-500">
      <span />
      <span>{t("adminColKey")}</span>
      <span>{t("adminColFr")}</span>
      <span>{t("adminColAr")}</span>
      <span />
    </div>
  );

  const EntryRow = ({ entry }: { entry: MergedEntry }) => (
    <div
      className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-5 py-2.5 items-center hover:bg-slate-50/60 transition-colors group"
    >
      <div className="flex items-center justify-center">
        <div className={`h-1.5 w-1.5 rounded-full ${entry.isCustom ? "bg-indigo-400" : "bg-slate-200"}`} />
      </div>

      {editingKey === entry.key ? (
        <>
          <span className="font-mono text-xs text-slate-400 truncate">{entry.key}</span>
          <Input value={editFr} onChange={e => setEditFr(e.target.value)} className="h-8 rounded text-sm" autoFocus />
          <Input value={editAr} onChange={e => setEditAr(e.target.value)} className="h-8 rounded text-sm text-right" dir="rtl" />
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => upsert.mutate({ key: entry.key, fr: editFr, ar: editAr })} disabled={upsert.isPending} className="h-8 w-8 rounded text-emerald-600 hover:bg-emerald-50">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setEditingKey(null)} className="h-8 w-8 rounded text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className="font-mono text-xs text-slate-400 truncate">{entry.key}</span>
          <span className="text-sm text-slate-700 truncate">{entry.fr}</span>
          <span className="text-sm text-slate-700 truncate text-right" dir="rtl">{entry.ar}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => startEdit(entry)} className="h-8 w-8 rounded text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {entry.isCustom && (
              <Button size="icon" variant="ghost" title="Réinitialiser aux valeurs par défaut"
                onClick={() => { if (confirm(`Réinitialiser "${entry.key}" aux valeurs par défaut ?`)) del.mutate(entry.key); }}
                className="h-8 w-8 rounded text-slate-400 hover:text-amber-500 hover:bg-amber-50">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            {!allDefaultKeys.includes(entry.key as TKey) && (
              <Button size="icon" variant="ghost"
                onClick={() => { if (confirm(`${t("delete")} "${entry.key}" ?`)) del.mutate(entry.key); }}
                className="h-8 w-8 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
            <Type className="h-3.5 w-3.5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{t("adminTranslationsTitle")}</h1>
        </div>
        <p className="text-sm text-slate-500 ps-[34px]">{t("adminTranslationsSubtitle")}</p>
      </div>

      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-[#1E3A8A]" />
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              {merged.length} {t("adminEntriesLabel")}
              {customCount > 0 && (
                <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                  {customCount} personnalisées
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder={t("adminSearch")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="ps-8 h-8 rounded border-slate-200 bg-slate-50 text-sm w-48"
                />
              </div>
              <Button
                onClick={() => { setAdding(true); setEditingKey(null); }}
                disabled={adding}
                className="h-8 px-3 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium"
              >
                <Plus className="h-3.5 w-3.5 me-1.5" />
                {t("adminAdd")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* New-entry row */}
          {adding && (
            <>
              <ColHeader />
              <div className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-5 py-2.5 border-b border-slate-100 bg-blue-50/40 items-center">
                <span />
                <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="new_key" className="h-8 rounded font-mono text-sm" autoFocus />
                <Input value={newFr} onChange={e => setNewFr(e.target.value)} placeholder="Texte français..." className="h-8 rounded text-sm" />
                <Input value={newAr} onChange={e => setNewAr(e.target.value)} placeholder="النص بالعربية..." className="h-8 rounded text-sm text-right" dir="rtl" />
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => upsert.mutate({ key: newKey.trim(), fr: newFr, ar: newAr })} disabled={!newKey.trim() || !newFr || !newAr || upsert.isPending} className="h-8 w-8 rounded text-emerald-600 hover:bg-emerald-50">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setAdding(false); setNewKey(""); setNewFr(""); setNewAr(""); }} className="h-8 w-8 rounded text-slate-400 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ── Flat search results ── */}
          {isSearching && (
            <>
              <ColHeader />
              <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
                {filtered.map(entry => <EntryRow key={entry.key} entry={entry} />)}
              </div>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">{t("adminNoResults")}</div>
              )}
            </>
          )}

          {/* ── Grouped view ── */}
          {!isSearching && (
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
              {groups.map(group => {
                const isCollapsed = collapsed.has(group.label);
                const groupCustom = group.entries.filter(e => e.isCustom).length;
                return (
                  <div key={group.label}>
                    {/* Group header */}
                    <button
                      onClick={() => toggleCollapse(group.label)}
                      className="w-full flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      {isCollapsed
                        ? <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      }
                      <span className="text-xs font-semibold text-slate-600 flex-1">{group.label}</span>
                      <span className="text-[10px] text-slate-400 tabular-nums">{group.entries.length} clés</span>
                      {groupCustom > 0 && (
                        <span className="text-[10px] font-medium bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded">
                          {groupCustom} perso.
                        </span>
                      )}
                    </button>

                    {/* Group rows */}
                    {!isCollapsed && (
                      <div className="divide-y divide-slate-50">
                        {/* Column header — only shown for first group or after an expanded header */}
                        <div className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-5 py-1.5 border-b border-slate-100 text-[10px] font-medium text-slate-400 bg-white">
                          <span />
                          <span>{t("adminColKey")}</span>
                          <span>{t("adminColFr")}</span>
                          <span>{t("adminColAr")}</span>
                          <span />
                        </div>
                        {group.entries.map(entry => <EntryRow key={entry.key} entry={entry} />)}
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
  );
}
