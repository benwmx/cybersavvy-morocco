import { useLang } from "@/lib/i18n/LanguageContext";
import { ImageIcon } from "lucide-react";

export function MediaPlaceholder({ label }: { label?: string }) {
  const { t } = useLang();
  return (
    <div className="aspect-video w-full rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <ImageIcon className="h-10 w-10" />
      <span className="text-sm">{label ?? t("media")}</span>
    </div>
  );
}
