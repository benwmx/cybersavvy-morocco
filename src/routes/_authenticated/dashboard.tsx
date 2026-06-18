import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { GraduationCap, Users, BookOpen, BarChart3, TrendingUp, BookMarked, BookText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useLang();

  const { data: session } = useQuery({ queryKey: ["session"], queryFn: () => api.getSession() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => api.listMyClasses() });
  const { data: scenarios = [] } = useQuery({ queryKey: ["scenarios"], queryFn: () => api.listScenarios() });
  const { data: results = [] } = useQuery({ queryKey: ["results-teacher"], queryFn: () => api.listResultsForTeacher() });

  const totalStudents = useQuery({
    queryKey: ["all-students-count"],
    queryFn: async () => {
      if (classes.length === 0) return 0;
      const counts = await Promise.all(classes.map(c => api.listStudentsInClass(c.id)));
      return counts.reduce((sum, arr) => sum + arr.length, 0);
    },
    enabled: classes.length > 0,
  });

  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.max_score > 0 ? (r.score / r.max_score) * 100 : 0), 0) / results.length)
    : null;

  const stats = [
    { label: t("classesLabel"), value: classes.length,               icon: GraduationCap, color: "bg-blue-50 text-[#1E3A8A]",      to: "/classes"   },
    { label: t("studentsLabel"), value: totalStudents.data ?? "—",   icon: Users,         color: "bg-emerald-50 text-emerald-600",   to: "/students"  },
    { label: t("tracks"),        value: scenarios.length,            icon: BookOpen,      color: "bg-violet-50 text-violet-600",     to: "/quizzes"   },
    { label: t("avgGeneral"),    value: avgScore !== null ? `${avgScore}%` : "—", icon: TrendingUp, color: "bg-amber-50 text-amber-600", to: "/analytics" },
  ];

  const shortcuts = [
    { label: t("analytics"),     desc: t("analyticsDesc"),   icon: BarChart3,  to: "/analytics", accent: "bg-[#1E3A8A]"    },
    { label: t("classesLabel"),  desc: t("classesDesc"),     icon: GraduationCap, to: "/classes", accent: "bg-emerald-500" },
    { label: t("tracks"),        desc: t("tracksDesc"),      icon: BookOpen,   to: "/quizzes",   accent: "bg-violet-500"   },
    { label: t("studentsLabel"), desc: t("studentsDesc"),    icon: Users,      to: "/students",  accent: "bg-amber-500"    },
    { label: t("tutorialsLabel"),desc: t("tutorialsDesc"),   icon: BookMarked, to: "/tutorials", accent: "bg-rose-500"     },
    { label: t("docsLabel"),     desc: t("docsDesc"),        icon: BookText,   to: "/docs",      accent: "bg-slate-600"    },
  ];

  const fullName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {fullName ? `${t("greeting")}, ${fullName}` : t("overview")}
          </h1>
          <p className="text-sm text-slate-500">{t("dashboardSubtitle")}</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Link key={s.to} to={s.to}>
            <Card className="border border-slate-200 shadow-none bg-white rounded-sm p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
              <div className={`h-8 w-8 shrink-0 rounded-sm flex items-center justify-center ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-mono font-semibold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Shortcuts */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-3">
          {t("quickAccess")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(s => (
            <Link key={s.to} to={s.to}>
              <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden hover:bg-slate-50 transition-colors group">
                <div className={`h-0.5 ${s.accent}`} />
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-sm flex items-center justify-center ${s.accent} text-white`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{s.label}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
