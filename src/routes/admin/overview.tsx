import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, TrendingUp,
  Layers, Type, Settings, Home, LogIn, ChevronRight,
} from "lucide-react";

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

function NavCard({
  to,
  icon: Icon,
  label,
  desc,
  barColor,
  iconBg,
  iconText,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  barColor: string;
  iconBg: string;
  iconText: string;
}) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-sm border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className={`h-0.5 ${barColor}`} />
      <div className="p-4 flex items-start gap-3">
        <div className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconText}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1E3A8A] transition-colors">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 transition-all mt-0.5 shrink-0" />
      </div>
    </Link>
  );
}

function OverviewPage() {
  const { t } = useLang();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.adminGetStats(),
  });

  const statCards = [
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

  const navCards = [
    { to: "/admin/users",        icon: Users,        label: t("adminUsersTitle"),        desc: t("adminUsersDesc"),        barColor: "bg-violet-500",  iconBg: "bg-violet-50",  iconText: "text-violet-600"  },
    { to: "/admin/content",      icon: Layers,       label: t("adminContentTitle"),      desc: t("adminContentDesc"),      barColor: "bg-[#1E3A8A]",   iconBg: "bg-blue-50",    iconText: "text-[#1E3A8A]"   },
    { to: "/admin/classes",      icon: GraduationCap,label: t("classesLabel"),           desc: t("adminClassesDesc"),      barColor: "bg-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
    { to: "/admin/translations", icon: Type,         label: t("adminTranslationsTitle"), desc: t("adminTranslationsDesc"), barColor: "bg-amber-500",   iconBg: "bg-amber-50",   iconText: "text-amber-600"   },
    { to: "/admin/settings",     icon: Settings,     label: t("settings"),               desc: t("adminSettingsDesc"),     barColor: "bg-slate-500",   iconBg: "bg-slate-100",  iconText: "text-slate-600"   },
  ];

  const platformLinks = [
    { to: "/",                    icon: Home,  label: t("viewPublicSite"),   desc: t("platformTitle") },
    { to: "/login?role=teacher",  icon: LogIn, label: t("teacherLoginLink"), desc: t("trainerSpace")  },
    { to: "/login?role=student",  icon: LogIn, label: t("studentLoginLink"), desc: t("learnerSpace")  },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <LayoutDashboard className="h-3.5 w-3.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("overview")}</h1>
          <p className="text-sm text-slate-500">{t("adminOverviewSubtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />
            ))
          : statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Quick access */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("adminQuickAccess")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {navCards.map(card => <NavCard key={card.to} {...card} />)}
        </div>
      </div>

      {/* Platform links */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("adminPlatformLinks")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {platformLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 p-3 bg-white rounded-sm border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-[#1E3A8A] transition-colors truncate">{label}</p>
                <p className="text-xs text-slate-400 truncate">{desc}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 shrink-0 rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
