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
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 gap-2">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <OnlineBadge />
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 bg-muted/30">
          <div className="max-w-7xl mx-auto w-full">
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        online
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      }`}
    >
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? t("online") : t("offline")}
    </span>
  );
}
