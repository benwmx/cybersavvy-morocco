import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Shield, Languages, LogOut, Type } from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const session = await api.getSession();
    if (!session) throw redirect({ to: "/login" });
    if (!session.isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  const logout = async () => {
    await api.signOut();
    navigate({ to: "/login" });
  };

  const navItems = [
    {
      to: "/admin/translations",
      icon: Type,
      label: lang === "fr" ? "Traductions" : "الترجمات",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Dark admin sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-[#0f172a] border-e border-white/5">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
          <div className="h-8 w-8 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-lg shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-white text-sm leading-none">CyberSafe</p>
            <p className="text-[10px] text-[#1E3A8A] font-black uppercase tracking-[0.2em] mt-0.5">Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(item => {
            const active = path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/30"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Inline dark language switcher */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl p-1.5">
            <Languages className="h-4 w-4 text-white/30 ms-1 me-0.5 shrink-0" />
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                lang === "fr" ? "bg-[#1E3A8A] text-white" : "text-white/40 hover:text-white"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                lang === "ar" ? "bg-[#1E3A8A] text-white" : "text-white/40 hover:text-white"
              }`}
            >
              AR
            </button>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {lang === "fr" ? "Déconnexion" : "تسجيل الخروج"}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-h-screen bg-slate-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
