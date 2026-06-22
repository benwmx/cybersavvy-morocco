import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/supabase/api";
import { ICON_REGISTRY } from "@/lib/icons";
import { useLang } from "@/lib/i18n/LanguageContext";

interface IconPickerProps {
  value: string | null;
  onChange: (v: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const { t, lang } = useLang();

  const { data: enabledIcons = [] } = useQuery({
    queryKey: ["icon-settings"],
    queryFn: () => api.getIconSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const icons = enabledIcons.length > 0
    ? ICON_REGISTRY.filter(i => enabledIcons.includes(i.name))
    : ICON_REGISTRY;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{t("categoryIcon")}</Label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
        {icons.map(iconDef => {
          const Icon = iconDef.component;
          const isSelected = value === iconDef.name;
          return (
            <button
              key={iconDef.name}
              type="button"
              onClick={() => onChange(isSelected ? null : iconDef.name)}
              title={lang === "fr" ? iconDef.labelFr : iconDef.labelAr}
              className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-white text-slate-500 hover:text-[#1E3A8A] border border-slate-200 hover:border-[#1E3A8A]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[10px] text-rose-400 hover:text-rose-600 font-medium"
        >
          {t("adminCancel")}
        </button>
      )}
    </div>
  );
}
