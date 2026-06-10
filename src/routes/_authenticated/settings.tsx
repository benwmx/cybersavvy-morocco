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
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => api.getSession(),
  });

  const [firstName, setFirstName] = useState(() => session?.firstName ?? "");
  const [lastName, setLastName]   = useState(() => session?.lastName  ?? "");
  const [nameLoading, setNameLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      await api.updateProfile(firstName, lastName);
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(lang === "fr" ? "Profil mis à jour." : "تم تحديث الملف الشخصي.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(lang === "fr" ? "Mot de passe trop court (6 caractères min.)" : "كلمة المرور قصيرة جداً (6 أحرف على الأقل)");
      return;
    }
    setPwLoading(true);
    try {
      await api.updatePassword(password);
      toast.success(t("passwordUpdated"));
      setPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">{t("settings")}</h1>
        <p className="text-slate-500 font-medium">{lang === "fr" ? "Sécurité et configuration du compte enseignant." : "إعدادات الأمان والحساب."}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile card */}
        <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-[#1E3A8A]" />
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-[#1E3A8A]">
              <User className="h-6 w-6" />
              {t("account")}
            </CardTitle>
            <CardDescription className="text-base">{lang === "fr" ? "Informations de votre compte." : "معلومات حسابك."}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-2 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("email")}</Label>
              <p className="font-bold text-lg text-slate-700 select-all">{session?.email || "..."}</p>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === "fr" ? "Prénom" : "الاسم الأول"}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === "fr" ? "Nom" : "اسم العائلة"}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
                  />
                </div>
              </div>
              <Button type="submit" disabled={nameLoading} className="h-11 px-8 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black shadow-lg shadow-blue-900/10 active:scale-95 transition-all">
                {lang === "fr" ? "Enregistrer" : "حفظ"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password card */}
        <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-rose-500" />
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-rose-600">
              <KeyRound className="h-6 w-6" />
              {t("updatePassword")}
            </CardTitle>
            <CardDescription className="text-base">{lang === "fr" ? "Modifier le mot de passe de votre compte." : "تغيير كلمة مرور حسابك."}</CardDescription>
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
              <Button type="submit" disabled={pwLoading || !password} className="h-14 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 text-lg font-black shadow-lg shadow-rose-900/10 active:scale-95 transition-all">
                {t("update")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
