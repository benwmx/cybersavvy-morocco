import { useLang } from "@/lib/i18n/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm">
      <Languages className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden />
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
          lang === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
          lang === "ar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        AR
      </button>
    </div>
  );
}
