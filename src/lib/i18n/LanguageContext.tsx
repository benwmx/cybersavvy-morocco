import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type TKey } from "./translations";
import { getDB } from "@/lib/offline/db";

type Overrides = Record<string, { fr: string; ar: string }>;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey | (string & {})) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  const [overrides, setOverrides] = useState<Overrides>({});

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored === "fr" || stored === "ar") setLangState(stored);
  }, []);

  // Load translations from Dexie (populated by syncTranslations on first online visit).
  // Falls back silently to the hardcoded translations.ts if Dexie is empty.
  useEffect(() => {
    const db = getDB();
    if (!db) return;
    db.translations.toArray().then(rows => {
      if (!rows.length) return;
      const map: Overrides = {};
      for (const row of rows) map[row.key] = { fr: row.fr, ar: row.ar };
      setOverrides(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  const t = (k: TKey | (string & {})): string => {
    const override = overrides[k];
    if (override) return override[lang] ?? override.fr;
    return (translations[lang] as any)[k] ?? (translations.fr as any)[k];
  };

  return <Ctx.Provider value={{ lang, setLang, t, dir }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLang must be used inside LanguageProvider");
  return c;
}
