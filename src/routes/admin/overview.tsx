import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { LayoutDashboard, Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/overview")({
  component: OverviewPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
  barColor,
  iconBg,
  iconText,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  barColor: string;
  iconBg: string;
  iconText: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 overflow-hidden">
      <div className={`h-1.5 ${barColor}`} />
      <div className="p-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{label}</p>
          <p className="text-4xl font-black text-[#0f172a] mt-1">{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-7 w-7 ${iconText}`} />
        </div>
      </div>
    </div>
  );
}

function OverviewPage() {
  const { lang } = useLang();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.adminGetStats(),
  });

  const cards = [
    {
      label: lang === "fr" ? "Enseignants" : "المعلمون",
      value: stats?.total_teachers ?? "—",
      icon: Users,
      barColor: "bg-violet-500",
      iconBg: "bg-violet-50",
      iconText: "text-violet-600",
    },
    {
      label: lang === "fr" ? "Classes" : "الأقسام",
      value: stats?.total_classes ?? "—",
      icon: GraduationCap,
      barColor: "bg-[#1E3A8A]",
      iconBg: "bg-blue-50",
      iconText: "text-[#1E3A8A]",
    },
    {
      label: lang === "fr" ? "Élèves" : "التلاميذ",
      value: stats?.total_students ?? "—",
      icon: Users,
      barColor: "bg-emerald-500",
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
    },
    {
      label: lang === "fr" ? "Résultats" : "النتائج",
      value: stats?.total_results ?? "—",
      icon: BookOpen,
      barColor: "bg-amber-500",
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
    },
    {
      label: lang === "fr" ? "Score moyen" : "متوسط الدرجات",
      value: isLoading
        ? "—"
        : stats?.avg_score_percent != null
        ? `${stats.avg_score_percent}%`
        : "—",
      icon: TrendingUp,
      barColor: "bg-rose-500",
      iconBg: "bg-rose-50",
      iconText: "text-rose-600",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {lang === "fr" ? "Vue d'ensemble" : "نظرة عامة"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {lang === "fr"
              ? "Statistiques globales de la plateforme"
              : "إحصائيات المنصة الشاملة"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
            ))
          : cards.map(card => <StatCard key={card.label} {...card} />)}
      </div>
    </div>
  );
}
