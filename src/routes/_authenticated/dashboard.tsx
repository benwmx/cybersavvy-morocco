import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { GraduationCap, Users, BookOpen, BarChart3, TrendingUp, BookMarked, ArrowRight, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { lang } = useLang();

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
    {
      label: lang === "fr" ? "Classes" : "الأقسام",
      value: classes.length,
      icon: GraduationCap,
      color: "bg-blue-50 text-[#1E3A8A]",
      to: "/classes",
    },
    {
      label: lang === "fr" ? "Élèves" : "التلاميذ",
      value: totalStudents.data ?? "—",
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
      to: "/students",
    },
    {
      label: lang === "fr" ? "Parcours" : "المسارات",
      value: scenarios.length,
      icon: BookOpen,
      color: "bg-violet-50 text-violet-600",
      to: "/quizzes",
    },
    {
      label: lang === "fr" ? "Moyenne générale" : "المعدل العام",
      value: avgScore !== null ? `${avgScore}%` : "—",
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      to: "/analytics",
    },
  ];

  const shortcuts = [
    {
      label: lang === "fr" ? "Analyses" : "التحليلات",
      desc: lang === "fr" ? "Performance des cohortes" : "أداء الأفواج",
      icon: BarChart3,
      to: "/analytics",
      accent: "bg-[#1E3A8A]",
    },
    {
      label: lang === "fr" ? "Classes" : "الأقسام",
      desc: lang === "fr" ? "Gérer les groupes" : "إدارة المجموعات",
      icon: GraduationCap,
      to: "/classes",
      accent: "bg-emerald-500",
    },
    {
      label: lang === "fr" ? "Parcours" : "المسارات",
      desc: lang === "fr" ? "Catégories & scénarios" : "المحاور والمسارات",
      icon: BookOpen,
      to: "/quizzes",
      accent: "bg-violet-500",
    },
    {
      label: lang === "fr" ? "Élèves" : "التلاميذ",
      desc: lang === "fr" ? "Registre & import" : "السجل والاستيراد",
      icon: Users,
      to: "/students",
      accent: "bg-amber-500",
    },
    {
      label: lang === "fr" ? "Tutoriels" : "الدروس",
      desc: lang === "fr" ? "Contenu pédagogique" : "المحتوى التعليمي",
      icon: BookMarked,
      to: "/tutorials",
      accent: "bg-rose-500",
    },
  ];

  const fullName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <User className="h-7 w-7" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {fullName
              ? lang === "fr"
                ? `Bonjour, ${fullName}`
                : `مرحباً، ${fullName}`
              : lang === "fr" ? "Vue d'ensemble" : "نظرة عامة"}
          </h1>
          <p className="text-slate-500 font-medium">
            {lang === "fr" ? "Tableau de bord de supervision." : "لوحة قيادة الإشراف."}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Link key={s.to} to={s.to}>
            <Card className="border-none shadow-lg shadow-slate-200 bg-white rounded-[1.5rem] p-6 flex items-center gap-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
              <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                <s.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Shortcuts */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          {lang === "fr" ? "Accès rapide" : "وصول سريع"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(s => (
            <Link key={s.to} to={s.to}>
              <Card className="border-none shadow-lg shadow-slate-200 bg-white rounded-[1.5rem] overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`h-1.5 ${s.accent}`} />
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${s.accent} text-white`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{s.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
