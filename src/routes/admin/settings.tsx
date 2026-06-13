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
  const { t } = useLang();

  const [email, setEmail]             = useState("");
  const [emailStatus, setEmailStatus] = useState<Status>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus]   = useState<Status>(null);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus(null);
    setEmailLoading(true);
    try {
      await api.updateEmail(email.trim());
      setEmailStatus({ ok: true, msg: t("adminEmailSent") });
      setEmail("");
    } catch (err: any) {
      setEmailStatus({ ok: false, msg: err.message ?? t("unknownError") });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPw !== confirmPw) {
      setPwStatus({ ok: false, msg: t("adminPasswordMismatch") });
      return;
    }
    if (newPw.length < 8) {
      setPwStatus({ ok: false, msg: t("adminPasswordTooShort") });
      return;
    }
    setPwLoading(true);
    try {
      const session = await api.getSession();
      if (session?.email) await api.signIn(session.email, currentPw);
      await api.updatePassword(newPw);
      setPwStatus({ ok: true, msg: t("adminPasswordUpdated") });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwStatus({ ok: false, msg: err.message ?? t("unknownError") });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-sm bg-[#1E3A8A] flex items-center justify-center text-white shrink-0">
          <Settings className="h-3.5 w-3.5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("settings")}</h1>
          <p className="text-sm text-slate-500">{t("adminSettingsSubtitle")}</p>
        </div>
      </div>

      {/* Email card */}
      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-[#1E3A8A]" />
        <CardHeader className="p-5 pb-3 flex flex-row items-center gap-2">
          <Mail className="h-4 w-4 text-[#1E3A8A] shrink-0" />
          <CardTitle className="text-base font-semibold text-slate-800">{t("adminChangeEmail")}</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">
                {t("adminNewEmail")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1E3A8A] focus:bg-white transition-colors"
                placeholder="admin@example.com"
              />
            </div>
            {emailStatus && <StatusBanner status={emailStatus} />}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full rounded bg-[#1E3A8A] text-white text-sm font-medium py-2 hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-all"
            >
              {emailLoading ? t("adminSending") : t("adminUpdateEmail")}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Password card */}
      <Card className="border border-slate-200 shadow-none bg-white rounded-sm overflow-hidden">
        <div className="h-0.5 bg-[#1E3A8A]" />
        <CardHeader className="p-5 pb-3 flex flex-row items-center gap-2">
          <Lock className="h-4 w-4 text-[#1E3A8A] shrink-0" />
          <CardTitle className="text-base font-semibold text-slate-800">{t("adminChangePassword")}</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <Field label={t("adminCurrentPassword")} value={currentPw} onChange={setCurrentPw} />
            <Field label={t("adminNewPassword")}     value={newPw}     onChange={setNewPw}     />
            <Field label={t("adminConfirmPassword")} value={confirmPw} onChange={setConfirmPw} />
            {pwStatus && <StatusBanner status={pwStatus} />}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full rounded bg-[#1E3A8A] text-white text-sm font-medium py-2 hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-all"
            >
              {pwLoading ? t("adminUpdating") : t("adminUpdatePassword")}
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
      <label className="text-xs text-slate-500">{label}</label>
      <input
        type="password"
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1E3A8A] focus:bg-white transition-colors"
      />
    </div>
  );
}

function StatusBanner({ status }: { status: { ok: boolean; msg: string } }) {
  return (
    <div className={`flex items-center gap-2 rounded px-3 py-2.5 text-sm font-medium ${
      status.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
    }`}>
      {status.ok
        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />}
      {status.msg}
    </div>
  );
}
