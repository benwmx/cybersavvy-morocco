import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useStudent } from "@/context/StudentContext";
import { api } from "@/lib/supabase/api";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Shield, GraduationCap, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";

const loginSearchSchema = z.object({
  role: z.enum(["student", "teacher"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
  head: () => ({ meta: [{ title: "Accès — CyberSafe" }] }),
});

function LoginPage() {
  const { t, dir } = useLang();
  const { role } = Route.useSearch();
  const [activeRole, setActiveRole] = useState<"student" | "teacher">(role ?? "student");

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
          <div style={{ width: "100%", maxWidth: "380px" }}>

            {/* Role switcher */}
            <div style={{
              display: "flex",
              borderBottom: "1px solid oklch(0.90 0.012 260)",
              marginBottom: "32px",
            }}>
              {(["student", "teacher"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRole(r)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "none",
                    border: "none",
                    borderBottom: activeRole === r
                      ? "2px solid oklch(0.22 0.14 258)"
                      : "2px solid transparent",
                    color: activeRole === r
                      ? "oklch(0.22 0.14 258)"
                      : "oklch(0.52 0.025 260)",
                    fontWeight: activeRole === r ? 700 : 500,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    transition: "color 0.15s, border-color 0.15s",
                    marginBottom: "-1px",
                  }}
                >
                  {r === "student"
                    ? <GraduationCap style={{ width: 15, height: 15 }} />
                    : <ShieldCheck style={{ width: 15, height: 15 }} />
                  }
                  {r === "student" ? t("student") : t("teacher")}
                </button>
              ))}
            </div>

            {/* Form content — keyed so it re-mounts cleanly on role switch */}
            <div key={activeRole} className="animate-in fade-in duration-150">
              <div style={{ marginBottom: "28px" }}>
                <h1 style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: "oklch(0.14 0.08 258)",
                  letterSpacing: "-0.025em",
                  marginBottom: "6px",
                }}>
                  {activeRole === "student" ? t("learnerSpace") : t("trainerSpace")}
                </h1>
                <p style={{ fontSize: "0.85rem", color: "oklch(0.48 0.03 260)", lineHeight: 1.55 }}>
                  {activeRole === "student" ? t("studentPortalDesc") : t("loginSubtitle")}
                </p>
              </div>

              {activeRole === "student" ? <StudentForm /> : <TeacherForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Student form ────────────────────────────────────────── */

function StudentForm() {
  const { t, lang } = useLang();
  const { login } = useStudent();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [massarCode, setMassarCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || !massarCode.trim()) {
      toast.error(t("enterCode"));
      return;
    }
    setLoading(true);
    try {
      const cls = await api.verifyClassCode(accessCode.trim());
      if (!cls) { toast.error(t("invalidAccessCode")); return; }

      const student = await api.verifyStudent(cls.id, massarCode.trim());
      if (!student) { toast.error(t("massarNotFound")); return; }

      login({ id: student.id, class_id: cls.id, name_fr: student.name_fr, name_ar: student.name_ar });
      toast.success(`${t("welcome")}, ${lang === "fr" ? student.name_fr : student.name_ar}`);
      navigate({ to: "/game" });
    } catch {
      toast.error(t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Field label={t("classCode")} htmlFor="access-code">
        <input
          id="access-code"
          className="login-input mono"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
          placeholder="DEMO01"
          maxLength={8}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <Field label={t("massarCode")} htmlFor="massar-code">
        <input
          id="massar-code"
          className="login-input mono"
          value={massarCode}
          onChange={(e) => setMassarCode(e.target.value.toUpperCase())}
          placeholder="G123456789"
          maxLength={12}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <AuthButton loading={loading}>
        <span>{t("join")}</span>
        <ArrowRight style={{ width: 15, height: 15 }} className="rtl:rotate-180" />
      </AuthButton>
    </form>
  );
}

/* ── Teacher form ────────────────────────────────────────── */

function TeacherForm() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        await api.sendPasswordReset(email);
        toast.success(t("resetLinkSent"));
        setMode("in");
        setEmail("");
      } else if (mode === "in") {
        const session = await api.signIn(email, password);
        toast.success(t("welcomeBack"));
        navigate({ to: session.isAdmin ? "/admin/overview" : "/dashboard" });
      } else {
        const session = await api.signUp(email, password, firstName, lastName);
        toast.success(t("accountCreated"));
        navigate({ to: session.isAdmin ? "/admin/overview" : "/dashboard" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {mode === "up" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <Field label={t("firstName")} htmlFor="first-name" noMargin>
            <input
              id="first-name"
              className="login-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </Field>
          <Field label={t("lastName")} htmlFor="last-name" noMargin>
            <input
              id="last-name"
              className="login-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </Field>
        </div>
      )}

      <Field label={t("email")} htmlFor="email">
        <input
          id="email"
          className="login-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete={mode === "up" ? "email" : "username"}
        />
      </Field>

      {mode !== "forgot" && (
        <Field
          label={t("password")}
          htmlFor="password"
          action={mode === "in" ? (
            <button
              type="button"
              onClick={() => { setMode("forgot"); setPassword(""); }}
              style={{ fontSize: "0.78rem", color: "oklch(0.32 0.14 258)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              {t("forgotPassword")}
            </button>
          ) : undefined}
        >
          <input
            id="password"
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
        </Field>
      )}

      <AuthButton loading={loading}>
        {mode === "in" ? t("signIn") : mode === "up" ? t("signUp") : t("sendResetLink")}
      </AuthButton>

      <button
        type="button"
        onClick={() => {
          if (mode === "forgot") setMode("in");
          else { setMode(mode === "in" ? "up" : "in"); setFirstName(""); setLastName(""); }
        }}
        style={{
          display: "block",
          width: "100%",
          marginTop: "16px",
          padding: "8px 0",
          background: "none",
          border: "none",
          fontSize: "0.83rem",
          color: "oklch(0.50 0.03 260)",
          cursor: "pointer",
          textAlign: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.22 0.14 258)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.50 0.03 260)")}
      >
        {mode === "in" ? t("needAccount") : mode === "up" ? t("haveAccount") : t("backToLogin")}
      </button>
    </form>
  );
}

/* ── Shared primitives ───────────────────────────────────── */

function Field({
  label, htmlFor, children, action, noMargin,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  noMargin?: boolean;
}) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <label htmlFor={htmlFor} style={{ fontSize: "0.8rem", fontWeight: 600, color: "oklch(0.38 0.04 258)" }}>
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

function AuthButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
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
      {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : children}
    </button>
  );
}
