import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "../lib/i18n/translations";

type TranslationDict = typeof translations.fr;

interface LanguageContextType {
  lang: Lang;
  t: TranslationDict;
  toggleLanguage: () => void;
  setLang: (l: Lang) => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored === "fr" || stored === "ar") setLangState(stored);
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

  const toggleLanguage = () => {
    setLang(lang === "fr" ? "ar" : "fr");
  };

  const dir = lang === "ar" ? "rtl" : "ltr";
  // We provide the dictionary directly as 't' for {t.keyName} usage
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used inside LanguageProvider");
  return context;
}
