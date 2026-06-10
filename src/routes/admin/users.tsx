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
  const { lang } = useLang();

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
            {lang === "fr" ? "Utilisateurs" : "المستخدمون"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {lang === "fr"
              ? "Tous les comptes enseignants inscrits"
              : "جميع حسابات المعلمين المسجلين"}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">
              {lang === "fr" ? "Migration requise" : "يلزم تشغيل Migration"}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {lang === "fr"
                ? "Exécutez supabase/migrations/006_admin_functions.sql dans l'éditeur SQL de Supabase."
                : "شغّل ملف supabase/migrations/006_admin_functions.sql في محرر SQL لـ Supabase."}
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
              : lang === "fr"
              ? `${users.length} compte${users.length !== 1 ? "s" : ""}`
              : `${users.length} حساب`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_140px_80px_80px] gap-4 px-8 py-3 bg-slate-50 border-y border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{lang === "fr" ? "Email" : "البريد الإلكتروني"}</span>
            <span>{lang === "fr" ? "Inscrit le" : "تاريخ التسجيل"}</span>
            <span className="text-center">{lang === "fr" ? "Classes" : "الأقسام"}</span>
            <span className="text-center">{lang === "fr" ? "Élèves" : "التلاميذ"}</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px_80px_80px] gap-4 px-8 py-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : users.length === 0 && !error ? (
            <div className="py-16 text-center text-slate-400 font-bold italic">
              {lang === "fr" ? "Aucun utilisateur." : "لا يوجد مستخدمون."}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[62vh] overflow-y-auto">
              {users.map(u => (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_140px_80px_80px] gap-4 px-8 py-4 items-center hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{u.email}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{u.id}</p>
                  </div>
                  <span className="text-sm text-slate-500">{fmt(u.created_at)}</span>
                  <span className="text-sm font-bold text-[#1E3A8A] text-center">
                    {u.class_count}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 text-center">
                    {u.student_count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
