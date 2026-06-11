import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import type { TKey } from "@/lib/i18n/translations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Search, Type, RotateCcw } from "lucide-react";
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

  const filtered = useMemo(() => {
    if (!search.trim()) return merged;
    const q = search.toLowerCase();
    return merged.filter(
      e => e.key.toLowerCase().includes(q) || e.fr.toLowerCase().includes(q) || e.ar.includes(q)
    );
  }, [merged, search]);

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

  const customCount = merged.filter(e => e.isCustom).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
            <Type className="h-5 w-5" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {t("adminTranslationsTitle")}
          </h1>
        </div>
        <p className="text-slate-500 font-medium ps-[52px]">
          {t("adminTranslationsSubtitle")}
        </p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-2xl font-black text-[#1E3A8A] flex items-center gap-3">
              {merged.length} {t("adminEntriesLabel")}
              {customCount > 0 && (
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full">
                  {customCount} personnalisées
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t("adminSearch")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="ps-9 h-10 rounded-xl border-slate-200 bg-slate-50 w-56"
                />
              </div>
              <Button
                onClick={() => { setAdding(true); setEditingKey(null); }}
                disabled={adding}
                className="h-10 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black shadow-lg active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 me-2" />
                {t("adminAdd")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-8 py-3 bg-slate-50 border-y border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span />
            <span>{t("adminColKey")}</span>
            <span>{t("adminColFr")}</span>
            <span>{t("adminColAr")}</span>
            <span />
          </div>

          {adding && (
            <div className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-8 py-3 border-b border-slate-100 bg-blue-50/40 items-center">
              <span />
              <Input
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="new_key"
                className="h-9 rounded-xl font-mono text-sm"
                autoFocus
              />
              <Input
                value={newFr}
                onChange={e => setNewFr(e.target.value)}
                placeholder="Texte français..."
                className="h-9 rounded-xl text-sm"
              />
              <Input
                value={newAr}
                onChange={e => setNewAr(e.target.value)}
                placeholder="النص بالعربية..."
                className="h-9 rounded-xl text-sm text-right"
                dir="rtl"
              />
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => upsert.mutate({ key: newKey.trim(), fr: newFr, ar: newAr })}
                  disabled={!newKey.trim() || !newFr || !newAr || upsert.isPending}
                  className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setAdding(false); setNewKey(""); setNewFr(""); setNewAr(""); }}
                  className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
            {filtered.map(entry => (
              <div
                key={entry.key}
                className="grid grid-cols-[16px_160px_1fr_1fr_72px] gap-3 px-8 py-3 items-center hover:bg-slate-50/60 transition-colors group"
              >
                <div className="flex items-center justify-center">
                  <div className={`h-2 w-2 rounded-full ${entry.isCustom ? "bg-indigo-400" : "bg-slate-200"}`} title={entry.isCustom ? "Personnalisé" : "Défaut"} />
                </div>

                {editingKey === entry.key ? (
                  <>
                    <span className="font-mono text-xs text-slate-400 truncate">{entry.key}</span>
                    <Input
                      value={editFr}
                      onChange={e => setEditFr(e.target.value)}
                      className="h-9 rounded-xl text-sm"
                      autoFocus
                    />
                    <Input
                      value={editAr}
                      onChange={e => setEditAr(e.target.value)}
                      className="h-9 rounded-xl text-sm text-right"
                      dir="rtl"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => upsert.mutate({ key: entry.key, fr: editFr, ar: editAr })}
                        disabled={upsert.isPending}
                        className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingKey(null)}
                        className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100"
                      >
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
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(entry)}
                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {entry.isCustom && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Réinitialiser aux valeurs par défaut"
                          onClick={() => {
                            if (confirm(`Réinitialiser "${entry.key}" aux valeurs par défaut ?`)) {
                              del.mutate(entry.key);
                            }
                          }}
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!allDefaultKeys.includes(entry.key as TKey) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`${t("delete")} "${entry.key}" ?`)) {
                              del.mutate(entry.key);
                            }
                          }}
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 font-bold italic">
              {t("adminNoResults")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
