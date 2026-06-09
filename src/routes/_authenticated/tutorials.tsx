import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n/LanguageContext";
import { BookMarked } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tutorials")({
  component: TutorialsPage,
});

function TutorialsPage() {
  const { lang } = useLang();
  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
          {lang === "fr" ? "Tutoriels" : "الدروس"}
        </h1>
        <p className="text-slate-500 font-medium">
          {lang === "fr" ? "Contenu pédagogique global et personnalisé." : "المحتوى التعليمي العام والمخصص."}
        </p>
      </div>

      <div className="py-32 flex flex-col items-center gap-6 text-center">
        <div className="h-24 w-24 rounded-3xl bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
          <BookMarked className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-black text-slate-700">
            {lang === "fr" ? "Bientôt disponible" : "قريباً"}
          </p>
          <p className="text-slate-400 font-medium max-w-sm">
            {lang === "fr"
              ? "La gestion des tutoriels (global vs. personnalisé) sera disponible dans une prochaine mise à jour."
              : "ستكون إدارة الدروس (العامة والمخصصة) متاحة في تحديث قادم."}
          </p>
        </div>
      </div>
    </div>
  );
}
