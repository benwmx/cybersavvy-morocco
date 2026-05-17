import { Link } from "@tanstack/react-router";
import { Shield, RefreshCw } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useOffline } from "@/lib/offline/OfflineSyncProvider";

export function Navbar() {
  const { t } = useLang();
  const { syncing } = useOffline();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">{t("appName")}</span>
        </Link>
        <div className="flex items-center gap-3">
          {syncing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary animate-pulse text-[10px] sm:text-xs font-medium text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>{t("syncing")}</span>
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
