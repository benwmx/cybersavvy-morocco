import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";
import {
  ArrowRight,
  Wifi,
  Fish,
  KeyRound,
  Users,
  MessageSquareWarning,
  Lock,
  Bug,
  Newspaper,
  Fingerprint,
  Scale,
  ShieldQuestion,
  ChevronRight,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { api, CategoryRow } from "@/lib/supabase/api";
import type { Json } from "@/lib/database.types";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "e-Wa3y — Culture Numérique et Cybersécurité" },
      {
        name: "description",
        content: "Outil pédagogique interactif pour renforcer la culture numérique et la cybersécurité chez les collégiens.",
      },
    ],
  }),
});

const ICON_MAP: Record<string, React.ElementType> = {
  fish: Fish, phishing: Fish, hameçon: Fish,
  password: KeyRound, mot: KeyRound, mdp: KeyRound,
  social: Users, réseaux: Users, réseau: Users,
  bullying: MessageSquareWarning, harcèlement: MessageSquareWarning,
  privacy: Lock, vie: Lock, confidentialité: Lock,
  malware: Bug, virus: Bug, logiciel: Bug, menace: Bug,
  fake: Newspaper, désinformation: Newspaper, information: Newspaper,
  identité: Fingerprint, identity: Fingerprint, numérique: Fingerprint,
  droit: Scale, rights: Scale, loi: Scale,
};

const COLORS = [
  { bg: "rgba(239,68,68,0.12)",  fg: "#dc2626" },
  { bg: "rgba(59,130,246,0.12)", fg: "#2563eb" },
  { bg: "rgba(139,92,246,0.12)", fg: "#7c3aed" },
  { bg: "rgba(236,72,153,0.12)", fg: "#db2777" },
  { bg: "rgba(20,184,166,0.12)", fg: "#0d9488" },
  { bg: "rgba(249,115,22,0.12)", fg: "#ea580c" },
  { bg: "rgba(245,158,11,0.12)", fg: "#d97706" },
  { bg: "rgba(99,102,241,0.12)", fg: "#4f46e5" },
  { bg: "rgba(34,197,94,0.12)",  fg: "#16a34a" },
];

function parseBilingual(val: Json): { fr: string; ar: string } {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    return { fr: String(v.fr ?? ""), ar: String(v.ar ?? "") };
  }
  return { fr: String(val ?? ""), ar: String(val ?? "") };
}

function pickIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return ShieldQuestion;
}

function LandingPage() {
  const { t, lang, setLang, dir } = useLang();
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    api.listPublicCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden" dir={dir}>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#1E3A8A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: "4.5rem" }}>
          <AppLogo variant="dark" to="/" />

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-white/10 rounded-lg">
              <button
                onClick={() => setLang("fr")}
                className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-md ${
                  lang === "fr"
                    ? "bg-white text-[#1E3A8A]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLang("ar")}
                className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-md ${
                  lang === "ar"
                    ? "bg-white text-[#1E3A8A]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: "4.5rem" }}>

        {/* 1. HERO — navy, full bleed */}
        <section className="bg-[#1E3A8A] px-6 pt-20 pb-28 md:pt-28 md:pb-36 relative overflow-hidden">
          {/* subtle dot-grid texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="space-y-7">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] max-w-4xl" style={{ textWrap: "balance" }}>
                {t("platformTitle")}
              </h1>

              <p className="max-w-2xl text-lg md:text-xl text-blue-100 leading-relaxed">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] hover:bg-blue-50 px-8 h-14 rounded-sm font-bold text-base transition-all hover:scale-[1.02] active:scale-95"
                >
                  {t("startPath")}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/guest"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-8 h-14 rounded-sm font-bold text-base transition-all hover:bg-white/5"
                >
                  {t("heroCTAGuest")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. AUDIENCE PORTALS — two bold colored tiles */}
        <section className="px-6 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">

              {/* Student tile — teal */}
              <div className="bg-[#0F766E] rounded-sm overflow-hidden flex flex-col">
                <div className="p-10 md:p-12 flex flex-col flex-1">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-teal-300" />
                    <span className="text-teal-200 text-xs font-bold uppercase tracking-widest">{t("learnerSpace")}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-4" style={{ textWrap: "balance" }}>
                    {t("learnerDesc")}
                  </h2>
                  <ul className="space-y-3 mb-10 mt-2">
                    {[t("learnerBullet1"), t("learnerBullet2"), t("learnerBullet3")].map((label, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-teal-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-300 shrink-0" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    search={{ role: "student" }}
                    className="mt-auto inline-flex items-center justify-between group w-full px-6 h-14 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-sm transition-all"
                  >
                    <span className="font-bold text-white text-sm uppercase tracking-widest">{t("learnerPortalEntry")}</span>
                    <ChevronRight className="w-5 h-5 text-teal-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Teacher tile — cobalt blue */}
              <div className="bg-[#1D4ED8] rounded-sm overflow-hidden flex flex-col">
                <div className="p-10 md:p-12 flex flex-col flex-1">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-blue-300" />
                    <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">{t("trainerSpace")}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-4" style={{ textWrap: "balance" }}>
                    {t("trainerDesc")}
                  </h2>
                  <ul className="space-y-3 mb-10 mt-2">
                    {[t("trainerBullet1"), t("trainerBullet2"), t("trainerBullet3")].map((label, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-blue-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    search={{ role: "teacher" }}
                    className="mt-auto inline-flex items-center justify-between group w-full px-6 h-14 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-sm transition-all"
                  >
                    <span className="font-bold text-white text-sm uppercase tracking-widest">{t("trainerPortalEntry")}</span>
                    <ChevronRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. DOMAIN GRID — 9 clickable topic cards */}
        <section className="px-6 py-20 bg-[#F8FAFC] border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ textWrap: "balance" }}>
                {t("pillarsTitle")}
              </h2>
              <p className="text-slate-500 text-base">{t("pillarsSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-sm bg-slate-100 animate-pulse" />
                  ))
                : categories.map((cat, i) => {
                    const name = parseBilingual(cat.name as Json);
                    const displayName = lang === "fr" ? name.fr : name.ar;
                    const color = COLORS[i % COLORS.length];
                    const iconColor = cat.color_code ?? color.fg;
                    const IconComp = pickIcon(name.fr);
                    return (
                      <Link
                        key={cat.id}
                        to="/decouvrir/$categoryId"
                        params={{ categoryId: cat.id }}
                        className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 rounded-sm p-7 flex items-start gap-5 transition-all duration-200"
                      >
                        <div
                          className="w-11 h-11 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: color.bg }}
                        >
                          <IconComp className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                            {displayName}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-[#1E3A8A] transition-colors">
                            {t("discoverDomain")}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* 4. GUEST CALLOUT — navy strip */}
        <section className="bg-[#1E3A8A] px-6 py-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3" style={{ textWrap: "balance" }}>
                {t("guestCalloutTitle")}
              </h2>
              <p className="text-blue-200 text-base leading-relaxed max-w-lg">
                {t("guestCalloutDesc")}
              </p>
            </div>

            <Link
              to="/guest"
              className="inline-flex items-center gap-3 group shrink-0 bg-white text-[#1E3A8A] hover:bg-blue-50 px-8 h-14 rounded-sm font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              {t("guestCTA")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-slate-500">
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">{t("footerOffline")}</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {t("footerCopyright")}
            </span>
            <div className="flex gap-6">
              {[t("footerTerms"), t("footerPrivacy"), t("footerAccessibility")].map(label => (
                <button key={label} className="text-xs font-semibold text-slate-600 uppercase tracking-widest hover:text-white transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
