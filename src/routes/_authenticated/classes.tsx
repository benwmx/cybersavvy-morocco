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
  const { t } = useLang();
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold text-slate-900">{t("classes")}</h1>
        <p className="text-sm text-slate-500">{t("classesSubtitle")}</p>
      </div>

      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-[#1E3A8A]" />
        <CardHeader className="p-5 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Plus className="h-4 w-4" />
            {t("createClass")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("createClassDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (name.trim()) create.mutate(name.trim());
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Input
              placeholder={t("classNamePlaceholder")}
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 h-8 rounded border-slate-200 bg-slate-50/50 text-sm"
            />
            <Button
              type="submit"
              disabled={create.isPending}
              className="h-8 px-4 rounded bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm font-medium"
            >
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 py-16 text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-sm bg-slate-100 flex items-center justify-center text-slate-300">
              <BadgeInfo className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-sm">{t("noClasses")}</p>
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
    <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden group hover:bg-slate-50 transition-colors">
      <div className="h-0.5 bg-[#1E3A8A] opacity-50 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-50 text-[#1E3A8A]">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600"
              onClick={() => { if (confirm(t("deleteConfirm"))) onDelete(); }}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-1">{cls.name}</CardTitle>
        <CardDescription className="text-xs text-slate-500">{t("accessCode")}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-slate-50 border border-slate-100 px-3 py-2 font-mono text-sm font-semibold tracking-[0.2em] text-center text-[#1E3A8A]">
            {cls.access_code}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded text-[#1E3A8A] hover:bg-blue-50 transition-all"
            onClick={copy}
            aria-label={t("copy")}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
