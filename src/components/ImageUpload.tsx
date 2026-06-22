import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, X, Loader2, Image } from "lucide-react";
import { api } from "@/lib/supabase/api";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LanguageContext";

const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
const isVideoType = (type: string) => type.startsWith("video/");

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, userId, folder = "scenarios", label }: ImageUploadProps) {
  const { t } = useLang();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: limits } = useQuery({
    queryKey: ["upload-limits"],
    queryFn: () => api.getUploadLimits(),
    staleTime: 5 * 60 * 1000,
  });

  const imageMb = limits?.imageMb ?? 10;
  const videoMb = limits?.videoMb ?? 50;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const limitMb = isVideoType(file.type) ? videoMb : imageMb;
    if (file.size > limitMb * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const path = await api.uploadMedia(userId, folder, file);
      const url = api.getMediaUrl(path);
      onChange(url);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <p className="text-xs text-slate-500 mb-1.5">{label}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="relative rounded overflow-hidden border border-slate-200 aspect-video bg-slate-50">
          {isVideo(value) ? (
            <video src={value} controls className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="" className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded px-2 py-1 text-[10px] font-medium flex items-center gap-1 transition-colors"
          >
            <Upload className="h-3 w-3" />
            {t("replace")}
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded border border-dashed border-slate-300 bg-white hover:border-[#1E3A8A] hover:text-[#1E3A8A] text-slate-500 text-xs font-medium transition-colors shrink-0"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Image className="h-3.5 w-3.5" />
            )}
            {uploading ? t("uploading") : t("clickToUpload")}
          </button>
          <div className="flex flex-col gap-0.5 pt-0.5">
            <span className="text-[10px] text-slate-400">{t("imageFormatsHint")} — max {imageMb} Mo</span>
            <span className="text-[10px] text-slate-400">{t("videoFormatsHint")} — max {videoMb} Mo</span>
          </div>
        </div>
      )}
    </div>
  );
}
