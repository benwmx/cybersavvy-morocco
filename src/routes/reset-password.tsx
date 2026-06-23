import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { api, supabaseClient } from "@/lib/supabase/api";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Shield, Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Réinitialisation — CyberSafe" }] }),
});

function ResetPasswordPage() {
  const { t, dir } = useLang();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      supabaseClient.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setInvalid(true);
        else setReady(true);
      });
      return;
    }
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    const timeout = setTimeout(() => setInvalid(true), 5000);
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) { toast.error(t("passwordsNoMatch")); return; }
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
    <div style={{ minHeight: "100dvh", display: "flex" }} dir={dir}>

      {/* ── Brand panel ── */}
      <div
        className="hidden md:flex"
        style={{
          width: "38%",
          background: "oklch(0.22 0.14 258)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(2.5rem, 5vw, 4rem)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 40, height: 40,
            background: "oklch(1 0 0 / 0.12)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield style={{ width: 20, height: 20, color: "white" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "white", letterSpacing: "-0.01em" }}>
            {t("appName")}
          </span>
        </div>

        <div>
          <p style={{
            color: "oklch(1 0 0 / 0.4)",
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "14px",
          }}>
            Maroc
          </p>
          <p style={{
            color: "white",
            fontSize: "clamp(1.45rem, 2.2vw, 2rem)",
            fontWeight: 800,
            lineHeight: 1.22,
            letterSpacing: "-0.025em",
            textWrap: "balance",
          }}>
            {t("tagline")}
          </p>
        </div>

        <p style={{ color: "oklch(1 0 0 / 0.22)", fontSize: "0.7rem", fontWeight: 500 }}>
          © 2025 CyberSafe · MENPS
        </p>
      </div>

      {/* ── Form panel ── */}
      <div style={{
        flex: 1,
        background: "oklch(0.99 0.005 260)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
          borderBottom: "1px solid oklch(0.93 0.01 260)",
        }}>
          <div className="flex md:hidden items-center gap-2">
            <Shield style={{ width: 18, height: 18, color: "oklch(0.22 0.14 258)" }} />
            <span style={{ fontWeight: 700, color: "oklch(0.22 0.14 258)", fontSize: "0.95rem" }}>
              {t("appName")}
            </span>
          </div>
          <div className="hidden md:block" />
          <LanguageSwitcher />
        </div>

        {/* Centered form */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 6vw, 5rem)",
        }}>
          <div style={{ width: "100%", maxWidth: "380px" }} className="animate-in fade-in duration-200">
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "oklch(0.14 0.08 258)",
                letterSpacing: "-0.025em",
                marginBottom: "6px",
              }}>
                {t("resetYourPassword")}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "oklch(0.48 0.03 260)", lineHeight: 1.55 }}>
                {t("trainerSpace")}
              </p>
            </div>

            {invalid && (
              <div style={{
                padding: "14px 16px",
                borderRadius: "8px",
                background: "oklch(0.97 0.01 25)",
                border: "1px solid oklch(0.90 0.04 25)",
                color: "oklch(0.45 0.18 25)",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}>
                {t("invalidResetLink")}
              </div>
            )}

            {!invalid && !ready && (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 style={{ width: 28, height: 28, color: "oklch(0.32 0.14 258)", animation: "spin 1s linear infinite" }} />
              </div>
            )}

            {ready && (
              <form onSubmit={onSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="new-password" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "oklch(0.38 0.04 258)", marginBottom: "6px" }}>
                    {t("newPassword")}
                  </label>
                  <input
                    id="new-password"
                    className="login-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="confirm-password" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "oklch(0.38 0.04 258)", marginBottom: "6px" }}>
                    {t("confirmPassword")}
                  </label>
                  <input
                    id="confirm-password"
                    className="login-input"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    marginTop: "8px",
                    background: "oklch(0.22 0.14 258)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.65 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "opacity 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "oklch(0.28 0.14 258)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.22 0.14 258)"; }}
                >
                  {loading
                    ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                    : t("setNewPassword")
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
