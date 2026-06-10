import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const { t, lang } = useLang();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.adminListUsers(),
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "ar-MA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {t("adminUsersTitle")}
          </h1>
          <p className="text-slate-500 font-medium text-sm">{t("adminUsersSubtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">
              {t("migrationRequired")}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {t("migrationRequiredDesc")}
            </p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black text-[#1E3A8A]">
            {isLoading
              ? "…"
              : `${users.length} ${t("adminUsersTitle").toLowerCase()}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_1fr_140px_80px_80px] gap-4 px-8 py-3 bg-slate-50 border-y border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{t("colName")}</span>
            <span>{t("colEmail")}</span>
            <span>{t("colRegisteredAt")}</span>
            <span className="text-center">{t("classesLabel")}</span>
            <span className="text-center">{t("studentsLabel")}</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_140px_80px_80px] gap-4 px-8 py-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : users.length === 0 && !error ? (
            <div className="py-16 text-center text-slate-400 font-bold italic">
              {t("noUsers")}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
              {users.map(u => {
                const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ");
                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1fr_1fr_140px_80px_80px] gap-4 px-8 py-4 items-center hover:bg-slate-50/60 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {fullName || <span className="text-slate-300 italic">{lang === "fr" ? "—" : "—"}</span>}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{u.email}</p>
                    <span className="text-sm text-slate-500">{fmt(u.created_at)}</span>
                    <span className="text-sm font-bold text-[#1E3A8A] text-center">{u.class_count}</span>
                    <span className="text-sm font-bold text-emerald-600 text-center">{u.student_count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
