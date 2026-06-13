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
    <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-hidden">
      <div className={`h-0.5 ${barColor}`} />
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{label}</p>
          <p className="text-2xl font-mono font-semibold text-slate-900 mt-0.5">{value}</p>
        </div>
        <div className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconText}`} />
        </div>
      </div>
    </div>
  );
}

function OverviewPage() {
  const { t } = useLang();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.adminGetStats(),
  });

  const cards = [
    { label: t("teachers"),     value: stats?.total_teachers ?? "—", icon: Users,        barColor: "bg-violet-500",   iconBg: "bg-violet-50",  iconText: "text-violet-600"  },
    { label: t("classesLabel"), value: stats?.total_classes  ?? "—", icon: GraduationCap,barColor: "bg-[#1E3A8A]",    iconBg: "bg-blue-50",    iconText: "text-[#1E3A8A]"   },
    { label: t("studentsLabel"),value: stats?.total_students ?? "—", icon: Users,        barColor: "bg-emerald-500",  iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
    { label: t("results"),      value: stats?.total_results  ?? "—", icon: BookOpen,     barColor: "bg-amber-500",    iconBg: "bg-amber-50",   iconText: "text-amber-600"   },
    {
      label: t("avgScoreLabel"),
      value: isLoading ? "—" : stats?.avg_score_percent != null ? `${stats.avg_score_percent}%` : "—",
      icon: TrendingUp, barColor: "bg-rose-500", iconBg: "bg-rose-50", iconText: "text-rose-600",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <LayoutDashboard className="h-3.5 w-3.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("overview")}</h1>
          <p className="text-sm text-slate-500">{t("adminOverviewSubtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />
            ))
          : cards.map(card => <StatCard key={card.label} {...card} />)}
      </div>
    </div>
  );
}
