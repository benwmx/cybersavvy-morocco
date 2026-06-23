import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Play, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { api, CategoryRow, ScenarioRow, TutorialRow } from "@/lib/supabase/api";
import type { Json } from "@/lib/database.types";
import { AppLogo } from "@/components/AppLogo";
import { DocMarkdown } from "@/components/DocMarkdown";

export const Route = createFileRoute("/decouvrir/$categoryId")({
  component: DecouvrirPage,
});

function parseBilingual(val: Json): { fr: string; ar: string } {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    return { fr: String(v.fr ?? ""), ar: String(v.ar ?? "") };
  }
  return { fr: "", ar: "" };
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "30, 58, 138";
}

function DecouvrirPage() {
  const { categoryId } = Route.useParams();
  const { t, lang, setLang, dir } = useLang();

  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [tutorials, setTutorials] = useState<TutorialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [readerTut, setReaderTut] = useState<TutorialRow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cats, scens, tuts] = await Promise.all([
          api.listPublicCategories(),
          api.listPublicScenariosForCategory(categoryId),
          api.listPublicTutorialsForCategory(categoryId),
        ]);
        const cat = cats.find((c) => c.id === categoryId) ?? null;
        setCategory(cat);
        setScenarios(scens);
        setTutorials(tuts);
      } catch {
        // best-effort
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  // Tutorial reader full-page swap
  if (readerTut) {
    return <TutorialReader tut={readerTut} onBack={() => setReaderTut(null)} />;
  }

  const accent = category?.color_code ?? "#1E3A8A";
  const catName = category
    ? parseBilingual(category.name as Json)
    : { fr: "…", ar: "…" };
  const displayName = lang === "fr" ? catName.fr : catName.ar;

  return (
    <div className="min-h-screen bg-white font-sans" dir={dir}>

      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b border-white/10"
        style={{ background: accent }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: "4.5rem" }}>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" style={{ transform: dir === "rtl" ? "rotate(180deg)" : undefined }} />
              {t("discoverPageBack")}
            </Link>
          </div>

          <AppLogo variant="dark" to="/" />

          <div className="flex p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }}>
            <button
              onClick={() => setLang("fr")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                lang === "fr" ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
              }`}
            >FR</button>
            <button
              onClick={() => setLang("ar")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                lang === "ar" ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
              }`}
            >AR</button>
          </div>
        </div>
      </nav>

      {/* HERO HEADER */}
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: "4.5rem",
          background: accent,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {loading ? (
            <div className="h-16 w-64 rounded-sm bg-white/10 animate-pulse" />
          ) : (
            <>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                {t("discoverDomain")}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4" style={{ textWrap: "balance" }}>
                {displayName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to="/game/$categoryId"
                  params={{ categoryId }}
                  onClick={() => localStorage.setItem("cs.guest", "true")}
                  className="inline-flex items-center gap-2 bg-white font-bold text-sm px-6 h-12 rounded-sm transition-all hover:scale-[1.02] active:scale-95"
                  style={{ color: accent }}
                >
                  <Play className="w-4 h-4" />
                  {t("discoverPagePlayGuest")}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-bold text-sm px-6 h-12 rounded-sm transition-all hover:bg-white/5"
                >
                  {t("discoverPageJoin")}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Wave separator */}
        <svg viewBox="0 0 1440 48" className="w-full block" style={{ marginBottom: -1 }} preserveAspectRatio="none">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="white" />
        </svg>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* SCENARIOS */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: `rgba(${hexToRgb(accent)}, 0.1)` }}>
              <Play className="w-4 h-4" style={{ color: accent }} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{t("discoverPageScenarios")}</h2>
            {scenarios.length > 0 && (
              <span className="text-sm font-bold text-slate-400">{scenarios.length}</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-sm bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : scenarios.length === 0 ? (
            <p className="text-slate-400 text-sm">{t("discoverPageNoScenarios")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const title = parseBilingual(scenario.title as Json);
                const desc = parseBilingual(scenario.description as Json);
                const qCount = (scenario.questions as unknown[])?.length ?? 0;
                const displayTitle = lang === "fr" ? title.fr : title.ar;
                const displayDesc = lang === "fr" ? desc.fr : desc.ar;
                return (
                  <Link
                    key={scenario.id}
                    to="/game/$categoryId"
                    params={{ categoryId }}
                    onClick={() => localStorage.setItem("cs.guest", "true")}
                    className="group border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 rounded-sm p-7 flex flex-col transition-all duration-200 bg-white"
                  >
                    {scenario.image_url && (
                      <img
                        src={scenario.image_url}
                        alt=""
                        className="w-full h-36 object-cover rounded-sm mb-5"
                      />
                    )}
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[color:var(--accent)] transition-colors" style={{ "--accent": accent } as React.CSSProperties}>
                      {displayTitle}
                    </h3>
                    {displayDesc && (
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{displayDesc}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        {qCount} {t("discoverPageQuestions")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" style={{ color: accent }}>
                        {t("discoverPagePlayGuest")} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* TUTORIALS */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: `rgba(${hexToRgb(accent)}, 0.1)` }}>
              <BookOpen className="w-4 h-4" style={{ color: accent }} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{t("discoverPageTutorials")}</h2>
            {tutorials.length > 0 && (
              <span className="text-sm font-bold text-slate-400">{tutorials.length}</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-sm bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tutorials.length === 0 ? (
            <p className="text-slate-400 text-sm">{t("discoverPageNoTutorials")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tut) => {
                const title = parseBilingual(tut.title as Json);
                const displayTitle = lang === "fr" ? title.fr : title.ar;
                return (
                  <button
                    key={tut.id}
                    onClick={() => setReaderTut(tut)}
                    className="group text-start border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 rounded-sm bg-white transition-all duration-200 overflow-hidden flex"
                  >
                    {tut.image_url && (
                      <img src={tut.image_url} alt="" className="w-28 h-full object-cover shrink-0" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 mb-3 group-hover:text-[color:var(--accent)] transition-colors leading-snug" style={{ "--accent": accent } as React.CSSProperties}>
                        {displayTitle}
                      </h3>
                      <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold" style={{ color: accent }}>
                        {t("discoverPageReadTutorial")} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM CTA */}
        <div className="mt-24 border-t border-slate-100 pt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            {t("discoverPageCTADesc")}
          </p>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/login"
              search={{ role: "student" }}
              className="inline-flex items-center gap-2 font-bold text-sm px-6 h-12 rounded-sm text-white transition-all hover:opacity-90"
              style={{ background: accent }}
            >
              {t("discoverPageJoin")}
            </Link>
            <Link
              to="/login"
              search={{ role: "teacher" }}
              className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-sm px-6 h-12 rounded-sm transition-all"
            >
              {t("discoverPageTeacher")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorialReader({ tut, onBack }: { tut: TutorialRow; onBack: () => void }) {
  const { t, lang, dir } = useLang();
  const title = parseBilingual(tut.title as Json);
  const content = parseBilingual(tut.content as Json);
  const displayTitle = lang === "fr" ? title.fr : title.ar;
  const displayContent = lang === "fr" ? content.fr : content.ar;

  return (
    <div className="min-h-screen bg-white font-sans" dir={dir}>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" style={{ transform: dir === "rtl" ? "rotate(180deg)" : undefined }} />
          {t("discoverPageBackToList")}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        {tut.image_url && (
          <img
            src={tut.image_url}
            alt=""
            className="w-full rounded-sm mb-10 object-cover"
            style={{ maxHeight: 320 }}
          />
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 leading-tight" style={{ textWrap: "balance" }}>
          {displayTitle}
        </h1>
        <div style={{ lineHeight: 1.8 }}>
          <DocMarkdown text={displayContent} />
        </div>
        <div className="mt-16 pt-8 border-t border-slate-100">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" style={{ transform: dir === "rtl" ? "rotate(180deg)" : undefined }} />
            {t("discoverPageBackToList")}
          </button>
        </div>
      </div>
    </div>
  );
}
