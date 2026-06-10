import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/supabase/api";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Status = { ok: boolean; msg: string } | null;

function SettingsPage() {
  const { lang } = useLang();

  const [email, setEmail]           = useState("");
  const [emailStatus, setEmailStatus] = useState<Status>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwStatus, setPwStatus]     = useState<Status>(null);
  const [pwLoading, setPwLoading]   = useState(false);

  const t = (fr: string, ar: string) => lang === "fr" ? fr : ar;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus(null);
    setEmailLoading(true);
    try {
      await api.updateEmail(email.trim());
      setEmailStatus({ ok: true, msg: t("Un e-mail de confirmation a été envoyé à la nouvelle adresse.", "تم إرسال بريد تأكيد إلى العنوان الجديد.") });
      setEmail("");
    } catch (err: any) {
      setEmailStatus({ ok: false, msg: err.message ?? t("Erreur inconnue.", "خطأ غير معروف.") });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPw !== confirmPw) {
      setPwStatus({ ok: false, msg: t("Les mots de passe ne correspondent pas.", "كلمتا المرور غير متطابقتين.") });
      return;
    }
    if (newPw.length < 8) {
      setPwStatus({ ok: false, msg: t("Le mot de passe doit comporter au moins 8 caractères.", "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.") });
      return;
    }
    setPwLoading(true);
    try {
      // Re-authenticate first to confirm identity
      const session = await api.getSession();
      if (session?.email) {
        await api.signIn(session.email, currentPw);
      }
      await api.updatePassword(newPw);
      setPwStatus({ ok: true, msg: t("Mot de passe mis à jour.", "تم تحديث كلمة المرور.") });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwStatus({ ok: false, msg: err.message ?? t("Erreur inconnue.", "خطأ غير معروف.") });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#1E3A8A]">
            {t("Paramètres", "الإعدادات")}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {t("Gérez vos identifiants de connexion", "إدارة بيانات تسجيل الدخول")}
          </p>
        </div>
      </div>

      {/* Email card */}
      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4 flex flex-row items-center gap-3">
          <Mail className="h-5 w-5 text-[#1E3A8A] shrink-0" />
          <CardTitle className="text-xl font-black text-[#1E3A8A]">
            {t("Changer l'adresse e-mail", "تغيير البريد الإلكتروني")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-2">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                {t("Nouvelle adresse e-mail", "البريد الإلكتروني الجديد")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#1E3A8A] focus:bg-white transition-colors"
                placeholder="admin@example.com"
              />
            </div>
            {emailStatus && <StatusBanner status={emailStatus} />}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full rounded-xl bg-[#1E3A8A] text-white text-sm font-black py-2.5 hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-all"
            >
              {emailLoading ? t("Envoi…", "جارٍ الإرسال…") : t("Mettre à jour l'e-mail", "تحديث البريد الإلكتروني")}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Password card */}
      <Card className="border-none shadow-xl shadow-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-[#1E3A8A]" />
        <CardHeader className="p-8 pb-4 flex flex-row items-center gap-3">
          <Lock className="h-5 w-5 text-[#1E3A8A] shrink-0" />
          <CardTitle className="text-xl font-black text-[#1E3A8A]">
            {t("Changer le mot de passe", "تغيير كلمة المرور")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-2">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field
              label={t("Mot de passe actuel", "كلمة المرور الحالية")}
              value={currentPw}
              onChange={setCurrentPw}
            />
            <Field
              label={t("Nouveau mot de passe", "كلمة المرور الجديدة")}
              value={newPw}
              onChange={setNewPw}
            />
            <Field
              label={t("Confirmer le nouveau mot de passe", "تأكيد كلمة المرور الجديدة")}
              value={confirmPw}
              onChange={setConfirmPw}
            />
            {pwStatus && <StatusBanner status={pwStatus} />}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full rounded-xl bg-[#1E3A8A] text-white text-sm font-black py-2.5 hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-all"
            >
              {pwLoading ? t("Mise à jour…", "جارٍ التحديث…") : t("Mettre à jour le mot de passe", "تحديث كلمة المرور")}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type="password"
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#1E3A8A] focus:bg-white transition-colors"
      />
    </div>
  );
}

function StatusBanner({ status }: { status: { ok: boolean; msg: string } }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
      status.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
    }`}>
      {status.ok
        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />}
      {status.msg}
    </div>
  );
}
