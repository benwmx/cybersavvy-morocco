import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n/LanguageContext";
import { api, supabaseClient } from "@/lib/supabase/api";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Réinitialisation — CyberSafe" }] }),
});

function ResetPasswordPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // PKCE flow: Supabase puts ?code= in the URL; exchange it for a session
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      supabaseClient.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setInvalid(true);
        else setReady(true);
      });
      return;
    }

    // Implicit flow fallback: listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // If neither code nor event arrives within a few seconds, mark invalid
    const timeout = setTimeout(() => setInvalid(true), 5000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error(t("passwordsNoMatch"));
      return;
    }
    setLoading(true);
    try {
      await api.updatePassword(newPassword);
      toast.success(t("passwordUpdated"));
      navigate({ to: "/login" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
              {t("resetYourPassword")}
            </h1>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-emerald-500" />
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                {t("setNewPassword")}
              </CardTitle>
              <CardDescription>{t("trainerSpace")}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {invalid && (
                <p className="text-sm text-red-500 text-center py-4">{t("invalidResetLink")}</p>
              )}
              {!invalid && !ready && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              )}
              {ready && (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("newPassword")}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">{t("confirmPassword")}</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-900/10 active:scale-95 transition-all"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("setNewPassword")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
