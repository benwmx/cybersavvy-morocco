import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n/LanguageContext";
import { BookMarked } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tutorials")({
  component: TutorialsPage,
});

function TutorialsPage() {
  const { t } = useLang();
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold text-slate-900">{t("tutorialsLabel")}</h1>
        <p className="text-sm text-slate-500">{t("tutorialsPageDesc")}</p>
      </div>

      <div className="py-24 flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400">
          <BookMarked className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-700">{t("comingSoon")}</p>
          <p className="text-sm text-slate-500 max-w-sm">{t("tutorialsComingSoonDesc")}</p>
        </div>
      </div>
    </div>
  );
}
