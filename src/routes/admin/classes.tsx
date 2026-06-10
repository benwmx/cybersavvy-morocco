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
  const { lang } = useLang();

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
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {lang === "fr" ? "Classes" : "الأقسام"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {lang === "fr"
              ? "Toutes les classes créées sur la plateforme"
              : "جميع الأقسام المنشأة على المنصة"}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black text-[#1E3A8A]">
            {isLoading
              ? "…"
              : lang === "fr"
              ? `${classes.length} classe${classes.length !== 1 ? "s" : ""}`
              : `${classes.length} قسم`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className={`grid ${cols} gap-4 px-8 py-3 bg-slate-50 border-y border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400`}>
            <span>{lang === "fr" ? "Nom" : "الاسم"}</span>
            <span>{lang === "fr" ? "Enseignant" : "المعلم"}</span>
            <span className="text-center">{lang === "fr" ? "Code" : "الرمز"}</span>
            <span className="text-center">{lang === "fr" ? "Élèves" : "التلاميذ"}</span>
            <span className="text-center">{lang === "fr" ? "Scénarios" : "السيناريوهات"}</span>
            <span>{lang === "fr" ? "Créée le" : "تاريخ الإنشاء"}</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`grid ${cols} gap-4 px-8 py-4`}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold italic">
              {lang === "fr" ? "Aucune classe." : "لا توجد أقسام."}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
              {classes.map(cls => (
                <div
                  key={cls.id}
                  className={`grid ${cols} gap-4 px-8 py-4 items-center hover:bg-slate-50/60 transition-colors`}
                >
                  <p className="text-sm font-semibold text-slate-700 truncate">{cls.name}</p>
                  <p className="text-xs text-slate-500 truncate">{cls.teacher_email}</p>
                  <span className="font-mono text-sm font-bold text-[#1E3A8A] text-center tracking-wider">
                    {cls.access_code}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 text-center">
                    {cls.student_count}
                  </span>
                  <span className="text-sm font-bold text-violet-600 text-center">
                    {cls.scenario_count}
                  </span>
                  <span className="text-sm text-slate-500">{fmt(cls.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
