import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { KeyRound, User } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => api.getSession(),
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password too short");
      return;
    }
    setLoading(true);
    try {
      await api.updatePassword(password);
      toast.success(t("passwordUpdated"));
      setPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">{t("settings")}</h1>
        <p className="text-slate-500 font-medium">Sécurité et configuration du compte formateur.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-[#1E3A8A]" />
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#1E3A8A]">
              <User className="h-6 w-6" />
              {t("account")}
            </CardTitle>
            <CardDescription className="text-base">Informations d'identification de votre compte.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-2 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse Email</Label>
              <p className="font-bold text-lg text-slate-700 select-all">{session?.email || "..."}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-rose-500" />
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-rose-600">
              <KeyRound className="h-6 w-6" />
              {t("updatePassword")}
            </CardTitle>
            <CardDescription className="text-base">Mettre à jour vos paramètres de sécurité.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("newPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 text-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
              <Button type="submit" disabled={loading || !password} className="h-14 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 text-lg font-black shadow-lg shadow-rose-900/10 active:scale-95 transition-all">
                {t("update")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
