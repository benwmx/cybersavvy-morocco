import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, RefreshCw, LogOut } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useOffline } from "@/lib/offline/OfflineSyncProvider";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function Navbar() {
  const { t } = useLang();
  const { syncing } = useOffline();
  const navigate = useNavigate();
  const [hasStudent, setHasStudent] = useState(false);

  useEffect(() => {
    setHasStudent(!!sessionStorage.getItem("cs.student"));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("cs.student");
    setHasStudent(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-[#1E3A8A] tracking-tight">{t("appName")}</span>
        </Link>
        <div className="flex items-center gap-4">
          {syncing && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 animate-pulse text-[10px] sm:text-xs font-bold text-[#1E3A8A]">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>{t("syncing")}</span>
            </div>
          )}
          {hasStudent && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl px-4"
            >
              <LogOut className="h-4 w-4 me-2" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </Button>
          )}
          <div className="h-6 w-px bg-slate-200" />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
