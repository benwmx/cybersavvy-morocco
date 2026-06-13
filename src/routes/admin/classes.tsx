import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/admin/classes")({
  component: ClassesPage,
});

function ClassesPage() {
  const { t, lang } = useLang();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["admin-all-classes"],
    queryFn: () => api.adminListAllClasses(),
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "ar-MA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const cols = "grid-cols-[1fr_180px_90px_80px_80px_130px]";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <GraduationCap className="h-3.5 w-3.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("classesLabel")}</h1>
          <p className="text-sm text-slate-500">{t("adminClassesSubtitle")}</p>
        </div>
      </div>

      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-[#1E3A8A]" />
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800">
            {isLoading
              ? "…"
              : `${classes.length} ${t("classesLabel").toLowerCase()}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={`grid ${cols} gap-4 px-5 py-2.5 bg-slate-50 border-y border-slate-100 text-xs font-medium text-slate-500`}>
            <span>{t("colName")}</span>
            <span>{t("colTeacher")}</span>
            <span className="text-center">{t("colCode")}</span>
            <span className="text-center">{t("studentsLabel")}</span>
            <span className="text-center">{t("colScenarios")}</span>
            <span>{t("colCreatedAt")}</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`grid ${cols} gap-4 px-5 py-3`}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {t("noClassesAdmin")}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
              {classes.map(cls => (
                <div
                  key={cls.id}
                  className={`grid ${cols} gap-4 px-5 py-3 items-center hover:bg-slate-50/60 transition-colors`}
                >
                  <p className="text-sm font-medium text-slate-700 truncate">{cls.name}</p>
                  <p className="text-xs text-slate-500 truncate">{cls.teacher_email}</p>
                  <span className="font-mono text-xs font-semibold text-[#1E3A8A] text-center tracking-wider">
                    {cls.access_code}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 text-center">
                    {cls.student_count}
                  </span>
                  <span className="text-sm font-semibold text-violet-600 text-center">
                    {cls.scenario_count}
                  </span>
                  <span className="text-xs text-slate-500">{fmt(cls.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
