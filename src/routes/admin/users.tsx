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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <Users className="h-3.5 w-3.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("adminUsersTitle")}</h1>
          <p className="text-sm text-slate-500">{t("adminUsersSubtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded p-4">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">{t("migrationRequired")}</p>
            <p className="text-xs text-amber-700 mt-1">{t("migrationRequiredDesc")}</p>
          </div>
        </div>
      )}

      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-[#1E3A8A]" />
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800">
            {isLoading
              ? "…"
              : `${users.length} ${t("adminUsersTitle").toLowerCase()}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_1fr_140px_80px_80px] gap-4 px-5 py-2.5 bg-slate-50 border-y border-slate-100 text-xs font-medium text-slate-500">
            <span>{t("colName")}</span>
            <span>{t("colEmail")}</span>
            <span>{t("colRegisteredAt")}</span>
            <span className="text-center">{t("classesLabel")}</span>
            <span className="text-center">{t("studentsLabel")}</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_140px_80px_80px] gap-4 px-5 py-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : users.length === 0 && !error ? (
            <div className="py-12 text-center text-sm text-slate-400">
              {t("noUsers")}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
              {users.map(u => {
                const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ");
                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1fr_1fr_140px_80px_80px] gap-4 px-5 py-3 items-center hover:bg-slate-50/60 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {fullName || <span className="text-slate-300 italic">—</span>}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{u.email}</p>
                    <span className="text-xs text-slate-500">{fmt(u.created_at)}</span>
                    <span className="text-sm font-semibold text-[#1E3A8A] text-center">{u.class_count}</span>
                    <span className="text-sm font-semibold text-emerald-600 text-center">{u.student_count}</span>
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
