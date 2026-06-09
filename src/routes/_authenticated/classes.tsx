import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ClassRow } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Copy, Check, Plus, GraduationCap, Trash2, BadgeInfo } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/classes")({
  component: ClassesPage,
});

function ClassesPage() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.listMyClasses(),
  });

  const create = useMutation({
    mutationFn: (n: string) => api.createClass(n),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      setName("");
      toast.success(t("create") + " ✓");
    },
    onError: (err: any) => toast.error(err.message || "Error creating class"),
  });

  const deleteClass = useMutation({
    mutationFn: (id: string) => api.deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success(t("delete") + " ✓");
    },
    onError: (err: any) => console.error("Mutation error:", err),
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">{t("classes")}</h1>
        <p className="text-slate-500 font-medium">
          {lang === "fr" ? "Gestion des groupes de suivi." : "إدارة مجموعات المتابعة."}
        </p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#1E3A8A]">
            <Plus className="h-7 w-7" />
            {t("createClass")}
          </CardTitle>
          <CardDescription className="text-base font-medium">
            {lang === "fr" ? "Initialiser un nouveau groupe de suivi." : "إنشاء مجموعة متابعة جديدة."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (name.trim()) create.mutate(name.trim());
            }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Input
              placeholder="Ex: Classe de 3ème - Année 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 text-lg font-medium focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
            />
            <Button
              type="submit"
              disabled={create.isPending}
              className="h-14 px-10 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-lg font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all"
            >
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 py-20 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
              <BadgeInfo className="h-10 w-10" />
            </div>
            <p className="text-slate-400 font-bold italic text-lg">{t("noClasses")}</p>
          </div>
        )}
        {classes.map(c => (
          <ClassCard
            key={c.id}
            cls={c}
            onDelete={() => deleteClass.mutate(c.id)}
            isDeleting={deleteClass.isPending && deleteClass.variables === c.id}
          />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ cls, onDelete, isDeleting }: { cls: ClassRow; onDelete: () => void; isDeleting: boolean }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cls.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Card className="border-none shadow-lg shadow-slate-200 bg-white rounded-[1.5rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="h-1.5 bg-[#1E3A8A] opacity-50 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1E3A8A] group-hover:scale-110 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90"
              onClick={() => { if (confirm(t("deleteConfirm"))) onDelete(); }}
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-xl font-extrabold text-slate-900 line-clamp-1">{cls.name}</CardTitle>
        <CardDescription className="font-bold text-[#1E3A8A]/60 text-xs uppercase tracking-widest">{t("accessCode")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3">
          <code className="flex-1 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 font-mono text-xl font-black tracking-[0.3em] text-center text-[#1E3A8A]">
            {cls.access_code}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-xl text-[#1E3A8A] hover:bg-blue-50 active:scale-90 transition-all"
            onClick={copy}
            aria-label={t("copy")}
          >
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
