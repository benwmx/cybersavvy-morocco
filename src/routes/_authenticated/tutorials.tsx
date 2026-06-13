import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n/LanguageContext";
import { BookMarked } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tutorials")({
  component: TutorialsPage,
});

function TutorialsPage() {
  const { lang } = useLang();
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold text-slate-900">
          {lang === "fr" ? "Tutoriels" : "الدروس"}
        </h1>
        <p className="text-sm text-slate-500">
          {lang === "fr" ? "Contenu pédagogique global et personnalisé." : "المحتوى التعليمي العام والمخصص."}
        </p>
      </div>

      <div className="py-24 flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400">
          <BookMarked className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-700">
            {lang === "fr" ? "Bientôt disponible" : "قريباً"}
          </p>
          <p className="text-sm text-slate-500 max-w-sm">
            {lang === "fr"
              ? "La gestion des tutoriels (global vs. personnalisé) sera disponible dans une prochaine mise à jour."
              : "ستكون إدارة الدروس (العامة والمخصصة) متاحة في تحديث قادم."}
          </p>
        </div>
      </div>
    </div>
  );
}
