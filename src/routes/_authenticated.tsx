import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { api } from "@/lib/supabase/api";
import { useOnline } from "@/lib/offline/OfflineSyncProvider";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Wifi, WifiOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const session = await api.getSession();
    if (!session) throw redirect({ to: "/login" });
    if (session.isAdmin) throw redirect({ to: "/admin/translations" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 gap-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ms-2 text-[#1E3A8A] hover:bg-blue-50" />
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <h2 className="text-sm font-bold text-[#1E3A8A] hidden sm:block uppercase tracking-wider">
              {typeof window !== "undefined" && window.location.pathname.includes("dashboard") ? "Panel Control" : ""}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <OnlineBadge />
            <div className="h-6 w-px bg-slate-200" />
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10 bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function OnlineBadge() {
  const online = useOnline();
  const { t } = useLang();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
        online
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
      {online ? t("online") : t("offline")}
    </span>
  );
}
