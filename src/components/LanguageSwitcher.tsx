import { useLang } from "@/lib/i18n/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-white p-1 shadow-sm border-slate-200">
      <div className="ms-2 me-1 flex items-center justify-center">
        <Languages className="h-4 w-4 text-[#1E3A8A]/50" aria-hidden />
      </div>
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
          lang === "fr" ? "bg-[#1E3A8A] text-white shadow-md" : "text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-50"
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
          lang === "ar" ? "bg-[#1E3A8A] text-white shadow-md" : "text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-50"
        }`}
      >
        AR
      </button>
    </div>
  );
}
