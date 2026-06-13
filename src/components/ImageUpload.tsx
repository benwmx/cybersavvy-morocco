import { useRef, useState } from "react";
import { Upload, X, Loader2, Image } from "lucide-react";
import { api } from "@/lib/supabase/api";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, userId, folder = "scenarios", label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="relative rounded overflow-hidden border border-slate-200 aspect-video bg-slate-50">
          <img src={value} alt="" className="w-full h-full object-cover" />
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
            Remplacer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full rounded border-2 border-dashed border-slate-200 hover:border-[#1E3A8A] bg-slate-50/50 hover:bg-blue-50/30 transition-colors aspect-video flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#1E3A8A]"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Image className="h-5 w-5" />
              <span className="text-xs font-medium">Cliquer pour uploader</span>
              <span className="text-[10px] text-slate-300">JPEG · PNG · WebP · GIF</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
